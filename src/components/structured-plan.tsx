"use client";

import { CategoryGroup } from "./category-group";
import type { StructuredPlan as StructuredPlanType, SavedPlan } from "@/lib/types";

interface StructuredPlanPreviewProps {
  plan: StructuredPlanType;
  rawInput: string;
  onSave: () => void;
  isSaving: boolean;
}

export function StructuredPlanPreview({ plan, onSave, isSaving }: StructuredPlanPreviewProps) {
  const totalTasks = plan.categories.reduce((acc, c) => acc + c.tasks.length, 0);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-violet-500 mb-1.5">AI-Organized Plan</p>
            <h2 className="text-xl font-bold text-zinc-900">{plan.title}</h2>
            {plan.summary && (
              <p className="mt-1.5 text-sm text-zinc-500 leading-relaxed">{plan.summary}</p>
            )}
            <div className="mt-3 flex items-center gap-3 text-xs text-zinc-400">
              <span>{plan.categories.length} categories</span>
              <span className="h-1 w-1 rounded-full bg-zinc-300" />
              <span>{totalTasks} tasks</span>
            </div>
          </div>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="shrink-0 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-700 hover:shadow active:scale-[0.98] disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Plan"}
          </button>
        </div>
      </div>
      <div className="space-y-6">
        {plan.categories.map((category) => (
          <CategoryGroup
            key={category.name}
            name={category.name}
            tasks={category.tasks}
          />
        ))}
      </div>
    </div>
  );
}

interface StructuredPlanSavedProps {
  plan: SavedPlan;
}

export function StructuredPlanSaved({ plan }: StructuredPlanSavedProps) {
  const totalTasks = plan.categories.reduce((acc, c) => acc + c.tasks.length, 0);
  const doneTasks = plan.categories.reduce(
    (acc, c) => acc + c.tasks.filter((t) => t.status === "done").length,
    0
  );
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-zinc-900">{plan.title}</h2>
        {plan.summary && (
          <p className="mt-1.5 text-sm text-zinc-500 leading-relaxed">{plan.summary}</p>
        )}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-violet-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <span className="text-sm font-medium text-zinc-600">
            {doneTasks}/{totalTasks}
          </span>
        </div>
        <p className="mt-2 text-xs text-zinc-400">
          Created {new Date(plan.createdAt).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>
      <div className="space-y-6">
        {plan.categories.map((category) => (
          <CategoryGroup
            key={category.name}
            name={category.name}
            tasks={category.tasks}
            interactive
            planId={plan.id}
          />
        ))}
      </div>
    </div>
  );
}
