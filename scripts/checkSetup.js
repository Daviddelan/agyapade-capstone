import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { config } from 'dotenv';

// Load environment variables
config();

console.log('Checking system setup...\n');

// Check Docker
try {
  execSync('docker --version');
  console.log('✅ Docker is installed');
} catch (error) {
  console.error('❌ Docker is not installed');
}

// Check Docker Compose
try {
  execSync('docker compose version');
  console.log('✅ Docker Compose is installed');
} catch (error) {
  console.error('❌ Docker Compose is not installed');
}

// Check Node.js
try {
  execSync('node --version');
  console.log('✅ Node.js is installed');
} catch (error) {
  console.error('❌ Node.js is not installed');
}

// Check npm
try {
  execSync('npm --version');
  console.log('✅ npm is installed');
} catch (error) {
  console.error('❌ npm is not installed')