import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMP_DIR = path.join(__dirname, '_temp');

async function unzipFile(zipPath) {
  try {
    // Create _temp directory if it doesn't exist
    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR, { recursive: true });
    }

    // Clean the temp directory
    fs.readdirSync(TEMP_DIR).forEach((file) => {
      const filePath = path.join(TEMP_DIR, file);
      fs.unlinkSync(filePath);
    });

    console.log('Starting unzip process...');
    const zip = new AdmZip(zipPath);

    // Extract everything
    zip.extractAllTo(TEMP_DIR, true);

    console.log(`Successfully extracted to ${TEMP_DIR}`);
  } catch (error) {
    console.error('Error during unzip process:', error);
    throw error;
  }
}

// Get the zip file path from command line arguments
const zipPath = process.argv[2];

if (!zipPath) {
  console.error('Please provide a zip file path as an argument');
  process.exit(1);
}

unzipFile(zipPath).catch((error) => {
  console.error('Failed to process zip file:', error);
  process.exit(1);
});
