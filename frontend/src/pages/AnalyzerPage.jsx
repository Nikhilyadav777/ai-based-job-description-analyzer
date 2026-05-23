import { useCallback, useState } from "react";
import { api } from "../services/api.js";
import { TextAreaField } from "../components/analyzer/TextAreaField.jsx";
import { MatchResultCard } from "../components/analyzer/MatchResultCard.jsx";
import { EmailDraftPanel } from "../components/analyzer/EmailDraftPanel.jsx";
import { OptimizedResumePanel } from "../components/analyzer/OptimizedResumePanel.jsx";

function guessTitle(jd) {
  const line = jd.split("\n").map((l) => l.trim()).find(Boolean) || "";
  return line.slice(0, 80);
}

export function AnalyzerPage() {
  const [jd, setJd] = useState("");
  const [resume, setResume] = useState("");
  const [company, setCompany] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [optimizeLoading, setOptimizeLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [error, setError] = useState("");
  const [match, setMatch] = useState(null);
  const [optimized, setOptimized] = useState(null);
  const [emailDraft, setEmailDraft] = useState(null);
  const [extractedEmails, setExtractedEmails] = useState([]);

  const copy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  }, []);

  const runAnalyze = async () => {
    setSavedMsg("");
    setError("");
    setAnalyzeLoading(true);
    try {
      const data = await api.analyze({ jobDescription: jd, resumeText: resume });
      setMatch(data);
      setExtractedEmails(data.extractedEmails || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setAnalyzeLoading(false);
    }
  };

  const runOptimize = async () => {
    setSavedMsg("");
    setError("");
    setOptimizeLoading(true);
    try {
      const data = await api.optimizeResume({ jobDescription: jd, resumeText: resume });
      setOptimized(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setOptimizeLoading(false);
    }
  };

  const runDraftEmail = async () => {
    setSavedMsg("");
    setError("");
    setEmailLoading(true);
    try {
      const data = await api.draftEmail({
        jobDescription: jd,
        companyName: company || undefined,
        candidateName: candidateName || undefined,
      });
      console.log("Drafted email:", data);
      setEmailDraft({ subject: data.subject, body: data.body, usedMock: data.usedMock });
      setExtractedEmails(data.extractedEmails || extractedEmails);
    } catch (e) {
      setError(e.message);
    } finally {
      setEmailLoading(false);
    }
  };

  const saveToTracker = async () => {
    setSavedMsg("");
    setError("");
    setSaveLoading(true);
    try {
      const resumeSnapshot = optimized?.optimizedResume || resume;
      await api.createApplication({
        title: guessTitle(jd),
        company,
        jobDescription: jd,
        resumeSnapshot,
        matchScore: match?.matchScore ?? null,
        contactEmails: extractedEmails,
        status: "pending",
        lastEmailDraft: emailDraft,
      });
      setSavedMsg("Saved to Applications — open the Applications tab to track status.");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
          Job description analyzer
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-600 sm:text-base">
          Paste a JD and your resume to see fit score, get a tailored resume draft, and generate
          application emails—including when the posting asks you to mail a resume.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      )}
      {savedMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {savedMsg}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <TextAreaField
          label="Job description"
          value={jd}
          onChange={setJd}
          placeholder="Paste the full job description…"
          rows={14}
        />
        <TextAreaField
          label="Your resume"
          value={resume}
          onChange={setResume}
          placeholder="Paste your resume text…"
          rows={14}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-700">Company (optional)</span>
          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            placeholder="Acme Inc."
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-700">Your name (for emails)</span>
          <input
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            className="rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            placeholder="Jane Doe"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={analyzeLoading}
          onClick={runAnalyze}
          className="rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-accent-dark disabled:opacity-50"
        >
          {analyzeLoading ? "Analyzing…" : "Analyze fit"}
        </button>
        <button
          type="button"
          disabled={optimizeLoading}
          onClick={runOptimize}
          className="rounded-xl border border-ink-200 bg-white px-5 py-2.5 text-sm font-semibold text-ink-800 hover:bg-ink-50 disabled:opacity-50"
        >
          {optimizeLoading ? "Tailoring…" : "Tailor resume to JD"}
        </button>
        <button
          type="button"
          disabled={emailLoading}
          onClick={runDraftEmail}
          className="rounded-xl border border-ink-200 bg-white px-5 py-2.5 text-sm font-semibold text-ink-800 hover:bg-ink-50 disabled:opacity-50"
        >
          {emailLoading ? "Drafting…" : "Draft application email"}
        </button>
        <button
          type="button"
          disabled={saveLoading || !jd.trim()}
          onClick={saveToTracker}
          className="rounded-xl bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink-800 disabled:opacity-50"
        >
          {saveLoading ? "Saving…" : "Save to tracker"}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MatchResultCard result={match} loading={analyzeLoading} />
        <EmailDraftPanel draft={emailDraft} extractedEmails={extractedEmails} onCopy={copy} />
      </div>

      {optimizeLoading && (
        <div className="rounded-2xl border border-ink-200 bg-white p-6 text-sm text-ink-500">
          Generating tailored resume…
        </div>
      )}
      <OptimizedResumePanel data={optimized} onCopy={copy} />
    </div>
  );
}
