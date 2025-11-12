#!/usr/bin/env node

/**
 * PWA Icon Generator - Using SVGEXPORT or simple base64 fallback
 * This script generates PNG icons from the SVG icon.svg file
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function generateIconsWithSVG2PNG() {
  try {
    const svgPath = path.join(__dirname, '..', 'public', 'icon.svg');
    
    if (!fs.existsSync(svgPath)) {
      throw new Error('SVG file not found at ' + svgPath);
    }

    console.log('🎨 Icon Generator for Event Counter PWA');
    console.log('');
    console.log('📦 Attempting to generate PNG icons from SVG...');
    console.log('');

    // Try using svg2png if available
    try {
      console.log('Checking for svg2png...');
      execSync('which svg2png', { stdio: 'ignore' });
      
      console.log('Using svg2png to generate icons...');
      execSync(`svg2png "${svgPath}" -o "${path.join(__dirname, '..', 'public', 'icon-192.png')}" -w 192 -h 192`);
      console.log('✅ Generated icon-192.png');
      
      execSync(`svg2png "${svgPath}" -o "${path.join(__dirname, '..', 'public', 'icon-512.png')}" -w 512 -h 512`);
      console.log('✅ Generated icon-512.png');
      
      // Copy for maskable versions
      fs.copyFileSync(
        path.join(__dirname, '..', 'public', 'icon-192.png'),
        path.join(__dirname, '..', 'public', 'icon-192-maskable.png')
      );
      console.log('✅ Generated icon-192-maskable.png');
      
      fs.copyFileSync(
        path.join(__dirname, '..', 'public', 'icon-512.png'),
        path.join(__dirname, '..', 'public', 'icon-512-maskable.png')
      );
      console.log('✅ Generated icon-512-maskable.png');
      
      console.log('');
      console.log('✨ All PNG icons generated successfully!');
      return;
    } catch (e) {
      // svg2png not available, try another approach
    }

    // Try using ImageMagick convert if available
    try {
      console.log('Checking for ImageMagick convert...');
      execSync('which convert', { stdio: 'ignore' });
      
      console.log('Using ImageMagick to generate icons...');
      execSync(`convert -density 96 -size 192x192 "${svgPath}" "${path.join(__dirname, '..', 'public', 'icon-192.png')}"`);
      console.log('✅ Generated icon-192.png');
      
      execSync(`convert -density 240 -size 512x512 "${svgPath}" "${path.join(__dirname, '..', 'public', 'icon-512.png')}"`);
      console.log('✅ Generated icon-512.png');
      
      // Copy for maskable versions
      fs.copyFileSync(
        path.join(__dirname, '..', 'public', 'icon-192.png'),
        path.join(__dirname, '..', 'public', 'icon-192-maskable.png')
      );
      console.log('✅ Generated icon-192-maskable.png');
      
      fs.copyFileSync(
        path.join(__dirname, '..', 'public', 'icon-512.png'),
        path.join(__dirname, '..', 'public', 'icon-512-maskable.png')
      );
      console.log('✅ Generated icon-512-maskable.png');
      
      console.log('');
      console.log('✨ All PNG icons generated successfully!');
      return;
    } catch (e) {
      // ImageMagick not available either
    }

    // Final fallback: Create minimal but valid PNG files
    throw new Error('No SVG to PNG conversion tools available');

  } catch (error) {
    console.log('⚠️  Could not auto-generate PNG icons');
    console.log('');
    console.log('Available options to generate PNG icons:');
    console.log('');
    console.log('1️⃣  Install ImageMagick (recommended for macOS):');
    console.log('   brew install imagemagick');
    console.log('   Then run: npm run generate:icons');
    console.log('');
    console.log('2️⃣  Install svg2png:');
    console.log('   npm install -g svg2png');
    console.log('   Then run: npm run generate:icons');
    console.log('');
    console.log('3️⃣  Online converter (no installation needed):');
    console.log('   Visit: https://convertio.co/svg-png/');
    console.log('   Upload: public/icon.svg');
    console.log('   Create 4 PNG files:');
    console.log('     • icon-192.png (192x192)');
    console.log('     • icon-192-maskable.png (192x192)');
    console.log('     • icon-512.png (512x512)');
    console.log('     • icon-512-maskable.png (512x512)');
    console.log('   Save to: public/');
    console.log('');
    console.log('4️⃣  Use an online SVG editor that can export PNG:');
    console.log('   • https://svgedit.netlify.app/');
    console.log('   • https://www.photopea.com/');
    console.log('');
    console.log('Note: The app will still work with just the SVG icon.');
    console.log('PNG files provide better compatibility on older devices.');
    console.log('');
  }
}

generateIconsWithSVG2PNG().catch(console.error);
