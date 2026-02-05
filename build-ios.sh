#!/bin/bash
# iOS Production Build Script
# Run this on your Mac before submitting to App Store

set -e  # Exit on any error

echo "🚀 Starting iOS Production Build Process..."
echo ""

# Step 1: Check we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found!"
  echo "   Run this script from user-frontend-vite-temp directory"
  exit 1
fi

echo "✅ Step 1: Found package.json"
echo ""

# Step 2: Clean previous builds
echo "🧹 Step 2: Cleaning previous builds..."
rm -rf dist
rm -rf node_modules/.vite
echo "✅ Cleaned dist/ and node_modules/.vite"
echo ""

# Step 3: Install dependencies
echo "📦 Step 3: Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Step 4: Build for production
echo "🔨 Step 4: Building for production..."
npm run build
echo "✅ Production build complete"
echo ""

# Step 5: Verify no localhost
echo "🔍 Step 5: Verifying no localhost references..."
if [ -f "verify-ios-build.js" ]; then
  node verify-ios-build.js
else
  echo "⚠️  Warning: verify-ios-build.js not found, skipping verification"
fi
echo ""

# Step 6: Sync to iOS
echo "📱 Step 6: Syncing to iOS..."
npx cap sync ios
echo "✅ Synced to iOS project"
echo ""

# Step 7: Done!
echo "🎉 BUILD COMPLETE!"
echo ""
echo "Next steps:"
echo "1. Run: npx cap open ios"
echo "2. In Xcode:"
echo "   - Select 'Any iOS Device (arm64)'"
echo "   - Product → Archive"
echo "   - Distribute App → App Store Connect"
echo ""
echo "Happy shipping! 🚀"
