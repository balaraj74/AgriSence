#!/bin/bash

# AgriSence Firebase App Hosting Setup Script
# This script helps you set up the backend for Firebase App Hosting

set -e

echo "🌾 AgriSence - Firebase App Hosting Setup"
echo "=========================================="
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed."
    echo "📦 Installing Firebase CLI..."
    npm install -g firebase-tools
    echo "✅ Firebase CLI installed successfully!"
else
    echo "✅ Firebase CLI is already installed"
fi

echo ""

# Login to Firebase
echo "🔐 Logging in to Firebase..."
firebase login

echo ""

# Check current project
echo "📋 Current Firebase project:"
firebase use

echo ""

# Set secrets
echo "🔑 Setting up secrets..."
echo "You'll need to provide your Google API Key (Gemini API Key)"
echo ""

read -p "Do you want to set the GOOGLE_API_KEY secret now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    firebase apphosting:secrets:set GOOGLE_API_KEY
    echo "✅ GOOGLE_API_KEY secret set successfully!"
fi

echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp .env.example .env.local
    echo "✅ .env.local created! Please edit it with your local API keys."
else
    echo "ℹ️  .env.local already exists"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "📚 Next steps:"
echo "1. Edit .env.local with your local development API keys"
echo "2. Run 'npm run dev' to start local development"
echo "3. Deploy to Firebase App Hosting:"
echo "   - Go to Firebase Console: https://console.firebase.google.com/"
echo "   - Navigate to App Hosting"
echo "   - Connect your GitHub repository"
echo "   - Firebase will auto-deploy on push"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"
echo ""
