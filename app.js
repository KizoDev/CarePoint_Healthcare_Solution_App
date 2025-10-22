import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import cron from "node-cron";
import axios from "axios";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import swaggerDocs  from "./swagger.js";
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
//import { swaggerUi, swaggerSpec } from "./swagger.js";

// CORS configuration
const whiteList = [
  process.env.CLIENT_URL,
  process.env.CLIENT2_URL,
  "http://localhost:3000",
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
//app.use("/photo", express.static(path.join(__dirname, "photo")));

// Routes
import adminRoutes from "./routes/AdminRoute.js";
import staffRoutes from "./routes/staffRoute.js";
import clientRoutes from "./routes/clientRoute.js";
import shiftRoutes from "./routes/shiftRoute.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import auditLogRoutes from "./routes/auditRoute.js";
import shiftTemplateRoutes from "./routes/shiftTemplate.js";
import payrollRoute from "./routes/payrollRoute.js";
import benefitRoute from "./routes/benefitRoute.js";
import attendanceRoute from "./routes/attendanceRoute.js";
import performanceRoute from "./routes/performanceRoute.js";
import carePointAppRoute from "./routes/carePointAppRoute.js";
import candidateRoute from "./routes/candidateRoutes.js";
import InterviewRoute from "./routes/interviewsRoutes.js";
import jobApplicationRoute from "./routes/jobapplicaionRoutes.js";
import jobPostingRoute from "./routes/jobPostingRoutes.js";
import learningRoute from "./routes/learningDevRoute.js";


// Error Handlers
import errorHandler from "./error/errorHandler.js";
import notFoundError from "./error/notFoundError.js";

// Use routes
app.use("/admin", adminRoutes);
app.use("/staff", staffRoutes);
app.use("/client", clientRoutes);
app.use("/shift", shiftRoutes);
app.use("/notification", notificationRoutes);
app.use("/audit", auditLogRoutes);
app.use("/template", shiftTemplateRoutes);
app.use("/", payrollRoute);
app.use("/benefits", benefitRoute);
app.use("/attendance", attendanceRoute);
app.use("/performance", performanceRoute);
app.use("/learning", learningRoute);
app.use("/carepoint", carePointAppRoute);
app.use("/carePointApp", carePointAppRoute);
app.use("/candidate", candidateRoute);
app.use("/Interview", InterviewRoute);
app.use("/jobApplication", jobApplicationRoute);
app.use("/jobPosting", jobPostingRoute);

// Swagger UI
//app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Allow Swagger docs before anything else
app.use("/api-docs", (req, res, next) => next());

// Swagger UI
const client_url = process.env.CLIENT_URL || "http://localhost:5000";
swaggerDocs(app, client_url);

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
