import express from "express";
import {
    createProgram,
    getDoctorPrograms,
    enrollInProgram,
    getPatientPrograms,
    deleteProgram,
    getProgramPatients
} from "../controllers/programController.js";

const router = express.Router();

router.post("/", createProgram);
router.get("/doctor/:doctorId", getDoctorPrograms);
router.post("/enroll", enrollInProgram);
router.get("/patient/:patientId", getPatientPrograms);
router.delete("/:id", deleteProgram);
router.get("/:id/patients", getProgramPatients);

export default router;
