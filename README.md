# # 🏦 CryptoX - Ethereum Wallet Monorepo

A complete Ethereum wallet ecosystem built with **Nx monorepo** management, featuring smart contracts, backend API, and modern development tooling.

## 🏗️ Monorepo Structure

```
cryptoX/
├── apps/
│   └── server-wallet/                # Main wallet application
│       ├── contracts/               # Solidity smart contracts
│       ├── scripts/                # Deployment scripts
│       ├── backend/                # Express.js API server
│       ├── hardhat.config.js      # Hardhat configuration
│       └── project.json           # Nx project configuration
├── libs/                           # Shared libraries (future)
├── nx.json                        # Nx workspace configuration
└── package.json                   # Root package.json with scripts
```

## 🚀 Quick Start with Nx

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
```bash
cp apps/server-wallet/backend/.env.example apps/server-wallet/backend/.env
# Edit the .env file with your RPC URL and private key
```

### 3. Compile Smart Contracts
```bash
nx compile server-wallet
```

### 4. Deploy to Testnet
```bash
nx deploy server-wallet
```

### 5. Start Backend Server
```bash
nx start server-wallet
```

## 📋 Available Nx Commands

### Core Commands
- `nx build server-wallet` - Build the backend application
- `nx serve server-wallet` - Serve the application in development mode
- `nx start server-wallet` - Start the production server
- `nx test server-wallet` - Run Hardhat tests

### Smart Contract Commands
- `nx compile server-wallet` - Compile Solidity contracts
- `nx deploy server-wallet` - Deploy contracts to configured network

### Monorepo Management
- `nx graph` - View the dependency graph of your workspace
- `nx run-many -t build` - Run build for all projects
- `nx run-many -t test` - Run tests for all projects

## 🔧 Project Features

### ✅ Smart Contract Wallet
- Owner-controlled ETH withdrawals
- ERC20 token support
- Owner transfer functionality
- Access control and security

### ✅ Backend API
- RESTful Express.js server
- Ethers.js integration
- Environment-based configuration
- Error handling and validation

### ✅ Nx Monorepo Benefits
- **Unified Dependencies**: Single node_modules for the entire workspace
- **Task Orchestration**: Run tasks across multiple projects efficiently
- **Caching**: Nx caches task results for faster subsequent runs
- **Dependency Graph**: Visualize relationships between projects
- **Code Generation**: Generate new apps and libraries with consistent structure

## 📡 API Endpoints

All endpoints are available at `http://localhost:3000`:

- `GET /` - Health check
- `GET /wallet-info` - Get wallet information
- `POST /send-eth` - Send ETH from wallet
- `POST /send-token` - Send ERC20 tokens
- `POST /change-owner` - Change wallet owner

## 🌐 Supported Networks

Configure in `apps/server-wallet/hardhat.config.js`:
- Ethereum Mainnet
- Goerli Testnet
- Sepolia Testnet
- Polygon
- Binance Smart Chain

## 🧪 Development Workflow

### 1. Smart Contract Development
```bash
# Compile contracts
nx compile server-wallet

# Run tests
nx test server-wallet

# Deploy to local network
npx hardhat node  # In separate terminal
nx deploy server-wallet --args="--network localhost"
```

### 2. Backend Development
```bash
# Start in development mode
nx serve server-wallet

# Or start production build
nx build server-wallet && nx start server-wallet
```

### 3. Dependency Graph Visualization
```bash
nx graph
```

## 📦 Adding New Projects

### Add a Frontend Application
```bash
nx g @nx/react:app frontend
# or
nx g @nx/next:app frontend
```

### Add a Shared Library
```bash
nx g @nx/node:lib shared-utils
```

### Add Testing Utilities
```bash
nx g @nx/node:lib contract-testing --directory=libs/testing
```

## 🔒 Security Best Practices

- ✅ Environment variables for sensitive data
- ✅ Owner-only smart contract functions
- ✅ Input validation on API endpoints
- ✅ Error handling and proper HTTP status codes
- ✅ Git ignore for environment files

## 📊 Nx Cloud Integration

This workspace is connected to **Nx Cloud** for:
- Remote caching across team members
- Distributed task execution
- CI/CD optimizations

View your workspace: https://cloud.nx.app/connect/u3x9XNZNix

## 🛠 Advanced Commands

### Cache Management
```bash
nx reset              # Clear the cache
nx run-many -t build --verbose  # See cache hits/misses
```

### Project Dependencies
```bash
nx show projects      # List all projects
nx show project server-wallet  # Show project details
```

### Code Generation
```bash
nx list              # Show available plugins
nx g @nx/node:app new-service  # Generate new Node.js app
```

## 🚀 Production Deployment

### 1. Build for Production
```bash
nx build server-wallet
```

### 2. Deploy Smart Contracts
```bash
nx deploy server-wallet --args="--network mainnet"
```

### 3. Start Production Server
```bash
NODE_ENV=production nx start server-wallet
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `nx run-many -t test`
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ using Nx, Hardhat, and Express.js**