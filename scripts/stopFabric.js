import { execSync } from 'child_process';
import path from 'path';
import { config } from 'dotenv';

// Load environment variables
config();

const FABRIC_SAMPLES_PATH = process.env.FABRIC_SAMPLES_PATH;

if (!FABRIC_SAMPLES_PATH) {
  console.error('FABRIC_SAMPLES_PATH environment variable is missing');
  process.exit(1);
}

try {
  // Navigate to test-network directory
  process.chdir(path.join(FABRIC_SAMPLES_PATH, 'test-network'));

  // Stop the network
  console.log('Stopping Fabric network...');
  execSync('./network.sh down', { stdio: 'inherit' });

  console.log('Fabric network has been stopped.');
} catch (error) {
  console.error('Error stopping Fabric network:', error);
  process.exit(1);
}