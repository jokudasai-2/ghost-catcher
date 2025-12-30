const fs = require('fs');
const path = require('path');

const sizes = [16, 48, 128];
const iconsDir = path.join(__dirname, '../extension/icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const createSVGIcon = (size) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#4F46E5" rx="${size * 0.15}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.6}" fill="white" text-anchor="middle" dominant-baseline="central">👻</text>
</svg>`;
};

console.log('Creating extension icons...');

sizes.forEach(size => {
  const svgContent = createSVGIcon(size);
  const svgPath = path.join(iconsDir, `icon${size}.svg`);
  fs.writeFileSync(svgPath, svgContent);
  console.log(`✓ Created icon${size}.svg`);
});

console.log('\n⚠️  Note: SVG icons are created. For PNG icons, please:');
console.log('1. Open extension/icons/generate-icons.html in your browser');
console.log('2. Download the three PNG files');
console.log('3. Place them in the extension/icons/ folder');
console.log('\nOr use an online SVG to PNG converter for the generated SVG files.');
