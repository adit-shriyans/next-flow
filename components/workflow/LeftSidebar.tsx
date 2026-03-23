"use client";

import { useState, type DragEvent } from "react";
import {
  Type,
  ImagePlus,
  VideoIcon,
  BrainCircuit,
  Crop,
  Film,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useWorkflowStore } from "@/lib/store";
import type { NodeType } from "@/lib/types";

interface NodeButton {
  type: NodeType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const NODE_BUTTONS: NodeButton[] = [
  {
    type: "textNode",
    label: "Text",
    icon: <Type size={18} />,
    description: "Simple text input",
  },
  {
    type: "uploadImageNode",
    label: "Upload Image",
    icon: <ImagePlus size={18} />,
    description: "Upload image file",
  },
  {
    type: "uploadVideoNode",
    label: "Upload Video",
    icon: <VideoIcon size={18} />,
    description: "Upload video file",
  },
  {
    type: "llmNode",
    label: "Run LLM",
    icon: <BrainCircuit size={18} />,
    description: "AI text generation",
  },
  {
    type: "cropImageNode",
    label: "Crop Image",
    icon: <Crop size={18} />,
    description: "Crop an image",
  },
  {
    type: "extractFrameNode",
    label: "Extract Frame",
    icon: <Film size={18} />,
    description: "Extract video frame",
  },
];

export function LeftSidebar() {
  const [search, setSearch] = useState("");
  const { leftSidebarOpen, toggleLeftSidebar } = useWorkflowStore();

  const filtered = NODE_BUTTONS.filter(
    (n) =>
      n.label.toLowerCase().includes(search.toLowerCase()) ||
      n.description.toLowerCase().includes(search.toLowerCase())
  );

  const onDragStart = (event: DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  if (!leftSidebarOpen) {
    return (
      <div className="flex flex-col items-center py-3 px-1 bg-surface border-r border-border">
        <button
          onClick={toggleLeftSidebar}
          className="p-2 rounded-lg hover:bg-surface-hover text-zinc-400 hover:text-white transition-colors"
          title="Open sidebar"
        >
          <PanelLeftOpen size={18} />
        </button>
        <div className="mt-4 flex flex-col gap-2">
          {NODE_BUTTONS.map((btn) => (
            <button
              key={btn.type}
              draggable
              onDragStart={(e) => onDragStart(e, btn.type)}
              className="p-2 rounded-lg hover:bg-surface-hover text-zinc-400 hover:text-white transition-colors"
              title={btn.label}
            >
              {btn.icon}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-60 flex flex-col bg-surface border-r border-border shrink-0">
      <div className="flex items-center justify-between px-3 py-3 border-b border-border">
        <span className="text-sm font-semibold text-zinc-300">Nodes</span>
        <button
          onClick={toggleLeftSidebar}
          className="p-1.5 rounded-lg hover:bg-surface-hover text-zinc-400 hover:text-white transition-colors"
        >
          <PanelLeftClose size={16} />
        </button>
      </div>

      <div className="px-3 py-2">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            type="text"
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-1.5 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      <div className="px-3 py-1">
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
          Quick Access
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <div className="flex flex-col gap-1">
          {filtered.map((btn) => (
            <button
              key={btn.type}
              draggable
              onDragStart={(e) => onDragStart(e, btn.type)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-hover text-zinc-400 hover:text-white transition-colors cursor-grab active:cursor-grabbing group text-left"
            >
              <div className="p-1.5 rounded-md bg-background border border-border group-hover:border-accent/50 transition-colors">
                {btn.icon}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate">
                  {btn.label}
                </span>
                <span className="text-xs text-zinc-600 truncate">
                  {btn.description}
                </span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-xs text-zinc-600 px-3 py-4 text-center">
              No nodes match your search
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
