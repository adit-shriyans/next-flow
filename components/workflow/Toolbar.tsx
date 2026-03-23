"use client";

import {
  Play,
  PlayCircle,
  Save,
  Undo2,
  Redo2,
  Download,
  Upload,
  Loader2,
} from "lucide-react";
import { useWorkflowStore } from "@/lib/store";
import { useState, useRef } from "react";

interface ToolbarProps {
  onRunAll: () => void;
  onRunSelected: () => void;
  onSave: () => void;
  isSaving: boolean;
  isExecuting: boolean;
}

export function Toolbar({
  onRunAll,
  onRunSelected,
  onSave,
  isSaving,
  isExecuting,
}: ToolbarProps) {
  const {
    undo,
    redo,
    canUndo,
    canRedo,
    selectedNodeIds,
    nodes,
    edges,
    workflowName,
    setWorkflowName,
    loadWorkflow,
    workflowId,
  } = useWorkflowStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingName, setEditingName] = useState(false);

  const handleExport = () => {
    const data = JSON.stringify({ nodes, edges, name: workflowName }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${workflowName.replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        loadWorkflow(
          workflowId ?? "",
          data.name ?? "Imported Workflow",
          data.nodes ?? [],
          data.edges ?? []
        );
      } catch {
        alert("Invalid workflow file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="h-12 flex items-center justify-between px-3 bg-surface border-b border-border shrink-0">
      <div className="flex items-center gap-2">
        {editingName ? (
          <input
            autoFocus
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            onBlur={() => setEditingName(false)}
            onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
            className="bg-background border border-border rounded px-2 py-0.5 text-sm text-zinc-200 focus:outline-none focus:border-accent w-48"
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="text-sm font-medium text-zinc-300 hover:text-white transition-colors px-1"
          >
            {workflowName}
          </button>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={undo}
          disabled={!canUndo()}
          className="p-2 rounded-lg hover:bg-surface-hover text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Undo"
        >
          <Undo2 size={16} />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo()}
          className="p-2 rounded-lg hover:bg-surface-hover text-zinc-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Redo"
        >
          <Redo2 size={16} />
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        <button
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-surface-hover text-zinc-400 hover:text-white disabled:opacity-50 transition-colors text-sm"
          title="Save"
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save
        </button>

        <button
          onClick={handleExport}
          className="p-2 rounded-lg hover:bg-surface-hover text-zinc-400 hover:text-white transition-colors"
          title="Export JSON"
        >
          <Download size={16} />
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-lg hover:bg-surface-hover text-zinc-400 hover:text-white transition-colors"
          title="Import JSON"
        >
          <Upload size={16} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />

        <div className="w-px h-5 bg-border mx-1" />

        <button
          onClick={onRunSelected}
          disabled={selectedNodeIds.length === 0 || isExecuting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-accent/20 text-accent-light hover:bg-accent/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          {isExecuting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <PlayCircle size={14} />
          )}
          Run Selected
        </button>

        <button
          onClick={onRunAll}
          disabled={isExecuting || nodes.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-accent text-white hover:bg-accent-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isExecuting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Play size={14} />
          )}
          Run All
        </button>
      </div>
    </div>
  );
}
