"use client";

import { useState, useEffect } from "react";
import { BrainDumpInput } from "@/components/brain-dump-input";
import { StructuredPlanPreview } from "@/components/structured-plan";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useDumpProcessor } from "@/hooks/use-dump-processor";
import { clsx } from "clsx";

interface FullTask {
  id: string;
  planId: string;
  title: string;
  description: string | null;
  category: string | null;
  priority: string;
  status: string;
  planTitle: string;
  steps: { id: string; content: string; isComplete: boolean }[];
}

export default function HomePage() {
  const { state, result, rawInput, error, isProcessing, submit, addMore, reset } =
    useDumpProcessor();
  const [isSaving, setIsSaving] = useState(false);
  const [showAddMore, setShowAddMore] = useState(false);
  const [showDump, setShowDump] = useState(false);
  const [tasks, setTasks] = useState<FullTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  function fetchTasks() {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((data) => { setTasks(Array.isArray(data) ? data : []); setLoadingTasks(false); })
      .catch(() => setLoadingTasks(false));
  }

  useEffect(() => { fetchTasks(); }, []);

  async function handleSave() {
    if (!result) return;
    setIsSaving(true);
    try {
      await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawInput, plan: result }),
      });
      reset();
      setShowDump(false);
      fetchTasks();
    } catch {
      alert("Failed to save plan");
    } finally {
      setIsSaving(false);
    }
  }

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
    fetch("/api/streak", { method: "POST" });
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

  async function deleteTask(taskId: string, planId: string) {
    const reason = prompt("Why are you removing this task?");
    if (!reason || !reason.trim()) return;
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    await fetch(`/api/plans/${planId}/tasks`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", taskId }),
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

  const activeTasks = tasks
    .filter((t) => t.status !== "done")
    .sort((a, b) => {
      const ps = (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
      return ps !== 0 ? ps : (statusOrder[a.status] ?? 1) - (statusOrder[b.status] ?? 1);
    });
  const completedTasks = tasks.filter((t) => t.status === "done");
  const totalDone = completedTasks.length;
  const totalAll = tasks.length;
  const progress = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0;

  const priorityDot: Record<string, string> = { high: "bg-red-500", medium: "bg-amber-500", low: "bg-emerald-500" };
  const priorityLabel: Record<string, string> = { high: "Urgent", medium: "Medium", low: "Low" };
  const priorityStyle: Record<string, string> = { high: "bg-red-50 text-red-600", medium: "bg-amber-50 text-amber-600", low: "bg-emerald-50 text-emerald-600" };

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  // AI result view
  if (state === "success" && result) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <StructuredPlanPreview plan={result} rawInput={rawInput} onSave={handleSave} isSaving={isSaving} />
        {showAddMore ? (
          <div className="mt-8 space-y-4">
            <p className="text-base font-medium text-zinc-600">Add more tasks:</p>
            <BrainDumpInput onSubmit={(items) => { addMore(items, result); setShowAddMore(false); }} isProcessing={isProcessing} />
            <button onClick={() => setShowAddMore(false)} className="text-base text-zinc-400 hover:text-zinc-600">Cancel</button>
          </div>
        ) : (
          <div className="flex items-center gap-4 border-t border-zinc-200 mt-8 pt-6">
            <button onClick={() => setShowAddMore(true)} className="flex items-center gap-2.5 rounded-xl border border-violet-200 bg-violet-50 px-6 py-3 text-base font-medium text-violet-700 hover:bg-violet-100">
              + Add More Tasks
            </button>
            <button onClick={() => { reset(); setShowDump(false); }} className="rounded-xl border border-zinc-200 px-6 py-3 text-base font-medium text-zinc-500 hover:bg-zinc-50">Discard</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      {/* Header area */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-violet-600">{today}</p>
          <h1 className="text-3xl font-bold text-zinc-900 mt-1">My Checklist</h1>
          {totalAll > 0 && (
            <div className="mt-3 flex items-center gap-4">
              <div className="w-40 h-2.5 rounded-full bg-zinc-100 overflow-hidden">
                <div className={clsx("h-full rounded-full transition-all", progress === 100 ? "bg-emerald-500" : "bg-violet-500")} style={{ width: `${progress}%` }} />
              </div>
              <span className="text-sm text-zinc-500">{totalDone}/{totalAll} done</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {tasks.length > 0 && (
            <button
              onClick={() => setEditMode(!editMode)}
              className={clsx("rounded-xl px-4 py-2.5 text-sm font-medium transition-colors", editMode ? "bg-violet-600 text-white" : "border border-zinc-200 text-zinc-600 hover:bg-zinc-50")}
            >
              {editMode ? "Done" : "Edit"}
            </button>
          )}
          <button
            onClick={() => setShowDump(!showDump)}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Brain Dump
          </button>
        </div>
      </div>

      {/* Brain dump panel */}
      {showDump && !isProcessing && (
        <div className="mb-8">
          <BrainDumpInput onSubmit={submit} isProcessing={isProcessing} />
        </div>
      )}
      {isProcessing && <LoadingSpinner message="Organizing your thoughts..." />}
      {state === "error" && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-base text-red-600">
          <p className="font-medium">Something went wrong</p>
          <p className="mt-1 text-red-500">{error}</p>
        </div>
      )}

      {/* Task list */}
      {loadingTasks ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-100 border-t-violet-600" />
        </div>
      ) : tasks.length === 0 && !showDump ? (
        <div className="rounded-2xl border-2 border-dashed border-zinc-200 bg-white py-16 text-center">
          <p className="text-4xl mb-4">&#128161;</p>
          <p className="text-lg font-medium text-zinc-700">No tasks yet</p>
          <p className="mt-2 text-base text-zinc-400">Brain dump your thoughts to create your first checklist</p>
          <button onClick={() => setShowDump(true)} className="mt-5 inline-flex rounded-xl bg-violet-600 px-7 py-3 text-base font-semibold text-white hover:bg-violet-700">
            Start Brain Dump
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {activeTasks.map((task) => {
            const isExpanded = expandedSteps.has(task.id);
            const stepsLeft = task.steps.filter((s) => !s.isComplete).length;
            return (
              <div key={task.id} className={clsx(
                "rounded-2xl border bg-white p-5 transition-all",
                task.status === "in_progress" ? "border-violet-200 bg-violet-50/20" : "border-zinc-200"
              )}>
                <div className="flex items-start gap-4">
                  {editMode && (
                    <button onClick={() => deleteTask(task.id, task.planId)} className="mt-1 rounded-lg p-1.5 text-zinc-300 hover:bg-red-50 hover:text-red-500">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  )}
                  {!editMode && (
                    <button
                      onClick={() => toggleStatus(task.id)}
                      className={clsx("mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all",
                        task.status === "in_progress" ? "border-violet-500 bg-violet-50" : "border-zinc-300 hover:border-zinc-400"
                      )}
                    >
                      {task.status === "in_progress" && <div className="h-2.5 w-2.5 rounded-full bg-violet-500" />}
                    </button>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-semibold text-base text-zinc-800">{task.title}</span>
                      <span className={clsx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold", priorityStyle[task.priority])}>
                        <span className={clsx("h-1.5 w-1.5 rounded-full", priorityDot[task.priority])} />
                        {priorityLabel[task.priority]}
                      </span>
                      {task.category && <span className="rounded-lg bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500">{task.category}</span>}
                    </div>
                    {task.description && <p className="mt-1.5 text-sm text-zinc-500">{task.description}</p>}
                    {task.steps.length > 0 && (
                      <button onClick={() => toggleExpand(task.id)} className="mt-2 text-xs font-medium text-zinc-400 hover:text-zinc-600">
                        {isExpanded ? "Hide" : "Show"} {stepsLeft > 0 ? `${stepsLeft} remaining` : `${task.steps.length} steps`}
                      </button>
                    )}
                    {isExpanded && (
                      <ul className="mt-3 space-y-2 border-t border-zinc-100 pt-3">
                        {task.steps.map((step) => (
                          <li key={step.id} className="flex items-start gap-2.5 text-sm">
                            <input type="checkbox" checked={step.isComplete} onChange={() => toggleStep(step.id, step.isComplete)} className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-violet-600" />
                            <span className={clsx(step.isComplete && "line-through text-zinc-400")}>{step.content}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Completed */}
          {completedTasks.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">Completed ({completedTasks.length})</h2>
              <div className="space-y-1.5">
                {completedTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-4 rounded-xl border border-emerald-100 bg-emerald-50/30 px-5 py-3">
                    {editMode ? (
                      <button onClick={() => deleteTask(task.id, task.planId)} className="rounded-lg p-1 text-zinc-300 hover:bg-red-50 hover:text-red-500">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                      </button>
                    ) : (
                      <button onClick={() => toggleStatus(task.id)} className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-emerald-500 bg-emerald-500">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      </button>
                    )}
                    <span className="text-sm text-zinc-400 line-through flex-1">{task.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
