import Link from "next/link";

interface PlanCardProps {
  id: string;
  title: string;
  summary: string | null;
  createdAt: string;
  taskCount: number;
}

export function PlanCard({ id, title, summary, createdAt, taskCount }: PlanCardProps) {
  return (
    <Link
      href={`/plan/${id}`}
      className="group block rounded-2xl border border-zinc-200 bg-white p-6 transition-all hover:border-violet-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-zinc-900 group-hover:text-violet-700 transition-colors">
          {title}
        </h3>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className="shrink-0 mt-0.5 text-zinc-300 transition-all group-hover:text-violet-500 group-hover:translate-x-0.5"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </div>
      {summary && (
        <p className="mt-2 line-clamp-2 text-sm text-zinc-500 leading-relaxed">{summary}</p>
      )}
      <div className="mt-4 flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-600">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
          </svg>
          {taskCount} task{taskCount !== 1 ? "s" : ""}
        </span>
        <span className="text-xs text-zinc-400">
          {new Date(createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    </Link>
  );
}
