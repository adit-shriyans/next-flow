"use client";

import { memo } from "react";
import { type NodeProps, useEdges } from "@xyflow/react";
import { Film } from "lucide-react";
import { BaseNode } from "./BaseNode";
import { useWorkflowStore } from "@/lib/store";
import type { ExtractFrameNodeData, HandleConfig } from "@/lib/types";

const inputs: HandleConfig[] = [
  { id: "video_url", label: "video_url", type: "video", required: true },
  { id: "timestamp", label: "timestamp", type: "text" },
];

const outputs: HandleConfig[] = [
  { id: "output", label: "output", type: "image" },
];

function ExtractFrameNodeComponent({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as ExtractFrameNodeData;
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const edges = useEdges();

  const connectedHandles = new Set(
    edges.filter((e) => e.target === id).map((e) => e.targetHandle)
  );

  return (
    <BaseNode
      data={nodeData}
      selected={!!selected}
      icon={<Film size={16} />}
      inputs={inputs}
      outputs={outputs}
    >
      <div className="flex flex-col gap-2">
        {!connectedHandles.has("video_url") && (
          <input
            type="text"
            value={nodeData.videoUrl ?? ""}
            onChange={(e) => updateNodeData(id, { videoUrl: e.target.value })}
            placeholder="Video URL..."
            className="w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-accent nodrag"
          />
        )}

        <div className="flex items-center gap-2">
          <label className="text-[10px] text-zinc-500 w-16 shrink-0">
            Timestamp
          </label>
          <input
            type="text"
            value={nodeData.timestamp ?? "0"}
            onChange={(e) => updateNodeData(id, { timestamp: e.target.value })}
            placeholder='0 or "50%"'
            disabled={connectedHandles.has("timestamp")}
            className="flex-1 bg-background border border-border rounded px-2 py-1 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-accent disabled:opacity-40 disabled:cursor-not-allowed nodrag"
          />
        </div>

        {nodeData.frameUrl && (
          <div className="mt-1">
            <img
              src={nodeData.frameUrl}
              alt="Extracted frame"
              className="w-full h-24 object-cover rounded border border-border"
            />
          </div>
        )}
      </div>
    </BaseNode>
  );
}

export const ExtractFrameNode = memo(ExtractFrameNodeComponent);
