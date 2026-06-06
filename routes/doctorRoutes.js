import express from "express";
import { getAllDoctors, getDoctorById, updateDoctorProfile, toggleAvailability, getPatientNote, savePatientNote } from "../controllers/doctorController.js";

const router = express.Router();

router.get("/", getAllDoctors);
router.get("/:id", getDoctorById);
router.put("/:id/profile", updateDoctorProfile);
router.patch("/:id/availability", toggleAvailability);
router.get("/patient-note/:doctorId/:patientId", getPatientNote);
router.post("/patient-note", savePatientNote);

export default router;
