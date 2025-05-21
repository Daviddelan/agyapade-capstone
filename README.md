# M'agyapade Document Verification System

A blockchain-based document verification system for secure and transparent management of land documents in Ghana.

## Features

- **Secure Document Verification**: Blockchain-powered verification system
- **Multi-User Roles**: Support for different user types:
  - Individual Users
  - Government Officials
  - Financial Institutions
  - System Administrators
- **Real-time Document Status**: Track document verification status
- **Blockchain Integration**: Immutable record keeping
- **Advanced Search**: Document search with history tracking
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

- Frontend: React + TypeScript + Vite
- Styling: Tailwind CSS
- Authentication: Firebase Auth
- Database: Firebase Firestore
- Storage: Firebase Storage
- Blockchain: Hyperledger Fabric
- State Management: Zustand

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Docker and Docker Compose (for Hyperledger Fabric)
- Firebase account
- Hyperledger Fabric test network

## Environment Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

## Blockchain Setup

1. Start Hyperledger Fabric network:
   ```bash
   npm run fabric:start
   ```
2. Deploy chaincode:
   ```bash
   cd src/server/chaincode
   npm install
   ```

## Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```
2. Start the API server:
   ```bash
   cd src/server
   npm run dev
   ```

## Project Structure

```
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── lib/           # Utility functions
│   ├── store/         # State management
│   ├── types/         # TypeScript types
│   └── server/        # Backend API and blockchain integration
├── public/            # Static assets
└── supabase/         # Database migrations and configurations
```

## User Roles

1. **Individual Users**
   - Upload documents
   - Track verification status
   - Manage profile

2. **Government Officials**
   - Review documents
   - Verify authenticity
   - Manage verifications

3. **Financial Institutions**
   - View verified documents
   - Search document history
   - Access verification records

4. **Administrators**
   - Manage users
   - System configuration
   - Activity monitoring

## Security Features

- Firebase Authentication
- Role-based access control
- Blockchain verification
- Document encryption
- Audit logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please email support@magyapade.com or create an issue in the repository.
