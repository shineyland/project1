"use client";

import { useState, useEffect } from "react";
import { BrainDumpInput } from "@/components/brain-dump-input";
import { StructuredPlanPreview } from "@/components/structured-plan";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useDumpProcessor } from "@/hooks/use-dump-processor";
import { clsx } from "clsx";

interface FullTask {
  id: string; planId: string; title: string; description: string | null;
  category: string | null; priority: string; status: string; planTitle: string;
  steps: { id: string; content: string; isComplete: boolean }[];
}

export default function HomePage() {
  const { state, result, rawInput, error, isProcessing, submit, addMore, reset } = useDumpProcessor();
  const [isSaving, setIsSaving] = useState(false);
  const [showDump, setShowDump] = useState(false);
  const [tasks, setTasks] = useState<FullTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  function fetchTasks() {
    fetch("/api/tasks").then((r) => r.json())
      .then((d) => { setTasks(Array.isArray(d) ? d : []); setLoadingTasks(false); })
      .catch(() => setLoadingTasks(false));
  }
  useEffect(() => { fetchTasks(); }, []);

  async function handleSave() {
    if (!result) return;
    setIsSaving(true);
    try {
      await fetch("/api/plans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rawInput, plan: result }) });
      reset(); setShowDump(false); fetchTasks();
    } catch { alert("Failed to save"); } finally { setIsSaving(false); }
  }

  async function toggleStatus(taskId: string) {
    const task = tasks.find((t) => t.id === taskId); if (!task) return;
    const next = task.status === "todo" ? "in_progress" : task.status === "in_progress" ? "done" : "todo";
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: next } : t)));
    await fetch("/api/tasks", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskId, status: next }) });
    fetch("/api/streak", { method: "POST" });
  }

  async function toggleStep(stepId: string, current: boolean) {
    setTasks((prev) => prev.map((t) => ({ ...t, steps: t.steps.map((s) => (s.id === stepId ? { ...s, isComplete: !current } : s)) })));
    await fetch("/api/tasks", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stepId, isComplete: !current }) });
  }

  async function deleteTask(taskId: string, planId: string) {
    const reason = prompt("Why are you removing this task?");
    if (!reason?.trim()) return;
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    await fetch(`/api/plans/${planId}/tasks`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete", taskId }) });
  }

  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  const activeTasks = tasks.filter((t) => t.status !== "done").sort((a, b) => (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2));
  const completedTasks = tasks.filter((t) => t.status === "done");
  const progress = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
  const pDot: Record<string, string> = { high: "bg-red-500", medium: "bg-amber-500", low: "bg-emerald-500" };
  const pLabel: Record<string, string> = { high: "Urgent", medium: "Medium", low: "Low" };
  const pStyle: Record<string, string> = { high: "bg-red-50 text-red-600", medium: "bg-amber-50 text-amber-600", low: "bg-emerald-50 text-emerald-600" };
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  if (state === "success" && result) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-6">
        <StructuredPlanPreview plan={result} rawInput={rawInput} onSave={handleSave} isSaving={isSaving} />
        <div className="flex items-center gap-3 border-t border-zinc-200 mt-5 pt-4">
          <button onClick={() => { const items = prompt("Add more tasks (comma separated):"); if (items) addMore(items.split(",").map((s) => s.trim()).filter(Boolean), result); }}
            className="flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-5 py-2.5 text-sm font-medium text-violet-700 hover:bg-violet-100">+ Add More</button>
          <button onClick={() => { reset(); setShowDump(false); }} className="rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-500 hover:bg-zinc-50">Discard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-5">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-violet-600 uppercase tracking-wider">{today}</p>
          <h1 className="text-2xl font-bold text-zinc-900 mt-0.5">My Checklist</h1>
        </div>
        <div className="flex items-center gap-2">
          {tasks.length > 0 && (
            <button onClick={() => setEditMode(!editMode)} className={clsx("rounded-xl px-4 py-2 text-sm font-medium", editMode ? "bg-violet-600 text-white" : "border border-zinc-200 text-zinc-600 hover:bg-zinc-50")}>
              {editMode ? "Done" : "Edit"}
            </button>
          )}
          <button onClick={() => setShowDump(!showDump)} className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700">
            {showDump ? "Close" : "+ Brain Dump"}
          </button>
        </div>
      </div>

      {/* Progress */}
      {tasks.length > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-2.5 rounded-full bg-zinc-100 overflow-hidden">
            <div className={clsx("h-full rounded-full transition-all", progress === 100 ? "bg-emerald-500" : "bg-violet-500")} style={{ width: `${progress}%` }} />
          </div>
          <span className="text-sm font-semibold text-zinc-600">{completedTasks.length}/{tasks.length}</span>
          {progress === 100 && <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">All done!</span>}
        </div>
      )}

      {/* Brain dump panel */}
      {showDump && !isProcessing && <div className="mb-4"><BrainDumpInput onSubmit={submit} isProcessing={isProcessing} /></div>}
      {isProcessing && <LoadingSpinner message="Organizing your thoughts..." />}
      {state === "error" && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600"><p className="font-medium">Error: {error}</p></div>}

      {/* Empty state */}
      {!loadingTasks && tasks.length === 0 && !showDump && (
        <div className="rounded-2xl border-2 border-dashed border-zinc-200 py-12 text-center">
          <p className="text-3xl mb-3">&#128161;</p>
          <p className="text-lg font-semibold text-zinc-700">No tasks yet</p>
          <p className="text-sm text-zinc-400 mt-1">Brain dump your thoughts to get started</p>
          <button onClick={() => setShowDump(true)} className="mt-4 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">Start Brain Dump</button>
        </div>
      )}

      {/* Loading */}
      {loadingTasks && <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-100 border-t-violet-600" /></div>}

      {/* Active tasks */}
      {activeTasks.length > 0 && (
        <div className="space-y-1.5 mb-4">
          {activeTasks.map((task) => {
            const isExpanded = expandedSteps.has(task.id);
            const stepsLeft = task.steps.filter((s) => !s.isComplete).length;
            return (
              <div key={task.id} className={clsx("rounded-2xl border p-4 transition-all", task.status === "in_progress" ? "border-violet-200" : "border-zinc-200")}>
                <div className="flex items-start gap-3">
                  {editMode ? (
                    <button onClick={() => deleteTask(task.id, task.planId)} className="mt-0.5 rounded-lg p-1.5 text-zinc-300 hover:bg-red-50 hover:text-red-500">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                    </button>
                  ) : (
                    <button onClick={() => toggleStatus(task.id)} className={clsx("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all",
                      task.status === "in_progress" ? "border-violet-500 bg-violet-50" : "border-zinc-300 hover:border-zinc-400")}>
                      {task.status === "in_progress" && <div className="h-2.5 w-2.5 rounded-full bg-violet-500" />}
                    </button>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[15px] text-zinc-800">{task.title}</span>
                      <span className={clsx("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", pStyle[task.priority])}>
                        <span className={clsx("h-1.5 w-1.5 rounded-full", pDot[task.priority])} />{pLabel[task.priority]}
                      </span>
                      {task.category && <span className="rounded-lg bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-500">{task.category}</span>}
                    </div>
                    {task.description && <p className="mt-1 text-sm text-zinc-500">{task.description}</p>}
                    {task.steps.length > 0 && (
                      <button onClick={() => { const n = new Set(expandedSteps); n.has(task.id) ? n.delete(task.id) : n.add(task.id); setExpandedSteps(n); }}
                        className="mt-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-600">
                        {isExpanded ? "Hide" : `${stepsLeft > 0 ? stepsLeft + " remaining" : task.steps.length + " steps"}`}
                      </button>
                    )}
                    {isExpanded && (
                      <ul className="mt-2 space-y-1.5 border-t border-zinc-100 pt-2">
                        {task.steps.map((s) => (
                          <li key={s.id} className="flex items-start gap-2 text-sm">
                            <input type="checkbox" checked={s.isComplete} onChange={() => toggleStep(s.id, s.isComplete)} className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-violet-600" />
                            <span className={clsx(s.isComplete && "line-through text-zinc-400")}>{s.content}</span>
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

      {/* Completed */}
      {completedTasks.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Completed ({completedTasks.length})</h2>
          <div className="space-y-1">
            {completedTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 rounded-xl border border-emerald-100 px-4 py-2.5">
                {editMode ? (
                  <button onClick={() => deleteTask(task.id, task.planId)} className="rounded-lg p-1 text-zinc-300 hover:bg-red-50 hover:text-red-500">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                  </button>
                ) : (
                  <button onClick={() => toggleStatus(task.id)} className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-emerald-500 bg-emerald-500">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </button>
                )}
                <span className="text-sm text-zinc-400 line-through">{task.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
