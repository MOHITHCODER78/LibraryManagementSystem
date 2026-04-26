# Library Management System - Complete Setup & Deployment Guide

## 🚀 Quick Start

### Local Development (Already Complete ✅)
- Backend running on `http://localhost:5000`
- Frontend running on `http://localhost:5173`
- MongoDB connected with 133 books pre-loaded
- User authentication working with JWT tokens
- All API endpoints tested and verified

### Production Deployment (Next Steps)

#### Prerequisites
- GitHub account with repository created ✅ (user has this)
- Render account (free tier)
- Vercel account (free tier)
- Production MongoDB URI (using existing MongoDB Atlas)
- Production API keys (OpenAI, Razorpay, Cloudinary, Gemini, HF)

---

## 📋 Step-by-Step Deployment

### Step 1: Push Code to GitHub

**Windows:**
```bash
.\deploy.bat
```

**macOS/Linux:**
```bash
bash deploy.sh
```

**Manual:**
```bash
git init
git add .
git commit -m "Initial commit: Library Management System"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/repo-name.git
git push -u origin main
```

### Step 2: Deploy Backend to Render

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Configure:
   ```
   Name: library-management-backend
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```
5. Add Environment Variables (under "Environment"):
   ```
   NODE_ENV=production
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/lms?retryWrites=true&w=majority
   JWT_SECRET=your_super_secret_jwt_key_12345
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
   GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxx
   HF_API_TOKEN=hf_xxxxxxxxxxxxx
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxx
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   FRONTEND_URL=https://your-frontend.vercel.app
   PORT=5000
   ```
6. Click "Create Web Service"
7. Wait for deployment (3-5 minutes)
8. Note your backend URL (e.g., `https://library-management-backend.onrender.com`)

### Step 3: Deploy Frontend to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure:
   ```
   Project Name: library-management-frontend
   Root Directory: frontend
   Framework: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```
4. Add Environment Variables:
   ```
   VITE_API_URL=https://library-management-backend.onrender.com/api
   VITE_RAZORPAY_KEY_ID=rzp_test_Shj8RyjZg1NsJ6
   ```
5. Click "Deploy"
6. Wait for deployment (2-3 minutes)
7. Get your frontend URL (e.g., `https://library-management-frontend.vercel.app`)

### Step 4: Update Backend FRONTEND_URL

Go back to Render dashboard:
1. Select your backend service
2. Go to "Environment"
3. Update `FRONTEND_URL` to your Vercel URL
4. Click "Save"
5. Deployment will auto-restart

---

## ✅ Verification Checklist

### Backend (Render)
- [ ] Deployment shows "Live" status
- [ ] No errors in logs
- [ ] Health check passes: `curl https://your-backend.onrender.com/api/books`
- [ ] Returns JSON with books data

### Frontend (Vercel)
- [ ] Deployment shows "Production" status
- [ ] Open URL in browser
- [ ] Page loads without console errors
- [ ] Network tab shows API calls to correct backend URL

### End-to-End
- [ ] Homepage loads
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Can view books list
- [ ] Can access student dashboard
- [ ] API calls succeed (check DevTools Network tab)

---

## 🔍 Troubleshooting

### Backend won't start
```bash
# Check logs in Render dashboard
# Verify environment variables are set correctly
# Test locally: cd backend && npm start
```

### Frontend shows blank page
```bash
# Check browser console for errors
# Verify VITE_API_URL points to correct backend
# Check Network tab - API calls should succeed
```

### API calls failing
```bash
# Verify backend FRONTEND_URL matches Vercel URL (with /api)
# Check CORS is enabled in backend (it is by default)
# Verify API keys are correct in backend environment
```

### Database connection errors
```bash
# Verify MONGO_URI is correct: mongodb+srv://username:password@cluster.mongodb.net/lms?retryWrites=true&w=majority
# Check MongoDB Atlas whitelist includes Render IPs (usually auto-allows all)
# Test connection: ping cluster0.ycxrolh.mongodb.net
```

---

## 📊 Live URLs After Deployment

```
Frontend: https://your-frontend.vercel.app
Backend:  https://your-backend.onrender.com
API Base: https://your-backend.onrender.com/api
```

---

## 🛠️ Maintenance

### Update code after changes
```bash
git add .
git commit -m "Your message"
git push origin main
```
Both Render and Vercel auto-deploy on push!

### View logs
- **Render**: Dashboard → Select service → Logs
- **Vercel**: Dashboard → Select project → Deployments → View logs

### Monitor performance
- **Render**: Dashboard → Metrics tab
- **Vercel**: Dashboard → Analytics tab

---

## 📞 Support

Need help?
1. Check DEPLOYMENT.md for detailed instructions
2. Review troubleshooting section above
3. Check Render/Vercel dashboards for error messages
4. See platform docs: render.com/docs and vercel.com/docs
