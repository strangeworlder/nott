import { Router } from "express";
import { webRTCController } from "../controllers/webRTCController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// WebRTC configuration endpoints (public)
router.get("/config", webRTCController.getWebRTCConfig);
router.get("/validate", webRTCController.validateConfig);

// Voice room endpoints (require authentication)
router.get("/stats", authenticateToken, webRTCController.getVoiceStats);
router.get("/rooms/:roomId", authenticateToken, webRTCController.getVoiceRoom);
router.post(
	"/rooms/:roomId/join",
	authenticateToken,
	webRTCController.joinVoiceRoom,
);
router.post(
	"/rooms/:roomId/leave",
	authenticateToken,
	webRTCController.leaveVoiceRoom,
);

export default router;
