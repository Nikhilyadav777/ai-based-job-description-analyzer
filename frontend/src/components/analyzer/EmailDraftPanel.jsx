export function EmailDraftPanel({ draft, extractedEmails, onCopy }) {
  if (!draft && (!extractedEmails || extractedEmails.length === 0)) return null;

  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-6 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-lg font-semibold text-ink-900">Application email</h3>
        {draft?.usedMock && (
          <span className="text-xs text-amber-700">Demo draft</span>
        )}
      </div>
      {extractedEmails?.length > 0 && (
        <p className="mt-2 text-sm text-ink-600">
          Emails found in JD:{" "}
          <span className="font-medium text-ink-900">{extractedEmails.join(", ")}</span>
        </p>
      )}
      {draft && (
        <>
          <div className="mt-4">
            <p className="text-xs font-medium text-ink-500">Subject</p>
            <p className="mt-1 rounded-lg bg-ink-50 px-3 py-2 font-mono text-sm text-ink-900">
              {draft.subject}
            </p>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-ink-500">Body</p>
            <pre className="mt-1 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-ink-50 px-3 py-2 font-sans text-sm text-ink-800">
              {draft.body}
            </pre>
          </div>
          <button
            type="button"
            onClick={() => onCopy?.(`${draft.subject}\n\n${draft.body}`)}
            className="mt-4 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white shadow hover:bg-accent-dark"
          >
            Copy full email
          </button>
        </>
      )}
    </div>
  );
}
