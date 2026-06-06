import express from "express";
import multer from "multer";
import path from "path";
import {
    createVideo,
    getGeneralVideos,
    getProgramVideos,
    updateVideo,
    deleteVideo,
    getGeneralVideosByDoctor,
    logSession
} from "../controllers/videoController.js";

const router = express.Router();

// Setup Multer for video uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/videos/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // unique filename
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 100000000 }, // 100MB limit for short videos
});

// The 'videoFile' field corresponds to the attached file if any
router.post("/", upload.single("videoFile"), createVideo);
router.get("/general", getGeneralVideos);
router.get("/general/doctor/:doctorId", getGeneralVideosByDoctor);
router.get("/program/:programId", getProgramVideos);
router.put("/:id", updateVideo);
router.delete("/:id", deleteVideo);

router.post("/log-session", logSession);

export default router;
