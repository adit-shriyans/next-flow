"use client";

import { memo } from "react";
import { type NodeProps, useEdges } from "@xyflow/react";
import { BrainCircuit } from "lucide-react";
import { BaseNode } from "./BaseNode";
import { useWorkflowStore } from "@/lib/store";
import type { LLMNodeData, HandleConfig } from "@/lib/types";

const GEMINI_MODELS = [
  { value: "gemini-3-flash-preview", label: "Gemini 3 Flash Preview" },
  { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
  { value: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite" },
  { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
  { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
];

const inputs: HandleConfig[] = [
  { id: "system_prompt", label: "system_prompt", type: "text" },
  { id: "user_message", label: "user_message", type: "text", required: true },
  { id: "images", label: "images", type: "image" },
];

const outputs: HandleConfig[] = [
  { id: "output", label: "output", type: "text" },
];

function LLMNodeComponent({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as LLMNodeData;
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const edges = useEdges();

  const connectedHandles = new Set(
    edges.filter((e) => e.target === id).map((e) => e.targetHandle)
  );

  return (
    <BaseNode
      data={nodeData}
      selected={!!selected}
      icon={<BrainCircuit size={16} />}
      inputs={inputs}
      outputs={outputs}
    >
      <div className="flex flex-col gap-2">
        <select
          value={nodeData.model ?? "gemini-3-flash-preview"}
          onChange={(e) => updateNodeData(id, { model: e.target.value })}
          className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-sm text-zinc-300 focus:outline-none focus:border-accent nodrag"
        >
          {GEMINI_MODELS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        <textarea
          value={nodeData.systemPrompt ?? ""}
          onChange={(e) => updateNodeData(id, { systemPrompt: e.target.value })}
          placeholder="System prompt..."
          rows={2}
          disabled={connectedHandles.has("system_prompt")}
          className="w-full bg-background border border-border rounded-lg px-2.5 py-2 text-sm text-zinc-300 placeholder-zinc-600 resize-none focus:outline-none focus:border-accent disabled:opacity-40 disabled:cursor-not-allowed nodrag nowheel"
        />

        <textarea
          value={nodeData.userMessage ?? ""}
          onChange={(e) => updateNodeData(id, { userMessage: e.target.value })}
          placeholder="User message..."
          rows={2}
          disabled={connectedHandles.has("user_message")}
          className="w-full bg-background border border-border rounded-lg px-2.5 py-2 text-sm text-zinc-300 placeholder-zinc-600 resize-none focus:outline-none focus:border-accent disabled:opacity-40 disabled:cursor-not-allowed nodrag nowheel"
        />

        {nodeData.result && (
          <div className="bg-background border border-success/30 rounded-lg px-2.5 py-2 max-h-40 overflow-y-auto nowheel">
            <p className="text-xs text-zinc-400 mb-1 font-medium">Result:</p>
            <p className="text-sm text-zinc-300 whitespace-pre-wrap">
              {nodeData.result}
            </p>
          </div>
        )}
      </div>
    </BaseNode>
  );
}

export const LLMNode = memo(LLMNodeComponent);
