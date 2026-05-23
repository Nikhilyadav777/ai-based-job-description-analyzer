export function MatchResultCard({ result, loading }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-card">
        <div className="h-4 w-32 animate-pulse rounded bg-ink-200" />
        <div className="mt-4 h-24 animate-pulse rounded-xl bg-ink-100" />
      </div>
    );
  }
  if (!result) return null;

  const score = result.matchScore ?? 0;

  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-card">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
            Fit score
          </p>
          <p className="font-display text-4xl font-bold text-ink-900">{score}%</p>
        </div>
        {result.usedMock && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
            Demo mode — add API key
          </span>
        )}
      </div>
      <p className="mt-4 text-sm leading-relaxed text-ink-600">{result.summary}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <h4 className="text-xs font-semibold uppercase text-emerald-700">Strengths</h4>
          <ul className="mt-2 list-inside list-disc text-sm text-ink-700">
            {(result.strengths || []).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase text-rose-700">Gaps</h4>
          <ul className="mt-2 list-inside list-disc text-sm text-ink-700">
            {(result.gaps || []).map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      </div>
      {(result.interviewTips || []).length > 0 && (
        <div className="mt-4 rounded-xl bg-ink-50 p-4">
          <h4 className="text-xs font-semibold uppercase text-ink-600">Interview tips</h4>
          <ul className="mt-2 list-inside list-disc text-sm text-ink-700">
            {result.interviewTips.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
