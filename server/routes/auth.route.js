import express from "express";
import multer from "multer";
import {login, signup, logout } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js"; 

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/signup", upload.single("profilePic"), signup);
router.post("/login",login);
router.post('/logout', protectRoute, logout);

export default router;