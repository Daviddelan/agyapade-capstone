import { Wallets } from 'fabric-network';
import FabricCAServices from 'fabric-ca-client';
import { buildCAClient, enrollAdmin } from './utils';
import { loadConnectionConfig } from './config';

async function main() {
  try {
    // Load the network configuration
    const ccp = await loadConnectionConfig();

    // Create a new CA client for interacting with the CA
    const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');

    // Create a new file system based wallet for managing identities
    const wallet = await Wallets.newFileSystemWallet('./wallet');

    // Check to see if we've already enrolled the admin user
    const identity = await wallet.get('admin');
    if (identity) {
      console.log('An identity for the admin user already exists in the wallet');
      return;
    }

    // Enroll the admin user, and import the new identity into the wallet
    const enrollment = await enrollAdmin(caClient, wallet);
    console.log('Successfully enrolled admin user and imported it into the wallet');

  } catch (error) {
    console.error(`Failed to enroll admin user: ${error}`);
    process.exit(1);
  }
}

main();