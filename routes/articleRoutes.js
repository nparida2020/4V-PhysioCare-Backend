import express from "express";
import {
    createArticle,
    getPublishedArticles,
    getArticleCovers,
    getArticleById,
    getDoctorArticles,
    deleteArticle,
    updateArticle
} from "../controllers/articleController.js";

const router = express.Router();

router.post("/", createArticle);
router.get("/published", getPublishedArticles);
router.get("/covers", getArticleCovers);
router.get("/doctor/:id", getDoctorArticles);
router.get("/:id", getArticleById);
router.delete("/:id", deleteArticle);
router.patch("/:id", updateArticle);

export default router;
