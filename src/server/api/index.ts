import { Router } from 'express';
import { Wallets, Gateway } from 'fabric-network';
import * as path from 'path';
import * as fs from 'fs';
import { loadConnectionConfig } from '../fabric/config.js';

const app = Router();

// Fabric setup variables
let contract: any = null;

// Initialize Fabric connection
async function initializeFabric() {
  try {
    const ccp = await loadConnectionConfig();
    const walletPath = path.join(__dirname, 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: 'admin',
      discovery: { enabled: true, asLocalhost: true },
    });

    const network = await gateway.getNetwork('mychannel');
    contract = network.getContract('docverification');
    console.log('Connected to Fabric network');
  } catch (error) {
    console.error('Error connecting to Fabric network:', error);
  }
}

initializeFabric();

// API Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Verify document endpoint
app.post('/api/verify-document', async (req, res) => {
  try {
    if (!contract) {
      throw new Error('Fabric network connection not initialized');
    }

    const { docId, docHash, verifiedBy, timestamp, comments } = req.body;

    const result = await contract.submitTransaction(
      'verifyDocument',
      docId,
      docHash,
      verifiedBy,
      timestamp.toString(),
      comments || ''
    );

    const verification = JSON.parse(result.toString());

    res.json({
      ...verification,
      transactionId: verification.transactionId || null,
    });
  } catch (error) {
    console.error('Error verifying document:', error);
    res.status(500).json({ error: 'Failed to verify document' });
  }
});

// Get verification record endpoint
app.get('/api/get-verification/:docId', async (req, res) => {
  try {
    if (!contract) {
      throw new Error('Fabric network connection not initialized');
    }

    const { docId } = req.params;
    const result = await contract.evaluateTransaction('getVerification', docId);
    const verification = JSON.parse(result.toString());

    res.json(verification);
  } catch (error) {
    console.error('Error fetching verification record:', error);
    res.status(500).json({ error: 'Failed to fetch verification record' });
  }
});

export default app;
