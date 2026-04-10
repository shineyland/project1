export function LoadingSpinner({ message = "Processing..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-2 border-violet-100" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-violet-600" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-zinc-700">{message}</p>
        <p className="mt-1 text-xs text-zinc-400">This may take a few seconds</p>
      </div>
    </div>
  );
}
