# 4VPhysioCare — Digital Physiotherapy Management System

> A full-stack MERN application that bridges patients and certified physiotherapists through remote access to physiotherapy services, rehabilitation programs, exercise video libraries, and appointment management.

<br/>

## 📌 Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Getting Started (Local)](#getting-started-local)
- [Deployment](#deployment)
- [API Reference](#api-reference)
- [Database Models](#database-models)
- [User Roles](#user-roles)
- [Screenshots](#screenshots)


<br/>

---

## 🧾 Overview

PhysioCare is a role-based digital health platform designed to make physiotherapy accessible remotely. It supports two distinct user types — **Patients** and **Physiotherapists (Doctors)** — each with their own dedicated dashboard, workflows, and access controls.

Patients can discover doctors, book appointments, join rehabilitation programs, watch exercise videos, and read health articles. Physiotherapists can manage appointments, publish articles, create programs, upload exercise content, and track patient progress.

<br/>

---

## 🌐 Live Demo

| Service | URL |
|---|---|
| Frontend | `https://your-app.vercel.app` |
| Backend API | `https://physiocare-backend-hhh7.onrender.com` |

<br/>

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 7 | Build tool & dev server |
| React Router DOM | 7 | Client-side routing |
| Tailwind CSS | 4 | Utility-first styling |
| React Icons | 5 | Icon library |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express | 5 | Web framework |
| MongoDB | — | NoSQL database |
| Mongoose | 9 | MongoDB ODM |
| JSON Web Token | 9 | Authentication |
| Bcryptjs | 3 | Password hashing |
| Nodemailer | 8 | Email service |
| Multer | 2 | File uploads |
| Passport.js | 0.7 | Google OAuth strategy |
| Speakeasy | 2 | Two-Factor Authentication (TOTP) |

<br/>

---

## ✨ Features

### 👤 Patient Features
- **Signup / Login** with email verification
- **Google OAuth** login
- **Two-Factor Authentication (2FA)** support
- **Profile onboarding** — personal info, medical history, emergency contacts
- **Browse doctors** — filter by city, view profile, specialization, availability
- **Book appointments** with any doctor
- **View appointment history** and session reports sent by the doctor
- **Submit reviews** — rating, feeling (Better / Same / Worse), written feedback
- **Enroll in rehabilitation programs** using a unique code
- **Watch exercise videos** from enrolled programs or general library
- **Log exercise sessions** — pain level tracking per video
- **Read health articles** — categorized, filterable
- **Weekly adherence tracking** in personal dashboard

### 🩺 Physiotherapist (Doctor) Features
- **Separate signup / login** portal with email verification
- **Google OAuth** login
- **Profile onboarding** — specialization, license number, hospital, availability schedule, languages
- **Toggle availability** on/off
- **Manage appointments** — confirm, cancel, complete
- **Complete appointment flow** — add session notes, medicine, suggestions, follow-up date, assign program code
- **Send session report** directly to patient
- **Create rehabilitation programs** — auto-generates a unique 6-character enrollment code
- **Delete programs** — cascades and deletes all associated videos
- **Upload exercise videos** — attach to a program or make general
- **Write and publish articles** — rich text editor, categories, tags, cover image
- **View patient list** — see all patients, add private notes per patient
- **Analytics dashboard** — upcoming appointments, patient engagement chart, performance metrics

<br/>

---

## 📁 Project Structure

```
trial/
├── backend/
│   ├── config/
│   │   ├── db.js                  # MongoDB connection
│   │   ├── emailService.js        # Nodemailer SMTP setup
│   │   └── googleAuthConfig.js    # Passport Google OAuth config
│   ├── controllers/
│   │   ├── authController.js      # Signup, login, email verify, profile complete
│   │   ├── appointmentController.js
│   │   ├── articleController.js
│   │   ├── doctorController.js    # Doctor profile, patient notes
│   │   ├── programController.js   # Rehab programs, enrollment
│   │   ├── videoController.js     # Video upload, session logging
│   │   └── teamController.js      # Our Team page members
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT verification
│   ├── models/
│   │   ├── User.js                # Patient + Doctor user (role-based)
│   │   ├── DoctorProfile.js       # Extended doctor info
│   │   ├── Appointment.js         # Full appointment lifecycle
│   │   ├── Article.js             # Doctor articles
│   │   ├── Program.js             # Rehab programs with unique codes
│   │   ├── Video.js               # Exercise videos
│   │   ├── SessionLog.js          # Patient exercise session logs
│   │   ├── PatientNote.js         # Private doctor notes on patients
│   │   └── TeamMember.js          # Team page members
│   ├── routes/
│   │   ├── authRoutes.js          # /api/auth
│   │   ├── doctorRoutes.js        # /api/doctors
│   │   ├── appointmentRoutes.js   # /api/appointments
│   │   ├── articleRoutes.js       # /api/articles
│   │   ├── programRoutes.js       # /api/programs
│   │   ├── videoRoutes.js         # /api/videos
│   │   └── teamRoutes.js          # /api/members
│   ├── uploads/
│   │   ├── videos/                # Uploaded exercise videos
│   │   └── team/                  # Team member photos
│   ├── .env                       # Environment variables (DO NOT COMMIT)
│   ├── server.js                  # Express app entry point
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/                # Images, static files
│   │   ├── components/
│   │   │   ├── Layout.jsx         # Patient layout wrapper
│   │   │   ├── DoctorLayout.jsx   # Doctor layout wrapper
│   │   │   ├── Sidebar.jsx        # Patient sidebar navigation
│   │   │   ├── DoctorSidebar.jsx  # Doctor sidebar navigation
│   │   │   ├── UserProfileModal.jsx
│   │   │   └── DoctorProfileModal.jsx
│   │   ├── pages/
│   │   │   ├── Welcome.jsx        # Landing page
│   │   │   ├── PatientLogin.jsx
│   │   │   ├── PatientSignUp.jsx
│   │   │   ├── PatientOnboarding.jsx
│   │   │   ├── Home.jsx           # Patient dashboard
│   │   │   ├── AppointmentsPage.jsx
│   │   │   ├── Videos.jsx
│   │   │   ├── Articles.jsx
│   │   │   ├── ArticleDetail.jsx
│   │   │   ├── VideoDetail.jsx
│   │   │   ├── PatientReports.jsx
│   │   │   ├── VerifyEmail.jsx
│   │   │   ├── GoogleAuthSuccess.jsx
│   │   │   ├── OurTeam.jsx
│   │   │   └── doctor/
│   │   │       ├── DoctorLogin.jsx
│   │   │       ├── DoctorSignUp.jsx
│   │   │       ├── DoctorOnboarding.jsx
│   │   │       ├── DoctorDashboard.jsx
│   │   │       ├── DoctorAppointments.jsx
│   │   │       ├── DoctorPrograms.jsx
│   │   │       ├── DoctorReports.jsx
│   │   │       ├── DoctorArticles.jsx
│   │   │       └── DoctorNewArticle.jsx
│   │   ├── style/                 # Per-page CSS files
│   │   ├── config.js              # API base URL config
│   │   ├── App.jsx                # Route definitions
│   │   └── main.jsx               # React entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── package.json                   # Root package (concurrently)
```

<br/>

---

## 🔐 Environment Variables

Create a `.env` file inside the `backend/` folder:

```env
# MongoDB
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/yourdb

# Server
PORT=8080

# JWT
JWT_SECRET=your_strong_jwt_secret_here

# URLs
FRONTEND_URL=https://your-app.vercel.app
BACKEND_URL=https://your-backend.onrender.com

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_SECURE=false

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

> ⚠️ Never commit your `.env` file. Make sure it's listed in `.gitignore`.

### How to get Gmail App Password
1. Go to your Google Account → Security
2. Enable 2-Step Verification
3. Search "App passwords" → Generate one for "Mail"
4. Use that 16-character password as `SMTP_PASS`

<br/>

---

## 🚀 Getting Started (Local)

### Prerequisites
- Node.js 18+
- npm
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/PhysioCare.git
cd PhysioCare
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create `.env` file (see [Environment Variables](#environment-variables) above)

```bash
npm run dev
# Backend runs on http://localhost:8080
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### 4. Run both together (from root)
```bash
npm install        # installs concurrently
npm run dev        # runs both frontend and backend together
```

<br/>

---

## ☁️ Deployment

### Backend → Render

1. Push `backend/` to a GitHub repo
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Node Version:** 18
5. Add all environment variables from your `.env`
6. Click **Deploy**
7. Your backend URL: `https://your-app.onrender.com`

### Frontend → Vercel

1. Push `frontend/` to a GitHub repo
2. Update `frontend/src/config.js`:
   ```js
   export const API_BASE_URL = "https://your-backend.onrender.com/api";
   ```
3. Go to [vercel.com](https://vercel.com) → New Project
4. Import your frontend repo
5. Set **Root Directory** to `frontend`
6. Click **Deploy**
7. Your frontend URL: `https://your-app.vercel.app`

### Final Step — Update FRONTEND_URL on Render
After Vercel deployment, go back to Render → Environment:
```
FRONTEND_URL = https://your-app.vercel.app
```
Click **Save, rebuild, and deploy**.

### Google OAuth — Add Authorized URIs
In [Google Cloud Console](https://console.cloud.google.com):
- **Authorized JavaScript Origins:** `https://your-app.vercel.app`
- **Authorized Redirect URIs:** `https://your-backend.onrender.com/api/auth/google/callback`

<br/>

---

## 📡 API Reference

### Auth — `/api/auth`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/signup` | Register new user (patient or doctor) |
| POST | `/login` | Login with email & password |
| GET | `/verify-email/:token` | Verify email from link |
| PATCH | `/:id/complete-profile` | Complete onboarding profile |
| GET | `/:id` | Get user by ID |
| GET | `/google/patient` | Initiate Google OAuth (patient) |
| GET | `/google/doctor` | Initiate Google OAuth (doctor) |
| GET | `/google/callback` | Google OAuth callback |

### Doctors — `/api/doctors`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get all doctors (filter by city) |
| GET | `/:id` | Get doctor by ID with profile |
| PUT | `/:id/profile` | Update doctor profile |
| PATCH | `/:id/availability` | Toggle availability on/off |
| GET | `/patient-note/:doctorId/:patientId` | Get private note |
| POST | `/patient-note` | Save private note |

### Appointments — `/api/appointments`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Create appointment |
| GET | `/doctor/:id` | Get doctor's appointments |
| GET | `/patient/:id` | Get patient's appointments |
| PATCH | `/:id/status` | Update status (Confirmed/Cancelled etc.) |
| POST | `/:id/complete` | Doctor marks appointment complete |
| POST | `/:id/review` | Patient submits review |
| PATCH | `/:id/send-to-patient` | Send report to patient |

### Programs — `/api/programs`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Create program (auto-generates code) |
| GET | `/doctor/:doctorId` | Get doctor's programs |
| POST | `/enroll` | Patient enrolls using program code |
| GET | `/patient/:patientId` | Get patient's enrolled programs |
| DELETE | `/:id` | Delete program + all its videos |
| GET | `/:id/patients` | Get enrolled patients |

### Videos — `/api/videos`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Upload video (multipart) |
| GET | `/general` | Get all general videos |
| GET | `/general/doctor/:doctorId` | Get doctor's general videos |
| GET | `/program/:programId` | Get program-specific videos |
| PUT | `/:id` | Update video details |
| DELETE | `/:id` | Delete video + file |
| POST | `/log-session` | Log patient exercise session |

### Articles — `/api/articles`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Create article |
| GET | `/published` | Get all published articles |
| GET | `/covers` | Get article cover images |
| GET | `/doctor/:id` | Get doctor's articles |
| GET | `/:id` | Get single article |
| PATCH | `/:id` | Update article |
| DELETE | `/:id` | Delete article |

### Team — `/api/members`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Add team member (with photo upload) |
| GET | `/` | Get all members |
| GET | `/:id` | Get member by ID |
| DELETE | `/:id` | Delete member |

<br/>

---

## 🗄 Database Models

### User
```
name, email, password (hashed), role (patient/doctor/admin)
enrolledPrograms[], googleId, authProvider
twoFactorEnabled, twoFactorSecret, twoFactorCode
isVerified, verificationToken
profileCompleted, profilePhoto (base64), phone, city
-- Patient fields --
dateOfBirth, gender, bloodGroup
currentCondition, existingConditions, pastSurgeries
emergencyContactName, emergencyContactNumber
```

### DoctorProfile
```
user (ref), experience, patientsCount, rating, fees
bio, specialization, licenceNumber, hospitalName
availableDays[], availableTimeStart, availableTimeEnd
languages[], isAvailable
```

### Appointment
```
patientId (ref), doctorId (ref), date, time, status
notes, sessionNumber, problemDescription, medicine
suggestion, followUpNeeded, followUpDate
programCode, programTitle
patientRating, patientFeeling, patientReview
sentToPatient
```

### Program
```
doctorId (ref), title, description
programCode (unique, auto-generated 6-char), specialty
```

### Video
```
doctorId (ref), programId (ref, nullable)
title, description, url, thumbnail, duration
```

### Article
```
doctorId (ref), title, subtitle, content
category (Rehabilitation/Orthopedic/Sports/Wellness/Neurological/Nutrition)
tags[], coverImage, status (draft/published), readTime, views, likes
```

### SessionLog
```
patientId (ref), videoId (ref), painLevel (1-10), date
```

### PatientNote
```
doctorId (ref), patientId (ref), note
-- Unique index on doctorId + patientId pair --
```

<br/>

---

## 👥 User Roles

| Feature | Patient | Doctor | Admin |
|---|---|---|---|
| Signup / Login | ✅ | ✅ | ✅ |
| Google OAuth | ✅ | ✅ | — |
| Two-Factor Auth (2FA) | ✅ | ✅ | — |
| Book Appointments | ✅ | — | — |
| Manage Appointments | — | ✅ | — |
| Enroll in Programs | ✅ | — | — |
| Create Programs | — | ✅ | — |
| Watch Videos | ✅ | — | — |
| Upload Videos | — | ✅ | — |
| Read Articles | ✅ | ✅ | — |
| Write Articles | — | ✅ | — |
| Patient Analytics | — | ✅ | — |
| Session Logs | ✅ | — | — |

<br/>

---

## 🖼 Screenshots

> Add screenshots of the following pages:
- Welcome / Landing page
- Patient Dashboard
- Doctor Dashboard
- Appointments page
- Programs & Video Library
- Articles page

<br/>

---

## 👨‍💻 Team

| Name | Role | Roll Number |
|---|---|---|
| Prince Baghal | Full Stack Developer | — |
| *(Add team members)* | | |

> Built as part of the Summer Internship 2026 program.

<br/>

---

## 📄 License

This project is built for educational purposes as part of an internship program.

---

> Made with ❤️ by the PhysioCare Team
