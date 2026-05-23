import { Router } from "express";
import { analyze, atsFromPdf, draftEmail, optimizeResume } from "../controllers/jdController.js";

const router = Router();

router.post("/analyze", analyze);
router.post("/optimize-resume", optimizeResume);
router.post("/draft-email", draftEmail);
router.post("/ats-from-pdf", atsFromPdf);

export default router;
