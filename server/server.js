import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http"
import { Server } from 'socket.io';

import path from "path";

import { connectDB } from "./config/db.js";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js"
import issueRoutes from "./routes/issue.route.js"
import adminRoutes from "./routes/admin.route.js";
import { initSocket } from './services/socketService.js';
// import messageRoutes from "./routes/message.route.js";
// import { app, server } from "./lib/socket.js";
const app = express();
const server = http.createServer(app)
dotenv.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

// Make sure the admin routes are properly registered
app.use("/api/admin", adminRoutes);

// Initialize Socket.IO before routes
const io = initSocket(server);

// Basic connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/issues",issueRoutes)

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});