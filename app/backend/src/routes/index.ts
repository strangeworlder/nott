import { Router } from "express";
import authRoutes from "./auth";
import gameRoutes from "./game";
import userRoutes from "./user";
import webrtcRoutes from "./webrtc";

const router = Router();

// Health check
router.get("/health", (_req, res) => {
	res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API routes
router.use("/auth", authRoutes);
router.use("/game", gameRoutes);
router.use("/user", userRoutes);
router.use("/webrtc", webrtcRoutes);

export default router;
