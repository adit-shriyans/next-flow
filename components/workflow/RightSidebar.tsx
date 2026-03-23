"use client";

import { useState, useEffect } from "react";
import {
  PanelRightClose,
  PanelRightOpen,
  Clock,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { useWorkflowStore } from "@/lib/store";

interface NodeRunEntry {
  nodeId: string;
  nodeType: string;
  status: string;
  output?: unknown;
  error?: string;
  duration?: number;
}

interface RunEntry {
  id: string;
  status: string;
  scope: string;
  duration?: number;
  startedAt: string;
  nodeRuns: NodeRunEntry[];
}

export function RightSidebar() {
  const { rightSidebarOpen, toggleRightSidebar, workflowId } =
    useWorkflowStore();
  const [runs, setRuns] = useState<RunEntry[]>([]);
  const [expandedRun, setExpandedRun] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!workflowId || !rightSidebarOpen) return;
    setLoading(true);
    fetch(`/api/history/${workflowId}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setRuns(Array.isArray(data) ? data : []))
      .catch(() => setRuns([]))
      .finally(() => setLoading(false));
  }, [workflowId, rightSidebarOpen]);

  const statusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <CheckCircle2 size={14} className="text-success" />;
      case "FAILED":
        return <XCircle size={14} className="text-error" />;
      case "RUNNING":
        return <Loader2 size={14} className="text-warning animate-spin" />;
      default:
        return <Clock size={14} className="text-zinc-500" />;
    }
  };

  const scopeLabel = (scope: string) => {
    switch (scope) {
      case "FULL":
        return "Full Workflow";
      case "SINGLE":
        return "Single Node";
      case "PARTIAL":
        return "Selected Nodes";
      default:
        return scope;
    }
  };

  if (!rightSidebarOpen) {
    return (
      <div className="flex flex-col items-center py-3 px-1 bg-surface border-l border-border">
        <button
          onClick={toggleRightSidebar}
          className="p-2 rounded-lg hover:bg-surface-hover text-zinc-400 hover:text-white transition-colors"
          title="Open history"
        >
          <PanelRightOpen size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-72 flex flex-col bg-surface border-l border-border shrink-0">
      <div className="flex items-center justify-between px-3 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-zinc-400" />
          <span className="text-sm font-semibold text-zinc-300">History</span>
        </div>
        <button
          onClick={toggleRightSidebar}
          className="p-1.5 rounded-lg hover:bg-surface-hover text-zinc-400 hover:text-white transition-colors"
        >
          <PanelRightClose size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="animate-spin text-zinc-500" />
          </div>
        )}

        {!loading && runs.length === 0 && (
          <div className="px-4 py-8 text-center">
            <Clock size={24} className="mx-auto mb-2 text-zinc-600" />
            <p className="text-sm text-zinc-500">No runs yet</p>
            <p className="text-xs text-zinc-600 mt-1">
              Execute a workflow to see history
            </p>
          </div>
        )}

        {!loading &&
          runs.map((run) => (
            <div key={run.id} className="border-b border-border">
              <button
                onClick={() =>
                  setExpandedRun(expandedRun === run.id ? null : run.id)
                }
                className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-surface-hover transition-colors text-left"
              >
                {expandedRun === run.id ? (
                  <ChevronDown size={14} className="text-zinc-500 shrink-0" />
                ) : (
                  <ChevronRight size={14} className="text-zinc-500 shrink-0" />
                )}
                {statusIcon(run.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-300 truncate">
                      {scopeLabel(run.scope)}
                    </span>
                    {run.duration && (
                      <span className="text-xs text-zinc-600 ml-2">
                        {(run.duration / 1000).toFixed(1)}s
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-zinc-600">
                    {new Date(run.startedAt).toLocaleString()}
                  </span>
                </div>
              </button>

              {expandedRun === run.id && run.nodeRuns && (
                <div className="pl-6 pr-3 pb-2">
                  {run.nodeRuns.map((nr) => (
                    <div
                      key={nr.nodeId}
                      className="flex items-start gap-2 py-1.5 border-l border-border-light pl-3 ml-1"
                    >
                      {statusIcon(nr.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-zinc-400">
                            {nr.nodeType} ({nr.nodeId})
                          </span>
                          {nr.duration && (
                            <span className="text-xs text-zinc-600">
                              {(nr.duration / 1000).toFixed(1)}s
                            </span>
                          )}
                        </div>
                        {nr.output != null && (
                          <p className="text-xs text-zinc-500 mt-0.5 truncate">
                            Output:{" "}
                            {typeof nr.output === "string"
                              ? (nr.output as string).slice(0, 80)
                              : JSON.stringify(nr.output).slice(0, 80)}
                            ...
                          </p>
                        )}
                        {nr.error && (
                          <p className="text-xs text-error mt-0.5 truncate">
                            {nr.error}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
