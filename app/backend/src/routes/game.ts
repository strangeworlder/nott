import { Router } from "express";
import { gameController } from "../controllers/gameController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Apply authentication middleware to all game routes
router.use(authenticateToken);

// Room management endpoints
router.post("/rooms", gameController.createRoom);
router.get("/rooms", gameController.getRooms);
router.get("/rooms/:roomId", gameController.getRoom);
router.post("/rooms/:roomId/join", gameController.joinRoom);
router.delete("/rooms/:roomId/leave", gameController.leaveRoom);

// Room statistics
router.get("/stats", gameController.getRoomStats);

export default router;
