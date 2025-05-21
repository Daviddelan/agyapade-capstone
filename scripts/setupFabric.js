import { resolve } from 'path';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';

// Set fabric-samples directory within the project
const fabricPath = resolve(process.cwd(), 'fabric-samples');

// Create fabric-samples directory if it doesn't exist
if (!existsSync(fabricPath)) {
  console.log('Creating fabric-samples directory...');
  mkdirSync(fabricPath, { recursive: true });
}

// Download and install Fabric samples
try {
  console.log('Downloading Fabric samples...');
  execSync('curl -sSL https://bit.ly/2ysbOFE | bash -s', {
    cwd: process.cwd(),
    stdio: 'inherit'
  });
} catch (error) {
  console.error('Failed to download Fabric samples:', error);
  process.exit(1);
}

// Update .env file with correct path
const envPath = resolve(process.cwd(), '.env');
const envContent = `FABRIC_SAMPLES_PATH=${fabricPath}`;

writeFileSync(envPath, envContent);

console.log('✅ Fabric samples installed and environment configured at:', fabricPath);