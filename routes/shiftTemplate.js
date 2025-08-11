// routes/shiftTemplateRoutes.js
import express from "express";
import {
  createShiftTemplate,
  getAllTemplates,
  deleteTemplate
} from "../controllers/shiftTemplateControllers";

const router = express.Router();

router.post("/", createShiftTemplate);
router.get("/", getAllTemplates);
router.delete("/:id", deleteTemplate);

export default router;
