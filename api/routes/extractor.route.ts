import { Router } from "express";
import { extractTOC } from "../controllers/extractor.controller";
import { validatePreviewLink } from "../middleware/validatePreviewLink";

const router = Router();

router.post("/", validatePreviewLink, extractTOC);

export default router;