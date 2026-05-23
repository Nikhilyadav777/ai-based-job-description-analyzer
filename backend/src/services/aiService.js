import { config, hasGroqKey } from "../config/env.js";

async function chatJson(systemPrompt, userContent) {
  if (!hasGroqKey()) {
    throw new Error("NO_API_KEY");
  }

  const res = await fetch(`${config.groq.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.groq.apiKey}`,
    },
    body: JSON.stringify({
      model: config.groq.model,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Groq error: ${res.status} ${text}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content;

  if (!raw) throw new Error("Empty AI response");

  return JSON.parse(raw);
}

/* ---------------- MOCKS (unchanged) ---------------- */

function mockAnalyze(jobDescription, resumeText) {
  const jdLen = jobDescription.length;
  const resLen = resumeText.length;
  const rough = Math.min(95, 40 + Math.round((resLen / Math.max(jdLen, 1)) * 25));

  return {
    matchScore: rough,
    summary:
      "Demo mode: add GROQ_API_KEY in backend/.env for AI-powered analysis.",
    strengths: ["Enable AI for real keyword extraction."],
    gaps: ["Add Groq API key for real matching."],
    interviewTips: ["Prepare STAR-based answers."],
    usedMock: true,
  };
}

function mockOptimizedResume(jobDescription, resumeText) {
  return {
    optimizedResume: `${resumeText.trim()}\n\n[DEMO MODE] Add Groq API key for AI rewrite.`,
    changesSummary: ["Mock output — no API key detected."],
    usedMock: true,
  };
}

function mockDraftEmail(payload) {
  return {
    subject: "Application Email (Demo Mode)",
    body: `Hi,\n\nDemo mode active. Add GROQ_API_KEY to generate real email.\n\nRegards`,
    usedMock: true,
  };
}

function safeString(val) {
  if (typeof val === "string") return val;
  if (Array.isArray(val)) return val.join("\n");
  if (typeof val === "object" && val !== null) return JSON.stringify(val, null, 2);
  return String(val || "");
}

function mockFollowUp(payload) {
  return {
    subject: "Follow-up (Demo Mode)",
    body: "Demo mode active. Add GROQ_API_KEY for real output.",
    usedMock: true,
  };
}

/* ---------------- MAIN FUNCTIONS ---------------- */

export async function analyzeResumeAgainstJd(jobDescription, resumeText) {
  const system = `You are an expert recruiter and ATS optimization specialist.

Return STRICT JSON with:
- matchScore: number between 0 and 100, representing ATS friendliness and JD match
- summary: short plain-English overview of how well the resume fits
- strengths: array of bullet-point strings for what is already strong
- gaps: array of bullet-point strings for missing or weak areas
- interviewTips: array of bullet-point strings with prep tips.

Focus on realistic, non-hallucinated suggestions and ATS keywords that actually
appear in the job description. Do NOT invent experience or tools the candidate
does not mention.`;

  const user = `Job description:\n${jobDescription}\n\nResume:\n${resumeText}`;

  try {
    const out = await chatJson(system, user);

    return {
      matchScore: Number(out.matchScore) || 0,
      summary: String(out.summary || ""),
      strengths: Array.isArray(out.strengths) ? out.strengths : [],
      gaps: Array.isArray(out.gaps) ? out.gaps : [],
      interviewTips: Array.isArray(out.interviewTips) ? out.interviewTips : [],
      usedMock: false,
    };
  } catch (e) {
    if (e.message === "NO_API_KEY") {
      return mockAnalyze(jobDescription, resumeText);
    }
    throw e;
  }
}

export async function analyzeAtsForResume(jobDescription, resumeText) {
  return analyzeResumeAgainstJd(jobDescription, resumeText);
}

export async function optimizeResumeForJd(jobDescription, resumeText) {
  const system = `You are a resume writer. Return JSON:
optimizedResume (string), changesSummary (array). Do not hallucinate experience.`;

  const user = `JD:\n${jobDescription}\n\nResume:\n${resumeText}`;

  try {
    const out = await chatJson(system, user);

    return {
      optimizedResume: String(out.optimizedResume || resumeText),
      changesSummary: Array.isArray(out.changesSummary)
        ? out.changesSummary
        : [],
      usedMock: false,
    };
  } catch (e) {
    if (e.message === "NO_API_KEY") {
      return mockOptimizedResume(jobDescription, resumeText);
    }
    throw e;
  }
}

export async function draftApplicationEmail(payload) {
  const system = `
You are a professional HR assistant writing JOB APPLICATION EMAILS.

Your writing style MUST be:

- Simple and polite English
- Natural human tone (not AI or marketing style)
- Humble and respectful
- No exaggerated words like "highly excited", "perfect fit", "dream opportunity"
- No overly long sentences
- No sales/marketing tone

STRICT STRUCTURE:

Dear Hiring Team,

Paragraph 1: Simple introduction and purpose of writing

Paragraph 2: Briefly mention relevant skills from JD in a factual way

Paragraph 3: Polite interest in the role and willingness to contribute

Paragraph 4: Simple closing line requesting consideration

Best regards,
<Candidate Name>

FORMATTING RULES:
- Use \\n\\n between paragraphs
- Keep language natural and conversational but professional
- Do NOT use bullet points
- Do NOT include JSON inside body

OUTPUT FORMAT (STRICT JSON ONLY):
{
  "subject": "Application for <Job Role>",
  "body": "properly formatted email"
}
`;

  const user = `
Company: ${payload.companyName || ""}
Candidate: ${payload.candidateName || ""}

Job Description:
${payload.jobDescription.slice(0, 4000)}
`;

  try {
    const out = await chatJson(system, user);

    console.log("🔥 RAW EMAIL OUTPUT:", out);

return {
  subject: safeString(out.subject),

  body: (() => {
    let email = safeString(out.body)
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    const name = payload.candidateName || "Candidate";

    // Force correct signature format
    email = email.replace(
      /Best regards,?\s*(.*)?$/i,
      `Best regards,\n${name}`
    );

    // If missing signature completely, add it
    if (!email.includes(name)) {
      email += `\n\nBest regards,\n${name}`;
    }

    return email;
  })(),

  usedMock: false,
};

  } catch (e) {
    if (e.message === "NO_API_KEY") {
      return mockDraftEmail(payload);
    }
    throw e;
  }
}

export async function draftFollowUpEmail(payload) {
  const system = `Return JSON: subject, body.`;

  const user = `Status: ${payload.status}
Company: ${payload.companyName}
Notes: ${payload.notes}`;

  try {
    const out = await chatJson(system, user);

    return {
      subject: String(out.subject || ""),
      body: String(out.body || ""),
      usedMock: false,
    };
  } catch (e) {
    if (e.message === "NO_API_KEY") {
      return mockFollowUp(payload);
    }
    throw e;
  }
}

export function extractEmailFromJd(jobDescription) {
  const re = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  const found = jobDescription.match(re);
  return found ? [...new Set(found)] : [];
}