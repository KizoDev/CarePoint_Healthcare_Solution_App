// controllers/clientController.js
import db from "../models/index.js";
const { Client, Shift, Notification, AuditLog } = db;

// Create a new client
export const createClient = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const client = await Client.create(req.body);

    // Audit log
    await AuditLog.create({
      admin_id: req.user.id,
      action: "CREATE_CLIENT",
      module: "Client",
      details: `Created client ${client.name} (${client.id})`,
      timestamp: new Date(),
    });

    res.status(201).json({ message: "Client created successfully", data: client });
  } catch (error) {
    res.status(500).json({ message: "Failed to create client", error: error.message });
  }
};

// Get all clients
export const getClients = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const clients = await Client.findAll();

    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve clients", error: error.message });
  }
};

// Get a single client by ID
export const getSingleClient = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const { id } = req.params;
    const client = await Client.findByPk(id);
    if (!client) return res.status(404).json({ message: "Client not found" });

    res.json(client);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving client", error: error.message });
  }
};

// Update a client's information
export const updateClient = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const { id } = req.params;
    const [updated] = await Client.update(req.body, { where: { id } });

    if (!updated) {
      return res.status(404).json({ message: "Client not found or no change made" });
    }

    const updatedClient = await Client.findByPk(id);

    // 1) Find staff assigned to this client's shifts
    const shifts = await Shift.findAll({ where: { clientId: id } });
    const uniqueStaffIds = [...new Set(shifts.map((shift) => shift.staffId).filter(Boolean))];

    const io = req.app.get("io");

    // 2) Notify each staff
    for (const staffId of uniqueStaffIds) {
      await Notification.create({
        title: "Client Updated",
        message: `Client ${updatedClient.name} was updated.`,
        type: "client",
        staffId,
      });
      if (io) {
        io.to(`user_${staffId}`).emit("clientUpdated", {
          message: `Client ${updatedClient.name} information has been updated.`,
        });
      }
    }

    // Audit log
    await AuditLog.create({
      admin_id: req.user.id,
      action: "UPDATE_CLIENT",
      module: "Client",
      details: `Updated client ${updatedClient.name} (${updatedClient.id})`,
      timestamp: new Date(),
    });

    res.json({ message: "Client updated successfully", data: updatedClient });
  } catch (error) {
    res.status(500).json({ message: "Failed to update client", error: error.message });
  }
};

// Delete a client
export const deleteClient = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const { id } = req.params;
    const deleted = await Client.destroy({ where: { id } });

    if (!deleted) return res.status(404).json({ message: "Client not found" });

    // Find staff who were handling that client
    const shifts = await Shift.findAll({ where: { clientId: id } });
    const uniqueStaffIds = [...new Set(shifts.map((shift) => shift.staffId).filter(Boolean))];

    const io = req.app.get("io");

    for (const staffId of uniqueStaffIds) {
      await Notification.create({
        title: "Client Removed",
        message: "A client associated with your shifts has been removed.",
        type: "client",
        staffId,
      });
      if (io) {
        io.to(`user_${staffId}`).emit("clientRemoved", {
          message: "A client assigned to you has been removed.",
        });
      }
    }

    // Audit log
    await AuditLog.create({
      admin_id: req.user.id,
      action: "DELETE_CLIENT",
      module: "Client",
      details: `Deleted client ${id}`,
      timestamp: new Date(),
    });

    res.json({ message: "Client deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete client", error: error.message });
  }
};

// Get client's shift history
export const getClientShiftHistory = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const { clientId } = req.params;

    const shifts = await Shift.findAll({
      where: { clientId: clientId },
      order: [["start_time", "DESC"]],
    });

    // Audit log
    await AuditLog.create({
      admin_id: req.user.id,
      action: "GET_CLIENT_SHIFT_HISTORY",
      module: "Client",
      details: `Viewed shift history for client ${clientId}`,
      timestamp: new Date(),
    });

    res.json({ message: "Shift history retrieved", data: shifts });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch client shift history", error: error.message });
  }
};
