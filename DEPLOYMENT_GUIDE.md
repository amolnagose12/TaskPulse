# 🌐 TaskPulse Production Deployment Guide

This guide details how to deploy **TaskPulse** to production.

---

## 🏛️ The Production Architecture

```
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│        Vercel (Frontend)        │       │    Render / Railway (Backend)   │
│  • React 18 + Vite (SPA)        │       │  • Spring Boot 3 Java 17        │
│  • Global Edge CDN              │◀─────▶│  • REST APIs & Security         │
│  • https://taskpulse.vercel.app │       │  • Async Email & Cron Scheduler │
└─────────────────────────────────┘       └────────────────▲────────────────┘
                                                           │
                                          ┌────────────────▼────────────────┐
                                          │      Managed PostgreSQL DB      │
                                          │  • Neon / Supabase / Render PG  │
                                          │  • Persistent Data & Audit Logs │
                                          └─────────────────────────────────┘
```

> **Why the Split Architecture?**  
> * **Vercel** is the gold standard for hosting Vite / React SPAs with instant Edge CDN distribution.  
> * However, **Spring Boot requires a long-running Java Virtual Machine (JVM) process**, which serverless platforms like Vercel do not host directly.  
> * The industry standard is hosting the **React frontend on Vercel** and the **Spring Boot backend + PostgreSQL on Render, Railway, or Fly.io**.

---

## 📦 Step 1: Push Code to GitHub

Initialize git and push the project to your GitHub account:

```bash
cd ~/Desktop/team-task-tracker
git init
git add .
git commit -m "Initial commit: TaskPulse Production Ready"
git branch -M main
git remote add origin https://github.com/<your-username>/team-task-tracker.git
git push -u origin main
```

---

## 🚀 Step 2: Deploy Backend + PostgreSQL (on Render or Railway)

### Option A: Render.com (Generous Free Tier)

1. **Create Free PostgreSQL Database**:
   * Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** $\rightarrow$ **PostgreSQL**.
   * Name: `taskpulse-db`.
   * Click **Create Database**.
   * Once provisioned, copy the **Internal Database URL** (or External URL).

2. **Deploy Spring Boot Web Service**:
   * In Render, click **New +** $\rightarrow$ **Web Service**.
   * Connect your GitHub repository: `team-task-tracker`.
   * Configure settings:
     * **Root Directory**: `backend`
     * **Runtime**: `Docker` (Render will automatically detect `backend/Dockerfile`!)
     * **Instance Type**: `Free`
   * Click **Advanced** $\rightarrow$ **Add Environment Variable**:
     | Key | Value |
     | :--- | :--- |
     | `SPRING_PROFILES_ACTIVE` | `prod` |
     | `SPRING_DATASOURCE_URL` | `<Your Render PostgreSQL URL>` |
     | `SPRING_DATASOURCE_USERNAME` | `<Your DB User>` |
     | `SPRING_DATASOURCE_PASSWORD` | `<Your DB Password>` |
     | `TASKPULSE_MAIL_SIMULATION_MODE` | `false` *(or `true` if you don't have SMTP yet)* |
     | `SPRING_MAIL_HOST` | `smtp.gmail.com` *(or `smtp.sendgrid.net`)* |
     | `SPRING_MAIL_USERNAME` | `your-email@gmail.com` |
     | `SPRING_MAIL_PASSWORD` | `your-app-password` |
   * Click **Create Web Service**.
   * Note your backend URL once live: e.g. `https://taskpulse-backend.onrender.com`.

---

## ⚡ Step 3: Deploy Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** $\rightarrow$ **Project**.
2. Select your `team-task-tracker` GitHub repository.
3. In the project configuration screen:
   * **Root Directory**: Click *Edit* and select **`frontend`**.
   * **Framework Preset**: `Vite` (automatically detected).
4. Expand **Environment Variables** and add:
   * **Name**: `VITE_API_BASE_URL`
   * **Value**: `https://taskpulse-backend.onrender.com/api` *(Your Render backend URL followed by `/api`)*.
5. Click **Deploy**.

> **Note**: The repository includes `frontend/vercel.json`, which automatically handles Single Page Application (SPA) rewrites so refreshing any page route works seamlessly.

---

## 🐳 Alternative: 1-Click Docker Deployment (VPS / DigitalOcean / AWS)

If you prefer hosting both frontend, backend, and PostgreSQL together on a single VPS ($4–$6/month):

```bash
# On your server:
git clone https://github.com/<your-username>/team-task-tracker.git
cd team-task-tracker
docker compose up -d
```
All services (PostgreSQL on `:5432`, Spring Boot on `:8080`, and static React build) will spin up automatically!

---

## 📧 Configuring Real Email Delivery (Gmail / SendGrid / Resend)

To send real emails to mentors and managers instead of simulated records:

1. **Using Gmail**:
   * Go to Google Account $\rightarrow$ Security $\rightarrow$ 2-Step Verification $\rightarrow$ **App Passwords**.
   * Generate an App Password for "Mail".
   * Set:
     ```properties
     TASKPULSE_MAIL_SIMULATION_MODE=false
     SPRING_MAIL_HOST=smtp.gmail.com
     SPRING_MAIL_PORT=587
     SPRING_MAIL_USERNAME=your-email@gmail.com
     SPRING_MAIL_PASSWORD=your-16-character-app-password
     ```

2. **Using SendGrid / AWS SES**:
   * Set `SPRING_MAIL_HOST=smtp.sendgrid.net`, `SPRING_MAIL_USERNAME=apikey`, and `SPRING_MAIL_PASSWORD=<your-api-key>`.

