"use client";

import { useState } from "react";
import type { StructuredPlan } from "@/lib/types";

type State = "idle" | "processing" | "success" | "error";

export function useDumpProcessor() {
  const [state, setState] = useState<State>("idle");
  const [result, setResult] = useState<StructuredPlan | null>(null);
  const [rawInput, setRawInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit(text: string) {
    setState("processing");
    setError(null);
    setRawInput(text);

    try {
      const res = await fetch("/api/dump", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawInput: text }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to process");
      }

      const plan = await res.json();
      setResult(plan);
      setState("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  }

  function reset() {
    setState("idle");
    setResult(null);
    setRawInput("");
    setError(null);
  }

  return {
    state,
    result,
    rawInput,
    error,
    isProcessing: state === "processing",
    submit,
    reset,
  };
}
