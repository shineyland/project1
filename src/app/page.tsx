"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrainDumpInput } from "@/components/brain-dump-input";
import { StructuredPlanPreview } from "@/components/structured-plan";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useDumpProcessor } from "@/hooks/use-dump-processor";

export default function HomePage() {
  const router = useRouter();
  const { state, result, rawInput, error, isProcessing, submit, addMore, reset } =
    useDumpProcessor();
  const [isSaving, setIsSaving] = useState(false);
  const [showAddMore, setShowAddMore] = useState(false);

  async function handleSave() {
    if (!result) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawInput, plan: result }),
      });
      const data = await res.json();
      router.push(`/plan/${data.id}`);
    } catch {
      alert("Failed to save plan");
    } finally {
      setIsSaving(false);
    }
  }

  function handleAddMore(items: string[]) {
    if (result) {
      addMore(items, result);
      setShowAddMore(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {state !== "success" && !isProcessing && (
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Dump your brain
          </h1>
          <p className="mt-2 text-zinc-500 max-w-md mx-auto">
            Write down everything on your mind. AI will sort it into a structured, prioritized plan.
          </p>
        </div>
      )}

      {state !== "success" && !isProcessing && (
        <BrainDumpInput onSubmit={submit} isProcessing={isProcessing} />
      )}

      {isProcessing && (
        <LoadingSpinner message="Organizing your thoughts..." />
      )}

      {state === "error" && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <p className="font-medium">Something went wrong</p>
          <p className="mt-1 text-red-500">{error}</p>
        </div>
      )}

      {state === "success" && result && (
        <div className="space-y-6">
          <StructuredPlanPreview
            plan={result}
            rawInput={rawInput}
            onSave={handleSave}
            isSaving={isSaving}
          />

          {showAddMore ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-zinc-600">Add more tasks:</p>
              <BrainDumpInput onSubmit={handleAddMore} isProcessing={isProcessing} />
              <button
                onClick={() => setShowAddMore(false)}
                className="text-sm text-zinc-400 hover:text-zinc-600"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 border-t border-zinc-200 pt-5">
              <button
                onClick={() => setShowAddMore(true)}
                className="flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-medium text-violet-700 transition-colors hover:bg-violet-100"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                Add More Tasks
              </button>
              <button
                onClick={reset}
                className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-50"
              >
                Start Over
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
