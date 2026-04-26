# Deployment Guide: Library Management System

## Overview
This guide covers deploying the Library Management System to production:
- **Backend**: Node.js + Express → Render
- **Frontend**: React + Vite → Vercel

## Prerequisites
- GitHub account with repository access
- Render account (free tier available)
- Vercel account (free tier available)
- All environment variables from `.env.example` files

---

## Part 1: GitHub Repository Setup

### 1. Create GitHub Repository Structure

**Option A: Single Repository (Recommended)**
```
library-management-system/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   ├── render.yaml
│   ├── Procfile
│   └── ... (other backend files)
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json
│   └── ... (other frontend files)
├── README.md
└── .gitignore
```

**Option B: Separate Repositories**
- `library-management-backend` (deploy to Render)
- `library-management-frontend` (deploy to Vercel)

### 2. Initialize Git & Push to GitHub

```bash
# From project root
git init
git add .
git commit -m "Initial commit: Library Management System"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/library-management-system.git
git push -u origin main
```

### 3. Verify .gitignore Protects Secrets
Confirm these patterns are in `.gitignore`:
```
.env
.env.local
.env.*.local
node_modules/
dist/
```

---

## Part 2: Backend Deployment to Render

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub account
3. Authorize Render to access your repositories

### Step 2: Create New Web Service
1. Dashboard → New → Web Service
2. Connect your GitHub repository
3. Configure:
   - **Name**: `library-management-backend`
   - **Root Directory**: `backend` (if monorepo)
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or Starter for production stability)

### Step 3: Add Environment Variables
In Render Dashboard → Environment:

```
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/lms?retryWrites=true&w=majority
JWT_SECRET=use_a_long_random_string_min_32_chars
OPENAI_API_KEY=sk-proj-xxxxx
GEMINI_API_KEY=AIzaSyxxxxx
HF_API_TOKEN=hf_xxxxx
RAZORPAY_KEY_ID=rzp_live_xxxxx (production keys)
RAZORPAY_KEY_SECRET=xxxxx
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=https://your-app.vercel.app
```

### Step 4: Deploy
- Click "Deploy" in Render dashboard
- Wait for build to complete
- Backend URL: `https://library-management-backend.onrender.com`
- Note this URL for frontend configuration

### Step 5: Verify Backend
```bash
curl https://library-management-backend.onrender.com/api/books
```
Should return books data in JSON format.

---

## Part 3: Frontend Deployment to Vercel

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub account
3. Authorize Vercel to access your repositories

### Step 2: Create New Project
1. Vercel Dashboard → Add New → Project
2. Import your GitHub repository
3. Configure:
   - **Project Name**: `library-management-frontend` (or auto-detected)
   - **Framework**: Vite
   - **Root Directory**: `frontend` (if monorepo)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 3: Add Environment Variables
In Vercel Project Settings → Environment Variables:

```
VITE_API_URL=https://library-management-backend.onrender.com/api
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxx (production keys)
```

### Step 4: Deploy
- Vercel automatically deploys on push to main branch
- Wait for build to complete
- Frontend URL: `https://library-management-frontend.vercel.app`

### Step 5: Verify Frontend
1. Open frontend URL in browser
2. Check DevTools Console for errors
3. Verify API calls go to Render backend

---

## Part 4: Connection Verification

### Test End-to-End
1. **Frontend Load**: Open `https://your-frontend.vercel.app`
2. **API Connection**: Check browser DevTools → Network tab
   - API requests should go to `https://library-management-backend.onrender.com/api`
3. **Authentication**: Test registration and login
4. **Book Data**: Verify books load from backend
5. **Payment**: Test Razorpay integration (use test cards in test mode)

### Backend Logs
Monitor Render dashboard for any errors:
- Deployment logs
- Runtime logs
- Error tracking

---

## Part 5: Update Production URLs

After deployment, update these:

### Backend (.env)
```
FRONTEND_URL=https://your-frontend.vercel.app
NODE_ENV=production
```

### Frontend (.env)
```
VITE_API_URL=https://library-management-backend.onrender.com/api
```

---

## Troubleshooting

### Backend not starting on Render
- Check logs in Render dashboard
- Verify MongoDB connection string is correct
- Ensure all required env vars are set
- Check `npm start` works locally: `npm start`

### Frontend not connecting to backend
- Verify `VITE_API_URL` in Vercel env vars
- Check CORS headers in backend (should allow frontend URL)
- Inspect browser Network tab for failed requests
- Check for mixed HTTP/HTTPS issues

### Build failures
- **Render**: Check `npm install` and `npm start` work locally
- **Vercel**: Check `npm run build` works locally
- Verify all dependencies are in `package.json`

### Slow deployments
- Free tier Vercel/Render has slower builds
- Consider upgrading to Pro plan for faster builds

---

## Monitoring & Maintenance

### Daily Checks
- Monitor error logs on both platforms
- Check application performance
- Verify database connectivity

### Weekly Maintenance
- Review user registrations
- Check payment transactions
- Monitor API usage

### Monthly Reviews
- Update dependencies: `npm update`
- Review security vulnerabilities: `npm audit`
- Backup database from MongoDB Atlas

---

## Rollback Plan

If deployment breaks production:

1. **Render**: Push fix to GitHub, Render auto-redeploys
2. **Vercel**: Same - auto-redeploys on push
3. **Manual Rollback**: Revert last commit and push

---

## Next Steps After Deployment

1. ✅ Test all features in production
2. ✅ Set up error monitoring (e.g., Sentry)
3. ✅ Configure domain name (optional)
4. ✅ Set up SSL/TLS (auto-configured by Vercel & Render)
5. ✅ Monitor performance and logs
6. ✅ Plan scaling for growth

---

## Support & Resources

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://docs.mongodb.com/atlas/
- **Express.js**: https://expressjs.com/
- **React/Vite**: https://vite.dev/
