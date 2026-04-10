"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { PlanCard } from "@/components/plan-card";

interface UpcomingTask {
  id: string;
  title: string;
  priority: string;
  status: string;
  category: string | null;
}

interface PlanSummary {
  id: string;
  title: string;
  summary: string | null;
  createdAt: string;
  updatedAt: string;
  taskCount: number;
  doneTasks: number;
  inProgressTasks: number;
  highPriority: number;
  categories: string[];
  upcoming: UpcomingTask[];
}

export default function PlansPage() {
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchPlans = useCallback(() => {
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

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this plan? This cannot be undone.")) return;
    await fetch(`/api/plans/${id}`, { method: "DELETE" });
    setPlans((prev) => prev.filter((p) => p.id !== id));
  }

  // Aggregate stats
  const totalTasks = plans.reduce((a, p) => a + p.taskCount, 0);
  const totalDone = plans.reduce((a, p) => a + p.doneTasks, 0);
  const totalInProgress = plans.reduce((a, p) => a + p.inProgressTasks, 0);
  const totalUrgent = plans.reduce((a, p) => a + p.highPriority, 0);
  const overallProgress = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">My Plans</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Track your organized plans and stay on top of tasks
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
          <p className="mt-1 text-sm text-zinc-400">Brain dump your thoughts and AI will organize them into plans</p>
          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-700"
          >
            Create Your First Plan
          </Link>
        </div>
      )}

      {!loading && !error && plans.length > 0 && (
        <>
          {/* Stats overview */}
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Total Tasks</p>
              <p className="mt-1 text-2xl font-bold text-zinc-900">{totalTasks}</p>
              <div className="mt-2 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-violet-500 transition-all"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] text-zinc-400">{overallProgress}% complete</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">Completed</p>
              <p className="mt-1 text-2xl font-bold text-emerald-700">{totalDone}</p>
              <p className="mt-3 text-[11px] text-emerald-500">
                {totalTasks > 0 ? `${totalTasks - totalDone} remaining` : "No tasks yet"}
              </p>
            </div>
            <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">In Progress</p>
              <p className="mt-1 text-2xl font-bold text-blue-700">{totalInProgress}</p>
              <p className="mt-3 text-[11px] text-blue-500">
                Active right now
              </p>
            </div>
            <div className="rounded-2xl border border-red-200 bg-red-50/50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-red-600">Urgent</p>
              <p className="mt-1 text-2xl font-bold text-red-700">{totalUrgent}</p>
              <p className="mt-3 text-[11px] text-red-500">
                {totalUrgent > 0 ? "Need attention" : "All clear"}
              </p>
            </div>
          </div>

          {/* Plan cards */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
              {plans.length} Plan{plans.length !== 1 ? "s" : ""}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  id={plan.id}
                  title={plan.title}
                  summary={plan.summary}
                  createdAt={plan.createdAt}
                  taskCount={plan.taskCount}
                  doneTasks={plan.doneTasks}
                  inProgressTasks={plan.inProgressTasks}
                  highPriority={plan.highPriority}
                  categories={plan.categories}
                  upcoming={plan.upcoming}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
