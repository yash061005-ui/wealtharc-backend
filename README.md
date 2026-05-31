# WealthArc Backend

A production-ready Node.js + Express backend for the WealthArc mutual fund distributor website.

---

## Features

| Feature | Endpoint |
|---|---|
| Lead / consultation form | `POST /api/leads` |
| Newsletter subscribe | `POST /api/subscribe` |
| Newsletter unsubscribe | `POST /api/unsubscribe` |
| Public blog/newsletter posts | `GET /api/posts`, `GET /api/posts/:slug` |
| Admin: create/update/delete posts | `POST/PATCH/DELETE /api/posts` |
| Admin dashboard | `/admin` |
| Admin API | `GET /api/admin/stats`, `leads`, `subscribers`, `posts` |
| Health check | `GET /api/health` |

---

## Quick Start (Local)

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your SMTP credentials and admin password

# 3. Start the server
npm start

# Dev mode (auto-restarts on file changes)
npm run dev
```

Server runs on **http://localhost:3001**  
Admin panel: **http://localhost:3001/admin**

---

## Environment Variables

See `.env.example` for all variables. Key ones:

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 3001) |
| `ADMIN_PASSWORD` | Admin panel login password |
| `ADMIN_SECRET` | Secret token for admin API calls (any long random string) |
| `ALLOWED_ORIGIN` | Your Lovable frontend URL (for CORS) |
| `SMTP_HOST` | SMTP server (e.g. `smtp.gmail.com`) |
| `SMTP_USER` | SMTP username (your Gmail address) |
| `SMTP_PASS` | SMTP password (Gmail App Password) |
| `NOTIFY_EMAIL` | Where to send new lead notifications |

### Gmail App Password Setup
1. Enable 2FA on your Google account
2. Go to **Google Account → Security → App Passwords**
3. Generate a password for "Mail" and paste it as `SMTP_PASS`

---

## Connecting to Your Lovable Frontend

In your Lovable frontend, replace your form submission handlers with API calls:

### Contact Form
```javascript
const response = await fetch("https://your-backend.railway.app/api/leads", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    full_name: "Rahul Sharma",
    email: "rahul@example.com",
    mobile: "9876543210",
    city: "Mumbai",
    goal: "Retirement",
    budget: "₹10,000 – ₹50,000",
    message: "Looking to start SIP",
    source: "contact_page"
  })
});
const data = await response.json();
// data.success === true on success
```

### Newsletter Subscribe
```javascript
const response = await fetch("https://your-backend.railway.app/api/subscribe", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "user@example.com", name: "Priya" })
});
```

### Fetch Blog Posts
```javascript
// All posts
const res = await fetch("https://your-backend.railway.app/api/posts");
const { posts } = await res.json();

// Single post by slug
const res = await fetch("https://your-backend.railway.app/api/posts/my-post-slug");
const { post } = await res.json();
```

---

## Deployment

### Option A — Railway (Recommended, free tier available)

1. Push this folder to a GitHub repo
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add all environment variables in Railway's dashboard
4. Railway auto-detects Node.js and runs `npm start`
5. Your backend URL will be something like `https://wealtharc-backend.up.railway.app`

### Option B — Render (Also free tier)

1. Push to GitHub
2. Go to [render.com](https://render.com) → New Web Service → Connect GitHub
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables

### Option C — VPS / DigitalOcean

```bash
# On your server
git clone your-repo
cd wealtharc-backend
npm install --production
cp .env.example .env
# Edit .env
npm install -g pm2
pm2 start server.js --name wealtharc
pm2 save
```

---

## API Reference

### POST /api/leads
```json
{
  "full_name": "Rahul Sharma",       // required
  "email": "rahul@example.com",       // required
  "mobile": "9876543210",             // required (10-digit Indian)
  "city": "Mumbai",                   // optional
  "goal": "Retirement",              // optional
  "budget": "₹10,000 – ₹50,000",    // optional
  "message": "...",                   // optional
  "source": "contact_page"           // optional
}
```

### POST /api/subscribe
```json
{ "email": "user@example.com", "name": "Priya" }
```

### Admin endpoints require header:
```
x-admin-token: <your ADMIN_SECRET>
```

---

## Data

SQLite database is stored in `./data/wealtharc.db` — back this up regularly on VPS deployments. Railway and Render have persistent disk options.

---

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express 4
- **Database**: SQLite (via better-sqlite3) — zero config, file-based
- **Email**: Nodemailer
- **Security**: Helmet, CORS, express-rate-limit, input validation
