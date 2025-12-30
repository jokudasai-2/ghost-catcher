# Ghost Catcher Icons

The extension needs three icon sizes:
- icon16.png (16x16 pixels)
- icon48.png (48x48 pixels)
- icon128.png (128x128 pixels)

## Quick Setup: Use the Ghost Emoji

For quick testing, you can create simple icon images using any of these methods:

### Option 1: Online Icon Generator (Easiest)
1. Go to https://icon.horse/icon/ghost or https://www.favicon-generator.org/
2. Upload a ghost emoji screenshot or create a simple ghost icon
3. Generate icons in 16x16, 48x48, and 128x128 sizes
4. Download and place them in this folder

### Option 2: Use Figma or Canva
1. Create a square canvas (128x128)
2. Add a ghost emoji 👻 or simple ghost graphic
3. Use a purple/blue gradient background
4. Export as PNG in all three sizes

### Option 3: Use ImageMagick (Command Line)
If you have ImageMagick installed:

```bash
# Create a simple ghost icon with text
convert -size 128x128 xc:'#667eea' -font Arial -pointsize 80 -fill white -gravity center -annotate +0+0 '👻' icon128.png
convert icon128.png -resize 48x48 icon48.png
convert icon128.png -resize 16x16 icon16.png
```

### Temporary Placeholder
For now, you can also just copy any 3 PNG files into this folder with the correct names to test the extension functionality. The browser will load them even if they're not perfect.

## Design Suggestions
- Use ghost emoji 👻
- Purple/blue gradient background (#667eea to #764ba2)
- Simple, clean design
- High contrast for visibility
