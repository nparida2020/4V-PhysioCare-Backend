import DoctorProfile from "../models/DoctorProfile.js";
import User from "../models/User.js";

// Fetch all doctors (with optional city filter)
export const getAllDoctors = async (req, res) => {
    try {
        const { city } = req.query;

        // Build query filter
        const filter = { role: "doctor", isVerified: true };
        if (city) {
            filter.city = { $regex: new RegExp(city, "i") };
        }

        // Find all users with role 'doctor'
        const doctors = await User.find(filter).select("-password").lean();

        // Fetch their profiles
        const profiles = await DoctorProfile.find().populate("user", "name email").lean();

        // Merge user info with profile info
        const mergedDoctors = doctors.map(doc => {
            const profile = profiles.find(p => p.user && p.user._id.toString() === doc._id.toString());
            return {
                _id: doc._id,
                name: doc.name,
                email: doc.email,
                city: doc.city || "",
                phone: doc.phone || "",
                profilePhoto: doc.profilePhoto || "",
                profile: profile || null
            };
        });

        res.status(200).json(mergedDoctors);
    } catch (error) {
        console.error("Error fetching doctors:", error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};

// Fetch specific doctor details
export const getDoctorById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select("-password").lean();
        if (!user || user.role !== "doctor") {
            return res.status(404).json({ msg: "Doctor not found" });
        }

        let profile = await DoctorProfile.findOne({ user: id }).populate("user", "name email").lean();

        if (!profile) {
            // If profile doesn't exist, return empty profile structure
            profile = {
                user: { _id: user._id, name: user.name, email: user.email },
                experience: "0 Years",
                patientsCount: "0+",
                rating: 0,
                fees: 0,
                about: "",
                specialization: "Physiotherapist",
                bio: "",
                licenceNumber: "",
                hospitalName: "",
                availableDays: [],
                availableTimeStart: "",
                availableTimeEnd: "",
                languages: [],
                isAvailable: false
            };
        }

        res.status(200).json({
            ...profile.toObject ? profile.toObject() : profile,
            city: user.city || "",
            phone: user.phone || "",
            profilePhoto: user.profilePhoto || ""
        });
    } catch (error) {
        console.error("Error fetching doctor profile:", error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};

// Update or Create Doctor Profile
export const updateDoctorProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            experience, patientsCount, rating, fees, about, specialization,
            bio, licenceNumber, hospitalName,
            availableDays, availableTimeStart, availableTimeEnd, languages
        } = req.body;

        let profile = await DoctorProfile.findOne({ user: id });

        if (profile) {
            profile.experience = experience || profile.experience;
            profile.patientsCount = patientsCount || profile.patientsCount;
            profile.rating = rating || profile.rating;
            profile.fees = fees || profile.fees;
            profile.about = about || profile.about;
            profile.specialization = specialization || profile.specialization;
            if (bio !== undefined) profile.bio = bio;
            if (licenceNumber !== undefined) profile.licenceNumber = licenceNumber;
            if (hospitalName !== undefined) profile.hospitalName = hospitalName;
            if (availableDays !== undefined) profile.availableDays = availableDays;
            if (availableTimeStart !== undefined) profile.availableTimeStart = availableTimeStart;
            if (availableTimeEnd !== undefined) profile.availableTimeEnd = availableTimeEnd;
            if (languages !== undefined) profile.languages = languages;
            await profile.save();
        } else {
            profile = await DoctorProfile.create({
                user: id,
                experience, patientsCount, rating, fees, about, specialization,
                bio, licenceNumber, hospitalName,
                availableDays, availableTimeStart, availableTimeEnd, languages
            });
        }

        res.status(200).json({ msg: "Profile updated successfully", profile });
    } catch (error) {
        console.error("Error updating doctor profile:", error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};

// Toggle Doctor Availability
export const toggleAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        let profile = await DoctorProfile.findOne({ user: id });

        if (!profile) {
            profile = await DoctorProfile.create({ user: id, isAvailable: true });
        } else {
            profile.isAvailable = !profile.isAvailable;
            await profile.save();
        }

        res.status(200).json({ msg: "Availability updated", isAvailable: profile.isAvailable });
    } catch (error) {
        console.error("Error toggling availability:", error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};

import PatientNote from "../models/PatientNote.js";

// Get specific patient note for a doctor
export const getPatientNote = async (req, res) => {
    try {
        const { doctorId, patientId } = req.params;
        const note = await PatientNote.findOne({ doctorId, patientId });
        res.status(200).json(note || { note: "" });
    } catch (error) {
        console.error("Error fetching patient note:", error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};

// Save specific patient note for a doctor
export const savePatientNote = async (req, res) => {
    try {
        const { doctorId, patientId, note } = req.body;
        
        let patientNote = await PatientNote.findOne({ doctorId, patientId });
        
        if (patientNote) {
            patientNote.note = note;
            await patientNote.save();
        } else {
            patientNote = await PatientNote.create({ doctorId, patientId, note });
        }
        
        res.status(200).json({ msg: "Note saved successfully", patientNote });
    } catch (error) {
        console.error("Error saving patient note:", error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};
