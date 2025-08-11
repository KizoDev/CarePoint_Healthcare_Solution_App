// controllers/shiftTemplateController.js
import db from "../models/index.js";

const { ShiftTemplate } = db;

export const createShiftTemplate = async (req, res) => {
  try {
    const template = await ShiftTemplate.create(req.body);
    res.status(201).json({ message: "Template created", data: template });
  } catch (error) {
    res.status(500).json({ message: "Error creating shift template", error });
  }
};

export const getAllTemplates = async (req, res) => {
  try {
    const templates = await ShiftTemplate.findAll({ include: ["client"] });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: "Error fetching templates", error });
  }
};

export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    await ShiftTemplate.destroy({ where: { id } });
    res.json({ message: "Template deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting template", error });
  }
};
