"use client";

import { CategoryGroup } from "./category-group";
import type { StructuredPlan as StructuredPlanType, SavedPlan } from "@/lib/types";

interface StructuredPlanPreviewProps {
  plan: StructuredPlanType;
  rawInput: string;
  onSave: () => void;
  isSaving: boolean;
}

export function StructuredPlanPreview({ plan, rawInput, onSave, isSaving }: StructuredPlanPreviewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">{plan.title}</h2>
          {plan.summary && (
            <p className="mt-1 text-zinc-500">{plan.summary}</p>
          )}
        </div>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="shrink-0 rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Plan"}
        </button>
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
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900">{plan.title}</h2>
        {plan.summary && (
          <p className="mt-1 text-zinc-500">{plan.summary}</p>
        )}
        <p className="mt-2 text-xs text-zinc-400">
          Created {new Date(plan.createdAt).toLocaleDateString()}
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
