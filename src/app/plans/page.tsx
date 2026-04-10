"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlanCard } from "@/components/plan-card";

interface PlanSummary {
  id: string;
  title: string;
  summary: string | null;
  createdAt: string;
  taskCount: number;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then((data) => {
        setPlans(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">My Plans</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {plans.length > 0
              ? `${plans.length} plan${plans.length !== 1 ? "s" : ""} saved`
              : "Your organized plans will appear here"}
          </p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-700 hover:shadow active:scale-[0.98]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Dump
        </Link>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-100 border-t-violet-600" />
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Failed to load plans. Please refresh the page.
        </div>
      )}

      {!loading && !error && plans.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-zinc-200 bg-white py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <p className="text-zinc-500 font-medium">No plans yet</p>
          <p className="mt-1 text-sm text-zinc-400">Start by dumping your thoughts and saving a plan</p>
          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-700"
          >
            Create Your First Plan
          </Link>
        </div>
      )}

      {!loading && !error && plans.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              id={plan.id}
              title={plan.title}
              summary={plan.summary}
              createdAt={plan.createdAt}
              taskCount={plan.taskCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}
