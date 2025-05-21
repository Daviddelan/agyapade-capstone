import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { config } from 'dotenv';

// Load existing env variables
config();

const envPath = resolve(process.cwd(), '.env');

// Get Fabric samples path from current directory or environment
const fabricPath = process.env.FABRIC_SAMPLES_PATH || resolve(process.cwd(), 'fabric-samples');

const envContent = `# Fabric Configuration
FABRIC_SAMPLES_PATH=${fabricPath}

# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyABigrOcgZUdkjx36ipenIIIpiapwMs2xo
VITE_FIREBASE_AUTH_DOMAIN=magyapade3.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=magyapade3
VITE_FIREBASE_STORAGE_BUCKET=magyapade3.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=471348469514
VITE_FIREBASE_APP_ID=1:471348469514:web:0d17de231744794b4c64f3
VITE_FIREBASE_MEASUREMENT_ID=G-Z3L8BDSEH8

# Blockchain Configuration
CHAINCODE_PATH=/home/project/src/server/chaincode
WALLET_PATH=/home/project/wallet
CHANNEL_NAME=mychannel
CONTRACT_NAME=documentVerification`;

try {
  writeFileSync(envPath, envContent);
  console.log('✅ Environment variables configured successfully');
  
  // Force reload environment variables
  Object.keys(process.env).forEach(key => {
    if (key.startsWith('VITE_') || key.startsWith('FABRIC_')) {
      delete process.env[key];
    }
  });
  config();
} catch (error) {
  console.error('❌ Failed to write environment variables:', error);
  process.exit(1);
}