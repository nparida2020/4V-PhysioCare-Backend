import Appointment from "../models/Appointment.js";
import User from "../models/User.js";

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
            .sort({ createdAt: -1 });

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
            .sort({ createdAt: -1 });

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

        if (!["Pending", "Confirmed", "Cancelled", "Rescheduled"].includes(status)) {
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
