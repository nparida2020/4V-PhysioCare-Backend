import mongoose from "mongoose";

const programSchema = new mongoose.Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String },
    programCode: { type: String, required: true, unique: true },
    specialty: { type: String, default: "General" }, // e.g., Knee Rehab, Post-Op
}, { timestamps: true });

export default mongoose.model("Program", programSchema);
