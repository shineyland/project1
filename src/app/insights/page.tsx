"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";

interface FullTask {
  id: string;
  priority: string;
  status: string;
  category: string | null;
  planTitle: string;
  planId: string;
}

interface PlanSummary {
  id: string;
  title: string;
  taskCount: number;
  doneTasks: number;
}

export default function InsightsPage() {
  const [tasks, setTasks] = useState<FullTask[]>([]);
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/tasks").then((r) => r.json()),
      fetch("/api/plans").then((r) => r.json()),
    ]).then(([taskData, planData]) => {
      setTasks(taskData);
      setPlans(planData);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-100 border-t-violet-600" />
      </div>
    );
  }

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const todo = tasks.filter((t) => t.status === "todo").length;
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  // Priority breakdown
  const highTotal = tasks.filter((t) => t.priority === "high").length;
  const highDone = tasks.filter((t) => t.priority === "high" && t.status === "done").length;
  const medTotal = tasks.filter((t) => t.priority === "medium").length;
  const medDone = tasks.filter((t) => t.priority === "medium" && t.status === "done").length;
  const lowTotal = tasks.filter((t) => t.priority === "low").length;
  const lowDone = tasks.filter((t) => t.priority === "low" && t.status === "done").length;

  // Category breakdown
  const categoryMap = new Map<string, { total: number; done: number }>();
  tasks.forEach((t) => {
    const cat = t.category || "Uncategorized";
    const curr = categoryMap.get(cat) || { total: 0, done: 0 };
    curr.total++;
    if (t.status === "done") curr.done++;
    categoryMap.set(cat, curr);
  });
  const categoryStats = [...categoryMap.entries()]
    .sort((a, b) => b[1].total - a[1].total);

  // Plan completion ranking
  const planStats = plans
    .map((p) => ({
      ...p,
      progress: p.taskCount > 0 ? Math.round((p.doneTasks / p.taskCount) * 100) : 0,
    }))
    .sort((a, b) => b.progress - a.progress);

  // Status bar widths
  const doneW = total > 0 ? (done / total) * 100 : 0;
  const ipW = total > 0 ? (inProgress / total) * 100 : 0;
  const todoW = total > 0 ? (todo / total) * 100 : 0;

  function Bar({ value, max, color }: { value: number; max: number; color: string }) {
    const pct = max > 0 ? (value / max) * 100 : 0;
    return (
      <div className="h-2 flex-1 rounded-full bg-zinc-100 overflow-hidden">
        <div className={clsx("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Insights</h1>
        <p className="mt-1 text-sm text-zinc-500">Your productivity at a glance</p>
      </div>

      {total === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-zinc-200 bg-white py-14 text-center">
          <p className="font-medium text-zinc-700">No data yet</p>
          <p className="mt-1 text-sm text-zinc-400">Create some plans to see your insights</p>
          <Link href="/" className="mt-4 inline-flex rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">
            New Brain Dump
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-center">
              <p className="text-3xl font-bold text-zinc-900">{total}</p>
              <p className="mt-1 text-xs font-medium text-zinc-400">Total Tasks</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 text-center">
              <p className="text-3xl font-bold text-emerald-700">{completionRate}%</p>
              <p className="mt-1 text-xs font-medium text-emerald-500">Completion Rate</p>
            </div>
            <div className="rounded-2xl border border-violet-200 bg-violet-50/50 p-5 text-center">
              <p className="text-3xl font-bold text-violet-700">{plans.length}</p>
              <p className="mt-1 text-xs font-medium text-violet-500">Plans Created</p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 text-center">
              <p className="text-3xl font-bold text-amber-700">{todo + inProgress}</p>
              <p className="mt-1 text-xs font-medium text-amber-500">Remaining</p>
            </div>
          </div>

          {/* Status distribution */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-zinc-700 mb-4">Status Distribution</h2>
            <div className="flex h-4 w-full overflow-hidden rounded-full bg-zinc-100">
              {doneW > 0 && <div className="bg-emerald-500 transition-all" style={{ width: `${doneW}%` }} />}
              {ipW > 0 && <div className="bg-violet-500 transition-all" style={{ width: `${ipW}%` }} />}
              {todoW > 0 && <div className="bg-zinc-300 transition-all" style={{ width: `${todoW}%` }} />}
            </div>
            <div className="mt-3 flex items-center gap-6 text-sm">
              <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-emerald-500" /> Done ({done})</span>
              <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-violet-500" /> In Progress ({inProgress})</span>
              <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-zinc-300" /> To Do ({todo})</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Priority breakdown */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-zinc-700 mb-4">By Priority</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-red-500" /> High</span>
                    <span className="text-zinc-500">{highDone}/{highTotal}</span>
                  </div>
                  <Bar value={highDone} max={highTotal} color="bg-red-500" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-500" /> Medium</span>
                    <span className="text-zinc-500">{medDone}/{medTotal}</span>
                  </div>
                  <Bar value={medDone} max={medTotal} color="bg-amber-500" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Low</span>
                    <span className="text-zinc-500">{lowDone}/{lowTotal}</span>
                  </div>
                  <Bar value={lowDone} max={lowTotal} color="bg-emerald-500" />
                </div>
              </div>
            </div>

            {/* Category breakdown */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-zinc-700 mb-4">By Category</h2>
              {categoryStats.length === 0 ? (
                <p className="text-sm text-zinc-400">No categories yet</p>
              ) : (
                <div className="space-y-3">
                  {categoryStats.map(([name, stats]) => {
                    const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
                    return (
                      <div key={name}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-zinc-700 font-medium">{name}</span>
                          <span className="text-zinc-400">{pct}%</span>
                        </div>
                        <Bar value={stats.done} max={stats.total} color="bg-violet-500" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Plan rankings */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-zinc-700 mb-4">Plan Progress</h2>
            <div className="space-y-3">
              {planStats.map((plan) => (
                <Link
                  key={plan.id}
                  href={`/plan/${plan.id}`}
                  className="flex items-center gap-4 rounded-xl p-2.5 -mx-2.5 hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-700 truncate">{plan.title}</p>
                    <p className="text-xs text-zinc-400">{plan.doneTasks}/{plan.taskCount} tasks</p>
                  </div>
                  <div className="w-24 shrink-0">
                    <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
                      <div
                        className={clsx(
                          "h-full rounded-full transition-all",
                          plan.progress === 100 ? "bg-emerald-500" : "bg-violet-500"
                        )}
                        style={{ width: `${plan.progress}%` }}
                      />
                    </div>
                  </div>
                  <span className={clsx(
                    "text-sm font-semibold w-12 text-right",
                    plan.progress === 100 ? "text-emerald-600" : "text-zinc-600"
                  )}>
                    {plan.progress}%
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
