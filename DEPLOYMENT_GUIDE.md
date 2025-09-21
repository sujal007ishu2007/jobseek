# Environment Variables for Production

## 🚨 CRITICAL: MongoDB Atlas Setup
1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address" 
3. Select "Allow Access from Anywhere" (0.0.0.0/0)
4. This is required for both local development and Render deployment

## Frontend (Vercel Environment Variables)
Add these environment variables in your Vercel dashboard:

```
REACT_APP_API_URL=https://<your-render-backend>.onrender.com/api
```

## Backend (Render Environment Variables)
Add these environment variables in your Render dashboard:

```
MONGODB_URI=mongodb+srv://kommawarsujal007_db_user:qOTqhP7n6a5Tz9yY@cluster0.icwdl5k.mongodb.net/jobmanagement?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://<your-vercel-app>.vercel.app
# Optional: for multiple allowed origins (e.g., preview deployments)
CORS_ORIGINS=https://<your-vercel-app>.vercel.app,https://<your-vercel-preview>.vercel.app
```

## Steps to Fix:

1. **FIRST**: Fix MongoDB Atlas IP whitelist (see above)
2. Update your Vercel app's environment variables
3. Update your Render app's environment variables  
4. Redeploy both applications
5. Update CORS origins in server.js if needed (or set CORS_ORIGINS)

## Current Issues Found:
- ❌ MongoDB Atlas blocks your IP (MAIN ISSUE)
- ❌ Frontend .env points to localhost (won't work in production)
- ❌ Need to add your actual deployment URLs to CORS
- ❌ Environment variables not set in deployment platforms

## Notes
- Don’t commit a real `.env.production` in the frontend. Vercel injects env vars; use `.env.production.example` for documentation only.
- Authentication uses Bearer tokens via Authorization header; no cookies required, but ensure the frontend uses the correct API base URL.