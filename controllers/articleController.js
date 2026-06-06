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

// Get all published articles (for patients) — fast, no images
export const getPublishedArticles = async (req, res) => {
    try {
        const articles = await Article.find({ status: "published" })
            .select("-coverImage")   // always exclude — images fetched separately
            .sort({ createdAt: -1 })
            .lean()
            .maxTimeMS(8000);

        // Populate doctor name manually
        const doctorIds = [...new Set(articles.map(a => a.doctorId?.toString()).filter(Boolean))];
        let doctorMap = {};
        if (doctorIds.length > 0) {
            const doctors = await User.find({ _id: { $in: doctorIds } }).select("name").lean().maxTimeMS(3000);
            doctors.forEach(d => { doctorMap[d._id.toString()] = d.name; });
        }

        const result = articles.map(a => ({
            ...a,
            doctorId: { _id: a.doctorId, name: doctorMap[a.doctorId?.toString()] || "Unknown" }
        }));

        res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching articles:", error);
        if (error.codeName === 'MaxTimeMSExpired' || error.code === 50) {
            return res.status(200).json([]);
        }
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};

// Get only cover images for published articles — used for background lazy loading
export const getArticleCovers = async (req, res) => {
    try {
        const covers = await Article.find({ status: "published", coverImage: { $ne: "" } })
            .select("_id coverImage")
            .lean()
            .maxTimeMS(15000);  // allow longer — this runs in background
        res.status(200).json(covers);
    } catch (error) {
        console.error("Error fetching article covers:", error);
        res.status(200).json([]);  // silently return empty — UI degrades gracefully
    }
};

// Get single article by ID (includes full coverImage)
export const getArticleById = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id)
            .populate("doctorId", "name")
            .lean()
            .maxTimeMS(8000);
        if (!article) return res.status(404).json({ msg: "Article not found" });
        res.status(200).json(article);
    } catch (error) {
        console.error("Error fetching article:", error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};


// Get articles by doctor ID
export const getDoctorArticles = async (req, res) => {
    try {
        const { id } = req.params;
        const articles = await Article.find({ doctorId: id })
            .select("-coverImage")
            .sort({ createdAt: -1 })
            .lean();
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
