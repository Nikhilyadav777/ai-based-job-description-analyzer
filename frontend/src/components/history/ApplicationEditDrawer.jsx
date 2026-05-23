import { useState } from "react";
import { api } from "../../services/api.js";
import { downloadResumePdf } from "../../utils/downloadResumePdf.js";

const STATUS_OPTIONS = [
  "pending",
  "applied",
  "interview",
  "offer",
  "selected",
  "rejected",
  "withdrawn",
];

export function ApplicationEditDrawer({ app, onClose, onSaved }) {
  const [title, setTitle] = useState(app?.title || "");
  const [company, setCompany] = useState(app?.company || "");
  const [status, setStatus] = useState(app?.status || "pending");
  const [jobDescription, setJobDescription] = useState(app?.jobDescription || "");
  const [resumeSnapshot, setResumeSnapshot] = useState(app?.resumeSnapshot || "");
  const [lastEmailDraft, setLastEmailDraft] = useState(app?.lastEmailDraft || null);

  const [atsResult, setAtsResult] = useState(null);
  const [atsLoading, setAtsLoading] = useState(false);

  const [optResult, setOptResult] = useState(null);
  const [optLoading, setOptLoading] = useState(false);

  const [pdfLoading, setPdfLoading] = useState(false);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!app) return null;

  const runAtsFromText = async () => {
    setError("");
    setAtsLoading(true);
    try {
      const result = await api.analyze({
        jobDescription: jobDescription,
        resumeText: resumeSnapshot,
      });
      setAtsResult(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setAtsLoading(false);
    }
  };

  const runAtsFromPdf = async (file) => {
    if (!file) return;
    setError("");
    setPdfLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i += 1) {
        binary += String.fromCharCode(bytes[i]);
      }
      const pdfBase64 = btoa(binary);

      const result = await api.atsFromPdf({
        jobDescription,
        pdfBase64,
      });
      setAtsResult(result);
      if (!resumeSnapshot) {
        // If we did not already have a resume snapshot, populate it with the extracted text
        // so further tailoring is possible.
        setResumeSnapshot(result.rawText || "");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setPdfLoading(false);
    }
  };

  const runOptimize = async () => {
    setError("");
    setOptLoading(true);
    try {
      const result = await api.optimizeResume({
        jobDescription,
        resumeText: resumeSnapshot,
      });
      setOptResult(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setOptLoading(false);
    }
  };

  const handleSave = async () => {
    setError("");
    setSaving(true);
    try {
      const payload = {
        title,
        company,
        status,
        jobDescription,
        resumeSnapshot,
        lastEmailDraft,
        matchScore: atsResult?.matchScore ?? app.matchScore ?? null,
      };
      const updated = await api.updateApplication(app.id, payload);
      onSaved?.(updated);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-end bg-black/30">
      <div className="flex h-full w-full max-w-3xl flex-col bg-white shadow-2xl">
        <header className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink-900">
              Edit application
            </h2>
            <p className="text-xs text-ink-500">
              Update fields, re-run ATS analysis, or tailor the resume. Changes are saved
              only when you click Save.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-ink-200 px-3 py-1 text-xs font-medium text-ink-700 hover:bg-ink-50"
          >
            Close
          </button>
        </header>

        {error && (
          <div className="mx-6 mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-800">
            {error}
          </div>
        )}

        <div className="flex-1 space-y-4 overflow-auto px-6 py-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-1 text-xs font-medium text-ink-600">
              Title
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-lg border border-ink-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-ink-600">
              Company
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="rounded-lg border border-ink-200 px-3 py-2 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-ink-600">
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-lg border border-ink-200 px-3 py-2 text-sm"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs font-medium text-ink-600">
              Job description
              <textarea
                rows={8}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[160px] rounded-lg border border-ink-200 px-3 py-2 text-xs leading-relaxed"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-ink-600">
              Resume snapshot
              <textarea
                rows={8}
                value={resumeSnapshot}
                onChange={(e) => setResumeSnapshot(e.target.value)}
                className="min-h-[160px] rounded-lg border border-ink-200 px-3 py-2 text-xs leading-relaxed"
              />
            </label>
          </div>

          <section className="space-y-3 rounded-2xl border border-ink-100 bg-ink-50/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-ink-900">
                Resume ATS score & suggestions
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  type="button"
                  disabled={atsLoading || !jobDescription.trim() || !resumeSnapshot.trim()}
                  onClick={runAtsFromText}
                  className="rounded-lg bg-ink-900 px-3 py-1.5 font-semibold text-white hover:bg-ink-800 disabled:opacity-50"
                >
                  {atsLoading ? "Scoring…" : "Score from text"}
                </button>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-ink-300 bg-white px-3 py-1.5 font-medium text-ink-700 hover:border-ink-400">
                  <span>{pdfLoading ? "Uploading…" : "Upload resume PDF"}</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => runAtsFromPdf(e.target.files?.[0])}
                  />
                </label>
              </div>
            </div>

            {atsResult && (
              <div className="space-y-2 rounded-xl bg-white p-3 text-xs text-ink-800">
                <p className="font-medium">
                  ATS score:{" "}
                  <span className="font-semibold text-ink-900">
                    {atsResult.matchScore ?? 0}%
                  </span>
                </p>
                {atsResult.summary && <p className="text-ink-700">{atsResult.summary}</p>}
                {(atsResult.gaps || atsResult.strengths) && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {Array.isArray(atsResult.strengths) && atsResult.strengths.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                          Strengths
                        </p>
                        <ul className="mt-1 list-inside list-disc space-y-1">
                          {atsResult.strengths.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {Array.isArray(atsResult.gaps) && atsResult.gaps.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-700">
                          Improvements & missing items
                        </p>
                        <ul className="mt-1 list-inside list-disc space-y-1">
                          {atsResult.gaps.map((g, i) => (
                            <li key={i} className="font-medium text-rose-800">
                              {g}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="space-y-3 rounded-2xl border border-ink-100 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-ink-900">
                Tailor resume to JD
              </h3>
              <button
                type="button"
                disabled={optLoading || !jobDescription.trim() || !resumeSnapshot.trim()}
                onClick={runOptimize}
                className="rounded-lg border border-ink-200 bg-ink-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-ink-800 disabled:opacity-50"
              >
                {optLoading ? "Tailoring…" : "Regenerate tailored resume"}
              </button>
            </div>

            {optResult && (
              <div className="space-y-2 text-xs">
                {Array.isArray(optResult.changesSummary) &&
                  optResult.changesSummary.length > 0 && (
                    <ul className="list-inside list-disc text-ink-700">
                      {optResult.changesSummary.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  )}
                <div className="mt-2 rounded-xl bg-ink-900/5 p-3">
                  <pre className="max-h-48 overflow-auto whitespace-pre-wrap text-[11px] leading-relaxed text-ink-900">
                    {optResult.optimizedResume}
                  </pre>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-800 hover:bg-ink-50"
                    onClick={() => {
                      if (optResult.optimizedResume) {
                        setResumeSnapshot(optResult.optimizedResume);
                      }
                    }}
                  >
                    Use as resume snapshot
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-ink-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-ink-800"
                    onClick={() =>
                      downloadResumePdf({
                        resumeText: optResult.optimizedResume,
                        filename: "tailored-resume.pdf",
                      })
                    }
                  >
                    Download as PDF
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>

        <footer className="flex items-center justify-between border-t border-ink-100 px-6 py-3">
          <p className="text-[11px] text-ink-500">
            Saving will update this row in the Applications history table.
          </p>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </footer>
      </div>
    </div>
  );
}

