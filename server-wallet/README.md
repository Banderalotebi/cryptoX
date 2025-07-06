# 🏦 Server Wallet Project

A complete Ethereum server wallet implementation with smart contracts and backend API.

## 🔧 Project Structure

```
server-wallet/
├── contracts/
│   └── ServerWallet.sol        # Smart contract wallet
├── scripts/
│   └── deploy.js              # Deployment script
├── backend/
│   ├── index.js               # Express.js API server
│   └── .env.example           # Environment variables template
├── hardhat.config.js          # Hardhat configuration
├── package.json               # Dependencies
└── README.md                  # This file
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd server-wallet
npm install
```

### 2. Set Up Environment Variables

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your values:
- `RPC_URL`: Your Ethereum RPC endpoint (Alchemy, Infura, etc.)
- `PRIVATE_KEY`: Private key of the account that will own the wallet
- `WALLET_ADDRESS`: Will be filled after deployment

### 3. Compile Contracts

```bash
npx hardhat compile
```

### 4. Deploy the Wallet

For Goerli testnet:
```bash
npx hardhat run scripts/deploy.js --network goerli
```

For other networks:
```bash
npx hardhat run scripts/deploy.js --network sepolia
npx hardhat run scripts/deploy.js --network polygon
npx hardhat run scripts/deploy.js --network bsc
```

Copy the deployed contract address and add it to your `.env` file.

### 5. Start the Backend

```bash
npm start
```

The API will be available at `http://localhost:3000`

## 📡 API Endpoints

### GET `/`
Health check endpoint

### GET `/wallet-info`
Get wallet information (address, owner, ETH balance)

### POST `/send-eth`
Send ETH from the wallet
```json
{
  "to": "0xRecipientAddress",
  "amount": "0.01"
}
```

### POST `/send-token`
Send ERC20 tokens from the wallet
```json
{
  "token": "0xTokenContractAddress",
  "to": "0xRecipientAddress",
  "amount": "1000000000000000000"
}
```

### POST `/change-owner`
Change the wallet owner
```json
{
  "newOwner": "0xNewOwnerAddress"
}
```

## 🧪 Testing with curl

### Send ETH:
```bash
curl -X POST http://localhost:3000/send-eth \
  -H "Content-Type: application/json" \
  -d '{"to":"0xRecipientAddress", "amount":"0.01"}'
```

### Send Tokens:
```bash
curl -X POST http://localhost:3000/send-token \
  -H "Content-Type: application/json" \
  -d '{"token":"0xTokenAddress", "to":"0xRecipientAddress", "amount":"1000000000000000000"}'
```

### Get Wallet Info:
```bash
curl http://localhost:3000/wallet-info
```

## 🔒 Security Features

- ✅ Owner-only access to withdraw functions
- ✅ Input validation on all endpoints
- ✅ Error handling and proper HTTP status codes
- ✅ Support for both ETH and ERC20 tokens
- ✅ Owner change functionality

## 🌐 Supported Networks

- Ethereum Mainnet
- Goerli Testnet
- Sepolia Testnet
- Polygon
- Binance Smart Chain

## 📝 Smart Contract Features

- **Receive ETH**: Contract can receive ETH directly
- **Withdraw ETH**: Owner can withdraw ETH to any address
- **Withdraw Tokens**: Owner can withdraw ERC20 tokens
- **Change Owner**: Transfer ownership to another address
- **Access Control**: All functions are owner-protected

## 🛠 Development

### Run Tests
```bash
npx hardhat test
```

### Local Development
```bash
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

## 📋 Requirements

- Node.js 16+
- npm or yarn
- Ethereum wallet with testnet ETH
- RPC endpoint (Alchemy, Infura, etc.)

## ⚠️ Important Notes

- Keep your private key secure and never commit it to version control
- Test thoroughly on testnets before using on mainnet
- The wallet contract is minimal - consider adding additional security features for production use
- Always verify contract addresses and transactions before sending

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

MIT License
