import { execSync } from 'child_process';
import path from 'path';

const FABRIC_SAMPLES_PATH = process.env.FABRIC_SAMPLES_PATH || '~/fabric-samples';

try {
  // Navigate to test-network directory
  process.chdir(path.join(FABRIC_SAMPLES_PATH, 'test-network'));

  // Stop the network
  console.log('Stopping Fabric network...');
  execSync('./network.sh down');

  console.log('Fabric network has been stopped.');
} catch (error) {
  console.error('Error stopping Fabric network:', error);
  process.exit(1);
}