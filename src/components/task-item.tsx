"use client";

import { useState } from "react";
import type { SavedStep } from "@/lib/types";
import { clsx } from "clsx";

interface TaskItemProps {
  id?: string;
  title: string;
  description: string | null;
  priority: "high" | "medium" | "low";
  status?: "todo" | "in_progress" | "done";
  steps: (SavedStep | string)[];
  interactive?: boolean;
  planId?: string;
}

const priorityConfig = {
  high: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500", label: "High" },
  medium: { bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-500", label: "Medium" },
  low: { bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-500", label: "Low" },
};

export function TaskItem({
  id,
  title,
  description,
  priority,
  status = "todo",
  steps,
  interactive = false,
  planId,
}: TaskItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);
  const [stepStates, setStepStates] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    steps.forEach((s) => {
      if (typeof s !== "string") {
        map[s.id] = s.isComplete;
      }
    });
    return map;
  });

  const pc = priorityConfig[priority];

  async function toggleStatus() {
    if (!interactive || !id || !planId) return;
    const next =
      currentStatus === "todo"
        ? "in_progress"
        : currentStatus === "in_progress"
        ? "done"
        : "todo";
    setCurrentStatus(next);
    await fetch(`/api/plans/${planId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId: id, status: next }),
    });
  }

  async function toggleStep(stepId: string) {
    if (!interactive || !planId) return;
    const newVal = !stepStates[stepId];
    setStepStates((prev) => ({ ...prev, [stepId]: newVal }));
    await fetch(`/api/plans/${planId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stepId, isComplete: newVal }),
    });
  }

  return (
    <div
      className={clsx(
        "rounded-xl border p-4 transition-all",
        currentStatus === "done"
          ? "border-emerald-200 bg-emerald-50/30"
          : "border-zinc-200 bg-white hover:shadow-sm"
      )}
    >
      <div className="flex items-start gap-3">
        {interactive && (
          <button
            onClick={toggleStatus}
            className={clsx(
              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all",
              currentStatus === "done"
                ? "border-emerald-500 bg-emerald-500"
                : currentStatus === "in_progress"
                ? "border-violet-500 bg-violet-50"
                : "border-zinc-300 hover:border-zinc-400"
            )}
            title={`Status: ${currentStatus.replace("_", " ")}`}
          >
            {currentStatus === "done" && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
            {currentStatus === "in_progress" && (
              <div className="h-2 w-2 rounded-full bg-violet-500" />
            )}
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={clsx(
                "font-medium text-[15px]",
                currentStatus === "done" && "line-through text-zinc-400"
              )}
            >
              {title}
            </span>
            <span
              className={clsx(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                pc.bg, pc.text
              )}
            >
              <span className={clsx("h-1.5 w-1.5 rounded-full", pc.dot)} />
              {pc.label}
            </span>
          </div>
          {description && (
            <p className="mt-1.5 text-sm text-zinc-500 leading-relaxed">{description}</p>
          )}
          {steps.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              <svg
                width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className={clsx("transition-transform", expanded && "rotate-90")}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
              {steps.length} step{steps.length !== 1 ? "s" : ""}
            </button>
          )}
          {expanded && (
            <ul className="mt-2 space-y-2 pl-0.5">
              {steps.map((step, i) => {
                const isString = typeof step === "string";
                const content = isString ? step : step.content;
                const stepId = isString ? `step-${i}` : step.id;
                const checked = isString ? false : stepStates[step.id] ?? false;

                return (
                  <li key={stepId} className="flex items-start gap-2.5 text-sm">
                    {interactive && !isString ? (
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleStep(step.id)}
                        className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-violet-600 focus:ring-violet-500"
                      />
                    ) : (
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-300" />
                    )}
                    <span
                      className={clsx(
                        "leading-relaxed",
                        checked && "line-through text-zinc-400"
                      )}
                    >
                      {content}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
