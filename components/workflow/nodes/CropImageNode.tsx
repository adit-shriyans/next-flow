"use client";

import { memo } from "react";
import { type NodeProps, useEdges } from "@xyflow/react";
import { Crop } from "lucide-react";
import { BaseNode } from "./BaseNode";
import { useWorkflowStore } from "@/lib/store";
import type { CropImageNodeData, HandleConfig } from "@/lib/types";

const inputs: HandleConfig[] = [
  { id: "image_url", label: "image_url", type: "image", required: true },
  { id: "x_percent", label: "x%", type: "text" },
  { id: "y_percent", label: "y%", type: "text" },
  { id: "width_percent", label: "width%", type: "text" },
  { id: "height_percent", label: "height%", type: "text" },
];

const outputs: HandleConfig[] = [
  { id: "output", label: "output", type: "image" },
];

function CropImageNodeComponent({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as CropImageNodeData;
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const edges = useEdges();

  const connectedHandles = new Set(
    edges.filter((e) => e.target === id).map((e) => e.targetHandle)
  );

  const numField = (
    field: keyof CropImageNodeData,
    handleId: string,
    label: string,
    defaultVal: number
  ) => (
    <div className="flex items-center gap-2">
      <label className="text-[10px] text-zinc-500 w-12 shrink-0">
        {label}
      </label>
      <input
        type="number"
        min={0}
        max={100}
        value={(nodeData[field] as number) ?? defaultVal}
        onChange={(e) =>
          updateNodeData(id, { [field]: parseFloat(e.target.value) || 0 })
        }
        disabled={connectedHandles.has(handleId)}
        className="flex-1 bg-background border border-border rounded px-2 py-1 text-sm text-zinc-300 focus:outline-none focus:border-accent disabled:opacity-40 disabled:cursor-not-allowed nodrag"
      />
    </div>
  );

  return (
    <BaseNode
      data={nodeData}
      selected={!!selected}
      icon={<Crop size={16} />}
      inputs={inputs}
      outputs={outputs}
    >
      <div className="flex flex-col gap-1.5">
        {!connectedHandles.has("image_url") && (
          <input
            type="text"
            value={nodeData.imageUrl ?? ""}
            onChange={(e) => updateNodeData(id, { imageUrl: e.target.value })}
            placeholder="Image URL..."
            className="w-full bg-background border border-border rounded px-2 py-1 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-accent nodrag"
          />
        )}
        {numField("xPercent", "x_percent", "X %", 0)}
        {numField("yPercent", "y_percent", "Y %", 0)}
        {numField("widthPercent", "width_percent", "W %", 100)}
        {numField("heightPercent", "height_percent", "H %", 100)}

        {nodeData.croppedUrl && (
          <div className="mt-1">
            <img
              src={nodeData.croppedUrl}
              alt="Cropped"
              className="w-full h-24 object-cover rounded border border-border"
            />
          </div>
        )}
      </div>
    </BaseNode>
  );
}

export const CropImageNode = memo(CropImageNodeComponent);
