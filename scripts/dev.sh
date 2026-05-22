#!/bin/bash
# Dev script for AgriSence Monorepo

echo "🚀 Starting AgriSence development servers..."

# Run all dev scripts defined in workspace packages concurrently via Turborepo
pnpm turbo dev
