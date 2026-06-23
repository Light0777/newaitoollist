export default function AdminLoading() {
  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto animate-pulse">
      <div className="h-8 bg-muted rounded w-48 mb-2" />
      <div className="h-4 bg-muted rounded w-64 mb-6" />
      <div className="h-12 bg-muted rounded w-full mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded" />
        ))}
      </div>
    </div>
  )
}
