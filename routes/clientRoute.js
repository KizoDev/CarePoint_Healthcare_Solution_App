// routes/clientRoute.js
import express from "express";
import {
  createClient,
  getClients,
  getSingleClient,
  updateClient,
  deleteClient,
  getClientShiftHistory,
} from "../controllers/clientController.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();

/**
 * @swagger
 * /clients:
 *   post:
 *     summary: Create a new client
 *     tags: [Clients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Client created successfully
 *       500:
 *         description: Failed to create client
 */
router.post("/create",authMiddleware, createClient);

/**
 * @swagger
 * /clients:
 *   get:
 *     summary: Get all clients
 *     tags: [Clients]
 *     responses:
 *       200:
 *         description: List of clients
 *       500:
 *         description: Failed to retrieve clients
 */
router.get("/get",authMiddleware, getClients);

/**
 * @swagger
 * /clients/{id}:
 *   get:
 *     summary: Get a single client by ID
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Client details
 *       404:
 *         description: Client not found
 *       500:
 *         description: Error retrieving client
 */
router.get("/get/:id",authMiddleware, getSingleClient);

/**
 * @swagger
 * /clients/{id}:
 *   put:
 *     summary: Update a client
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Client updated successfully
 *       404:
 *         description: Client not found or no change made
 *       500:
 *         description: Failed to update client
 */
router.put("/update/:id",authMiddleware, updateClient);

/**
 * @swagger
 * /clients/{id}:
 *   delete:
 *     summary: Delete a client
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Client deleted successfully
 *       404:
 *         description: Client not found
 *       500:
 *         description: Failed to delete client
 */
router.delete("/elete/:id",authMiddleware, deleteClient);

/**
 * @swagger
 * /clients/{clientId}/shifts:
 *   get:
 *     summary: Get a client's shift history
 *     tags: [Clients]
 *     parameters:
 *       - in: path
 *         name: clientId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shift history retrieved
 *       500:
 *         description: Failed to fetch client shift history
 */
router.get("/:clientId/shifts",authMiddleware, getClientShiftHistory);

export default router;
