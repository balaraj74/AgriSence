#!/bin/bash
# Setup script for AgriSence Monorepo

echo "🌱 Setting up AgriSence Monorepo..."

# Ensure pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

echo "📦 Installing dependencies..."
pnpm install

echo "✅ Setup complete! Run 'pnpm dev' to start the development servers."
