
# Reviving Trust: Leveraging Blockchain for Secure Collateral Verification in Ghana

## Overview

This project is a blockchain-powered web application designed to streamline and secure the process of collateral verification in Ghana’s financial sector, especially among small-scale financial institutions. It replaces unreliable manual systems with an automated, tamper-proof platform that validates land ownership using smart contracts and records collateral data on a decentralized ledger.


## Features

- **Secure Collateral Verification**: Leverages Hyperledger Fabric to ensure tamper-evident ownership records.
- **Automated Loan Processing**: Smart contracts evaluate and validate submitted land documents in real time.
- **Immutable Audit Trails**: Every verification and update is recorded on the blockchain for regulatory transparency.
- **Document Upload and Management**: Borrowers can upload land titles and track their verification status.
- **Role-Based Access Control (RBAC)**: Distinct dashboards for borrowers, financial officers, and government officials.
- **Integration with Firestore**: Real-time synchronization of user metadata and document status.
- **Performance Optimized**: Handles 1000+ concurrent users with fast verification (<2s average response time).
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

- **Frontend**: React.js + TypeScript + TailwindCSS
- **Styling**: Tailwind CSS
- **Backend**: Node.js + Firebase Functions
- **Blockchain**: Hyperledger Fabric (v2.4)
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore (NoSQL)
- **Storage**: Firebase Storage
- **Authentication**: Firebase Auth (Email, Phone, MFA)
- **Monitoring**: Prometheus + Grafana


## System Architecture

1. **Presentation Layer**: Built with React.js and TailwindCSS for responsive user experience.
2. **Application Layer**: Node.js orchestrates interactions between Firestore, Firebase Auth, and the blockchain.
3. **Data Layer**: Firestore for off-chain metadata, Hyperledger Fabric for on-chain verification records.


## Installation

### Prerequisites

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


### Deploy Firebase Functions & Hosting

```bash
firebase login
firebase deploy
```

## Smart Contract Functionality

Smart contracts are implemented to:
- Validate ownership and collateral eligibility.
- Trigger automatic updates on the blockchain.
- Restrict fraudulent reuse of land documents.

## Usage Workflow

1. **Borrower** uploads land documents.
2. **Loan Officer** reviews and initiates smart contract verification.
3. **Blockchain** confirms authenticity and records the event.
4. **Regulators** view immutable history for oversight.

## Testing

- Unit tests for backend and smart contracts
- Integration tests between Firebase and Fabric
- System tested with up to 1,000 concurrent users


## Known Limitations

- Slight latency during Firestore-Blockchain sync under peak load
- User onboarding requires training due to blockchain unfamiliarity
- Requires further land registry API integration


## Future Enhancements

- Land registry API integration for real-time land title validation
- Mobile app version
- Expansion to movable assets (e.g., vehicles, equipment)
- AI-based risk analysis on collateral profiles


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

For support, please email magyapade@outlook.com or create an issue in the repository.



## Author

David Dela Nuworkpor
B.Sc. Computer Science, Ashesi University  
Email: david.nuworkpor@ashesi.edu.gh



## Acknowledgements

- Mr. Kwabena Bamfo (Supervisor, Ashesi University)
- Ashesi Computer Science Faculty
- Financial and Land Registry Institutions consulted
