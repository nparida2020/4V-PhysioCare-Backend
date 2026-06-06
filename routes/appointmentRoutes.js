import express from "express";
import {
    createAppointment,
    getDoctorAppointments,
    getPatientAppointments,
    updateAppointmentStatus,
    completeAppointment,
    reviewAppointment,
    sendAppointmentToPatient
} from "../controllers/appointmentController.js";

const router = express.Router();

router.post("/", createAppointment);
router.get("/doctor/:id", getDoctorAppointments);
router.get("/patient/:id", getPatientAppointments);
router.patch("/:id/status", updateAppointmentStatus);
router.post("/:id/complete", completeAppointment);
router.post("/:id/review", reviewAppointment);
router.patch("/:id/send-to-patient", sendAppointmentToPatient);

export default router;
