"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { clsx } from "clsx";

interface TaskStep {
  id: string;
  content: string;
  isComplete: boolean;
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

type FilterStatus = "all" | "todo" | "in_progress" | "done";
type FilterPriority = "all" | "high" | "medium" | "low";

export default function TasksPage() {
  const [tasks, setTasks] = useState<FullTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterPriority, setFilterPriority] = useState<FilterPriority>("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [search, setSearch] = useState("");

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

  const categories = [...new Set(tasks.map((t) => t.category).filter(Boolean))] as string[];

  const filtered = tasks.filter((t) => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    if (filterCategory !== "all" && t.category !== filterCategory) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const statusCounts = {
    all: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  const statusStyles: Record<string, { icon: string; border: string; bg: string }> = {
    todo: { icon: "border-zinc-300", border: "border-zinc-300", bg: "" },
    in_progress: { icon: "border-violet-500 bg-violet-50", border: "border-violet-200", bg: "bg-violet-50/30" },
    done: { icon: "border-emerald-500 bg-emerald-500", border: "border-emerald-100", bg: "bg-emerald-50/30" },
  };

  const priorityDot: Record<string, string> = { high: "bg-red-500", medium: "bg-amber-500", low: "bg-emerald-500" };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-100 border-t-violet-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">All Tasks</h1>
          <p className="mt-1 text-sm text-zinc-500">{tasks.length} tasks across all plans</p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Dump
        </Link>
      </div>

      {/* Search + Filters */}
      <div className="mb-5 space-y-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks..."
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 outline-none focus:border-violet-300 focus:ring-1 focus:ring-violet-300"
        />
        <div className="flex flex-wrap gap-2">
          {/* Status filters */}
          {(["all", "todo", "in_progress", "done"] as FilterStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={clsx(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                filterStatus === s
                  ? "bg-violet-600 text-white"
                  : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
              )}
            >
              {s === "all" ? "All" : s === "todo" ? "To Do" : s === "in_progress" ? "In Progress" : "Done"}
              <span className="ml-1.5 opacity-70">{statusCounts[s]}</span>
            </button>
          ))}

          <span className="w-px bg-zinc-200 mx-1" />

          {/* Priority filters */}
          {(["all", "high", "medium", "low"] as FilterPriority[]).map((p) => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={clsx(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                filterPriority === p
                  ? "bg-violet-600 text-white"
                  : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
              )}
            >
              {p === "all" ? "Any Priority" : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}

          {/* Category filter */}
          {categories.length > 0 && (
            <>
              <span className="w-px bg-zinc-200 mx-1" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white py-12 text-center">
          <p className="text-zinc-500">No tasks match your filters</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((task) => {
            const ss = statusStyles[task.status] || statusStyles.todo;
            return (
              <div
                key={task.id}
                className={clsx("flex items-center gap-3 rounded-xl border px-4 py-3 transition-all hover:shadow-sm", ss.border, ss.bg || "bg-white")}
              >
                <button
                  onClick={() => toggleStatus(task.id)}
                  className={clsx(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all",
                    ss.icon
                  )}
                >
                  {task.status === "done" && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                  {task.status === "in_progress" && <div className="h-2 w-2 rounded-full bg-violet-500" />}
                </button>
                <div className="flex-1 min-w-0">
                  <span className={clsx("text-sm font-medium", task.status === "done" && "line-through text-zinc-400")}>
                    {task.title}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className={clsx("h-2 w-2 rounded-full", priorityDot[task.priority] || "bg-zinc-300")} title={task.priority} />
                  {task.category && (
                    <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500">{task.category}</span>
                  )}
                  <Link href={`/plan/${task.planId}`} className="text-[11px] text-zinc-400 hover:text-violet-600 truncate max-w-[100px]">
                    {task.planTitle}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
