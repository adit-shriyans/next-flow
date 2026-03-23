"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { WorkflowEditor } from "@/components/workflow/WorkflowEditor";
import { useWorkflowStore } from "@/lib/store";
import { Loader2 } from "lucide-react";

export default function WorkflowEditorPage() {
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadWorkflow = useWorkflowStore((s) => s.loadWorkflow);

  useEffect(() => {
    if (!params.id) return;

    if (params.id === "new") {
      loadWorkflow("", "Untitled Workflow", [], []);
      setLoading(false);
      return;
    }

    fetch(`/api/workflows/${params.id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load workflow");
        return r.json();
      })
      .then((wf) => {
        const data = wf.data ?? { nodes: [], edges: [] };
        loadWorkflow(wf.id, wf.name, data.nodes ?? [], data.edges ?? []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.id, loadWorkflow]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <Loader2 size={32} className="animate-spin text-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <div className="text-center">
          <p className="text-error mb-2">{error}</p>
          <a href="/workflow" className="text-sm text-accent hover:underline">
            Back to workflows
          </a>
        </div>
      </div>
    );
  }

  return <WorkflowEditor />;
}
