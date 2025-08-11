import db from "../models/index.js";

const { Client, Shift } = db;

// Create a new client
export const createClient = async (req, res) => {
  try {
    const client = await Client.create(req.body);
    res.status(201).json({ message: "Client created successfully", data: client });
  } catch (error) {
    res.status(500).json({ message: "Failed to create client", error });
  }
};

// Get all clients
export const getClients = async (req, res) => {
  try {
    const clients = await Client.findAll();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve clients", error });
  }
};

// Get a single client by ID
export const getSingleClient = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findByPk(id);
    if (!client) return res.status(404).json({ message: "Client not found" });

    res.json(client);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving client", error });
  }
};

// Update a client's information
export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Client.update(req.body, { where: { id } });

    if (!updated) return res.status(404).json({ message: "Client not found or no change made" });

    const updatedClient = await Client.findByPk(id);
    res.json({ message: "Client updated successfully", data: updatedClient });
  } catch (error) {
    res.status(500).json({ message: "Failed to update client", error });
  }
};

// Delete a client
export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Client.destroy({ where: { id } });

    if (!deleted) return res.status(404).json({ message: "Client not found" });

    res.json({ message: "Client deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete client", error });
  }
};

// Get client's shift history
export const getClientShiftHistory = async (req, res) => {
  try {
    const { clientId } = req.params;

    const shifts = await Shift.findAll({
      where: { client_id: clientId },
      order: [["date", "DESC"]],
    });

    res.json({ message: "Shift history retrieved", data: shifts });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch client shift history", error });
  }
};
