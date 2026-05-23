import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../services/api.js";
import { StatusSummaryCards } from "../components/history/StatusSummaryCards.jsx";
import { ApplicationTable } from "../components/history/ApplicationTable.jsx";
import { ApplicationEditDrawer } from "../components/history/ApplicationEditDrawer.jsx";

export function HistoryPage() {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const data = await api.listApplications();
      setApplications(data.applications || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!filter) return applications;
    return applications.filter((a) => a.status === filter);
  }, [applications, filter]);

  const onStatusChange = async (id, status) => {
    setBusyId(id);
    setError("");
    try {
      const updated = await api.updateApplication(id, { status });
      setApplications((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Remove this application from the tracker?")) return;
    setBusyId(id);
    setError("");
    try {
      await api.deleteApplication(id);
      setApplications((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const onRegenerateMail = async (id) => {
    setBusyId(id);
    setError("");
    try {
      const updated = await api.followUp(id, {});
      console.log("Regenerated follow-up:", updated);
      setApplications((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  const onSavedFromEditor = (updated) => {
    setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    setEditing(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900">Applications</h1>
          <p className="mt-2 text-sm text-ink-600 sm:text-base">
            Track status, filter by stage, and regenerate email drafts when things change.
            Changing status auto-generates a follow-up or thank-you draft when possible.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-800 hover:bg-ink-50"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      <StatusSummaryCards
        applications={applications}
        activeFilter={filter}
        onFilter={setFilter}
      />

      {loading ? (
        <p className="text-sm text-ink-500">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-300 bg-white/50 py-16 text-center text-ink-600">
          {applications.length === 0
            ? "No applications yet. Run an analysis and click “Save to tracker”."
            : "No applications in this filter."}
        </div>
      ) : (
        <ApplicationTable
          applications={filtered}
          busyId={busyId}
          onEdit={(app) => setEditing(app)}
          onRegenerateMail={onRegenerateMail}
          onDelete={onDelete}
        />
      )}

      {editing && (
        <ApplicationEditDrawer
          app={editing}
          onClose={() => setEditing(null)}
          onSaved={onSavedFromEditor}
        />
      )}
    </div>
  );
}
