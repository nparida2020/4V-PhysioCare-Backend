import Video from "../models/Video.js";
import fs from "fs";
import path from "path";

// Upload a new video
export const createVideo = async (req, res) => {
    try {
        // Form Data parsed by Multer and body parser
        const { doctorId, programId, title, description, duration, thumbnail } = req.body;
        
        let url = req.body.url || "";

        // If file was uploaded locally, overwrite URL with the local relative path
        if (req.file) {
            url = `/uploads/videos/${req.file.filename}`;
        }

        if (!title || !url) {
            return res.status(400).json({ msg: "Title and Video File/URL are required." });
        }
        
        const video = await Video.create({
            doctorId,
            programId: programId || null, // null means general
            title,
            description,
            url,
            duration,
            thumbnail
        });

        res.status(201).json(video);
    } catch (error) {
        console.error("Error creating video:", error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};

// Update video details (e.g. title, description, duration) without replacing URL
export const updateVideo = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, duration } = req.body;

        const updated = await Video.findByIdAndUpdate(
            id,
            { title, description, duration },
            { new: true } // returns the newly updated doc
        );

        if (!updated) return res.status(404).json({ msg: "Video not found" });

        res.status(200).json(updated);
    } catch (error) {
        console.error("Error updating video:", error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};

// Delete a single video
export const deleteVideo = async (req, res) => {
    try {
        const { id } = req.params;
        const video = await Video.findById(id);

        if (!video) return res.status(404).json({ msg: "Video not found" });

        // Optionally, if the file is stored locally, delete it from the hard drive to clear space
        if (video.url && video.url.startsWith("/uploads/videos/")) {
            const filePath = path.join(process.cwd(), video.url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await Video.findByIdAndDelete(id);

        res.status(200).json({ msg: "Video deleted successfully" });
    } catch (error) {
        console.error("Error deleting video:", error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};

// Get general videos
export const getGeneralVideos = async (req, res) => {
    try {
        const videos = await Video.find({ programId: null }).populate("doctorId", "name").sort({ createdAt: -1 });
        
        // Group logic: Get 1 video per doctor first rapidly
        const doctorFirstVideos = new Map();
        const remainingVideos = [];

        for (const video of videos) {
            if (!video.doctorId) {
                remainingVideos.push(video);
                continue;
            }
            
            const docId = video.doctorId._id.toString();
            if (!doctorFirstVideos.has(docId)) {
                doctorFirstVideos.set(docId, video);
            } else {
                remainingVideos.push(video);
            }
        }

        // Ordered list combines the initial doctor diversity with the chronological remaining array
        const balancedFeed = [...doctorFirstVideos.values(), ...remainingVideos];

        res.status(200).json(balancedFeed);
    } catch (error) {
        console.error("Error fetching general videos:", error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};

// Get videos for a specific program
export const getProgramVideos = async (req, res) => {
    try {
        const { programId } = req.params;
        const videos = await Video.find({ programId }).populate("doctorId", "name").sort({ createdAt: -1 });
        res.status(200).json(videos);
    } catch (error) {
        console.error("Error fetching program videos:", error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};

// Get general videos uploaded by a specific doctor
export const getGeneralVideosByDoctor = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const videos = await Video.find({ doctorId, programId: null }).sort({ createdAt: -1 });
        res.status(200).json(videos);
    } catch (error) {
        console.error("Error fetching general videos by doctor:", error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};
