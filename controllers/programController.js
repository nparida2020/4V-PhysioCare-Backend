import Program from "../models/Program.js";
import User from "../models/User.js";
import Video from "../models/Video.js";
import crypto from "crypto";
import fs from "fs";
import path from "path";

// Generate a random 6-character alphanumeric code
const generateProgramCode = () => {
    return crypto.randomBytes(3).toString("hex").toUpperCase(); // e.g., "A3F9B2"
};

export const createProgram = async (req, res) => {
    try {
        const { doctorId, title, description, specialty } = req.body;
        
        let isUnique = false;
        let programCode = "";
        
        // Ensure uniqueness of the code
        while (!isUnique) {
            programCode = generateProgramCode();
            const existing = await Program.findOne({ programCode });
            if (!existing) isUnique = true;
        }

        const program = await Program.create({
            doctorId,
            title,
            description,
            specialty,
            programCode
        });

        res.status(201).json(program);
    } catch (error) {
        console.error("Error creating program:", error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};

export const getDoctorPrograms = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const programs = await Program.find({ doctorId }).sort({ createdAt: -1 });
        res.status(200).json(programs);
    } catch (error) {
        console.error("Error getting programs:", error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};

export const enrollInProgram = async (req, res) => {
    try {
        const { patientId, programCode } = req.body;

        const program = await Program.findOne({ programCode });
        if (!program) {
            return res.status(404).json({ msg: "Program not found. Invalid code." });
        }

        const patient = await User.findById(patientId);
        if (!patient) {
            return res.status(404).json({ msg: "Patient not found." });
        }

        if (patient.enrolledPrograms.includes(program._id)) {
            return res.status(400).json({ msg: "You are already enrolled in this program." });
        }

        // Add to patient's enrolled programs
        patient.enrolledPrograms.push(program._id);
        await patient.save();

        res.status(200).json({ msg: "Successfully enrolled!", program });
    } catch (error) {
        console.error("Error enrolling in program:", error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};

export const deleteProgram = async (req, res) => {
    try {
        const { id } = req.params;
        const program = await Program.findById(id);

        if (!program) {
            return res.status(404).json({ msg: "Program not found" });
        }

        // 1. Delete all associated videos
        const videos = await Video.find({ programId: id });
        for (const vid of videos) {
            if (vid.url && vid.url.startsWith("/uploads/videos/")) {
                const filePath = path.join(process.cwd(), vid.url);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
        }
        await Video.deleteMany({ programId: id });

        // 2. Remove program from enrolled users
        await User.updateMany(
            { enrolledPrograms: id },
            { $pull: { enrolledPrograms: id } }
        );

        // 3. Delete the program
        await Program.findByIdAndDelete(id);

        res.status(200).json({ msg: "Program and associated videos successfully deleted." });
    } catch (error) {
        console.error("Error deleting program:", error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};

export const getPatientPrograms = async (req, res) => {
    try {
        const { patientId } = req.params;
        const patient = await User.findById(patientId).populate("enrolledPrograms");
        if (!patient) {
            return res.status(404).json({ msg: "Patient not found." });
        }
        res.status(200).json(patient.enrolledPrograms);
    } catch (error) {
        console.error("Error getting patient programs:", error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};
