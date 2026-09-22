export default function LoadingState({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-white border border-gray-100 overflow-hidden"
        >
          <div className="aspect-[4/3] skeleton" />
          <div className="p-4 space-y-3">
            <div className="h-3 w-16 skeleton rounded" />
            <div className="h-5 w-3/4 skeleton rounded" />
            <div className="h-4 w-full skeleton rounded" />
            <div className="h-4 w-2/3 skeleton rounded" />
            <div className="flex items-center justify-between pt-2">
              <div className="h-6 w-16 skeleton rounded" />
              <div className="h-9 w-20 skeleton rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function LoadingSpinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <div className="h-10 w-10 border-4 border-gray-200 border-t-primary-color rounded-full animate-spin" />
    </div>
  );
}
