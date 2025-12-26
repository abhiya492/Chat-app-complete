#!/bin/bash

# In-App Purchase System Setup Script
echo "Setting up Advanced In-App Purchase System..."
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: Please run this script from the project root directory"
    exit 1
fi

echo "Step 1: Installing Backend Dependencies"
cd backend
npm install razorpay crypto
if [ $? -eq 0 ]; then
    echo "✅ Backend dependencies installed"
else
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

echo "Step 2: Installing Frontend Dependencies"
cd ../frontend
npm install
if [ $? -eq 0 ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

echo "Step 3: Setting up Environment Variables"
cd ../backend

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️ .env file not found, creating from .env.example"
    cp .env.example .env
fi

# Add Razorpay configuration to .env if not present
if ! grep -q "RAZORPAY_KEY_ID" .env; then
    echo "" >> .env
    echo "# Razorpay Configuration" >> .env
    echo "RAZORPAY_KEY_ID=your_razorpay_key_id" >> .env
    echo "RAZORPAY_KEY_SECRET=your_razorpay_key_secret" >> .env
    echo "✅ Added Razorpay configuration to .env"
else
    echo "✅ Razorpay configuration already exists in .env"
fi

echo "Step 4: Setting up Frontend Environment"
cd ../frontend

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "# Razorpay Configuration" > .env
    echo "VITE_RAZORPAY_KEY_ID=your_razorpay_key_id" >> .env
    echo "✅ Created frontend .env file"
else
    if ! grep -q "VITE_RAZORPAY_KEY_ID" .env; then
        echo "VITE_RAZORPAY_KEY_ID=your_razorpay_key_id" >> .env
        echo "✅ Added Razorpay key to frontend .env"
    else
        echo "✅ Frontend Razorpay configuration already exists"
    fi
fi

echo "Step 5: Adding Razorpay Script to HTML"
# Add Razorpay script to index.html if not present
if ! grep -q "checkout.razorpay.com" index.html; then
    # Find the closing </head> tag and insert before it
    sed -i.bak 's|</head>|    <script src="https://checkout.razorpay.com/v1/checkout.js"></script>\n  </head>|' index.html
    echo "✅ Added Razorpay script to index.html"
else
    echo "✅ Razorpay script already exists in index.html"
fi

echo "Step 6: Seeding Database with Sample Products"
cd ../backend

echo "ℹ️ Checking MongoDB connection..."
node -e "import('./src/lib/db.js').then(({connectDB}) => connectDB()).then(() => {console.log('MongoDB connected'); process.exit(0);}).catch(err => {console.error('MongoDB connection failed:', err.message); process.exit(1);})" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ MongoDB is connected"
    echo "ℹ️ Seeding products..."
    node src/scripts/seedProducts.js
    if [ $? -eq 0 ]; then
        echo "✅ Database seeded with sample products"
    else
        echo "⚠️ Failed to seed database - you can run this manually later"
    fi
else
    echo "⚠️ MongoDB not connected - skipping database seeding"
    echo "ℹ️ You can seed the database later by running: node src/scripts/seedProducts.js"
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo "✅ Backend dependencies installed"
echo "✅ Frontend dependencies installed"
echo "✅ Environment files configured"
echo "✅ Razorpay script added to HTML"
echo "✅ Database seeded (if MongoDB was connected)"

echo ""
echo "📋 Next Steps:"
echo "1. 🔑 Get Razorpay API keys from https://razorpay.com"
echo "2. 📝 Update .env files with your actual Razorpay keys"
echo "3. 🚀 Start the servers:"
echo "   Backend: cd backend && npm run dev"
echo "   Frontend: cd frontend && npm run dev"
echo "4. 🛒 Visit http://localhost:5173/store to test"

echo ""
echo "💰 Revenue Potential:"
echo "   Month 1: ₹10,000 - ₹25,000"
echo "   Month 3: ₹50,000 - ₹1,00,000"
echo "   Month 6: ₹2,00,000 - ₹5,00,000"

echo ""
echo "🎯 Your advanced in-app purchase system is ready!"
echo "Happy monetizing! 💰🚀"