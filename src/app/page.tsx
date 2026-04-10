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
  scheduledTime: string | null; duration: number | null;
  steps: { id: string; content: string; isComplete: boolean }[];
}

export default function HomePage() {
  const { state, result, rawInput, error, isProcessing, submit, reset } = useDumpProcessor();
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

  async function updateTask(taskId: string, field: string, value: string | number) {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, [field]: value } : t)));
    await fetch("/api/tasks", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskId, [field]: value }) });
  }

  // Sort by scheduled time, then priority
  const sortedActive = tasks
    .filter((t) => t.status !== "done")
    .sort((a, b) => {
      if (a.scheduledTime && b.scheduledTime) return a.scheduledTime.localeCompare(b.scheduledTime);
      if (a.scheduledTime) return -1;
      if (b.scheduledTime) return 1;
      const po: Record<string, number> = { high: 0, medium: 1, low: 2 };
      return (po[a.priority] ?? 2) - (po[b.priority] ?? 2);
    });
  const completedTasks = tasks.filter((t) => t.status === "done");
  const progress = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  const pDot: Record<string, string> = { high: "#ef4444", medium: "#f59e0b", low: "#10b981" };
  const pLabel: Record<string, string> = { high: "Urgent", medium: "Medium", low: "Low" };
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  // Current time marker
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  function timeToMinutes(t: string) {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  }

  function formatTime(t: string) {
    const [h, m] = t.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${h12}:${m} ${ampm}`;
  }

  // AI result view
  if (state === "success" && result) {
    return (
      <div className="mx-auto max-w-5xl px-5 py-6">
        <StructuredPlanPreview plan={result} rawInput={rawInput} onSave={handleSave} isSaving={isSaving} />
        <div className="flex items-center gap-3 border-t border-zinc-200 mt-5 pt-4">
          <button onClick={() => { reset(); setShowDump(false); }} className="rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-500 hover:bg-zinc-50">Discard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#7c3aed" }}>{today}</p>
          <h1 className="text-2xl font-bold mt-0.5" style={{ color: "#000" }}>My Day</h1>
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
          <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.05)" }}>
            <div className={clsx("h-full rounded-full transition-all", progress === 100 ? "bg-emerald-500" : "bg-violet-500")} style={{ width: `${progress}%` }} />
          </div>
          <span className="text-sm font-semibold" style={{ color: "#333" }}>{completedTasks.length}/{tasks.length}</span>
          {progress === 100 && <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#ecfdf5", color: "#047857" }}>All done!</span>}
        </div>
      )}

      {/* Brain dump */}
      {showDump && !isProcessing && <div className="mb-4"><BrainDumpInput onSubmit={submit} isProcessing={isProcessing} /></div>}
      {isProcessing && <LoadingSpinner message="Creating your daily schedule..." />}
      {state === "error" && <div className="mb-4 rounded-2xl border border-red-200 p-4 text-sm" style={{ background: "#fef2f2", color: "#dc2626" }}>Error: {error}</div>}

      {/* Empty state */}
      {!loadingTasks && tasks.length === 0 && !showDump && (
        <div className="rounded-2xl border-2 border-dashed py-12 text-center" style={{ borderColor: "rgba(0,0,0,0.08)" }}>
          <p style={{ fontSize: "2rem" }}>&#128161;</p>
          <p className="text-lg font-semibold mt-2" style={{ color: "#000" }}>No schedule yet</p>
          <p className="text-sm mt-1" style={{ color: "#888" }}>Click <strong>+ Brain Dump</strong> to create your daily routine</p>
        </div>
      )}

      {loadingTasks && <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-100 border-t-violet-600" /></div>}

      {/* Daily schedule timeline */}
      {sortedActive.length > 0 && (
        <div className="space-y-1.5 mb-4">
          {sortedActive.map((task) => {
            const isExpanded = expandedSteps.has(task.id);
            const stepsLeft = task.steps.filter((s) => !s.isComplete).length;
            const isPast = task.scheduledTime && timeToMinutes(task.scheduledTime) + (task.duration || 30) < nowMinutes;
            const isCurrent = task.scheduledTime &&
              timeToMinutes(task.scheduledTime) <= nowMinutes &&
              timeToMinutes(task.scheduledTime) + (task.duration || 30) >= nowMinutes;

            return (
              <div key={task.id} className={clsx("rounded-2xl border p-4 transition-all",
                isCurrent ? "border-violet-300 ring-2 ring-violet-100" :
                isPast ? "border-zinc-100 opacity-60" : "border-zinc-200"
              )}>
                <div className="flex items-start gap-3">
                  {/* Time column */}
                  {!editMode && (
                    <div className="w-16 shrink-0 pt-0.5 text-right">
                      {task.scheduledTime ? (
                        <div>
                          <p className="text-sm font-bold" style={{ color: isCurrent ? "#7c3aed" : "#000" }}>{formatTime(task.scheduledTime)}</p>
                          {task.duration && <p className="text-[10px]" style={{ color: "#999" }}>{task.duration}m</p>}
                        </div>
                      ) : (
                        <p className="text-xs" style={{ color: "#bbb" }}>No time</p>
                      )}
                    </div>
                  )}

                  {/* Edit controls */}
                  {editMode && (
                    <div className="flex items-center gap-2 shrink-0">
                      <input type="time" value={task.scheduledTime || ""} onChange={(e) => updateTask(task.id, "scheduledTime", e.target.value)}
                        className="rounded-lg border border-zinc-200 px-2 py-1 text-xs w-24" style={{ background: "white" }} />
                      <input type="number" value={task.duration || ""} onChange={(e) => updateTask(task.id, "duration", parseInt(e.target.value) || 0)} placeholder="min"
                        className="rounded-lg border border-zinc-200 px-2 py-1 text-xs w-14" style={{ background: "white" }} />
                      <select value={task.priority} onChange={(e) => updateTask(task.id, "priority", e.target.value)}
                        className="rounded-lg border border-zinc-200 px-2 py-1 text-xs" style={{ background: "white" }}>
                        <option value="high">Urgent</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                      <button onClick={() => deleteTask(task.id, task.planId)} className="rounded-lg p-1 text-zinc-300 hover:bg-red-50 hover:text-red-500">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </button>
                    </div>
                  )}

                  {/* Status toggle */}
                  {!editMode && (
                    <button onClick={() => toggleStatus(task.id)} className={clsx("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2",
                      task.status === "in_progress" ? "border-violet-500 bg-violet-50" : "border-zinc-300 hover:border-zinc-400")}>
                      {task.status === "in_progress" && <div className="h-2.5 w-2.5 rounded-full bg-violet-500" />}
                    </button>
                  )}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[15px]" style={{ color: "#000" }}>{task.title}</span>
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: pDot[task.priority] + "18", color: pDot[task.priority] }}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: pDot[task.priority] }} />
                        {pLabel[task.priority]}
                      </span>
                      {task.category && <span className="rounded-lg px-2 py-0.5 text-[10px]" style={{ background: "rgba(0,0,0,0.04)", color: "#666" }}>{task.category}</span>}
                      {isCurrent && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#f5f3ff", color: "#7c3aed" }}>NOW</span>}
                    </div>
                    {task.description && <p className="mt-1 text-sm" style={{ color: "#666" }}>{task.description}</p>}
                    {task.steps.length > 0 && !editMode && (
                      <button onClick={() => { const n = new Set(expandedSteps); n.has(task.id) ? n.delete(task.id) : n.add(task.id); setExpandedSteps(n); }}
                        className="mt-1.5 text-xs font-medium" style={{ color: "#999" }}>
                        {isExpanded ? "Hide" : `${stepsLeft > 0 ? stepsLeft + " remaining" : task.steps.length + " steps"}`}
                      </button>
                    )}
                    {isExpanded && (
                      <ul className="mt-2 space-y-1.5 border-t pt-2" style={{ borderColor: "rgba(0,0,0,0.04)" }}>
                        {task.steps.map((s) => (
                          <li key={s.id} className="flex items-start gap-2 text-sm">
                            <input type="checkbox" checked={s.isComplete} onChange={() => toggleStep(s.id, s.isComplete)} className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-violet-600" />
                            <span className={clsx(s.isComplete && "line-through")} style={{ color: s.isComplete ? "#bbb" : "#333" }}>{s.content}</span>
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
          <h2 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#999" }}>Completed ({completedTasks.length})</h2>
          <div className="space-y-1">
            {completedTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 rounded-xl border px-4 py-2.5" style={{ borderColor: "rgba(52,211,153,0.15)", background: "rgba(240,253,244,0.5)" }}>
                {editMode ? (
                  <button onClick={() => deleteTask(task.id, task.planId)} className="rounded-lg p-1 text-zinc-300 hover:bg-red-50 hover:text-red-500">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                ) : (
                  <button onClick={() => toggleStatus(task.id)} data-solid className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md" style={{ "--solid-bg": "#34d399" } as React.CSSProperties}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </button>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-sm line-through" style={{ color: "#aaa" }}>{task.title}</span>
                </div>
                {task.scheduledTime && <span className="text-xs" style={{ color: "#ccc" }}>{formatTime(task.scheduledTime)}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
