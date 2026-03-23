"use client";

import { Handle, Position, type HandleProps } from "@xyflow/react";
import type { BaseNodeData, HandleConfig } from "@/lib/types";
import { cn } from "@/lib/utils";

interface BaseNodeProps {
  data: BaseNodeData;
  selected: boolean;
  icon: React.ReactNode;
  inputs?: HandleConfig[];
  outputs?: HandleConfig[];
  children: React.ReactNode;
}

const handleColorMap: Record<string, string> = {
  text: "!bg-blue-500",
  image: "!bg-green-500",
  video: "!bg-orange-500",
};

export function BaseNode({
  data,
  selected,
  icon,
  inputs = [],
  outputs = [],
  children,
}: BaseNodeProps) {
  const glowClass =
    data.status === "running"
      ? "node-running"
      : data.status === "success"
        ? "node-success"
        : data.status === "error"
          ? "node-error"
          : "";

  return (
    <div
      className={cn(
        "bg-surface border border-border rounded-xl min-w-[240px] max-w-[320px] shadow-lg",
        selected && "border-accent",
        glowClass
      )}
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
        <div className="text-zinc-400">{icon}</div>
        <span className="text-sm font-medium text-zinc-200 flex-1 truncate">
          {data.label}
        </span>
        {data.status === "running" && (
          <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
        )}
        {data.status === "success" && (
          <div className="w-2 h-2 rounded-full bg-success" />
        )}
        {data.status === "error" && (
          <div className="w-2 h-2 rounded-full bg-error" />
        )}
      </div>

      <div className="relative px-3 py-3">
        {inputs.map((input, i) => (
          <div key={input.id} className="relative">
            <Handle
              type="target"
              position={Position.Left}
              id={input.id}
              className={cn(
                "!w-3 !h-3 !border-2 !border-surface",
                handleColorMap[input.type] ?? "!bg-blue-500"
              )}
              style={{ top: `${32 + i * 52}px` }}
            />
            <span
              className="absolute text-[10px] text-zinc-500 whitespace-nowrap"
              style={{ left: 8, top: `${24 + i * 52}px` }}
            >
              {input.label}
            </span>
          </div>
        ))}

        {outputs.map((output, i) => (
          <div key={output.id} className="relative">
            <Handle
              type="source"
              position={Position.Right}
              id={output.id}
              className={cn(
                "!w-3 !h-3 !border-2 !border-surface",
                handleColorMap[output.type] ?? "!bg-blue-500"
              )}
              style={{ top: `${32 + i * 52}px` }}
            />
            <span
              className="absolute text-[10px] text-zinc-500 whitespace-nowrap right-2"
              style={{ top: `${24 + i * 52}px` }}
            >
              {output.label}
            </span>
          </div>
        ))}

        {children}
      </div>

      {data.error && (
        <div className="px-3 py-2 border-t border-border">
          <p className="text-xs text-error truncate">{data.error}</p>
        </div>
      )}
    </div>
  );
}
