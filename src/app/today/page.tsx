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
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const next = t.status === "todo" ? "in_progress" : t.status === "in_progress" ? "done" : "todo";
        return { ...t, status: next };
      })
    );
    const task = tasks.find((t) => t.id === taskId);
    const next = task?.status === "todo" ? "in_progress" : task?.status === "in_progress" ? "done" : "todo";
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

  // Focus tasks: high priority not done, then in_progress, then medium todo
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
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-100 border-t-violet-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm font-medium text-violet-600">{today}</p>
        <h1 className="text-2xl font-bold text-zinc-900 mt-1">Today&apos;s Focus</h1>
        <div className="mt-3 flex items-center gap-4 text-sm">
          <span className="text-zinc-500"><span className="font-semibold text-zinc-700">{focusTasks.length}</span> tasks remaining</span>
          {urgentCount > 0 && <span className="text-red-500 font-medium">{urgentCount} urgent</span>}
          {inProgressCount > 0 && <span className="text-blue-500 font-medium">{inProgressCount} in progress</span>}
          <span className="text-emerald-500 font-medium">{completedToday.length} done</span>
        </div>
      </div>

      {focusTasks.length === 0 && completedToday.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-zinc-200 bg-white py-14 text-center">
          <p className="text-3xl mb-3">&#127881;</p>
          <p className="font-medium text-zinc-700">No tasks yet</p>
          <p className="mt-1 text-sm text-zinc-400">Brain dump some thoughts to get started</p>
          <Link href="/" className="mt-4 inline-flex rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">
            New Brain Dump
          </Link>
        </div>
      )}

      {/* Focus tasks */}
      {focusTasks.length > 0 && (
        <div className="space-y-2">
          {focusTasks.map((task) => {
            const pc = priorityConfig[task.priority] || priorityConfig.low;
            const isExpanded = expandedSteps.has(task.id);
            const stepsLeft = task.steps.filter((s) => !s.isComplete).length;

            return (
              <div key={task.id} className={clsx(
                "rounded-xl border bg-white p-4 transition-all hover:shadow-sm",
                task.status === "in_progress" ? "border-violet-200 bg-violet-50/30" : "border-zinc-200"
              )}>
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleStatus(task.id)}
                    className={clsx(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all",
                      task.status === "in_progress"
                        ? "border-violet-500 bg-violet-50"
                        : "border-zinc-300 hover:border-zinc-400"
                    )}
                  >
                    {task.status === "in_progress" && <div className="h-2 w-2 rounded-full bg-violet-500" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-[15px] text-zinc-800">{task.title}</span>
                      <span className={clsx("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold", pc.bg, pc.text)}>
                        <span className={clsx("h-1.5 w-1.5 rounded-full", pc.dot)} />
                        {pc.label}
                      </span>
                    </div>
                    {task.description && (
                      <p className="mt-1 text-sm text-zinc-500">{task.description}</p>
                    )}
                    <div className="mt-2 flex items-center gap-3 text-xs text-zinc-400">
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
                      <ul className="mt-3 space-y-1.5 pl-0.5 border-t border-zinc-100 pt-3">
                        {task.steps.map((step) => (
                          <li key={step.id} className="flex items-start gap-2.5 text-sm">
                            <input
                              type="checkbox"
                              checked={step.isComplete}
                              onChange={() => toggleStep(step.id, step.isComplete)}
                              className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-violet-600"
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

      {/* Completed section */}
      {completedToday.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3">
            Completed ({completedToday.length})
          </h2>
          <div className="space-y-1.5">
            {completedToday.map((task) => (
              <div key={task.id} className="flex items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50/30 px-4 py-2.5">
                <button
                  onClick={() => toggleStatus(task.id)}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-emerald-500 bg-emerald-500"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </button>
                <span className="text-sm text-zinc-400 line-through">{task.title}</span>
                <span className="ml-auto text-xs text-zinc-300">{task.planTitle}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
