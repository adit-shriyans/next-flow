"use client";

import { memo } from "react";
import { type NodeProps } from "@xyflow/react";
import { Type } from "lucide-react";
import { BaseNode } from "./BaseNode";
import { useWorkflowStore } from "@/lib/store";
import type { TextNodeData, HandleConfig } from "@/lib/types";

const outputs: HandleConfig[] = [
  { id: "output", label: "output", type: "text" },
];

function TextNodeComponent({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as TextNodeData;
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);

  return (
    <BaseNode
      data={nodeData}
      selected={!!selected}
      icon={<Type size={16} />}
      outputs={outputs}
    >
      <textarea
        value={nodeData.text ?? ""}
        onChange={(e) => updateNodeData(id, { text: e.target.value })}
        placeholder="Enter text..."
        rows={3}
        className="w-full bg-background border border-border rounded-lg px-2.5 py-2 text-sm text-zinc-300 placeholder-zinc-600 resize-none focus:outline-none focus:border-accent nodrag nowheel"
      />
    </BaseNode>
  );
}

export const TextNode = memo(TextNodeComponent);
