import express from "express";
import {
    createArticle,
    getPublishedArticles,
    getDoctorArticles,
    deleteArticle,
    updateArticle
} from "../controllers/articleController.js";

const router = express.Router();

router.post("/", createArticle);
router.get("/published", getPublishedArticles);
router.get("/doctor/:id", getDoctorArticles);
router.delete("/:id", deleteArticle);
router.patch("/:id", updateArticle);

export default router;
