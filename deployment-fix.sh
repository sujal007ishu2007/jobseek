#!/bin/bash

# Quick Fix Script for Deployment Issues

echo "🚀 Job Management App Deployment Fix Guide"
echo "=========================================="
echo ""

echo "1. 🚨 CRITICAL - MongoDB Atlas IP Whitelist:"
echo "   - Go to https://cloud.mongodb.com/"
echo "   - Navigate to Network Access"
echo "   - Add IP Address: 0.0.0.0/0 (Allow from anywhere)"
echo "   - This fixes 'MongooseServerSelectionError'"
echo ""

echo "2. 📱 Frontend (Vercel) Environment Variables:"
echo "   Variable: REACT_APP_API_URL"
echo "   Value: https://your-render-backend.onrender.com/api"
echo ""

echo "3. 🖥️  Backend (Render) Environment Variables:"
echo "   MONGODB_URI=mongodb+srv://kommawarsujal007_db_user:qOTqhP7n6a5Tz9yY@cluster0.icwdl5k.mongodb.net/jobmanagement?retryWrites=true&w=majority"
echo "   JWT_SECRET=your_super_secret_jwt_key_here"
echo "   PORT=5000"
echo "   NODE_ENV=production"
echo "   FRONTEND_URL=https://your-vercel-app.vercel.app"
echo ""

echo "4. 🔄 After making changes:"
echo "   - Redeploy both applications"
echo "   - Test signup/login functionality"
echo ""

echo "✅ Current server status check..."