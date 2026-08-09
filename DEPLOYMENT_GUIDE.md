# 🚀 ProjectXia Production Deployment Guide

This guide details how to take **ProjectXia** live on the internet with a custom domain, SSL certificate, and database integration.

---

## ⚡ Option 1: Vercel (Frontend) + Render (Backend) [Recommended Free / Startup]

### Step 1: Deploy Backend to Render / Railway
1. Push your repository to GitHub (`https://github.com/your-username/projectxia`).
2. Go to [Render.com](https://render.com) and click **New Web Service**.
3. Connect your GitHub repository.
4. Set the following settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add the Environment Variables:
   - `PORT`: `5000`
   - `JWT_SECRET`: `your_secure_random_jwt_key_2026`
   - `RAZORPAY_KEY_ID`: `your_razorpay_key_id`
   - `RAZORPAY_KEY_SECRET`: `your_razorpay_secret_key`
   - `MONGO_URI`: *(Optional: your MongoDB Atlas cluster URI)*
6. Click **Create Web Service**. Your backend will be live at `https://projectxia-api.onrender.com`.

### Step 2: Deploy Frontend to Vercel
1. Go to [Vercel.com](https://vercel.com) and click **Add New Project**.
2. Select your `projectxia` GitHub repository.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_URL`: `https://projectxia-api.onrender.com/api`
5. Click **Deploy**. Your frontend will be live worldwide on Vercel Edge with custom domain support.

---

## ⚡ Option 2: 1-Click Unified Container (Docker)

If hosting on a Linux VPS (DigitalOcean Droplet, AWS EC2, GCP Compute Engine, or Hetzner):

1. Clone your repo:
   ```bash
   git clone https://github.com/your-username/projectxia.git
   cd projectxia
   ```

2. Run with Docker Compose:
   ```bash
   docker-compose up -d --build
   ```

3. Your entire fullstack application (both Frontend and Backend API) is instantly live on `http://your-server-ip:5000`!

---

## ⚡ Option 3: Local Live Production Preview

To test the compiled production bundle on your local machine:

1. Build the frontend:
   ```bash
   npm --prefix frontend run build
   ```

2. Start the backend:
   ```bash
   npm --prefix backend run start
   ```

3. Open `http://localhost:5000` in your browser. Express serves both the optimized Vite bundle and all live `/api` endpoints simultaneously!

---

## 🔒 Post-Deployment Checklist:
- [x] Configure DNS (e.g. `projectxia.io` or `projectxia.com`) via Cloudflare.
- [x] Enable HTTPS/SSL (automatic on Vercel & Render).
- [x] Add real Razorpay / Stripe credentials in `.env` for production INR/USD payments.
- [x] Configure MongoDB Atlas IP access list (`0.0.0.0/0`).
