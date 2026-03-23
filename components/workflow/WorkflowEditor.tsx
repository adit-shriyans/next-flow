"use client";

import { useState, useCallback } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";
import { Canvas } from "./Canvas";
import { Toolbar } from "./Toolbar";
import { useWorkflowStore } from "@/lib/store";
import { executeNodes, getNodeIdsForExecution } from "@/lib/execution";

export function WorkflowEditor() {
  const [isSaving, setIsSaving] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const {
    workflowId,
    workflowName,
    nodes,
    edges,
    selectedNodeIds,
    getWorkflowData,
    setWorkflowId,
  } = useWorkflowStore();

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const data = getWorkflowData();
      if (workflowId) {
        await fetch(`/api/workflows/${workflowId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: workflowName, data }),
        });
      } else {
        const res = await fetch("/api/workflows", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: workflowName, data }),
        });
        if (res.ok) {
          const result = await res.json();
          setWorkflowId(result.id);
          window.history.replaceState(null, "", `/workflow/${result.id}`);
        }
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setIsSaving(false);
    }
  }, [workflowId, workflowName, getWorkflowData, setWorkflowId]);

  const handleRunAll = useCallback(async () => {
    if (!workflowId) {
      await handleSave();
    }
    const wfId = useWorkflowStore.getState().workflowId;
    if (!wfId) return;

    setIsExecuting(true);
    try {
      const ids = getNodeIdsForExecution("full", [], nodes, edges);
      await executeNodes(wfId, ids, nodes, edges, "full");
    } finally {
      setIsExecuting(false);
    }
  }, [workflowId, nodes, edges, handleSave]);

  const handleRunSelected = useCallback(async () => {
    if (!workflowId) {
      await handleSave();
    }
    const wfId = useWorkflowStore.getState().workflowId;
    if (!wfId || selectedNodeIds.length === 0) return;

    setIsExecuting(true);
    try {
      const scope = selectedNodeIds.length === 1 ? "single" : "partial";
      const ids = getNodeIdsForExecution(
        scope === "single" ? "single" : "partial",
        selectedNodeIds,
        nodes,
        edges
      );
      await executeNodes(wfId, ids, nodes, edges, scope);
    } finally {
      setIsExecuting(false);
    }
  }, [workflowId, selectedNodeIds, nodes, edges, handleSave]);

  return (
    <ReactFlowProvider>
      <div className="flex flex-col h-full">
        <Toolbar
          onRunAll={handleRunAll}
          onRunSelected={handleRunSelected}
          onSave={handleSave}
          isSaving={isSaving}
          isExecuting={isExecuting}
        />
        <div className="flex flex-1 overflow-hidden">
          <LeftSidebar />
          <Canvas />
          <RightSidebar />
        </div>
      </div>
    </ReactFlowProvider>
  );
}
