import { draftFollowUpEmail } from "../services/aiService.js";
import {
  createApplication,
  deleteApplication,
  getApplication,
  listApplications,
  updateApplication,
  validStatuses,
} from "../services/applicationStore.js";

function safeString(val) {
  if (typeof val === "string") return val;
  if (Array.isArray(val)) return val.join("\n");
  if (val && typeof val === "object") return JSON.stringify(val, null, 2);
  return String(val || "");
}

export async function list(req, res, next) {
  try {
    const apps = await listApplications();
    res.json({ applications: apps, statuses: validStatuses() });
  } catch (e) {
    next(e);
  }
}

export async function getOne(req, res, next) {
  try {
    const app = await getApplication(req.params.id);
    if (!app) return res.status(404).json({ error: "Not found" });
    res.json(app);
  } catch (e) {
    next(e);
  }
}

export async function create(req, res, next) {
  try {
    const app = await createApplication(req.body || {});
    res.status(201).json(app);
  } catch (e) {
    next(e);
  }
}

export async function update(req, res, next) {
  try {
    const { status, notes, title, company, lastEmailDraft, followUpDraft, resumeSnapshot } =
      req.body || {};
    const patch = {};
    if (status !== undefined) patch.status = status;
    if (notes !== undefined) patch.notes = notes;
    if (title !== undefined) patch.title = title;
    if (company !== undefined) patch.company = company;
    if (lastEmailDraft !== undefined) patch.lastEmailDraft = lastEmailDraft;
    if (followUpDraft !== undefined) patch.followUpDraft = followUpDraft;
    if (resumeSnapshot !== undefined) patch.resumeSnapshot = resumeSnapshot;

    const existing = await getApplication(req.params.id);
    if (!existing) return res.status(404).json({ error: "Not found" });

    const prevStatus = existing.status;
    const updated = await updateApplication(req.params.id, patch);
    if (!updated) return res.status(404).json({ error: "Not found" });

    let followUpAuto = null;
    if (status !== undefined && status !== prevStatus) {
      try {
        followUpAuto = await draftFollowUpEmail({
          status,
          companyName: updated.company,
          candidateName: req.body?.candidateName,
          notes: updated.notes,
          jobDescription: updated.jobDescription,
        });
        const withDraft = await updateApplication(req.params.id, {
          followUpDraft: followUpAuto,
        });
        return res.json(withDraft);
      } catch {
        return res.json(updated);
      }
    }

    res.json(updated);
  } catch (e) {
    if (e.message === "Invalid status") {
      return res.status(400).json({ error: e.message, statuses: validStatuses() });
    }
    next(e);
  }
}

export async function remove(req, res, next) {
  try {
    const ok = await deleteApplication(req.params.id);
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

export async function regenerateFollowUp(req, res, next) {
  try {
    const existing = await getApplication(req.params.id);
    if (!existing) return res.status(404).json({ error: "Not found" });

    const { candidateName, extraNotes } = req.body || {};

    const draft = await draftFollowUpEmail({
      status: existing.status,
      companyName: existing.company,
      candidateName,
      notes: extraNotes || existing.notes,
      jobDescription: existing.jobDescription,
    });

    // 🔥 ALWAYS SANITIZE OUTPUT
    const safeDraft = {
      subject: safeString(draft.subject),
      body: safeString(draft.body),
      usedMock: Boolean(draft.usedMock),
    };

    const updated = await updateApplication(req.params.id, {
      followUpDraft: safeDraft,
    });

    res.json(updated);

  } catch (e) {
    next(e);
  }
}
