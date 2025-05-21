import { execSync } from 'child_process';
import path from 'path';
import { config } from 'dotenv';

// Load environment variables
config();

const FABRIC_SAMPLES_PATH = process.env.FABRIC_SAMPLES_PATH;
const CHAINCODE_PATH = process.env.CHAINCODE_PATH;

if (!FABRIC_SAMPLES_PATH || !CHAINCODE_PATH) {
  console.error('Required environment variables are missing. Please run setup first.');
  process.exit(1);
}

try {
  // Navigate to test-network directory
  process.chdir(path.join(FABRIC_SAMPLES_PATH, 'test-network'));

  // Start the network
  console.log('Starting Fabric network...');
  execSync('./network.sh up createChannel -c mychannel -ca', { stdio: 'inherit' });

  // Deploy the chaincode
  console.log('Deploying chaincode...');
  execSync(`./network.sh deployCC -ccn documentVerification -ccp ${CHAINCODE_PATH} -ccl javascript`, { stdio: 'inherit' });

  console.log('Fabric network is up and running with chaincode deployed!');
} catch (error) {
  console.error('Error starting Fabric network:', error);
  process.exit(1);
}