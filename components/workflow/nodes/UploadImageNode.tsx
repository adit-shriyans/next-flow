"use client";

import { memo, useCallback } from "react";
import { type NodeProps } from "@xyflow/react";
import { ImagePlus, X } from "lucide-react";
import { BaseNode } from "./BaseNode";
import { useWorkflowStore } from "@/lib/store";
import type { UploadImageNodeData, HandleConfig } from "@/lib/types";

const outputs: HandleConfig[] = [
  { id: "output", label: "output", type: "image" },
];

const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/jpg,image/png,image/webp,image/gif";

function UploadImageNodeComponent({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as UploadImageNodeData;
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const previewUrl = URL.createObjectURL(file);

      const reader = new FileReader();
      reader.onload = () => {
        updateNodeData(id, {
          imageUrl: previewUrl,
          imageBase64: reader.result as string,
          fileName: file.name,
        } as Partial<UploadImageNodeData>);
      };
      reader.readAsDataURL(file);
    },
    [id, updateNodeData]
  );

  const clearImage = useCallback(() => {
    updateNodeData(id, {
      imageUrl: undefined,
      fileName: undefined,
    } as Partial<UploadImageNodeData>);
  }, [id, updateNodeData]);

  return (
    <BaseNode
      data={nodeData}
      selected={!!selected}
      icon={<ImagePlus size={16} />}
      outputs={outputs}
    >
      {nodeData.imageUrl ? (
        <div className="relative group">
          <img
            src={nodeData.imageUrl}
            alt={nodeData.fileName ?? "Uploaded image"}
            className="w-full h-32 object-cover rounded-lg border border-border"
          />
          <button
            onClick={clearImage}
            className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity nodrag"
          >
            <X size={12} />
          </button>
          <p className="text-xs text-zinc-500 mt-1 truncate">
            {nodeData.fileName}
          </p>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-accent/50 transition-colors nodrag">
          <ImagePlus size={20} className="text-zinc-600 mb-1" />
          <span className="text-xs text-zinc-500">
            Click to upload image
          </span>
          <span className="text-[10px] text-zinc-600">
            jpg, png, webp, gif
          </span>
          <input
            type="file"
            accept={ACCEPTED_IMAGE_TYPES}
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      )}
    </BaseNode>
  );
}

export const UploadImageNode = memo(UploadImageNodeComponent);
