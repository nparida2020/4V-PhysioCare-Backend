import Article from "../models/Article.js";
import User from "../models/User.js";

// Create Article
export const createArticle = async (req, res) => {
    try {
        const { doctorId, title, subtitle, content, category, tags, coverImage, status } = req.body;

        if (!title || !content || !doctorId) {
            return res.status(400).json({ msg: "Title, content, and doctorId are required." });
        }

        // Calculate read time based on word count (~200 words per min)
        const wordCount = content.trim().split(/\s+/).length;
        const readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

        const article = await Article.create({
            doctorId,
            title,
            subtitle: subtitle || "",
            content,
            category: category || "Wellness",
            tags: tags || [],
            coverImage: coverImage || "",
            status: status || "draft",
            readTime,
        });

        res.status(201).json({ msg: "Article created successfully", article });
    } catch (error) {
        console.error("Error creating article:", error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};

// Get all published articles (for patients)
export const getPublishedArticles = async (req, res) => {
    try {
        const articles = await Article.find({ status: "published" })
            .populate("doctorId", "name")
            .sort({ createdAt: -1 });
        res.status(200).json(articles);
    } catch (error) {
        console.error("Error fetching articles:", error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};

// Get articles by doctor ID
export const getDoctorArticles = async (req, res) => {
    try {
        const { id } = req.params;
        const articles = await Article.find({ doctorId: id }).sort({ createdAt: -1 });
        res.status(200).json(articles);
    } catch (error) {
        console.error("Error fetching doctor articles:", error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};

// Delete article
export const deleteArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const article = await Article.findByIdAndDelete(id);
        if (!article) return res.status(404).json({ msg: "Article not found" });
        res.status(200).json({ msg: "Article deleted successfully" });
    } catch (error) {
        console.error("Error deleting article:", error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};

// Update article
export const updateArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (updates.content) {
            const wordCount = updates.content.trim().split(/\s+/).length;
            updates.readTime = `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
        }

        const article = await Article.findByIdAndUpdate(id, updates, { new: true });
        if (!article) return res.status(404).json({ msg: "Article not found" });
        res.status(200).json({ msg: "Article updated", article });
    } catch (error) {
        console.error("Error updating article:", error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};
