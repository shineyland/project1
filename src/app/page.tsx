"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrainDumpInput } from "@/components/brain-dump-input";
import { StructuredPlanPreview } from "@/components/structured-plan";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useDumpProcessor } from "@/hooks/use-dump-processor";

export default function HomePage() {
  const router = useRouter();
  const { state, result, rawInput, error, isProcessing, submit, reset } =
    useDumpProcessor();
  const [isSaving, setIsSaving] = useState(false);

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

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-zinc-900">
          Dump Your Brain
        </h1>
        <p className="mt-2 text-zinc-500">
          Paste your messy thoughts, tasks, and ideas below. AI will organize
          them into a structured, prioritized plan.
        </p>
      </div>

      {state !== "success" && (
        <BrainDumpInput onSubmit={submit} isProcessing={isProcessing} />
      )}

      {isProcessing && (
        <LoadingSpinner message="Organizing your thoughts..." />
      )}

      {state === "error" && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {state === "success" && result && (
        <div className="mt-6 space-y-4">
          <StructuredPlanPreview
            plan={result}
            rawInput={rawInput}
            onSave={handleSave}
            isSaving={isSaving}
          />
          <button
            onClick={reset}
            className="text-sm text-zinc-500 hover:text-zinc-700"
          >
            Start over with a new dump
          </button>
        </div>
      )}
    </div>
  );
}
