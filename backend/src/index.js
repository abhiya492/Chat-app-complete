import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import invitationRoutes from './routes/invitation.route.js';
import cors from 'cors';

import path from 'path';

import {connectDB} from './lib/db.js';
import cookieParser from 'cookie-parser';
import { app,server } from './lib/socket.js';

dotenv.config();

const PORT=process.env.PORT;
const __dirname = path.resolve();

//allows us to extract json data from the request body
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));  
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials:true
}));

// Health check endpoint for Kubernetes
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

app.use("/api/auth",authRoutes);
app.use("/api/messages",messageRoutes);
app.use("/api/invitations",invitationRoutes);

if (process.env.NODE_ENV === "production") {
    const frontendPath = path.join(__dirname, "../frontend/dist");
    app.use(express.static(frontendPath));
  
    app.get("*", (req, res) => {
      res.sendFile(path.join(frontendPath, "index.html"));
    });
  }
 

server.listen(PORT, () => {
    console.log("Server isrunning on port:" + PORT);
    connectDB();
});