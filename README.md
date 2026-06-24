# 🎵 SonicFlow 🎵

Welcome to **SonicFlow**, a modern full-stack music and media app built with a polished Next.js frontend and a secure Node.js backend.

## 🚀 What SonicFlow Does

- **User Authentication** with secure email/password signup, login, and JWT-based session protection.
- **File Uploads** for music/album artwork, processed through the backend and saved with ImageKit support.
- **User Profiles** stored in MongoDB, including session and OTP support.
- **Responsive UI** built with Next.js, React, Tailwind CSS, and Lucide icons.

## 🧱 Architecture

The repository is organized into two main folders:

- `frontend/` — Next.js application for the user interface
- `backend/` — Express API server with authentication, file uploads, and MongoDB data management

## 📦 Tech Stack

### Frontend
- Next.js 16
- React 19
- Tailwind CSS 4
- Lucide React icons
- `@react-oauth/google` for Google OAuth UI support

### Backend
- Node.js + Express
- MongoDB via Mongoose
- JWT authentication
- `bcryptjs` for password hashing
- `multer` for file upload handling
- `nodemailer` for email workflows
- `@imagekit/nodejs` for media storage integration

## ⚙️ Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/mantujha3007-web/SonicFlow.git
cd "d:\Mantu Jha\Project\SonicFlow"
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with the required configuration values, for example:

```env
PORT=4000
MONGO_URI=mongodb://localhost:27017/sonicflow
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend setup

Open a second terminal and run:

```bash
cd frontend
npm install
npm run dev
```

By default, the frontend proxy rewrites `/api/*` to the backend URL configured in `frontend/next.config.mjs`.

## 🧪 Running Locally

- Backend: `http://localhost:4000`
- Frontend: `http://localhost:3000`

## 🎯 Key Features

- Secure user registration and login
- JWT-protected API routes
- Email verification and OTP handling
- Music and album media uploads
- Clean, responsive Next.js UI

## 📁 Important Files

- `backend/server.js` — Express server entry point
- `backend/src/routes/auth.routes.js` — authentication routes
- `backend/src/controllers/auth.controller.js` — auth logic
- `backend/src/models/user.model.js` — user schema
- `frontend/src/app/page.js` — main landing page
- `frontend/src/components/AudioPlayer.js` — audio playback UI

## 💡 Notes

- Use `BACKEND_URL` in `frontend/next.config.mjs` to switch the API proxy endpoint.
- Make sure MongoDB is running before starting the backend.
- Keep `.env` secrets out of source control.

## 🙌 Contribution

If you want to improve SonicFlow, feel free to:

- add new music discovery features,
- improve authentication flows,
- add playlists or favorites,
- integrate streaming or share functionality.

Happy building! 🎧

