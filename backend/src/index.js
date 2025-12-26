import express from 'express';
import dotenv from 'dotenv';
import notificationRoutes from './routes/notification.route.js';
import groupRoutes from './routes/group.route.js';
import upiPaymentRoutes from './routes/upiPayment.route.js';
import privacyRoutes from './routes/privacy.route.js';
import optimizationRoutes from './routes/optimization.route.js';
import authRoutes from './routes/auth.route.js';
import oauthRoutes from './routes/oauth.route.js';
import messageRoutes from './routes/message.route.js';
import contactRoutes from './routes/contact.route.js';
import invitationRoutes from './routes/invitation.route.js';
import callRoutes from './routes/call.route.js';
import analyticsRoutes from './routes/analytics.route.js';
import aiRoutes from './routes/ai.route.js';
import storyRoutes from './routes/story.route.js';
import streakRoutes from './routes/streak.route.js';
import roomRoutes from './routes/room.route.js';
import sharedExperienceRoutes from './routes/sharedExperience.route.js';
import challengeRoutes from './routes/challenge.route.js';
import gameProgressRoutes from './routes/gameProgress.route.js';
import wellnessRoutes from './routes/wellness.routes.js';
import healthIntegrationRoutes from './routes/healthIntegration.routes.js';
import corporateWellnessRoutes from './routes/corporateWellness.routes.js';
import communityChallengeRoutes from './routes/communityChallenge.routes.js';
import purchaseRoutes from './routes/purchase.routes.js';
import cors from 'cors';
import passportConfig from './lib/passport.js';
import { apiLimiter } from './middleware/rateLimiter.middleware.js';

import path from 'path';

import {connectDB} from './lib/db.js';
import cookieParser from 'cookie-parser';
import { app,server } from './lib/socket.js';
import { startMessageScheduler } from './lib/scheduler.js';
import maintenanceScheduler from './lib/maintenanceScheduler.js';
import cache from './lib/cache.js';
import keepAlive from './lib/keepAlive.js';

dotenv.config();

const PORT=process.env.PORT;
const __dirname = path.resolve();

// Trust proxy for production (Render, Heroku, etc.)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

//allows us to extract json data from the request body
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));  
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials:true
}));
app.use(passportConfig.initialize());

// Apply general rate limiting to all API routes
app.use('/api/', apiLimiter);

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: Date.now() });
});

// API routes MUST come before static files
app.use("/api/notifications",notificationRoutes);
app.use("/api/groups",groupRoutes);
app.use("/api/upi",upiPaymentRoutes);
app.use("/api/privacy",privacyRoutes);
app.use("/api/optimization",optimizationRoutes);
app.use("/api/auth",authRoutes);
app.use("/api/auth",oauthRoutes);
app.use("/api/messages",messageRoutes);
app.use("/api/contacts",contactRoutes);
app.use("/api/invitations",invitationRoutes);
app.use("/api/calls",callRoutes);
app.use("/api/analytics",analyticsRoutes);
app.use("/api/ai",aiRoutes);
app.use("/api/stories",storyRoutes);
app.use("/api/streaks",streakRoutes);
app.use("/api/rooms",roomRoutes);
app.use("/api/shared",sharedExperienceRoutes);
app.use("/api/challenges",challengeRoutes);
app.use("/api/game-progress",gameProgressRoutes);
app.use("/api/wellness",wellnessRoutes);
app.use("/api/health",healthIntegrationRoutes);
app.use("/api/corporate-wellness",corporateWellnessRoutes);
app.use("/api/community-challenges",communityChallengeRoutes);
app.use("/api/purchases",purchaseRoutes);

if (process.env.NODE_ENV === "production") {
    const frontendPath = path.join(__dirname, "../frontend/dist");
    app.use(express.static(frontendPath));
  
    // Catch-all route MUST be last
    app.get("*", (req, res) => {
      res.sendFile(path.join(frontendPath, "index.html"));
    });
  }
 

server.listen(PORT, async () => {
    console.log("Server isrunning on port:" + PORT);
    await connectDB();
    
    // Test Redis connection
    const redisHealthy = await cache.ping();
    if (redisHealthy) {
        console.log('✅ Redis connected and healthy');
    } else {
        console.warn('⚠️ Redis connection failed - running without cache');
    }
    
    startMessageScheduler();
    console.log("Message scheduler started");
    
    // Start maintenance scheduler
    maintenanceScheduler.start();
    console.log("Maintenance scheduler started");
    
    // Start keep-alive service to prevent cold starts
    keepAlive();
});
