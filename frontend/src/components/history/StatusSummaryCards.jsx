const STATUS_LABELS = {
  pending: "Pending",
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  selected: "Selected",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export function StatusSummaryCards({ applications, activeFilter, onFilter }) {
  const keys = Object.keys(STATUS_LABELS);
  const counts = keys.reduce((acc, k) => ({ ...acc, [k]: 0 }), {});
  for (const a of applications || []) {
    if (counts[a.status] !== undefined) counts[a.status] += 1;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      {keys.map((status) => {
        const active = activeFilter === status;
        return (
          <button
            key={status}
            type="button"
            onClick={() => onFilter(active ? null : status)}
            className={`rounded-2xl border px-3 py-3 text-left transition ${
              active
                ? "border-accent bg-accent/10 ring-2 ring-accent/30"
                : "border-ink-200 bg-white hover:border-ink-300"
            }`}
          >
            <p className="text-xs font-medium text-ink-500">{STATUS_LABELS[status]}</p>
            <p className="font-display text-2xl font-bold text-ink-900">{counts[status]}</p>
          </button>
        );
      })}
    </div>
  );
}
