#!/bin/bash

# Ghost Catcher Extension Packaging Script

echo "🎁 Packaging Ghost Catcher Chrome Extension..."
echo ""

# Check if icons exist
ICONS_DIR="extension/icons"
REQUIRED_ICONS=("icon16.png" "icon48.png" "icon128.png")
MISSING_ICONS=false

echo "Checking for required icon files..."
for icon in "${REQUIRED_ICONS[@]}"; do
  if [ ! -f "$ICONS_DIR/$icon" ]; then
    echo "❌ Missing: $icon"
    MISSING_ICONS=true
  else
    echo "✓ Found: $icon"
  fi
done

if [ "$MISSING_ICONS" = true ]; then
  echo ""
  echo "⚠️  ERROR: Missing icon files!"
  echo ""
  echo "Please generate icons first:"
  echo "1. Open extension/icons/generate-icons.html in your browser"
  echo "2. Download all three icon files (icon16.png, icon48.png, icon128.png)"
  echo "3. Move them to the extension/icons/ folder"
  echo "4. Run this script again"
  echo ""
  exit 1
fi

# Create dist directory
DIST_DIR="dist-extension"
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR/ghost-catcher-extension"

echo ""
echo "Copying extension files..."

# Copy necessary files
cp extension/manifest.json "$DIST_DIR/ghost-catcher-extension/"
cp extension/popup.html "$DIST_DIR/ghost-catcher-extension/"
cp extension/popup.js "$DIST_DIR/ghost-catcher-extension/"
cp extension/background.js "$DIST_DIR/ghost-catcher-extension/"
cp -r extension/icons "$DIST_DIR/ghost-catcher-extension/"

# Copy documentation
cp extension/README.md "$DIST_DIR/ghost-catcher-extension/"
cp extension/INSTALLATION.md "$DIST_DIR/ghost-catcher-extension/" 2>/dev/null || true

echo "✓ Files copied"

# Create zip file
cd "$DIST_DIR"
ZIP_NAME="ghost-catcher-extension.zip"
zip -r "$ZIP_NAME" ghost-catcher-extension/
cd ..

mv "$DIST_DIR/$ZIP_NAME" .

echo ""
echo "✅ Extension packaged successfully!"
echo ""
echo "📦 Package location: ghost-catcher-extension.zip"
echo ""
echo "To share the extension:"
echo "1. Share the ghost-catcher-extension.zip file with your team"
echo "2. Recipients should unzip and follow INSTALLATION.md"
echo ""
echo "To publish to Chrome Web Store:"
echo "1. Visit: https://chrome.google.com/webstore/devconsole"
echo "2. Pay $5 one-time developer fee (if first time)"
echo "3. Upload ghost-catcher-extension.zip"
echo "4. Fill in store listing details"
echo "5. Submit for review"
echo ""
