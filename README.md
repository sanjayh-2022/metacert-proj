# MetaCert

An application for securely issuing, storing, and verifying tamper-proof digital credentials. By leveraging IPFS and Soulbound Tokens (SBTs), MetaCert ensures trust and authenticity empowering users to manage credentials with unmatched security and transparency.


## Features

- 🔒 **Secure Credential Issuance**: Issue cryptographically secured credentials.  
- 🌐 **IPFS Storage**: Store credentials in a decentralized, immutable manner.  
- 🎓 **Soulbound Tokens (SBTs)**: Credentials are tokenized as non-transferable SBTs, ensuring authenticity and ownership.  
- ✅ **Easy Verification**: Verify credentials seamlessly with blockchain-backed proof.

## Getting Started

### Prerequisites

Ensure you have the following installed:

- Node.js (v16 or higher)
- npm package manager
- A compatible crypto wallet (e.g., MetaMask/Phantom)

  
### Installation

Clone the repository:

```bash
git clone --recurse-submodules https://github.com/Aswinr24/MetaCert.git
```

Navigate to the project directory:
```bash
cd MetaCert
```

Install dependencies:
```bash
npm i
```

#### Environment Setup

Create a .env file in the root directory and configure the following variables:

```env
NEXT_PUBLIC_OPENSEA_API_KEY=<OPENSEA_API_KEY>
NEXT_PUBLIC_SMART_CONTRACT_ADDRESS=<CONTRACT_ADDRESS>
JWT_SECRET=<PINATA_IPFS_SECRET_KEY>
```

#### Run Locally

Start the development server for UI:

```bash
npm run dev
```

#### Build for Production

Build the application for production:

```bash
npm run build
npm start
```

### Smart Contracts Deployment

The contracts directory is included as a Git submodule.

#### Navigate to the Contracts Directory

After cloning the repository with submodules, navigate to the contracts submodule:

```bash
cd contracts 
```

Install Dependencies for Hardhat

```bash
npm i
```

#### Environment Setup for Smart Contracts

Create a .env file in the contracts directory and configure the following variables:

```env
NEXT_PUBLIC_ALCHEMY_SEPOLIA_API=<YOUR_ALCHEMY_SEPOLIA_API_KEY>
NEXT_PUBLIC_ACCOUNT_PRIVATE_KEY=<YOUR_WALLET_PRIVATE_KEY>
```

#### Compile Smart Contracts

Compile the smart contracts using Hardhat:

```bash
npx hardhat compile
```
#### Deploy the Smart Contracts

Deploy the contracts to the Sepolia test network:

```
npx hardhat run scripts/deploy-sepolia.js --network sepolia
```

#### Update Contract Address

After deploying the smart contract, note the contract address and update the ```NEXT_PUBLIC_SMART_CONTRACT_ADDRESS``` variable in the .env file of the MetaCert UI directory.

## Contributing

Contributions are welcome! If you find any bugs or have suggestions for improvements, please open an issue or clone the repository and submit a pull request on GitHub.
