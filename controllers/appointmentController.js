import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import Program from "../models/Program.js";

// Create Appointment
export const createAppointment = async (req, res) => {
    try {
        const { patientId, doctorId, date, time, notes } = req.body;

        const patient = await User.findById(patientId);
        const doctor = await User.findById(doctorId);

        if (!patient || !doctor) {
            return res.status(404).json({ msg: "Patient or Doctor not found" });
        }

        const appointment = await Appointment.create({
            patientId,
            doctorId,
            date,
            time,
            notes,
            status: "Pending" // Default
        });

        res.status(201).json({ msg: "Appointment created successfully", appointment });
    } catch (error) {
        console.error("Error creating appointment:", error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};

// Get Doctor Appointments
export const getDoctorAppointments = async (req, res) => {
    try {
        const { id } = req.params;
        const appointments = await Appointment.find({ doctorId: id })
            .populate("patientId", "name email")
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json(appointments);
    } catch (error) {
        console.error("Error fetching doctor appointments:", error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};

// Get Patient Appointments
export const getPatientAppointments = async (req, res) => {
    try {
        const { id } = req.params;
        const appointments = await Appointment.find({ patientId: id })
            .populate("doctorId", "name email")
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json(appointments);
    } catch (error) {
        console.error("Error fetching patient appointments:", error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};

// Update Appointment Status
export const updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["Pending", "Confirmed", "Completed", "Cancelled", "Rescheduled"].includes(status)) {
            return res.status(400).json({ msg: "Invalid status" });
        }

        const appointment = await Appointment.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!appointment) {
            return res.status(404).json({ msg: "Appointment not found" });
        }

        res.status(200).json({ msg: "Appointment status updated", appointment });
    } catch (error) {
        console.error("Error updating appointment status:", error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};

// Complete Appointment (Doctor side)
export const completeAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { problemDescription, medicine, suggestion, followUpNeeded, followUpDate, programCode } = req.body;

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({ msg: "Appointment not found" });
        }

        let programTitle = "";
        if (programCode) {
            const program = await Program.findOne({ programCode });
            if (program) {
                programTitle = program.title;
            }
        }

        // Calculate session number (how many completed appointments the patient already has)
        const pastSessions = await Appointment.countDocuments({
            patientId: appointment.patientId,
            status: "Completed"
        });
        
        appointment.status = "Completed";
        appointment.sessionNumber = pastSessions + 1;
        appointment.problemDescription = problemDescription;
        appointment.medicine = medicine;
        appointment.suggestion = suggestion;
        appointment.followUpNeeded = followUpNeeded;
        appointment.followUpDate = followUpDate;
        if (programCode) {
            appointment.programCode = programCode;
            appointment.programTitle = programTitle;
        }

        await appointment.save();

        res.status(200).json({ msg: "Appointment marked as completed", appointment });
    } catch (error) {
        console.error("Error completing appointment:", error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};

// Review Appointment (Patient side)
export const reviewAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { patientRating, patientFeeling, patientReview } = req.body;

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({ msg: "Appointment not found" });
        }

        if (appointment.status !== "Completed") {
            return res.status(400).json({ msg: "Can only review completed appointments" });
        }

        appointment.patientRating = patientRating;
        appointment.patientFeeling = patientFeeling;
        appointment.patientReview = patientReview;

        await appointment.save();

        res.status(200).json({ msg: "Review submitted successfully", appointment });
    } catch (error) {
        console.error("Error submitting review:", error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};

// Send appointment report to patient
export const sendAppointmentToPatient = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({ msg: "Appointment not found" });
        }
        if (appointment.status !== "Completed") {
            return res.status(400).json({ msg: "Can only send report for completed appointments" });
        }
        appointment.sentToPatient = true;
        await appointment.save();
        res.status(200).json({ msg: "Report sent to patient successfully", appointment });
    } catch (error) {
        console.error("Error sending report to patient:", error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};
