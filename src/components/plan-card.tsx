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
      className="block rounded-lg border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md"
    >
      <h3 className="font-semibold text-zinc-900">{title}</h3>
      {summary && (
        <p className="mt-1 line-clamp-2 text-sm text-zinc-500">{summary}</p>
      )}
      <div className="mt-3 flex items-center gap-3 text-xs text-zinc-400">
        <span>{taskCount} task{taskCount !== 1 ? "s" : ""}</span>
        <span>{new Date(createdAt).toLocaleDateString()}</span>
      </div>
    </Link>
  );
}
