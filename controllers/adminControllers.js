import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import  db  from "../models/index.js";

const {Admin} = db;

const generateToken = (admin) => {
  return jwt.sign(
    { id: admin.id, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) return res.status(401).json({ message: "Invalid credentials" });

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(admin);
    res.status(200).json({ token, admin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createAdmin = async (req, res) => {
  if (req.user.role !== "super_admin") {
    return res.status(403).json({ message: "Only super admins can create other admins" });
  }

  const { name, email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role,
    });
    res.status(201).json(newAdmin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll();
    res.status(200).json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.status(200).json(admin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteAdmin = async (req, res) => {
  if (req.user.role !== "super_admin") {
    return res.status(403).json({ message: "Only super admins can delete admins" });
  }

  try {
    const admin = await Admin.findByPk(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    await admin.destroy();
    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
