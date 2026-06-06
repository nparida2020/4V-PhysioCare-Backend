import mongoose from "mongoose";

const doctorProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    experience: { type: String, default: "0 Years" },
    patientsCount: { type: String, default: "0+" },
    rating: { type: Number, default: 0 },
    fees: { type: Number, default: 0 },
    about: { type: String, default: "" },
    specialization: { type: String, default: "Physiotherapist" }
}, { timestamps: true });

export default mongoose.model("DoctorProfile", doctorProfileSchema);
