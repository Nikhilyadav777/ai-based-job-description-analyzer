import { downloadResumePdf } from "../../utils/downloadResumePdf.js";

export function OptimizedResumePanel({ data, onCopy }) {
  if (!data) return null;
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-lg font-semibold text-ink-900">Tailored resume</h3>
        {data.usedMock && (
          <span className="text-xs text-amber-700">Demo — configure API key</span>
        )}
      </div>
      {(data.changesSummary || []).length > 0 && (
        <ul className="mt-3 list-inside list-disc text-sm text-ink-600">
          {data.changesSummary.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      )}
      <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-xl bg-ink-900/5 p-4 text-xs leading-relaxed text-ink-800 sm:text-sm">
        {data.optimizedResume}
      </pre>
      {/* <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onCopy?.(data.optimizedResume)}
          className="rounded-xl border border-ink-200 bg-white px-4 py-2 text-sm font-semibold text-ink-800 hover:bg-ink-50"
        >
          Copy resume
        </button>
        <button
          type="button"
          onClick={() =>
            downloadResumePdf({
              resumeText: data.optimizedResume,
              filename: "tailored-resume.pdf",
            })
          }
          className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white hover:bg-ink-800"
        >
          Download as PDF
        </button>
      </div> */}
    </div>
  );
}
