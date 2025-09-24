import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../models/index.js";

const { Admin, AuditLog } = db;

const generateToken = (admin) => {
  return jwt.sign(
    { id: admin.AdminId, role: admin.role },
    process.env.SECRET_KEY,
    { expiresIn: "1d" }
  );
};

// 🔑 Login Admin
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) return res.status(401).json({ message: "Invalid credentials" });

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(admin);

    // // ✅ Log the login
    // await AuditLog.create({
    //   admin_id: admin.id,
    //   action: "LOGIN",
    //   module: "Admin",
    //   details: `Admin ${admin.email} logged in`,
    // });

    res.status(200).json({ token, admin });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔑 Create Admin
export const createAdmin = async (req, res) => {
  try {
    const adminCount = await Admin.count();

    // First admin case
    if (adminCount === 0) {
      const { name, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      const firstAdmin = await Admin.create({
        name,
        email,
        password: hashedPassword,
        role: "Super_admin",
      });

      return res.status(201).json({
        message: "First admin created successfully",
        admin: firstAdmin,
      });
    }


    if (!req.user || req.user.role !== "Super_admin") {
      return res.status(403).json({
        message: "Only super admins can create other admins",
      });
    }

    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    //  Log the admin creation
    await AuditLog.create({
      admin_id: req.user.id,
      action: "CREATE",
      module: "Admin",
      details: `Created admin: ${newAdmin.email} with role: ${newAdmin.role}`,
    });

    res.status(201).json({
      message: "Admin created successfully",
      admin: newAdmin,
    });
  } catch (err) {
    res.status(500).json({ error: err.message, details: err.errors || err });
  }
};

// 🔑 Get All Admins
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll();

    // ✅ Log the fetch action
    await AuditLog.create({
      admin_id: req.user?.id || firstAdmin.id,
      action: "READ",
      module: "Admin",
      details: `Fetched all admins`,
    });

    res.status(200).json(admins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔑 Get Admin by ID
export const getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });


    res.status(200).json(admin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔑 Delete Admin
export const deleteAdmin = async (req, res) => {
  if (req.user.role !== "Super_admin") {
    return res.status(403).json({ message: "Only super admins can delete admins" });
  }

  try {
    const admin = await Admin.findByPk(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    await admin.destroy();

    // ✅ Log the deletion
    await AuditLog.create({
      admin_id: req.user.id,
      action: "DELETE",
      module: "Admin",
      details: `Deleted admin: ${admin.email}`,
    });

    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
