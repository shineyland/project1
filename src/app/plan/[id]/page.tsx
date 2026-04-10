"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
    if (!confirm("Delete this plan? This cannot be undone.")) return;
    await fetch(`/api/plans/${params.id}`, { method: "DELETE" });
    router.push("/plans");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-violet-100 border-t-violet-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12 text-center">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-10">
          <p className="text-lg font-medium text-red-600">{error}</p>
          <Link href="/plans" className="mt-4 inline-block text-base text-red-500 hover:text-red-700">
            Back to My Plans
          </Link>
        </div>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8">
        <Link
          href="/plans"
          className="inline-flex items-center gap-2 text-base text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to My Plans
        </Link>
      </div>

      <StructuredPlanSaved plan={plan} />

      <div className="mt-10 flex items-center gap-4 border-t border-zinc-200 pt-8">
        <details className="flex-1 group">
          <summary className="cursor-pointer flex items-center gap-2.5 text-base text-zinc-400 hover:text-zinc-600 transition-colors">
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="transition-transform group-open:rotate-90"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            Show original brain dump
          </summary>
          <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-zinc-100 p-6 text-base text-zinc-600 leading-relaxed">
            {plan.rawInput}
          </pre>
        </details>
        <button
          onClick={handleDelete}
          className="shrink-0 self-start rounded-xl border border-red-200 px-6 py-3 text-base font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
