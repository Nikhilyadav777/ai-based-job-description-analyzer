import { Router } from "express";
import {
  create,
  getOne,
  list,
  regenerateFollowUp,
  remove,
  update,
} from "../controllers/applicationController.js";

const router = Router();

router.get("/", list);
router.get("/:id", getOne);
router.post("/", create);
router.patch("/:id", update);
router.delete("/:id", remove);
router.post("/:id/follow-up", regenerateFollowUp);

export default router;
