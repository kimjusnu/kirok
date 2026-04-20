// Automatic Suspense fallback for all /(site)/* route transitions.
// Rendered by Next.js whenever a nested server component streams.
export default function SiteLoading() {
  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center px-6 py-24">
      <div
        aria-hidden
        className="w-8 h-8 border border-[var(--line)] border-t-[var(--ink)] rounded-full animate-spin"
      />
      <p className="mt-6 text-[11px] tracking-[0.2em] uppercase text-[var(--ink-soft)]">
        Loading
      </p>
      <p className="mt-2 text-sm text-[var(--ink-muted)]">잠시만 기다려 주세요.</p>
    </div>
  )
}
