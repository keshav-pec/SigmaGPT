# SigmaGPT Deployment Guide

## 🚀 Quick Deployment Options

### Backend Deployment (Choose One)

#### Option 1: Railway (Recommended - Free Tier Available)
1. Visit [railway.app](https://railway.app)
2. Connect your GitHub account
3. Create new project from GitHub repo
4. Select the `Backend` folder as root
5. Add environment variables:
   - `USE_PUTER=true`
   - `NODE_ENV=production`
   - `FRONTEND_URL=https://your-frontend-domain.com`
6. Deploy automatically

#### Option 2: Heroku
1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create sigmagpt-backend`
4. Set buildpack: `heroku buildpacks:set heroku/nodejs`
5. Set environment variables:
   ```bash
   heroku config:set USE_PUTER=true
   heroku config:set NODE_ENV=production
   heroku config:set FRONTEND_URL=https://your-frontend-domain.com
   ```
6. Deploy: `git subtree push --prefix=Backend heroku main`

#### Option 3: Render
1. Visit [render.com](https://render.com)
2. Connect GitHub repo
3. Create new Web Service
4. Root directory: `Backend`
5. Build command: `npm install`
6. Start command: `npm start`
7. Add environment variables in dashboard

### Frontend Deployment (Choose One)

#### Option 1: Vercel (Recommended)
1. Visit [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Framework preset: Create React App
4. Root directory: `Frontend`
5. Build command: `npm run build`
6. Output directory: `build`
7. Add environment variable:
   - `REACT_APP_API_URL=https://your-backend-url.com/api`
8. Deploy

#### Option 2: Netlify
1. Visit [netlify.com](https://netlify.com)
2. Drag and drop the `Frontend/build` folder
3. Or connect to GitHub:
   - Base directory: `Frontend`
   - Build command: `npm run build`
   - Publish directory: `build`
4. Add environment variable in site settings:
   - `REACT_APP_API_URL=https://your-backend-url.com/api`

## 🔧 Environment Variables Setup

### Backend Variables
```env
USE_PUTER=true
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
PORT=3001
```

### Frontend Variables
```env
REACT_APP_API_URL=https://your-backend-url.com/api
GENERATE_SOURCEMAP=false
CI=false
```

## 📝 Post-Deployment Steps

1. **Update Frontend API URL**: Replace `https://your-backend-url.com` with actual backend URL
2. **Update Backend CORS**: Add your frontend domain to CORS origins
3. **Test Features**: Verify chat functionality, animations, and responsive design
4. **SSL Certificate**: Ensure both domains have HTTPS enabled

## 🌐 Expected URLs
- **Frontend**: `https://sigmagpt-frontend-xyz.vercel.app`
- **Backend**: `https://sigmagpt-backend-xyz.railway.app`
- **API Endpoints**: `https://your-backend-url.com/api/health`

## 🎯 Verification Steps
1. Visit frontend URL
2. Test homepage animations
3. Create new chat conversation
4. Send a message and verify Puter.js response
5. Test responsive design on mobile
6. Check browser console for errors

## 🔧 Troubleshooting
- **CORS Error**: Update FRONTEND_URL in backend environment
- **API Connection**: Verify REACT_APP_API_URL in frontend environment
- **Build Errors**: Check Node.js version (requires 18+)
- **Animation Issues**: Clear browser cache and disable ad blockers