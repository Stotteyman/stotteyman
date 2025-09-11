#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Create placeholder video files (empty files for now)
const videoFiles = [
  'intro.mp4',
  'intro.webm',
  'intro-poster.jpg'
];

videoFiles.forEach(file => {
  const filePath = path.join(publicDir, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '');
    console.log(`Created placeholder: ${file}`);
  }
});

// Create favicon files
const faviconFiles = [
  'favicon.ico',
  'favicon-16x16.png',
  'favicon-32x32.png',
  'apple-touch-icon.png',
  'android-chrome-192x192.png',
  'android-chrome-512x512.png'
];

faviconFiles.forEach(file => {
  const filePath = path.join(publicDir, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '');
    console.log(`Created placeholder: ${file}`);
  }
});

// Create OG image placeholder
const ogImagePath = path.join(publicDir, 'og-image.jpg');
if (!fs.existsSync(ogImagePath)) {
  fs.writeFileSync(ogImagePath, '');
  console.log('Created placeholder: og-image.jpg');
}

// Create screenshots
const screenshotFiles = [
  'screenshot-desktop.png',
  'screenshot-mobile.png'
];

screenshotFiles.forEach(file => {
  const filePath = path.join(publicDir, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '');
    console.log(`Created placeholder: ${file}`);
  }
});

console.log('✅ Placeholder assets created successfully!');
console.log('📝 Note: Replace these with actual video and image files before deployment.');
