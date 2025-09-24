import jwt from 'jsonwebtoken';
import db from "../models/index.js";

const { Admin } = db;
const authMiddleware =async (req, res, next) => {

const adminCount = await Admin.count();
  if (adminCount === 0) {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded; // { id, role, email, ... } 
    console.log("Decoded token:", decoded);
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
 

};
export default authMiddleware;
