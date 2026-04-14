#!/bin/bash

# ============================================
# TILLAS.EC - Quick Setup Script
# Installs all new dependencies
# ============================================

echo "🚀 Installing root dependencies..."
npm install

echo ""
echo "📦 Installing API dependencies..."
cd packages/api
npm install nest-winston winston helmet @types/supertest supertest
cd ../..

echo ""
echo "🌐 Installing web dependencies..."
cd apps/web
npm install
cd ../..

echo ""
echo "👨‍💼 Installing admin dependencies..."
cd apps/admin
npm install
cd ../..

echo ""
echo "📱 Installing mobile dependencies..."
cd apps/mobile
npm install
cd ../..

echo ""
echo "🐕 Setting up Husky..."
npx husky init 2>/dev/null || true

echo ""
echo "✅ All dependencies installed!"
echo ""
echo "📝 Next steps:"
echo "  1. Copy .env.example to .env"
echo "  2. Run: npm run docker:dev"
echo "  3. Run: npm run db:generate"
echo "  4. Run: npm run db:migrate"
echo "  5. Run: npm run dev:api"
echo ""
echo "🧪 Run tests:"
echo "  npm run test:api"
echo "  npm run test:api:e2e"
echo ""
echo "🔍 Check code quality:"
echo "  npm run lint:check"
echo "  npm run format:check"
