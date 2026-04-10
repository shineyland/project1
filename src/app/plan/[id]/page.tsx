"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { StructuredPlanSaved } from "@/components/structured-plan";
import type { SavedPlan } from "@/lib/types";

export default function PlanPage() {
  const params = useParams();
  const router = useRouter();
  const [plan, setPlan] = useState<SavedPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/plans/${params.id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Plan not found");
        return r.json();
      })
      .then((data) => {
        setPlan(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [params.id]);

  async function handleDelete() {
    if (!confirm("Delete this plan?")) return;
    await fetch(`/api/plans/${params.id}`, { method: "DELETE" });
    router.push("/plans");
  }

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-8 text-zinc-400">Loading...</div>;
  if (error) return <div className="mx-auto max-w-4xl px-4 py-8 text-red-500">{error}</div>;
  if (!plan) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <StructuredPlanSaved plan={plan} />
      <div className="mt-8 flex gap-3 border-t border-zinc-200 pt-6">
        <details className="flex-1">
          <summary className="cursor-pointer text-sm text-zinc-400 hover:text-zinc-600">
            Show original brain dump
          </summary>
          <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-zinc-100 p-4 text-sm text-zinc-600">
            {plan.rawInput}
          </pre>
        </details>
        <button
          onClick={handleDelete}
          className="shrink-0 self-start rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          Delete Plan
        </button>
      </div>
    </div>
  );
}
