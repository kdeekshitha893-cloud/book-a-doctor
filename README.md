# 🏥 MedConnect - Clinical Portal & Doctor Appointment System

MedConnect is a modern, full-stack web application designed to streamline healthcare connections between patients, medical doctors, and system administrators. It features a responsive React-based client portal, an Express-powered REST API, and a self-contained in-memory database setup designed for rapid evaluation and local execution.

---

## 🌟 Key Features

### 👤 Patient Portal
- **User Authentication:** Simple signup and login with role-based redirection.
- **Doctor Discovery:** Browse a list of board-certified and system-verified medical specialists.
- **Dynamic Scheduling:** Select and book available consultation slots.
- **Medical Dashboard:** View upcoming/past appointments and manage appointments.
- **Document Hub:** Upload and share medical reports or prescriptions with consulting doctors.

### 🥼 Doctor Portal
- **Profile Customization:** Manage professional bio, experience level, specialization, and profile info.
- **Schedule Management:** Set available consultation slots dynamically.
- **Clinical Dashboard:** Monitor patient appointments, check medical history, and access shared patient files/documents.
- **Verification Status:** Live status indicating whether the doctor is system-verified by administrators.

### 🔑 Admin Dashboard
- **Verification Controls:** Review and verify/unverify registered doctors to maintain safety and compliance.
- **Platform Analytics:** Track total patients, active doctors, and overall system appointments.
- **Global Management:** Full visibility into all appointments scheduled across the platform.

### ⚡ Built-in Conveniences
- **Self-Seeding Database:** Automatically populates demo accounts for all roles (Patient, Verified Doctor, Unverified Doctor, Admin) on first launch.
- **Zero-Config Database:** Utilizes an in-memory MongoDB server (`mongodb-memory-server`) so you don't need to install or configure MongoDB locally to run the app.

---

## 🛠️ Technology Stack

### Frontend (Client Portal)
- **Framework:** React 19 (Vite-powered environment)
- **Routing:** React Router Dom v7
- **Icons:** Lucide React
- **Styling:** Custom Vanilla CSS for clean, high-performance styling

### Backend (REST API Service)
- **Runtime:** Node.js
- **Server Framework:** Express
- **Database Wrapper:** Mongoose
- **Database Engine:** MongoDB Memory Server (in-memory MongoDB)
- **Security:** JSON Web Tokens (JWT) for authentication & BcryptJS for password hashing
- **File Uploads:** Multer (handling patient reports and documents securely)

---

## 📂 Project Directory Structure

```text
book-a-doctor/
├── backend/
│   ├── src/
│   │   ├── config/          # Database connection module
│   │   ├── controllers/     # Authentication, appointment, doctor, and admin logic
│   │   ├── middleware/      # Auth guard and file upload middleware
│   │   ├── models/          # Mongoose Schemas (User, Appointment, Document)
│   │   ├── routes/          # Express API route declarations
│   │   └── index.js         # API Entry point & Database seeder
│   ├── uploads/             # Stores uploaded medical documents (Git-ignored)
│   ├── package.json
│   └── .env                 # Server configurations
├── frontend/
│   ├── public/              # Static assets and icons
│   ├── src/
│   │   ├── assets/          # Project images and assets
│   │   ├── components/      # Common UI components (Navbar, Footer, DoctorCard)
│   │   ├── context/         # AuthContext state provider
│   │   ├── pages/           # Portal dashboards (Admin, Doctor, Patient, Home, Login)
│   │   ├── App.jsx          # Route controller
│   │   ├── index.css        # Core styling sheet
│   │   └── main.jsx         # React DOM entry point
│   ├── package.json
│   └── vite.config.js
├── start_medconnect.ps1     # Automated Windows startup script
└── README.md                # Documentation (You are here)
```

---

## 🚀 Getting Started

### 📋 Prerequisites
Ensure you have the following installed on your machine:
- **Node.js** (v18.x or higher recommended)
- **npm** (v9.x or higher)

### 🏎️ Method 1: Automatic Launch (Windows PowerShell)
A pre-configured startup runner is provided in the project root. To boot both services automatically:

1. Open a PowerShell window as Administrator in the root project directory.
2. Run the startup script:
   ```powershell
   ./start_medconnect.ps1
   ```
3. This script will launch the **Express API** on port `5000` and the **Vite React Dev Server** on port `5173`.

---

### 🛠️ Method 2: Manual Installation & Boot

If you want to run the application components manually, open two terminal windows and follow the steps below:

#### 1. Start the Backend API
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Express server:
   ```bash
   npm run dev
   ```
   *The console will notify you when the in-memory MongoDB database is connected and initialized.*

#### 2. Start the Frontend React Client
1. Open a second terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the web portal at **`http://localhost:5173`**.

---

## 👥 Demo Credentials

To make evaluation simple, the application automatically seeds the following test accounts into the in-memory database:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Patient** | `patient1@medconnect.com` | `patient123` | Can book appointments and upload files. |
| **Verified Doctor** | `doctor1@medconnect.com` | `doctor123` | Specialization: Cardiology. Profile is fully active. |
| **Unverified Doctor** | `doctor2@medconnect.com` | `doctor123` | Specialization: Pediatrics. Awaiting admin approval. |
| **Administrator** | `admin@medconnect.com` | `admin123` | Full control dashboard to verify/unverify doctors. |

---

## 📡 Core API Endpoints

The backend routes are accessible under `http://localhost:5000/api`:

- **Auth Portal:** `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/profile`
- **Doctors:** `GET /api/doctors` (all verified doctors), `GET /api/doctors/:id` (specific profile)
- **Appointments:** `GET /api/appointments` (list bookings), `POST /api/appointments` (schedule new booking)
- **Documents:** `POST /api/documents/upload` (attach patient report), `GET /api/documents` (fetch medical records)
- **Admin Control:** `GET /api/admin/doctors` (list all system doctors), `PUT /api/admin/doctors/:id/verify` (approve/unapprove doctor)

---

## 📄 License
This project is licensed under the MIT License.
