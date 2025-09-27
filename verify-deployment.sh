#!/bin/bash

# SigmaGPT Free Deployment Verification Script
echo "🔍 SigmaGPT Deployment Verification"
echo "==================================="
echo ""

# Get URLs from user
read -p "Enter your Render backend URL (e.g., https://sigmagpt-backend-xxx.onrender.com): " BACKEND_URL
read -p "Enter your Vercel frontend URL (e.g., https://sigmagpt-xxx.vercel.app): " FRONTEND_URL

echo ""
echo "🧪 Testing Backend..."

# Test backend health
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "${BACKEND_URL}/api/health")
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo "✅ Backend health check: PASSED"
else
    echo "❌ Backend health check: FAILED (HTTP $HEALTH_RESPONSE)"
fi

# Test CORS
CORS_RESPONSE=$(curl -s -H "Origin: ${FRONTEND_URL}" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: Content-Type" -X OPTIONS "${BACKEND_URL}/api/conversations")
if [[ $CORS_RESPONSE == *"Access-Control-Allow-Origin"* ]]; then
    echo "✅ CORS configuration: PASSED"
else
    echo "❌ CORS configuration: FAILED"
fi

echo ""
echo "🧪 Testing Frontend..."

# Test frontend
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "${FRONTEND_URL}")
if [ "$FRONTEND_RESPONSE" = "200" ]; then
    echo "✅ Frontend loading: PASSED"
else
    echo "❌ Frontend loading: FAILED (HTTP $FRONTEND_RESPONSE)"
fi

echo ""
echo "📋 Manual Testing Checklist:"
echo "□ Visit ${FRONTEND_URL}"
echo "□ Check homepage animations load"
echo "□ Try creating a new chat"
echo "□ Send a test message"
echo "□ Verify Puter.js response"
echo "□ Test on mobile device"
echo ""
echo "🎉 If all tests pass, your SigmaGPT is live!"