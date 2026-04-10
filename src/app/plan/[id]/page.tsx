"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { clsx } from "clsx";
import { StructuredPlanSaved } from "@/components/structured-plan";
import type { SavedPlan, SavedTask } from "@/lib/types";

interface DeleteModal {
  taskId: string;
  taskTitle: string;
  reason: string;
}

export default function PlanPage() {
  const params = useParams();
  const router = useRouter();
  const [plan, setPlan] = useState<SavedPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [deleteModal, setDeleteModal] = useState<DeleteModal | null>(null);
  const [addingTask, setAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", category: "", priority: "medium" });
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  function fetchPlan() {
    fetch(`/api/plans/${params.id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Plan not found");
        return r.json();
      })
      .then((data) => {
        setPlan(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchPlan();
  }, [params.id]);

  async function handleDelete() {
    if (!confirm("Delete this plan? This cannot be undone.")) return;
    await fetch(`/api/plans/${params.id}`, { method: "DELETE" });
    router.push("/plans");
  }

  async function handleDeleteTask() {
    if (!deleteModal || !deleteModal.reason.trim()) return;
    await fetch(`/api/plans/${params.id}/tasks`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", taskId: deleteModal.taskId }),
    });
    setDeleteModal(null);
    fetchPlan();
  }

  async function handleAddTask() {
    if (!newTask.title.trim()) return;
    await fetch(`/api/plans/${params.id}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    });
    setNewTask({ title: "", category: "", priority: "medium" });
    setAddingTask(false);
    fetchPlan();
  }

  async function handleEditTask(taskId: string) {
    if (!editTitle.trim()) return;
    await fetch(`/api/plans/${params.id}/tasks`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "edit", taskId, title: editTitle }),
    });
    setEditingTaskId(null);
    fetchPlan();
  }

  async function moveTask(taskId: string, direction: "up" | "down") {
    if (!plan) return;
    const allTasks = plan.categories.flatMap((c) => c.tasks);
    const idx = allTasks.findIndex((t) => t.id === taskId);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= allTasks.length) return;
    const ids = allTasks.map((t) => t.id);
    [ids[idx], ids[swapIdx]] = [ids[swapIdx], ids[idx]];
    await fetch(`/api/plans/${params.id}/tasks`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reorder", taskIds: ids }),
    });
    fetchPlan();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-violet-100 border-t-violet-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-12 text-center">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-10">
          <p className="text-lg font-medium text-red-600">{error}</p>
          <Link href="/plans" className="mt-4 inline-block text-base text-red-500 hover:text-red-700">Back to My Plans</Link>
        </div>
      </div>
    );
  }

  if (!plan) return null;

  const allTasks = plan.categories.flatMap((c) => c.tasks);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/plans" className="inline-flex items-center gap-2 text-base text-zinc-400 hover:text-zinc-600 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to My Plans
        </Link>
        <button
          onClick={() => setEditMode(!editMode)}
          className={clsx(
            "rounded-xl px-5 py-2.5 text-base font-medium transition-colors",
            editMode
              ? "bg-violet-600 text-white"
              : "border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
          )}
        >
          {editMode ? "Done Editing" : "Edit"}
        </button>
      </div>

      {/* Normal view */}
      {!editMode && <StructuredPlanSaved plan={plan} />}

      {/* Edit mode */}
      {editMode && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-violet-200 bg-violet-50/30 p-6">
            <h2 className="text-xl font-bold text-zinc-900 mb-1">{plan.title}</h2>
            <p className="text-sm text-violet-600 font-medium">Edit Mode — Reorder, edit, or delete tasks</p>
          </div>

          <div className="space-y-2">
            {allTasks.map((task, idx) => (
              <div key={task.id} className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-5">
                {/* Reorder buttons */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveTask(task.id, "up")}
                    disabled={idx === 0}
                    className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 disabled:opacity-30"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                  </button>
                  <button
                    onClick={() => moveTask(task.id, "down")}
                    disabled={idx === allTasks.length - 1}
                    className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 disabled:opacity-30"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>

                {/* Task content */}
                <div className="flex-1 min-w-0">
                  {editingTaskId === task.id ? (
                    <div className="flex items-center gap-3">
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 rounded-xl border border-zinc-200 px-4 py-2.5 text-base outline-none focus:border-violet-300"
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && handleEditTask(task.id)}
                      />
                      <button onClick={() => handleEditTask(task.id)} className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white">Save</button>
                      <button onClick={() => setEditingTaskId(null)} className="text-sm text-zinc-400">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-base font-medium text-zinc-800">{task.title}</span>
                      {task.category && (
                        <span className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-500">{task.category}</span>
                      )}
                      <span className={clsx(
                        "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        task.priority === "high" ? "bg-red-50 text-red-600" :
                        task.priority === "medium" ? "bg-amber-50 text-amber-600" :
                        "bg-emerald-50 text-emerald-600"
                      )}>{task.priority}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {editingTaskId !== task.id && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setEditingTaskId(task.id); setEditTitle(task.title); }}
                      className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                      title="Edit"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteModal({ taskId: task.id, taskTitle: task.title, reason: "" })}
                      className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-500"
                      title="Delete"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add task */}
          {addingTask ? (
            <div className="rounded-2xl border border-violet-200 bg-white p-6 space-y-4">
              <h3 className="text-base font-semibold text-zinc-700">Add New Task</h3>
              <input
                value={newTask.title}
                onChange={(e) => setNewTask((p) => ({ ...p, title: e.target.value }))}
                placeholder="Task title"
                className="w-full rounded-xl border border-zinc-200 px-5 py-3 text-base outline-none focus:border-violet-300"
                autoFocus
              />
              <div className="flex gap-3">
                <input
                  value={newTask.category}
                  onChange={(e) => setNewTask((p) => ({ ...p, category: e.target.value }))}
                  placeholder="Category (optional)"
                  className="flex-1 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-violet-300"
                />
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask((p) => ({ ...p, priority: e.target.value }))}
                  className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={handleAddTask} className="rounded-xl bg-violet-600 px-6 py-3 text-base font-semibold text-white hover:bg-violet-700">Add Task</button>
                <button onClick={() => setAddingTask(false)} className="rounded-xl border border-zinc-200 px-6 py-3 text-base text-zinc-500 hover:bg-zinc-50">Cancel</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingTask(true)}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-zinc-300 bg-white py-5 text-base font-medium text-zinc-500 hover:border-violet-400 hover:text-violet-600 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              Add New Task
            </button>
          )}
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
            <h3 className="text-xl font-bold text-zinc-900 mb-2">Delete Task?</h3>
            <p className="text-base text-zinc-500 mb-1">
              You&apos;re about to delete: <span className="font-medium text-zinc-700">{deleteModal.taskTitle}</span>
            </p>
            <p className="text-sm text-zinc-400 mb-5">Please provide a reason for deleting this task.</p>
            <textarea
              value={deleteModal.reason}
              onChange={(e) => setDeleteModal((p) => p ? { ...p, reason: e.target.value } : null)}
              placeholder="Why are you removing this task?"
              className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-base outline-none focus:border-red-300 resize-none"
              rows={3}
              autoFocus
            />
            <div className="flex gap-3 mt-5">
              <button
                onClick={handleDeleteTask}
                disabled={!deleteModal.reason.trim()}
                className="flex-1 rounded-xl bg-red-600 py-3 text-base font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 rounded-xl border border-zinc-200 py-3 text-base font-medium text-zinc-600 hover:bg-zinc-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      {!editMode && (
        <div className="mt-10 flex items-center gap-4 border-t border-zinc-200 pt-8">
          <details className="flex-1 group">
            <summary className="cursor-pointer flex items-center gap-2.5 text-base text-zinc-400 hover:text-zinc-600 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-open:rotate-90">
                <polyline points="9 18 15 12 9 6" />
              </svg>
              Show original brain dump
            </summary>
            <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-zinc-100 p-6 text-base text-zinc-600 leading-relaxed">{plan.rawInput}</pre>
          </details>
          <button onClick={handleDelete} className="shrink-0 self-start rounded-xl border border-red-200 px-6 py-3 text-base font-medium text-red-500 hover:bg-red-50 hover:text-red-600">
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
