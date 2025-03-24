import express from "express";
import { adminLogin, createAdmin, getIssues, updateIssueStatus, verifyIssue, getUsers } from "../controllers/admin.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/login", adminLogin);
router.post("/create", createAdmin);
router.get("/issues", protectRoute, getIssues);
router.patch("/issues/:id/status", protectRoute, updateIssueStatus);
router.post("/issues/:id/verify", protectRoute, verifyIssue);
router.get("/users", protectRoute, getUsers);

export default router;
