import { Wallet } from 'fabric-network';

export function buildCAClient(FabricCAServices: any, ccp: any, caHostName: string) {
  const caInfo = ccp.certificateAuthorities[caHostName];
  const caTLSCACerts = caInfo.tlsCACerts.pem;
  const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);
  return ca;
}

export async function enrollAdmin(caClient: any, wallet: Wallet) {
  try {
    const enrollment = await caClient.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: 'Org1MSP',
      type: 'X.509',
    };
    await wallet.put('admin', x509Identity);
  } catch (error) {
    throw new Error(`Failed to enroll admin user: ${error}`);
  }
}

export async function registerAndEnrollUser(caClient: any, wallet: Wallet, orgMspId: string, userId: string, affiliation: string) {
  try {
    const adminIdentity = await wallet.get('admin');
    if (!adminIdentity) {
      throw new Error('Admin identity not found in wallet');
    }

    const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, 'admin');

    await caClient.register({
      affiliation,
      enrollmentID: userId,
      role: 'client',
      attrs: [{ name: 'role', value: 'client', ecert: true }]
    }, adminUser);

    const enrollment = await caClient.enroll({
      enrollmentID: userId,
      enrollmentSecret: 'userpw'
    });

    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: orgMspId,
      type: 'X.509',
    };

    await wallet.put(userId, x509Identity);
  } catch (error) {
    throw new Error(`Failed to register user: ${error}`);
  }
}