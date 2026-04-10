"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BrainDumpInput } from "@/components/brain-dump-input";
import { StructuredPlanPreview } from "@/components/structured-plan";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useDumpProcessor } from "@/hooks/use-dump-processor";
import { clsx } from "clsx";

interface QuickPlan {
  id: string;
  title: string;
  taskCount: number;
  doneTasks: number;
  updatedAt: string;
}

export default function HomePage() {
  const router = useRouter();
  const { state, result, rawInput, error, isProcessing, submit, addMore, reset } =
    useDumpProcessor();
  const [isSaving, setIsSaving] = useState(false);
  const [showAddMore, setShowAddMore] = useState(false);
  const [recentPlans, setRecentPlans] = useState<QuickPlan[]>([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [doneTasks, setDoneTasks] = useState(0);

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then((data: QuickPlan[]) => {
        setRecentPlans(data.slice(0, 3));
        setTotalTasks(data.reduce((a: number, p: QuickPlan) => a + p.taskCount, 0));
        setDoneTasks(data.reduce((a: number, p: QuickPlan) => a + p.doneTasks, 0));
      })
      .catch(() => {});
  }, []);

  async function handleSave() {
    if (!result) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawInput, plan: result }),
      });
      const data = await res.json();
      router.push(`/plan/${data.id}`);
    } catch {
      alert("Failed to save plan");
    } finally {
      setIsSaving(false);
    }
  }

  function handleAddMore(items: string[]) {
    if (result) {
      addMore(items, result);
      setShowAddMore(false);
    }
  }

  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  if (state === "success" && result) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <StructuredPlanPreview
          plan={result}
          rawInput={rawInput}
          onSave={handleSave}
          isSaving={isSaving}
        />
        {showAddMore ? (
          <div className="mt-8 space-y-4">
            <p className="text-base font-medium text-zinc-600">Add more tasks:</p>
            <BrainDumpInput onSubmit={handleAddMore} isProcessing={isProcessing} />
            <button onClick={() => setShowAddMore(false)} className="text-base text-zinc-400 hover:text-zinc-600">
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4 border-t border-zinc-200 mt-8 pt-6">
            <button
              onClick={() => setShowAddMore(true)}
              className="flex items-center gap-2.5 rounded-xl border border-violet-200 bg-violet-50 px-6 py-3 text-base font-medium text-violet-700 hover:bg-violet-100"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              Add More Tasks
            </button>
            <button onClick={reset} className="rounded-xl border border-zinc-200 px-6 py-3 text-base font-medium text-zinc-500 hover:bg-zinc-50">
              Start Over
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
              What&apos;s on your mind?
            </h1>
            <p className="mt-2 text-base text-zinc-500">
              Dump your tasks, ideas, and goals. AI will organize everything.
            </p>
          </div>

          {!isProcessing && (
            <BrainDumpInput onSubmit={submit} isProcessing={isProcessing} />
          )}

          {isProcessing && (
            <LoadingSpinner message="Organizing your thoughts..." />
          )}

          {state === "error" && (
            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-base text-red-600">
              <p className="font-medium">Something went wrong</p>
              <p className="mt-1 text-red-500">{error}</p>
            </div>
          )}

          {!isProcessing && state !== "error" && (
            <div className="mt-8 grid grid-cols-3 gap-4">
              <Link href="/today" className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:border-violet-200 hover:shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-semibold text-zinc-700">Today</p>
                  <p className="text-sm text-zinc-400">Focus view</p>
                </div>
              </Link>
              <Link href="/tasks" className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:border-violet-200 hover:shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-semibold text-zinc-700">All Tasks</p>
                  <p className="text-sm text-zinc-400">Filter & search</p>
                </div>
              </Link>
              <Link href="/insights" className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:border-violet-200 hover:shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                </div>
                <div>
                  <p className="text-base font-semibold text-zinc-700">Insights</p>
                  <p className="text-sm text-zinc-400">Stats & trends</p>
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5 lg:pt-12">
          {totalTasks > 0 && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">Overall Progress</p>
              <div className="flex items-end gap-3 mb-3">
                <span className="text-4xl font-bold text-zinc-900">{progress}%</span>
                <span className="text-base text-zinc-400 mb-1">{doneTasks}/{totalTasks}</span>
              </div>
              <div className="h-3 rounded-full bg-zinc-100 overflow-hidden">
                <div className="h-full rounded-full bg-violet-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {recentPlans.length > 0 && (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Recent Plans</p>
                <Link href="/plans" className="text-sm font-medium text-violet-600 hover:text-violet-700">View all</Link>
              </div>
              <div className="space-y-4">
                {recentPlans.map((plan) => {
                  const p = plan.taskCount > 0 ? Math.round((plan.doneTasks / plan.taskCount) * 100) : 0;
                  return (
                    <Link key={plan.id} href={`/plan/${plan.id}`} className="block rounded-xl p-3 -mx-3 hover:bg-zinc-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <p className="text-base font-medium text-zinc-700 truncate pr-3">{plan.title}</p>
                        <span className={clsx("text-sm font-semibold", p === 100 ? "text-emerald-600" : "text-zinc-400")}>{p}%</span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                        <div className={clsx("h-full rounded-full transition-all", p === 100 ? "bg-emerald-500" : "bg-violet-500")} style={{ width: `${p}%` }} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {recentPlans.length === 0 && totalTasks === 0 && (
            <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-8 text-center">
              <p className="text-base text-zinc-500">Your plans will appear here</p>
              <p className="mt-1 text-sm text-zinc-400">Start by dumping your thoughts</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
