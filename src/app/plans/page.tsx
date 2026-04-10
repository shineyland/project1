"use client";

import { useEffect, useState } from "react";
import { PlanCard } from "@/components/plan-card";

interface PlanSummary {
  id: string;
  title: string;
  summary: string | null;
  createdAt: string;
  taskCount: number;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then((data) => {
        setPlans(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900">My Plans</h1>
      {loading ? (
        <p className="text-zinc-400">Loading...</p>
      ) : plans.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center">
          <p className="text-zinc-500">No plans yet. Start by dumping your thoughts!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              id={plan.id}
              title={plan.title}
              summary={plan.summary}
              createdAt={plan.createdAt}
              taskCount={plan.taskCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}
