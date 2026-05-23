const base = import.meta.env.VITE_API_URL || "";

async function request(path, options = {}) {
  const isJson =
    options.body !== undefined &&
    options.body !== null &&
    !(options.body instanceof FormData);
  const res = await fetch(`${base}${path}`, {
    headers: isJson
      ? { "Content-Type": "application/json", ...options.headers }
      : { ...options.headers },
    ...options,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { error: text };
  }
  if (!res.ok) {
    throw new Error(data?.error || res.statusText);
  }
  return data;
}

export const api = {
  analyze: (body) => request("/api/jd/analyze", { method: "POST", body: JSON.stringify(body) }),
  optimizeResume: (body) =>
    request("/api/jd/optimize-resume", { method: "POST", body: JSON.stringify(body) }),
  draftEmail: (body) =>
    request("/api/jd/draft-email", { method: "POST", body: JSON.stringify(body) }),
  listApplications: () => request("/api/applications"),
  createApplication: (body) =>
    request("/api/applications", { method: "POST", body: JSON.stringify(body) }),
  updateApplication: (id, body) =>
    request(`/api/applications/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteApplication: (id) =>
    request(`/api/applications/${id}`, { method: "DELETE" }),
  followUp: (id, body) =>
    request(`/api/applications/${id}/follow-up`, {
      method: "POST",
      body: JSON.stringify(body || {}),
    }),
  atsFromPdf: ({ jobDescription, pdfBase64 }) =>
    request("/api/jd/ats-from-pdf", {
      method: "POST",
      body: JSON.stringify({ jobDescription, pdfBase64 }),
    }),
};
