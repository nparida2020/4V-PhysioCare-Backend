import express from "express";
import {
    createAppointment,
    getDoctorAppointments,
    getPatientAppointments,
    updateAppointmentStatus
} from "../controllers/appointmentController.js";

const router = express.Router();

router.post("/", createAppointment);
router.get("/doctor/:id", getDoctorAppointments);
router.get("/patient/:id", getPatientAppointments);
router.patch("/:id/status", updateAppointmentStatus);

export default router;
