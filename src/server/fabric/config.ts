import * as fs from 'fs';
import * as path from 'path';

export async function loadConnectionConfig() {
  try {
    const ccpPath = path.resolve(__dirname, 'connection.json');
    const fileContent = fs.readFileSync(ccpPath, 'utf8');
    const ccp = JSON.parse(fileContent);
    return ccp;
  } catch (error) {
    throw new Error(`Failed to load network configuration: ${error}`);
  }
}
