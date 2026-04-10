"use client";

import Link from "next/link";
import { clsx } from "clsx";

interface UpcomingTask {
  id: string;
  title: string;
  priority: string;
  status: string;
  category: string | null;
}

interface PlanCardProps {
  id: string;
  title: string;
  summary: string | null;
  createdAt: string;
  taskCount: number;
  doneTasks: number;
  inProgressTasks: number;
  highPriority: number;
  categories: string[];
  upcoming: UpcomingTask[];
  onDelete: (id: string) => void;
}

const priorityDot: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-amber-500",
  low: "bg-emerald-500",
};

export function PlanCard({
  id,
  title,
  summary,
  createdAt,
  taskCount,
  doneTasks,
  inProgressTasks,
  highPriority,
  categories,
  upcoming,
  onDelete,
}: PlanCardProps) {
  const progress = taskCount > 0 ? Math.round((doneTasks / taskCount) * 100) : 0;
  const isComplete = taskCount > 0 && doneTasks === taskCount;

  return (
    <div
      className={clsx(
        "rounded-2xl border bg-white transition-all hover:shadow-md",
        isComplete ? "border-emerald-200" : "border-zinc-200"
      )}
    >
      <Link href={`/plan/${id}`} className="block p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {isComplete && <span className="text-lg">&#10003;</span>}
              <h3 className={clsx(
                "text-lg font-semibold truncate",
                isComplete ? "text-emerald-700" : "text-zinc-900"
              )}>
                {title}
              </h3>
            </div>
            {summary && (
              <p className="mt-1.5 line-clamp-1 text-base text-zinc-500">{summary}</p>
            )}
          </div>
          <span className="shrink-0 text-2xl font-bold text-zinc-300">{progress}%</span>
        </div>

        <div className="mt-4 h-2 rounded-full bg-zinc-100 overflow-hidden">
          <div
            className={clsx(
              "h-full rounded-full transition-all duration-500",
              isComplete ? "bg-emerald-500" : "bg-violet-500"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-3 flex items-center gap-4 text-sm">
          <span className="text-zinc-500">
            <span className="font-semibold text-zinc-700">{doneTasks}</span>/{taskCount} done
          </span>
          {inProgressTasks > 0 && (
            <span className="text-blue-600">{inProgressTasks} in progress</span>
          )}
          {highPriority > 0 && (
            <span className="text-red-500">{highPriority} urgent</span>
          )}
        </div>

        {upcoming.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-zinc-100 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Next up</p>
            {upcoming.map((task) => (
              <div key={task.id} className="flex items-center gap-2.5 text-base">
                <span className={clsx("h-2 w-2 shrink-0 rounded-full", priorityDot[task.priority] || "bg-zinc-300")} />
                <span className="truncate text-zinc-600">{task.title}</span>
              </div>
            ))}
          </div>
        )}

        {categories.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span key={cat} className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-500">
                {cat}
              </span>
            ))}
          </div>
        )}
      </Link>

      <div className="flex items-center justify-between border-t border-zinc-100 px-6 py-3">
        <span className="text-sm text-zinc-400">
          {new Date(createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        <button
          onClick={(e) => {
            e.preventDefault();
            onDelete(id);
          }}
          className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
