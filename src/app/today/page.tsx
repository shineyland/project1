"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";

interface TaskStep {
  id: string;
  content: string;
  isComplete: boolean;
  sortOrder: number;
}

interface FullTask {
  id: string;
  planId: string;
  title: string;
  description: string | null;
  category: string | null;
  priority: string;
  status: string;
  planTitle: string;
  steps: TaskStep[];
}

const priorityConfig: Record<string, { dot: string; label: string; bg: string; text: string }> = {
  high: { dot: "bg-red-500", label: "Urgent", bg: "bg-red-50", text: "text-red-600" },
  medium: { dot: "bg-amber-500", label: "Medium", bg: "bg-amber-50", text: "text-amber-600" },
  low: { dot: "bg-emerald-500", label: "Low", bg: "bg-emerald-50", text: "text-emerald-600" },
};

export default function TodayPage() {
  const [tasks, setTasks] = useState<FullTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((data: FullTask[]) => {
        setTasks(data);
        setLoading(false);
      });
  }, []);

  async function toggleStatus(taskId: string) {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const next = task.status === "todo" ? "in_progress" : task.status === "in_progress" ? "done" : "todo";
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: next } : t)));
    await fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, status: next }),
    });
  }

  async function toggleStep(stepId: string, current: boolean) {
    setTasks((prev) =>
      prev.map((t) => ({
        ...t,
        steps: t.steps.map((s) => (s.id === stepId ? { ...s, isComplete: !current } : s)),
      }))
    );
    await fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stepId, isComplete: !current }),
    });
  }

  function toggleExpand(id: string) {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  const statusOrder: Record<string, number> = { in_progress: 0, todo: 1, done: 2 };

  const focusTasks = tasks
    .filter((t) => t.status !== "done")
    .sort((a, b) => {
      const ps = (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
      if (ps !== 0) return ps;
      return (statusOrder[a.status] ?? 1) - (statusOrder[b.status] ?? 1);
    });

  const completedToday = tasks.filter((t) => t.status === "done");
  const urgentCount = focusTasks.filter((t) => t.priority === "high").length;
  const inProgressCount = focusTasks.filter((t) => t.status === "in_progress").length;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-violet-100 border-t-violet-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8">
        <p className="text-base font-medium text-violet-600">{today}</p>
        <h1 className="text-3xl font-bold text-zinc-900 mt-2">Today&apos;s Focus</h1>
        <div className="mt-4 flex items-center gap-5 text-base">
          <span className="text-zinc-500"><span className="font-semibold text-zinc-700">{focusTasks.length}</span> tasks remaining</span>
          {urgentCount > 0 && <span className="text-red-500 font-medium">{urgentCount} urgent</span>}
          {inProgressCount > 0 && <span className="text-blue-500 font-medium">{inProgressCount} in progress</span>}
          <span className="text-emerald-500 font-medium">{completedToday.length} done</span>
        </div>
      </div>

      {focusTasks.length === 0 && completedToday.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-zinc-200 bg-white py-16 text-center">
          <p className="text-4xl mb-4">&#127881;</p>
          <p className="text-lg font-medium text-zinc-700">No tasks yet</p>
          <p className="mt-2 text-base text-zinc-400">Brain dump some thoughts to get started</p>
          <Link href="/" className="mt-5 inline-flex rounded-xl bg-violet-600 px-7 py-3 text-base font-semibold text-white hover:bg-violet-700">
            New Brain Dump
          </Link>
        </div>
      )}

      {focusTasks.length > 0 && (
        <div className="space-y-3">
          {focusTasks.map((task) => {
            const pc = priorityConfig[task.priority] || priorityConfig.low;
            const isExpanded = expandedSteps.has(task.id);
            const stepsLeft = task.steps.filter((s) => !s.isComplete).length;

            return (
              <div key={task.id} className={clsx(
                "rounded-2xl border bg-white p-6 transition-all hover:shadow-sm",
                task.status === "in_progress" ? "border-violet-200 bg-violet-50/30" : "border-zinc-200"
              )}>
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleStatus(task.id)}
                    className={clsx(
                      "mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all",
                      task.status === "in_progress"
                        ? "border-violet-500 bg-violet-50"
                        : "border-zinc-300 hover:border-zinc-400"
                    )}
                  >
                    {task.status === "in_progress" && <div className="h-2.5 w-2.5 rounded-full bg-violet-500" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-semibold text-lg text-zinc-800">{task.title}</span>
                      <span className={clsx("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold", pc.bg, pc.text)}>
                        <span className={clsx("h-2 w-2 rounded-full", pc.dot)} />
                        {pc.label}
                      </span>
                    </div>
                    {task.description && (
                      <p className="mt-2 text-base text-zinc-500">{task.description}</p>
                    )}
                    <div className="mt-3 flex items-center gap-4 text-sm text-zinc-400">
                      <Link href={`/plan/${task.planId}`} className="hover:text-violet-600 transition-colors">
                        {task.planTitle}
                      </Link>
                      {task.category && (
                        <>
                          <span className="h-1 w-1 rounded-full bg-zinc-300" />
                          <span>{task.category}</span>
                        </>
                      )}
                      {task.steps.length > 0 && (
                        <>
                          <span className="h-1 w-1 rounded-full bg-zinc-300" />
                          <button onClick={() => toggleExpand(task.id)} className="hover:text-zinc-600">
                            {stepsLeft}/{task.steps.length} steps left
                          </button>
                        </>
                      )}
                    </div>
                    {isExpanded && task.steps.length > 0 && (
                      <ul className="mt-4 space-y-2.5 pl-1 border-t border-zinc-100 pt-4">
                        {task.steps.map((step) => (
                          <li key={step.id} className="flex items-start gap-3 text-base">
                            <input
                              type="checkbox"
                              checked={step.isComplete}
                              onChange={() => toggleStep(step.id, step.isComplete)}
                              className="mt-1 h-5 w-5 rounded border-zinc-300 text-violet-600"
                            />
                            <span className={clsx(step.isComplete && "line-through text-zinc-400")}>
                              {step.content}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {completedToday.length > 0 && (
        <div className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-4">
            Completed ({completedToday.length})
          </h2>
          <div className="space-y-2">
            {completedToday.map((task) => (
              <div key={task.id} className="flex items-center gap-4 rounded-xl border border-emerald-100 bg-emerald-50/30 px-6 py-4">
                <button
                  onClick={() => toggleStatus(task.id)}
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 border-emerald-500 bg-emerald-500"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </button>
                <span className="text-base text-zinc-400 line-through">{task.title}</span>
                <span className="ml-auto text-sm text-zinc-300">{task.planTitle}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
