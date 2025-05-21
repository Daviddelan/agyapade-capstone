import { Gateway, Wallets } from 'fabric-network';
import * as path from 'path';
import * as fs from 'fs';

export async function connect() {
  try {
    // Load connection profile
    const ccpPath = path.resolve(__dirname, 'connection.json');
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    // Create a new file system based wallet for managing identities
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // Create a new gateway for connecting to the peer node
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: 'appUser',
      discovery: { enabled: true, asLocalhost: true }
    });

    // Get the network (channel) our contract is deployed to
    const network = await gateway.getNetwork('mychannel');

    // Get the contract
    const contract = network.getContract('documentVerification');

    return contract;
  } catch (error) {
    console.error('Failed to connect to Fabric network:', error);
    throw error;
  }
}