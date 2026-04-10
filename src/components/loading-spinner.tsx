export function LoadingSpinner({ message = "Processing..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
      <p className="text-sm text-zinc-500">{message}</p>
    </div>
  );
}
