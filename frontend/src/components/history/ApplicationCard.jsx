const STATUS_OPTIONS = [
  "pending",
  "applied",
  "interview",
  "offer",
  "selected",
  "rejected",
  "withdrawn",
];

// ✅ SAFE TEXT HELPER (IMPORTANT)
const safeText = (val) => {
  if (typeof val === "string") return val;
  if (Array.isArray(val)) return val.join("\n");
  if (val && typeof val === "object") return JSON.stringify(val, null, 2);
  return String(val || "");
};

export function ApplicationCard({
  app,
  onStatusChange,
  onDelete,
  onRegenerateMail,
  busyId,
}) {
  const busy = busyId === app.id;

  return (
    <article className="flex flex-col rounded-2xl border border-ink-200 bg-white p-4 shadow-card sm:p-5">
      <div className="flex flex-1 flex-col gap-3">

        {/* HEADER */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-lg font-semibold text-ink-900">
              {app.title}
            </h3>

            {app.company && (
              <p className="text-sm text-ink-600">{app.company}</p>
            )}
          </div>

          <span className="rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-medium capitalize text-ink-700">
            {app.status}
          </span>
        </div>

        {/* MATCH SCORE */}
        {app.matchScore != null && (
          <p className="text-sm text-ink-600">
            Match score:{" "}
            <strong className="text-ink-900">{app.matchScore}%</strong>
          </p>
        )}

        {/* STATUS DROPDOWN */}
        <label className="text-xs font-medium text-ink-500">
          Update status
          <select
            disabled={busy}
            value={app.status}
            onChange={(e) => onStatusChange(app.id, e.target.value)}
            className="mt-1 w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        {/* FOLLOW UP EMAIL */}
        {app.followUpDraft && (
          <div className="rounded-xl bg-ink-50 p-3 text-sm">
            <p className="text-xs font-semibold text-ink-600">
              Latest mail draft
            </p>

            {/* SUBJECT */}
            <p className="mt-1 font-medium text-ink-900">
              {safeText(app.lastEmailDraft.subject)}
            </p>

            {/* BODY */}
            <p className="mt-2 max-h-24 overflow-auto whitespace-pre-wrap text-ink-700">
              {safeText(app.
lastEmailDraft.body)}
            </p>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => onRegenerateMail(app.id)}
            className="rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-800 hover:bg-ink-50 disabled:opacity-50"
          >
            Regenerate mail
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={() => onDelete(app.id)}
            className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}