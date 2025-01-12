import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import mime from 'mime-types';

// Load environment variables
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMP_DIR = path.join(__dirname, '_temp');
const BUCKET_NAME = 'ui';

async function ensureBucketExists() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets.some((bucket) => bucket.name === BUCKET_NAME);

    if (!bucketExists) {
      console.log(`Creating bucket ${BUCKET_NAME}...`);
      const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        allowedMimeTypes: ['image/webp', 'image/png', 'image/jpeg'],
      });
      if (error) throw error;
      console.log('Bucket created successfully');
    }
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
    throw error;
  }
}

async function uploadFile(filePath, relativePath) {
  try {
    const fileContent = fs.readFileSync(filePath);
    const mimeType = mime.lookup(filePath) || 'application/octet-stream';

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(relativePath, fileContent, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) throw error;
    console.log(`Uploaded: ${relativePath}`);
  } catch (error) {
    console.error(`Error uploading ${relativePath}:`, error);
    throw error;
  }
}

async function uploadDirectory(directory) {
  try {
    const files = fs.readdirSync(directory);

    for (const file of files) {
      const fullPath = path.join(directory, file);
      const relativePath = path.relative(TEMP_DIR, fullPath);

      if (fs.statSync(fullPath).isDirectory()) {
        await uploadDirectory(fullPath);
      } else {
        await uploadFile(fullPath, relativePath);
      }
    }
  } catch (error) {
    console.error('Error uploading directory:', error);
    throw error;
  }
}

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

    // Ensure bucket exists and upload files
    console.log('Starting upload to Supabase...');
    await ensureBucketExists();
    await uploadDirectory(TEMP_DIR);
    console.log('Upload completed successfully');
  } catch (error) {
    console.error('Error during process:', error);
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
