import express from "express";
import { getAllDoctors, getDoctorById, updateDoctorProfile } from "../controllers/doctorController.js";

const router = express.Router();

router.get("/", getAllDoctors);
router.get("/:id", getDoctorById);
router.put("/:id/profile", updateDoctorProfile);

export default router;
