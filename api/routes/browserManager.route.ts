import { Router } from "express";
import { getBrowserStatus } from "../controllers/browserManager.controller";

const router = Router();

router.get("/", getBrowserStatus);

export default router;