const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { Gateway, Wallets } = require('fabric-network');
const cors = require('cors');

const app = express();
const PORT = 4000;

// Enable CORS
app.use(cors());

// Setup Multer memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Temp storage folder
const tempFolder = path.join(__dirname, 'temp');
if (!fs.existsSync(tempFolder)) {
  fs.mkdirSync(tempFolder);
}

// Connect to Hyperledger
async function connectGateway() {
    const ccpPath = path.resolve(__dirname, 'connection-org1.json');
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    const walletPath = path.join(__dirname, 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: 'appUser2',
      discovery: { enabled: false }
    });
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('docverification');
    return { contract, gateway };
  }

// Upload document to blockchain
app.post('/api/upload', upload.single('file'), async (req, res) => {
  const { file } = req;
  const { docId, ownerId, comments } = req.body;

  if (!file || !docId || !ownerId) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  const extension = path.extname(file.originalname) || '.pdf';
  const tempFilePath = path.join(tempFolder, `${docId}${extension}`);
  
  try {
    fs.writeFileSync(tempFilePath, file.buffer);

    const fileBuffer = fs.readFileSync(tempFilePath);
    const base64File = fileBuffer.toString('base64');

    const { contract, gateway } = await connectGateway();
    await contract.submitTransaction('verifyDocument', docId, base64File, ownerId, Date.now().toString(), comments || '');
    await gateway.disconnect();

    res.status(200).json({ message: 'Document uploaded successfully.' });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ message: 'Error uploading document', error: error.message });
  } finally {
    //if (fs.existsSync(tempFilePath)) {
      //fs.unlinkSync(tempFilePath);
    //}
  }
});

// Fetch document metadata for display (NOT the file yet)
app.get('/api/view/:docId', async (req, res) => {
  const { docId } = req.params;

  try {
    const { contract, gateway } = await connectGateway();
    const resultBytes = await contract.evaluateTransaction('getDocument', docId);
    await gateway.disconnect();

    const resultJson = JSON.parse(resultBytes.toString());

    if (!resultJson || !resultJson.docBase64) {
      return res.status(404).json({ message: 'Document not found on blockchain.' });
    }

    res.json({
      id: docId,
      ownerId: resultJson.ownerId || 'Unknown Owner',
      docHash: resultJson.docHash || '',
      comments: resultJson.comments || '',
      timestamp: resultJson.timestamp || Date.now(),
      status: "Verified",
      documentUrl: `http://localhost:${PORT}/api/download/${docId}`
    });

  } catch (error) {
    console.error('Error retrieving document metadata:', error);
    res.status(500).json({ message: 'Error retrieving document', error: error.message });
  }
});

// New: download the actual document file
app.get('/api/download/:docId', async (req, res) => {
  const { docId } = req.params;

  try {
    const { contract, gateway } = await connectGateway();
    const resultBytes = await contract.evaluateTransaction('QueryDocument', docId);
    await gateway.disconnect();

    const resultJson = JSON.parse(resultBytes.toString());

    if (!resultJson || !resultJson.docBase64) {
      return res.status(404).json({ message: 'Document not found on blockchain.' });
    }

    const fileBuffer = Buffer.from(resultJson.docBase64, 'base64');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${docId}.pdf"`);
    res.send(fileBuffer);

  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ message: 'Error downloading document', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
