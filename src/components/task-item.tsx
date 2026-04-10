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

const priorityColors = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-green-100 text-green-700",
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

  const statusIcons = {
    todo: "border-zinc-300",
    in_progress: "border-blue-500 bg-blue-50",
    done: "border-green-500 bg-green-500",
  };

  return (
    <div
      className={clsx(
        "rounded-lg border p-3",
        currentStatus === "done"
          ? "border-green-200 bg-green-50/50"
          : "border-zinc-200 bg-white"
      )}
    >
      <div className="flex items-start gap-3">
        {interactive && (
          <button
            onClick={toggleStatus}
            className={clsx(
              "mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 transition-colors",
              statusIcons[currentStatus]
            )}
            title={`Status: ${currentStatus}`}
          >
            {currentStatus === "done" && (
              <svg className="h-full w-full text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={clsx(
                "font-medium",
                currentStatus === "done" && "line-through text-zinc-400"
              )}
            >
              {title}
            </span>
            <span
              className={clsx(
                "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                priorityColors[priority]
              )}
            >
              {priority}
            </span>
          </div>
          {description && (
            <p className="mt-1 text-sm text-zinc-500">{description}</p>
          )}
          {steps.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-xs font-medium text-zinc-500 hover:text-zinc-700"
            >
              {expanded ? "Hide" : "Show"} {steps.length} step{steps.length !== 1 ? "s" : ""}
            </button>
          )}
          {expanded && (
            <ul className="mt-2 space-y-1.5">
              {steps.map((step, i) => {
                const isString = typeof step === "string";
                const content = isString ? step : step.content;
                const stepId = isString ? `step-${i}` : step.id;
                const checked = isString ? false : stepStates[step.id] ?? false;

                return (
                  <li key={stepId} className="flex items-start gap-2 text-sm">
                    {interactive && !isString ? (
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleStep(step.id)}
                        className="mt-0.5 h-4 w-4 rounded border-zinc-300"
                      />
                    ) : (
                      <span className="mt-0.5 text-zinc-400">-</span>
                    )}
                    <span
                      className={clsx(
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
