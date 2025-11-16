#!/bin/bash

echo "🚀 Starting deployment..."

# Build frontend
echo "📦 Building frontend..."
cd frontend
npm run build

# Go back to root
cd ..

echo "✅ Build complete! Push to GitHub and redeploy."
echo ""
echo "Next steps:"
echo "1. git add ."
echo "2. git commit -m 'fix: Rebuild with scheduled messages feature'"
echo "3. git push origin main"
echo "4. Redeploy on your hosting platform (Render/Vercel/etc.)"
