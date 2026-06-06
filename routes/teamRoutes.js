import express from "express";
import multer from "multer";
import path from "path";
import {
  createMember,
  getAllMembers,
  getMemberById,
  deleteMember,
} from "../controllers/teamController.js";

const router = express.Router();

// Multer — store team member photos in uploads/team/
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/team/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed."));
    }
  },
});

router.post("/", upload.single("photo"), createMember);
router.get("/", getAllMembers);
router.get("/:id", getMemberById);
router.delete("/:id", deleteMember);

export default router;
