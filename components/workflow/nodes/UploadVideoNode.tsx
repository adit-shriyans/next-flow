"use client";

import { memo, useCallback } from "react";
import { type NodeProps } from "@xyflow/react";
import { VideoIcon, X } from "lucide-react";
import { BaseNode } from "./BaseNode";
import { useWorkflowStore } from "@/lib/store";
import type { UploadVideoNodeData, HandleConfig } from "@/lib/types";

const outputs: HandleConfig[] = [
  { id: "output", label: "output", type: "video" },
];

const ACCEPTED_VIDEO_TYPES = "video/mp4,video/quicktime,video/webm,video/x-m4v";

function UploadVideoNodeComponent({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as UploadVideoNodeData;
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const url = URL.createObjectURL(file);
      updateNodeData(id, {
        videoUrl: url,
        fileName: file.name,
      } as Partial<UploadVideoNodeData>);
    },
    [id, updateNodeData]
  );

  const clearVideo = useCallback(() => {
    updateNodeData(id, {
      videoUrl: undefined,
      fileName: undefined,
    } as Partial<UploadVideoNodeData>);
  }, [id, updateNodeData]);

  return (
    <BaseNode
      data={nodeData}
      selected={!!selected}
      icon={<VideoIcon size={16} />}
      outputs={outputs}
    >
      {nodeData.videoUrl ? (
        <div className="relative group">
          <video
            src={nodeData.videoUrl}
            controls
            className="w-full h-32 rounded-lg border border-border bg-black object-contain nodrag nowheel"
          />
          <button
            onClick={clearVideo}
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
          <VideoIcon size={20} className="text-zinc-600 mb-1" />
          <span className="text-xs text-zinc-500">
            Click to upload video
          </span>
          <span className="text-[10px] text-zinc-600">
            mp4, mov, webm, m4v
          </span>
          <input
            type="file"
            accept={ACCEPTED_VIDEO_TYPES}
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      )}
    </BaseNode>
  );
}

export const UploadVideoNode = memo(UploadVideoNodeComponent);
