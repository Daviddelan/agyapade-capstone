import { execSync } from 'child_process';
import path from 'path';

const FABRIC_SAMPLES_PATH = process.env.FABRIC_SAMPLES_PATH || '~/fabric-samples';
const CHAINCODE_PATH = path.resolve(__dirname, '../chaincode');

try {
  // Navigate to test-network directory
  process.chdir(path.join(FABRIC_SAMPLES_PATH, 'test-network'));

  // Start the network
  console.log('Starting Fabric network...');
  execSync('./network.sh up createChannel -c mychannel -ca');

  // Deploy the chaincode
  console.log('Deploying chaincode...');
  execSync(`./network.sh deployCC -ccn documentVerification -ccp ${CHAINCODE_PATH} -ccl javascript`);

  console.log('Fabric network is up and running with chaincode deployed!');
} catch (error) {
  console.error('Error starting Fabric network:', error);
  process.exit(1);
}