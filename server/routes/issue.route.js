import express from "express";
import { getUserReports, reportIssue, getIssueDetails, getNearbyIssues } from "../controllers/issue.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/report", protectRoute, reportIssue);
router.get("/my-reports", protectRoute, getUserReports);
router.get("/nearby", protectRoute, getNearbyIssues);
router.get("/:id", protectRoute, getIssueDetails);

export default router;
