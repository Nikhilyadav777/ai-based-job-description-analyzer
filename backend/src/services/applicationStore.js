import { readFile, writeFile, mkdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "..", "data");
const DATA_FILE = join(DATA_DIR, "applications.json");

const DEFAULT_STATUSES = [
  "pending",
  "applied",
  "interview",
  "offer",
  "selected",
  "rejected",
  "withdrawn",
];

async function ensureFile() {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    await readFile(DATA_FILE, "utf-8");
  } catch {
    await writeFile(DATA_FILE, JSON.stringify({ applications: [] }, null, 2), "utf-8");
  }
}

async function readAll() {
  await ensureFile();
  const raw = await readFile(DATA_FILE, "utf-8");
  const data = JSON.parse(raw);
  return Array.isArray(data.applications) ? data.applications : [];
}

async function writeAll(applications) {
  await ensureFile();
  await writeFile(
    DATA_FILE,
    JSON.stringify({ applications }, null, 2),
    "utf-8"
  );
}

export function validStatuses() {
  return DEFAULT_STATUSES;
}

export async function listApplications() {
  const apps = await readAll();
  return apps.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export async function getApplication(id) {
  const apps = await readAll();
  return apps.find((a) => a.id === id) || null;
}

export async function createApplication(payload) {
  const apps = await readAll();
  const now = new Date().toISOString();
  const app = {
    id: uuidv4(),
    title: payload.title || "Untitled role",
    company: payload.company || "",
    status: payload.status && DEFAULT_STATUSES.includes(payload.status) ? payload.status : "pending",
    jobDescription: payload.jobDescription || "",
    resumeSnapshot: payload.resumeSnapshot || "",
    matchScore: payload.matchScore ?? null,
    contactEmails: Array.isArray(payload.contactEmails) ? payload.contactEmails : [],
    lastEmailDraft: payload.lastEmailDraft || null,
    followUpDraft: payload.followUpDraft || null,
    notes: payload.notes || "",
    createdAt: now,
    updatedAt: now,
  };
  apps.push(app);
  await writeAll(apps);
  return app;
}

export async function updateApplication(id, patch) {
  const apps = await readAll();
  const idx = apps.findIndex((a) => a.id === id);
  if (idx === -1) return null;

  const cur = apps[idx];
  const next = { ...cur, ...patch, updatedAt: new Date().toISOString() };

  if (patch.status && !DEFAULT_STATUSES.includes(patch.status)) {
    throw new Error("Invalid status");
  }

  apps[idx] = next;
  await writeAll(apps);
  return next;
}

export async function deleteApplication(id) {
  const apps = await readAll();
  const filtered = apps.filter((a) => a.id !== id);
  if (filtered.length === apps.length) return false;
  await writeAll(filtered);
  return true;
}
