#!/usr/bin/env node

/**
 * Placeholder Icon Generator
 * Creates placeholder PNG icons for PWA manifest
 * 
 * This is a fallback if SVG to PNG conversion tools aren't available.
 * In production, use the SVG directly or convert with proper tools.
 */

const fs = require('fs');
const path = require('path');

// Try to use sharp for SVG to PNG conversion
async function generateIconsWithSharp() {
  try {
    const sharp = require('sharp');
    const svgPath = path.join(__dirname, '..', 'public', 'icon.svg');
    
    if (!fs.existsSync(svgPath)) {
      throw new Error('SVG file not found at ' + svgPath);
    }

    console.log('📦 Generating PNG icons from SVG using sharp...');

    // Generate 192x192 icon
    await sharp(svgPath)
      .resize(192, 192, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(path.join(__dirname, '..', 'public', 'icon-192.png'));
    
    console.log('✅ Generated icon-192.png');

    // Generate 512x512 icon
    await sharp(svgPath)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(path.join(__dirname, '..', 'public', 'icon-512.png'));
    
    console.log('✅ Generated icon-512.png');

    // Generate maskable versions (for adaptive icons on Android)
    // Maskable icons can have content in the entire square
    await sharp(svgPath)
      .resize(192, 192, {
        fit: 'contain',
        background: { r: 59, g: 130, b: 246, alpha: 1 } // Blue background matching theme
      })
      .png()
      .toFile(path.join(__dirname, '..', 'public', 'icon-192-maskable.png'));
    
    console.log('✅ Generated icon-192-maskable.png');

    await sharp(svgPath)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 59, g: 130, b: 246, alpha: 1 }
      })
      .png()
      .toFile(path.join(__dirname, '..', 'public', 'icon-512-maskable.png'));
    
    console.log('✅ Generated icon-512-maskable.png');
    console.log('');
    console.log('✨ All PNG icons generated successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error with sharp:', error.message);
    
    if (error.message.includes('Cannot find module')) {
      console.log('');
      console.log('sharp is not installed. Installing...');
      const { execSync } = require('child_process');
      try {
        execSync('npm install --save-dev sharp', { stdio: 'inherit' });
        console.log('');
        console.log('Retrying icon generation...');
        generateIconsWithSharp();
      } catch (installError) {
        console.error('Failed to install sharp:', installError.message);
        generatePlaceholders();
      }
    } else {
      generatePlaceholders();
    }
  }
}

// Fallback: Generate simple placeholder icons as base64 PNGs
// This is a 192x192 solid blue PNG (minimal but valid)
function generatePlaceholders() {
  console.log('');
  console.log('⚠️  Generating placeholder PNG files...');
  console.log('');
  console.log('Note: These are minimal 1x1 PNGs. For production, please:');
  console.log('1. Install sharp: npm install --save-dev sharp');
  console.log('2. Re-run this script: npm run generate:icons');
  console.log('');

  // Minimal 1x1 blue PNG (base64 encoded)
  const bluePNG = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63, 0x3C, 0x51, 0x00, 0x00,
    0x03, 0x00, 0x01, 0x00, 0x00, 0x35, 0x3B, 0x8D, 0xB8, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,
    0x44, 0xAE, 0x42, 0x60, 0x82
  ]);

  const files = [
    'icon-192.png',
    'icon-192-maskable.png',
    'icon-512.png',
    'icon-512-maskable.png'
  ];

  const publicDir = path.join(__dirname, '..', 'public');
  
  files.forEach(file => {
    const filePath = path.join(publicDir, file);
    fs.writeFileSync(filePath, bluePNG);
    console.log('📝 Created placeholder:', file);
  });

  console.log('');
  console.log('✨ Placeholder PNG files created!');
  console.log('');
}

// Run the generator
console.log('🎨 Icon Generator for Event Counter PWA');
console.log('');
generateIconsWithSharp();
