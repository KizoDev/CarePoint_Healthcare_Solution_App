import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import cron from "node-cron";
import axios from "axios";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

import db from "./models/index.js";
await db.sequelize.sync({ alter: true }); 


// Load env vars
dotenv.config();

// For __dirname with ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize app and serve
const app = express();
const server = http.createServer(app);

//Initialize socket
import { initializeSocket, getUserSocketMap } from "./config/socket.js";

//import  {initializeSocket}  from "./config/socket.js";
const io = initializeSocket(server);
if (io) {
  console.log("Socket.io initialized successfully");
} else {
  console.error("Socket.io initialization failed");
}

// Initialize models
import "./models/index.js";

// Swagger setup
//import { swaggerUi, swaggerSpec } from "./swagger/index.js";

// CORS configuration
const whiteList = [
  process.env.CLIENT_URL,
  process.env.CLIENT2_URL,
  "http://localhost:5173",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (whiteList.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  allowedHeaders: "Content-Type,Authorization",
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors(corsOptions));
app.use(morgan("tiny"));
app.use("/photo", express.static(path.join(__dirname, "photo")));

// Routes

import adminRoutes from "./routes/AdminRoute.js";
import staffRoutes from "./routes/staffRoute.js";
import clientRoutes from "./routes/clientRoute.js";
import shiftRoutes from "./routes/shiftRoute.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import auditLogRoutes from "./routes/auditRoute.js";
import shiftTemplateRoutes from "./routes/shiftTemplate.js";

// Error Handlers
import errorHandler from "./error/errorHandler.js";
import notFoundError from "./error/notFoundError.js";

// Use routes

app.use("/carepoint/admin", adminRoutes);
app.use("/carepoint/staff", staffRoutes);
app.use("/carepoint/client", clientRoutes);
app.use("/carepoint/shift", shiftRoutes);
app.use("/carepoint/notification", notificationRoutes);
app.use("/carepoint/audit", auditLogRoutes);
app.use("/carepoint/template", shiftTemplateRoutes);

// Swagger UI
//app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));



// 404 Handler
app.use(notFoundError);

// Global Error Handler
app.use(errorHandler);

//Attach socket to app
app.set("io", io);
app.set('userSocketMap', getUserSocketMap());
// Cron job to ping site every 30 mins
cron.schedule("*/30 * * * *", async () => {
  try {
    const response = await axios.get(process.env.CLIENT_URL);
    console.log("Ping successful:", response.status);
  } catch (error) {
    console.error("Ping failed:", error.message);
  }
});

// Start server
const port = process.env.PORT || 5000;
const startServer = async () => {
  try {
    server.listen(port, () => {
      console.log(`CarePoint server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error.message);
  }
};

startServer();
