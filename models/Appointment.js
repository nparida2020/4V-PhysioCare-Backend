import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD or specific format
    time: { type: String, required: true }, // Format: HH:MM AM/PM
    status: { type: String, enum: ["Pending", "Confirmed", "Cancelled", "Rescheduled"], default: "Pending" },
    notes: { type: String, default: "" }
}, { timestamps: true });

export default mongoose.model("Appointment", appointmentSchema);
