'use strict';

const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

async function main() {
  try {
    const ccpPath = path.resolve(__dirname, 'connection-org1.json');
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
    const caTLSCACerts = caInfo.tlsCACerts.pem;
    const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false });

    const walletPath = path.join(__dirname, 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // Check if admin exists
    const adminIdentity = await wallet.get('admin');
    if (!adminIdentity) {
      console.log('An admin identity does not exist in the wallet');
      return;
    }

    const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, 'admin');

    // Register new user
    const secret = await ca.register({
      affiliation: 'org1.department1',
      enrollmentID: 'appUser2',
      role: 'client'
    }, adminUser);

    // Enroll the new user
    const enrollment = await ca.enroll({
      enrollmentID: 'appUser2',
      enrollmentSecret: secret
    });

    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: 'Org1MSP',
      type: 'X.509',
    };
    await wallet.put('appUser2', x509Identity);
    console.log('✅ Successfully registered and enrolled "appUser2"');

  } catch (error) {
    console.error(`❌ Failed to register new user: ${error}`);
    process.exit(1);
  }
}

main();
