import DoctorProfile from "../models/DoctorProfile.js";
import User from "../models/User.js";

// Fetch all doctors
export const getAllDoctors = async (req, res) => {
    try {
        // Find all users with role 'doctor'
        const doctors = await User.find({ role: "doctor" }).select("-password");

        // Fetch their profiles
        const profiles = await DoctorProfile.find().populate("user", "name email");

        // Merge user info with profile info
        const mergedDoctors = doctors.map(doc => {
            const profile = profiles.find(p => p.user && p.user._id.toString() === doc._id.toString());
            return {
                _id: doc._id,
                name: doc.name,
                email: doc.email,
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
        const user = await User.findById(id).select("-password");
        if (!user || user.role !== "doctor") {
            return res.status(404).json({ msg: "Doctor not found" });
        }

        let profile = await DoctorProfile.findOne({ user: id }).populate("user", "name email");

        if (!profile) {
            // If profile doesn't exist, return empty profile structure
            profile = {
                user: { _id: user._id, name: user.name, email: user.email },
                experience: "0 Years",
                patientsCount: "0+",
                rating: 0,
                fees: 0,
                about: "",
                specialization: "Physiotherapist"
            };
        }

        res.status(200).json(profile);
    } catch (error) {
        console.error("Error fetching doctor profile:", error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};

// Update or Create Doctor Profile
export const updateDoctorProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { experience, patientsCount, rating, fees, about, specialization } = req.body;

        let profile = await DoctorProfile.findOne({ user: id });

        if (profile) {
            profile.experience = experience || profile.experience;
            profile.patientsCount = patientsCount || profile.patientsCount;
            profile.rating = rating || profile.rating;
            profile.fees = fees || profile.fees;
            profile.about = about || profile.about;
            profile.specialization = specialization || profile.specialization;
            await profile.save();
        } else {
            profile = await DoctorProfile.create({
                user: id,
                experience,
                patientsCount,
                rating,
                fees,
                about,
                specialization
            });
        }

        res.status(200).json({ msg: "Profile updated successfully", profile });
    } catch (error) {
        console.error("Error updating doctor profile:", error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};
