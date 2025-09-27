# 🆓 SigmaGPT Free Deployment Guide

Deploy your SigmaGPT application completely **FREE** using Render.com (backend) and Vercel.com (frontend).

## 🎯 Free Tier Limits
- **Render.com**: 750 hours/month, 512MB RAM, 1GB storage (MORE than enough!)
- **Vercel.com**: Unlimited personal projects, 100GB bandwidth/month
- **Total Cost**: $0/month 💰

---

## 🚀 Step 1: Deploy Backend to Render (FREE)

### Option A: Web Dashboard (Recommended)
1. **Visit**: https://render.com
2. **Sign up** with your GitHub account
3. **Click**: "New" → "Web Service"
4. **Connect** your GitHub repository
5. **Configure**:
   ```
   Name: sigmagpt-backend
   Root Directory: Backend
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```

6. **Add Environment Variables** (in Render dashboard):
   ```
   USE_PUTER=true
   NODE_ENV=production
   ```

7. **Click Deploy** 🚀

### Option B: Render Blueprint (Advanced)
Create `render.yaml` in Backend folder (already created for you!)

---

## 🌐 Step 2: Deploy Frontend to Vercel (FREE)

1. **Visit**: https://vercel.com
2. **Sign up** with GitHub
3. **Click**: "New Project" → "Import Git Repository"
4. **Select** your SigmaGPT repository
5. **Configure**:
   ```
   Framework Preset: Create React App
   Root Directory: Frontend
   Build Command: npm run build
   Output Directory: build
   ```

6. **Add Environment Variable**:
   ```
   REACT_APP_API_URL=https://sigmagpt-backend-xxx.onrender.com/api
   ```
   *(Replace with your actual Render backend URL)*

7. **Deploy** 🚀

---

## 🔧 Environment Variables Setup

### Backend (Render.com)
```env
USE_PUTER=true
NODE_ENV=production
FRONTEND_URL=https://your-vercel-url.vercel.app
```

### Frontend (Vercel.com)
```env
REACT_APP_API_URL=https://your-render-url.onrender.com/api
GENERATE_SOURCEMAP=false
CI=false
```

---

## 📋 Deployment Checklist

### Backend Deployment ✅
- [ ] Render account created
- [ ] Repository connected
- [ ] Build/Start commands configured
- [ ] Environment variables set
- [ ] Free tier selected
- [ ] Health check working (`/api/health`)

### Frontend Deployment ✅
- [ ] Vercel account created  
- [ ] Repository imported
- [ ] Framework preset selected
- [ ] Root directory configured
- [ ] Backend API URL updated
- [ ] Build successful

### Testing ✅
- [ ] Backend health endpoint working
- [ ] Frontend loads without errors
- [ ] Chat functionality working
- [ ] Animations rendering properly
- [ ] Mobile responsive
- [ ] CORS headers working

---

## 🌐 Expected URLs

After deployment, you'll get:
- **Backend**: `https://sigmagpt-backend-[random].onrender.com`
- **Frontend**: `https://sigmagpt-[random].vercel.app`
- **API Health**: `https://your-backend-url.onrender.com/api/health`

---

## 🛠 Troubleshooting

### Common Issues:
1. **CORS Error**: Update `FRONTEND_URL` in Render environment variables
2. **Build Failed**: Check Node.js version (requires 18+)
3. **API Not Found**: Verify `REACT_APP_API_URL` in Vercel settings
4. **Sleep Mode**: Render free tier sleeps after 15min inactivity (normal)

### Solutions:
- **Sleep Issue**: First request may take 30 seconds (free tier limitation)
- **CORS**: Always include both domains in CORS configuration
- **Environment**: Double-check all environment variables

---

## 💡 Free Tier Benefits

### Why These Platforms?
- ✅ **No Credit Card Required**
- ✅ **Generous free limits**
- ✅ **Automatic HTTPS/SSL**
- ✅ **Global CDN**
- ✅ **Auto-deployments on git push**
- ✅ **Custom domains supported**
- ✅ **Professional hosting quality**

### Performance:
- **Backend**: Responds in ~200ms (when awake)
- **Frontend**: Lightning fast global CDN
- **Uptime**: 99.9% reliability
- **Security**: Enterprise-grade HTTPS

---

## 🎉 Success!

After following this guide, you'll have:
- 🚀 **Professional SigmaGPT app** deployed for FREE
- 🤖 **AI chat functionality** with Puter.js integration  
- ✨ **Beautiful animations** and modern UI
- 📱 **Mobile-responsive** design
- 🌐 **Global accessibility** with HTTPS
- 💰 **$0/month hosting costs**

Your ChatGPT clone is now live and accessible worldwide! 🌍