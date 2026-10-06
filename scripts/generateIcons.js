const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const SOURCE_IMAGE = 'C:/Users/Admin/Downloads/logo.webp';
const RES_DIR = path.resolve(__dirname, '../android/app/src/main/res');
const ASSETS_LOGO_DIR = path.resolve(__dirname, '../src/assets/logo');

const SIZES = [
  { folder: 'mipmap-mdpi', size: 48 },
  { folder: 'mipmap-hdpi', size: 72 },
  { folder: 'mipmap-xhdpi', size: 96 },
  { folder: 'mipmap-xxhdpi', size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
];

async function generate() {
  if (!fs.existsSync(SOURCE_IMAGE)) {
    console.error('Source logo does not exist:', SOURCE_IMAGE);
    process.exit(1);
  }

  // Ensure assets logo directory exists
  if (!fs.existsSync(ASSETS_LOGO_DIR)) {
    fs.mkdirSync(ASSETS_LOGO_DIR, { recursive: true });
  }

  // Copy source to assets
  fs.copyFileSync(SOURCE_IMAGE, path.join(ASSETS_LOGO_DIR, 'logo.webp'));
  await sharp(SOURCE_IMAGE)
    .png()
    .toFile(path.join(ASSETS_LOGO_DIR, 'logo.png'));
  console.log('Saved logo to assets/logo');

  for (const item of SIZES) {
    const targetFolder = path.join(RES_DIR, item.folder);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    const standardPath = path.join(targetFolder, 'ic_launcher.png');
    const roundPath = path.join(targetFolder, 'ic_launcher_round.png');

    // Generate standard square/adaptive icon
    await sharp(SOURCE_IMAGE)
      .resize(item.size, item.size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png()
      .toFile(standardPath);

    // Generate round icon with circular mask
    const circleBuffer = Buffer.from(
      `<svg width="${item.size}" height="${item.size}"><circle cx="${item.size / 2}" cy="${item.size / 2}" r="${item.size / 2}" fill="#fff" /></svg>`
    );

    const resizedBuffer = await sharp(SOURCE_IMAGE)
      .resize(item.size, item.size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .png()
      .toBuffer();

    await sharp(resizedBuffer)
      .composite([{ input: circleBuffer, blend: 'dest-in' }])
      .png()
      .toFile(roundPath);

    console.log(`Generated ${item.folder} (${item.size}x${item.size})`);
  }

  console.log('All launcher icons generated successfully!');
}

generate().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
