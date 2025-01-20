import { Router } from "express";
import { checkHealthStatus } from "../controllers/health.controller";

const router = Router();

router.get("/", checkHealthStatus);

export default router;