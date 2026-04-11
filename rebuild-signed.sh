#!/bin/bash

echo "🔧 Rebuilding Pro Recorder with proper macOS signing..."
echo ""

# Clean previous builds
rm -rf out/
rm -rf dist/

# Rebuild with signing
echo "📦 Packaging application..."
npm run package

echo ""
echo "✅ Build complete!"
echo ""
echo "📁 Your signed app is in: out/Pro Recorder-darwin-arm64/"
echo ""
echo "🚀 To test the camera:"
echo "   1. Open the app from the 'out' folder"
echo "   2. macOS will show a camera permission prompt"
echo "   3. Click 'OK' to grant access"
echo "   4. Select a camera from the dropdown"
echo ""
echo "📝 Note: If you still see issues, check:"
echo "   System Settings > Privacy & Security > Camera"
echo "   Make sure 'Pro Recorder' is listed and checked"
echo ""
