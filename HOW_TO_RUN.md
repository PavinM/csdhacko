# How to Run the KEC Feedback Portal

## Prerequisites
- **Node.js**: Installed on your system.
- **MongoDB**: 
  - **Atlas**: Ensure your IP is whitelisted in MongoDB Atlas Network Access.
  - **Local**: Ideally have MongoDB Compass or Community Server running.

## 1. Stop Current Processes
If you have terminals running `npm run dev` (Frontned or Backend), please stop them (Press `Ctrl + C`).

## 2. Check Environment Variables
Ensure `server/.env` is correctly configured.
```env
PORT=5000
# For Atlas Use:
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.exmple.mongodb.net/...
# For Local Use:
# MONGO_URI=mongodb://127.0.0.1:27017/kec_feedback_portal
JWT_SECRET=kec_placement_secure_secret_key_2026
```

## 3. Run the Backend (Server)
Open a terminal:
```bash
cd "KEC Placement Drive Feedback Management Portal"
cd server
npm install  # (Only if dependencies are missing)
npm run dev
```
**Expected Output:** `Server running on port 5000` & `MongoDB Connected: ...`

## 4. Run the Frontend (App)
Open a **new** terminal:
```bash
cd "KEC Placement Drive Feedback Management Portal"
npm install  # (Only if dependencies are missing)
npm run dev
```
**Expected Output:** `Vite v4.x.x  ready in xxxx ms` -> `http://localhost:5173/`

## 5. Admin Credentials
- **Email:** `admin@kongu.edu`
- **Password:** `admin123`
