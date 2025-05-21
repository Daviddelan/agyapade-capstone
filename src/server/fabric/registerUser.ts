import { Wallets } from 'fabric-network';
import FabricCAServices from 'fabric-ca-client';
import { buildCAClient, registerAndEnrollUser } from './utils';
import { loadConnectionConfig } from './config';

async function main() {
  try {
    // Load the network configuration
    const ccp = await loadConnectionConfig();

    // Create a new CA client for interacting with the CA
    const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');

    // Create a new file system based wallet for managing identities
    const wallet = await Wallets.newFileSystemWallet('./wallet');

    // Check to see if we've already enrolled the user
    const userIdentity = await wallet.get('appUser');
    if (userIdentity) {
      console.log('An identity for the user "appUser" already exists in the wallet');
      return;
    }

    // Check if admin exists in wallet
    const adminIdentity = await wallet.get('admin');
    if (!adminIdentity) {
      console.log('An identity for the admin user does not exist in the wallet');
      console.log('Run the enrollAdmin.ts application before retrying');
      return;
    }

    // Register and enroll the user
    await registerAndEnrollUser(caClient, wallet, 'Org1MSP', 'appUser', 'org1.department1');
    console.log('Successfully registered and enrolled user "appUser" and imported it into the wallet');

  } catch (error) {
    console.error(`Failed to register user: ${error}`);
    process.exit(1);
  }
}

main();