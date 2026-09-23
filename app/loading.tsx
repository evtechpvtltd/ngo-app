export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-16"
    >
      <div className="mx-auto h-6 w-40 animate-pulse rounded-full bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-lg border border-border bg-muted"
          />
        ))}
      </div>
    </div>
  );
}
