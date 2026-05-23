import { STATUS_LABELS_INTERNAL } from "./statusLabels.js";

export function ApplicationTable({ applications, onEdit, onRegenerateMail, onDelete, busyId }) {
  if (!applications || applications.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-2xl border border-ink-200 bg-white shadow-card">
      <table className="min-w-full divide-y divide-ink-100 text-sm">
        <thead className="bg-ink-50/60 text-xs font-semibold uppercase tracking-wide text-ink-500">
          <tr>
            <th className="px-4 py-3 text-left">Role</th>
            <th className="px-4 py-3 text-left">Company</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Match / ATS</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {applications.map((app) => {
            const busy = busyId === app.id;
            const label = STATUS_LABELS_INTERNAL[app.status] || app.status;
            return (
              <tr key={app.id} className="hover:bg-ink-50/60">
                <td className="max-w-xs px-4 py-3">
                  <div className="font-medium text-ink-900">{app.title}</div>
                </td>
                <td className="px-4 py-3 text-ink-700">{app.company || "—"}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-medium text-ink-700">
                    {label}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-800">
                  {app.matchScore != null ? `${app.matchScore}%` : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onEdit?.(app)}
                      className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-800 hover:bg-ink-50 disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onRegenerateMail?.(app.id)}
                      className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-800 hover:bg-ink-50 disabled:opacity-50"
                    >
                      Regenerate mail
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onDelete?.(app.id)}
                      className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

