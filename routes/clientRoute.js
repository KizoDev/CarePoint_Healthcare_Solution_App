import express from "express";
import {
  createClient,
  getClients,
  getSingleClient,
  updateClient,
  deleteClient,
  getClientShiftHistory,
} from "../controllers/clientController.js";

const router = express.Router();

router.post("/", createClient);
router.get("/", getClients);
router.get("/:id", getSingleClient);
router.put("/:id", updateClient);
router.delete("/:id", deleteClient);
router.get("/:clientId/shifts", getClientShiftHistory);

export default router;
