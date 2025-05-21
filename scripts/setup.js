import { execSync } from 'child_process';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { config } from 'dotenv';

const projectRoot = process.cwd();

async function setupEnvironment() {
  console.log('Setting up environment...');
  
  const envPath = resolve(projectRoot, '.env');
  const fabricPath = resolve(projectRoot, 'fabric-samples');

  // Create .env file with all required variables
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
CHAINCODE_PATH=${resolve(projectRoot, 'src/server/chaincode')}
WALLET_PATH=${resolve(projectRoot, 'wallet')}
CHANNEL_NAME=mychannel
CONTRACT_NAME=documentVerification`;

  try {
    writeFileSync(envPath, envContent);
    console.log('✅ Environment variables configured');
    
    // Reload environment variables
    config({ path: envPath, override: true });
  } catch (error) {
    console.error('❌ Failed to create .env file:', error);
    throw error;
  }
}

async function setupFabric() {
  console.log('\nSetting up Hyperledger Fabric...');
  
  const fabricPath = resolve(projectRoot, 'fabric-samples');

  // Create fabric-samples directory if it doesn't exist
  if (!existsSync(fabricPath)) {
    console.log('Creating fabric-samples directory...');
    mkdirSync(fabricPath, { recursive: true });
  }

  try {
    console.log('Downloading Fabric samples...');
    execSync('curl -sSL https://bit.ly/2ysbOFE | bash -s', {
      cwd: projectRoot,
      stdio: 'inherit'
    });
    console.log('✅ Fabric samples installed');
  } catch (error) {
    console.error('❌ Failed to download Fabric samples:', error);
    throw error;
  }
}

async function main() {
  console.log('Starting setup process...\n');
  
  try {
    await setupEnvironment();
    await setupFabric();
    
    // Run final check
    console.log('\nVerifying setup...');
    execSync('node scripts/checkSetup.js', { stdio: 'inherit' });
    
    console.log('\n✅ Setup completed successfully!');
  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

main();