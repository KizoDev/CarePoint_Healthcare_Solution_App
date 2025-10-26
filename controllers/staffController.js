import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../models/index.js";
const { Staff, StaffDocument, Shift, Notification, AuditLog } = db;
import nodemailer from "nodemailer";

// const generateToken = (staff) => {
//   return jwt.sign(
//     { id: staff.staffId, role: staff.role },
//     process.env.SECRET_KEY,
//     { expiresIn: "1d" }
//   );
// };
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.adminId || user.staffId, 
      role: user.role,
      email: user.email,
    },
    process.env.SECRET_KEY,
    { expiresIn: "1d" }
  );
};

let mailTransporter = nodemailer.createTransport({
      host: "mail.skilltopims.com",  
      port: 587, 
      secure: false, 
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

export const inviteStaff = async (req, res) => {
  try {
    const role = req.user.role;
    if (role !== "HR_admin" && role !== "Super_admin") {
      return res.status(401).json({ message: 'You are not allowed to access this route' });
    }

    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'All fields (firstname, lastname, email, password) are required' });
    }

    // Check if email already exists in Staff
    const existingStaff = await Staff.findOne({ where: { email } });
    if (existingStaff) {
      return res.status(400).json({ message: 'Email already exists as a staff' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const url = process.env.CLIENT_URL;

    // Create new staff
    const newStaff = await Staff.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    // Save to AuditLog
    await AuditLog.create({
      admin_id: req.user.id,
      action: "Invite Staff",
      module: "staff",
      details: `HR_admin invited new staff: ${firstName} ${lastName} (${email})`,
      timestamp: new Date(),
    });

    // Prepare email
    let mailOption = {
      from: process.env.EMAIL_USER,
      to: newStaff.email,
      subject: "You have been invited as a Staff Member",
      html: `<h2>Hi ${firstName},</h2>
      <p>You have been invited by Admin to join as a staff member.</p>
      <p>Please use the credentials below to log in by clicking on this <a href="${url}">link</a>:</p>
      <p>Email: ${newStaff.email}<br>
      Password: ${password}</p>`
    };

    // Send email
    mailTransporter.sendMail(mailOption, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Invitation email sent to staff');
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Staff invited successfully, email has been sent, and audit log created',
      data: {
        staffId: newStaff.staffId,
        email: newStaff.email,
        status: newStaff.status,
        role: newStaff.role,
      },
    });

  } catch (err) {
    console.error('Error inviting staff:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// login staff
export const loginStaff = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find staff by email
    const staff = await Staff.findOne({ where: { email } });
    if (!staff) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    //  Check permissions
    const hasAccess = staff.permissions?.some(
      (perm) => perm.label === "Access_mobile_App" && perm.Access === true
    );
    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied: Permission not granted" });
    }

    // 🔑 Compare password
    const validPassword = await bcrypt.compare(password, staff.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🎟️ Generate JWT token
    const token = generateToken(staff);

    // ✅ Send response
    res.status(200).json({
      token,
      staff: {
        id: staff.staffId,
        username: staff.firstname,
        email: staff.email,
        role: staff.role,
        status: staff.status,
      },
    });

  } catch (err) {
    console.error("Error logging in staff:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get all staff with pagination
export const getAllStaff = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin" && role !== "Super_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const { role, is_available, page = 1, limit = 10 } = req.query;

    const where = {};
    if (role) where.role = role;
    if (is_available !== undefined) where.is_available = is_available === "true";

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Staff.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [["created_at", "DESC"]],
    });

    res.status(200).json({
      total: count,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      data: rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single staff by ID
export const getSingleStaff = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin" && role !== "Super_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const staff = await Staff.findByPk(req.params.id, {
      include: [{ model: StaffDocument, as: "documents" }],
    });
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update staff profile
export const updateStaff = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin" && role !== "Super_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    await staff.update(req.body);

    // 🔔 Notify staff
    const io = req.app.get("io");
    if (io) {
      io.to(`user_${staff.staffId}`).emit("staffUpdated", {
        message: "Your staff profile has been updated",
        staff,
      });
    }

    await Notification.create({
      title: "Staff Updated",
      message: "Your staff profile has been updated.",
      type: "general",
      recipientId : staff.staffId,
    });

    //  Save to AuditLog
    await AuditLog.create({
      admin_id: req.user.id,
      action: "Update Staff",
      module: "staff",
      details: `HR_admin updated staff: ${staff.firstname} ${staff.lastname} (${staff.email})`,
      timestamp: new Date(),
    });

    res.status(200).json({ message: "Staff updated successfully", data: staff });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete staff
export const deleteStaff = async (req, res) => {
  const role = req.user.role;
  if (role !== "HR_admin" && role !== "Super_admin") {
    return res.status(401).json({ message: "You are not allowed to access this route" });
  }

  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    await staff.destroy();

    // Save to AuditLog
    await AuditLog.create({
      admin_id: req.user.id,
      action: "Delete Staff",
      module: "staff",
      details: `HR_admin deleted staff: ${staff.firstname} ${staff.lastname} (${staff.email})`,
      timestamp: new Date(),
    });

    res.status(200).json({ message: "Staff deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const updatePermissions = async (req, res) => {
  try {
    // ✅ Ensure only HR_admin can update permissions
    const role = req.user.role;
    if (role !== "HR_admin" && role !== "Super_admin") {
      return res.status(401).json({ message: "You are not allowed to access this route" });
    }

    //  Extract staffId from params
    const { id: staffId } = req.params;

    //  Extract permissions from body
    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
      return res.status(400).json({ message: "Permissions must be an array" });
    }

    // Find staff
    const staff = await Staff.findOne({ where: { staffId } });
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    //  Update permissions
    staff.permissions = permissions;
    await staff.save();

    console.log("updatedPermissions", permissions);

    return res.status(200).json({
      message: "Permissions updated successfully",
      permissions: staff.permissions,
    });
  } catch (err) {
    console.error("Error updating permissions:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
