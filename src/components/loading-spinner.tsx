export function LoadingSpinner({ message = "Processing..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center gap-5 py-20">
      <div className="relative h-14 w-14">
        <div className="absolute inset-0 rounded-full border-3 border-violet-100" />
        <div className="absolute inset-0 animate-spin rounded-full border-3 border-transparent border-t-violet-600" />
      </div>
      <div className="text-center">
        <p className="text-base font-medium text-zinc-700">{message}</p>
        <p className="mt-1.5 text-sm text-zinc-400">This may take a few seconds</p>
      </div>
    </div>
  );
}
