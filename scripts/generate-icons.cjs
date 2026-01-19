const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [48, 72, 96, 128, 144, 152, 192, 256, 384, 512];
const inputFile = path.join(__dirname, '../public/moondala-logo.png');
const outputDir = path.join(__dirname, '../public/icons');

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  console.log('Generating PWA icons...');
  
  for (const size of sizes) {
    const outputFile = path.join(outputDir, `icon-${size}x${size}.png`);
    
    await sharp(inputFile)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 10, g: 10, b: 15, alpha: 1 }
      })
      .png()
      .toFile(outputFile);
    
    console.log(`Generated ${size}x${size}`);
  }
  
  // Generate Apple touch icon (180x180)
  await sharp(inputFile)
    .resize(180, 180, {
      fit: 'contain',
      background: { r: 10, g: 10, b: 15, alpha: 1 }
    })
    .png()
    .toFile(path.join(outputDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon 180x180');
  
  // Generate favicon (32x32)
  await sharp(inputFile)
    .resize(32, 32, {
      fit: 'contain',
      background: { r: 10, g: 10, b: 15, alpha: 1 }
    })
    .png()
    .toFile(path.join(outputDir, 'favicon-32x32.png'));
  console.log('Generated favicon 32x32');
  
  // Generate favicon (16x16)
  await sharp(inputFile)
    .resize(16, 16, {
      fit: 'contain',
      background: { r: 10, g: 10, b: 15, alpha: 1 }
    })
    .png()
    .toFile(path.join(outputDir, 'favicon-16x16.png'));
  console.log('Generated favicon 16x16');
  
  console.log('\nAll icons generated in public/icons/');
}

generateIcons().catch(console.error);
