"use client";

import type { Node, Edge } from "@xyflow/react";
import type { WorkflowNodeData } from "./types";
import { getExecutionLevels, getUpstreamNodes } from "./dag";
import { useWorkflowStore } from "./store";

function resolveInputs(
  nodeId: string,
  edges: Edge[]
): Record<string, unknown> {
  const nodes = useWorkflowStore.getState().nodes;
  const incomingEdges = edges.filter((e) => e.target === nodeId);
  const inputs: Record<string, unknown> = {};

  for (const edge of incomingEdges) {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    if (!sourceNode) continue;

    const handleId = edge.targetHandle ?? "input";
    const output = sourceNode.data.output;

    if (handleId === "images") {
      if (!inputs.images) inputs.images = [];
      (inputs.images as unknown[]).push(output);
    } else {
      inputs[handleId] = output;
    }
  }

  return inputs;
}

export async function executeNodes(
  workflowId: string,
  nodeIds: string[],
  allNodes: Node<WorkflowNodeData>[],
  allEdges: Edge[],
  scope: "full" | "partial" | "single"
) {
  const store = useWorkflowStore.getState();
  const levels = getExecutionLevels(nodeIds, allEdges);

  if (!levels) {
    throw new Error("Workflow contains cycles");
  }

  const startTime = Date.now();
  let runId: string | undefined;

  try {
    const createRunRes = await fetch(`/api/workflows/${workflowId}/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodeIds, scope }),
    });

    if (createRunRes.ok) {
      const runData = await createRunRes.json();
      runId = runData.id;
    }
  } catch {
    // Continue without persistence
  }

  let hasError = false;

  for (const level of levels) {
    const promises = level.map(async (nodeId) => {
      const currentNodes = useWorkflowStore.getState().nodes;
      const node = currentNodes.find((n) => n.id === nodeId);
      if (!node) return;

      store.setNodeStatus(nodeId, "running");
      store.addExecutingNode(nodeId);

      try {
        const resolvedInputs = resolveInputs(nodeId, allEdges);
        const nodeData = { ...node.data, ...resolvedInputs };

        const response = await fetch(`/api/workflows/${workflowId}/execute`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            runId,
            nodeId,
            nodeType: node.type,
            data: nodeData,
          }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({ error: "Execution failed" }));
          throw new Error(err.error ?? "Execution failed");
        }

        const result = await response.json();
        store.setNodeOutput(nodeId, result.output);
        store.setNodeStatus(nodeId, "success");

        if (node.type === "llmNode") {
          store.updateNodeData(nodeId, { result: result.output });
        }
        if (node.type === "cropImageNode") {
          store.updateNodeData(nodeId, { croppedUrl: result.output });
        }
        if (node.type === "extractFrameNode") {
          store.updateNodeData(nodeId, { frameUrl: result.output });
        }
      } catch (err) {
        hasError = true;
        store.setNodeStatus(
          nodeId,
          "error",
          err instanceof Error ? err.message : "Unknown error"
        );
      } finally {
        store.removeExecutingNode(nodeId);
      }
    });

    await Promise.all(promises);
  }

  if (runId) {
    try {
      await fetch(`/api/workflows/${workflowId}/execute`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          runId,
          status: hasError ? "FAILED" : "SUCCESS",
          duration: Date.now() - startTime,
        }),
      });
    } catch {
      // Non-critical
    }
  }

  return { hasError, duration: Date.now() - startTime };
}

export function getNodeIdsForExecution(
  mode: "full" | "partial" | "single",
  selectedIds: string[],
  nodes: Node<WorkflowNodeData>[],
  edges: Edge[]
): string[] {
  if (mode === "full") {
    return nodes.map((n) => n.id);
  }

  if (mode === "single" && selectedIds.length === 1) {
    const upstream = getUpstreamNodes(selectedIds[0], edges);
    return [selectedIds[0], ...upstream];
  }

  const allIds = new Set<string>();
  for (const id of selectedIds) {
    allIds.add(id);
    const upstream = getUpstreamNodes(id, edges);
    upstream.forEach((u) => allIds.add(u));
  }
  return Array.from(allIds);
}
