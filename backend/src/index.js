import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import cors from 'cors';

import {connectDB} from './lib/db.js';
import cookieParser from 'cookie-parser';
import { app,server } from './lib/socket.js';

dotenv.config();

const PORT=process.env.PORT;

//allows us to extract json data from the request body
app.use(express.json());  
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials:true
}));

app.use("/api/auth",authRoutes);
app.use("/api/message",messageRoutes);
 

server.listen(PORT, () => {
    console.log("Server isrunning on port:" + PORT);
    connectDB();
});