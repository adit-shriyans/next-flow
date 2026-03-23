"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Loader2,
  Workflow,
  Trash2,
  Clock,
  Sparkles,
} from "lucide-react";
import { getSampleWorkflow } from "@/lib/sample-workflow";

interface WorkflowItem {
  id: string;
  name: string;
  updatedAt: string;
}

export default function WorkflowListPage() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchWorkflows = () => {
    setLoading(true);
    fetch("/api/workflows")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setWorkflows(Array.isArray(data) ? data : []))
      .catch(() => setWorkflows([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const handleCreate = async () => {
    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Untitled Workflow",
          data: { nodes: [], edges: [] },
        }),
      });
      if (res.ok) {
        const wf = await res.json();
        router.push(`/workflow/${wf.id}`);
      }
    } catch (err) {
      console.error("Failed to create workflow:", err);
    }
  };

  const handleLoadSample = async () => {
    try {
      const sampleData = getSampleWorkflow();
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Product Marketing Kit Generator",
          data: sampleData,
        }),
      });
      if (res.ok) {
        const wf = await res.json();
        router.push(`/workflow/${wf.id}`);
      }
    } catch (err) {
      console.error("Failed to create sample workflow:", err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this workflow?")) return;
    try {
      await fetch(`/api/workflows/${id}`, { method: "DELETE" });
      fetchWorkflows();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Workflows</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Create and manage your AI workflows
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadSample}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-accent text-accent-light hover:bg-accent/10 transition-colors text-sm font-medium"
            >
              <Sparkles size={16} />
              Sample Workflow
            </button>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white hover:bg-accent-light transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              New Workflow
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-zinc-500" />
          </div>
        )}

        {!loading && workflows.length === 0 && (
          <div className="text-center py-20">
            <Workflow size={48} className="mx-auto mb-4 text-zinc-700" />
            <h2 className="text-lg font-medium text-zinc-400 mb-2">
              No workflows yet
            </h2>
            <p className="text-sm text-zinc-600 mb-6">
              Create your first workflow to get started
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={handleLoadSample}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-accent text-accent-light hover:bg-accent/10 transition-colors text-sm font-medium"
              >
                <Sparkles size={16} />
                Load Sample
              </button>
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white hover:bg-accent-light transition-colors text-sm font-medium"
              >
                <Plus size={16} />
                Create Workflow
              </button>
            </div>
          </div>
        )}

        {!loading && workflows.length > 0 && (
          <div className="grid gap-3">
            {workflows.map((wf) => (
              <div
                key={wf.id}
                onClick={() => router.push(`/workflow/${wf.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && router.push(`/workflow/${wf.id}`)}
                className="flex items-center justify-between w-full px-5 py-4 bg-surface border border-border rounded-xl hover:border-accent/50 transition-colors text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Workflow size={20} className="text-accent shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-zinc-200 group-hover:text-white">
                      {wf.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock size={12} className="text-zinc-600" />
                      <span className="text-xs text-zinc-600">
                        {new Date(wf.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(wf.id, e)}
                  className="p-2 rounded-lg text-zinc-600 hover:text-error hover:bg-error/10 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
