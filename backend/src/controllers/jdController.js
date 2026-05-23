import {
  analyzeAtsForResume,
  analyzeResumeAgainstJd,
  draftApplicationEmail,
  extractEmailFromJd,
  optimizeResumeForJd,
} from "../services/aiService.js";

export async function analyze(req, res, next) {
  try {
    const { jobDescription = "", resumeText = "" } = req.body || {};
    if (!jobDescription.trim() || !resumeText.trim()) {
      return res.status(400).json({
        error: "jobDescription and resumeText are required",
      });
    }
    const result = await analyzeResumeAgainstJd(jobDescription, resumeText);
    const emails = extractEmailFromJd(jobDescription);
    res.json({ ...result, extractedEmails: emails });
  } catch (e) {
    next(e);
  }
}

export async function optimizeResume(req, res, next) {
  try {
    const { jobDescription = "", resumeText = "" } = req.body || {};
    if (!jobDescription.trim() || !resumeText.trim()) {
      return res.status(400).json({
        error: "jobDescription and resumeText are required",
      });
    }
    const result = await optimizeResumeForJd(jobDescription, resumeText);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

export async function draftEmail(req, res, next) {
  try {
    const {
      jobDescription = "",
      recipientEmail,
      companyName,
      candidateName,
    } = req.body || {};
    if (!jobDescription.trim()) {
      return res.status(400).json({ error: "jobDescription is required" });
    }
    const extracted = extractEmailFromJd(jobDescription);
    const to = recipientEmail || extracted[0] || undefined;
    const result = await draftApplicationEmail({
      jobDescription,
      recipientEmail: to,
      companyName,
      candidateName,
    });
    res.json({ ...result, suggestedRecipient: to, extractedEmails: extracted });
  } catch (e) {
    next(e);
  }
}

export async function atsFromPdf(req, res, next) {
  try {
    const { jobDescription = "", pdfBase64 = "" } = req.body || {};

    if (!jobDescription.trim()) {
      return res.status(400).json({ error: "jobDescription is required" });
    }
    if (!pdfBase64) {
      return res.status(400).json({ error: "pdfBase64 is required" });
    }

    // Lazy-load pdf-parse so the rest of the app is unaffected if it fails.
    const { default: pdfParse } = await import("pdf-parse");

    const buffer = Buffer.from(pdfBase64, "base64");
    const parsed = await pdfParse(buffer);
    const resumeText = parsed.text || "";

    if (!resumeText.trim()) {
      return res.status(400).json({ error: "Could not extract text from PDF" });
    }

    const result = await analyzeAtsForResume(jobDescription, resumeText);
    res.json({
      ...result,
      extractedFromPdf: true,
      rawTextLength: resumeText.length,
    });
  } catch (e) {
    next(e);
  }
}
