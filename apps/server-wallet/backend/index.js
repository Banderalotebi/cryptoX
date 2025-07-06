require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true
}));

const walletAbi = [
  "function withdrawETH(address to, uint256 amount) external",
  "function withdrawToken(address token, address to, uint256 amount) external",
  "function owner() view returns (address)",
  "function changeOwner(address newOwner) external",
  "function deposit() external payable",
  "function getBalance() external view returns (uint256)",
  "function transfer(address to, uint256 amount) external",
  "event Deposit(address indexed user, uint256 amount)",
  "event Withdrawal(address indexed user, uint256 amount)",
  "event Transfer(address indexed from, address indexed to, uint256 amount)",
  "event OwnerChanged(address indexed oldOwner, address indexed newOwner)"
];

const erc20Abi = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)"
];

// Initialize provider and signer only if environment variables are available
let provider, signer, walletAddress, contract;

if (process.env.RPC_URL && process.env.PRIVATE_KEY && process.env.WALLET_ADDRESS) {
  provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  walletAddress = process.env.WALLET_ADDRESS;
  contract = new ethers.Contract(walletAddress, walletAbi, signer);
  console.log("✅ Blockchain connection initialized");
} else {
  console.log("⚠️  Blockchain not configured - set RPC_URL, PRIVATE_KEY, and WALLET_ADDRESS in .env");
}

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ status: "Server Wallet API is running", timestamp: new Date().toISOString() });
});

// Get wallet info
app.get("/wallet-info", async (req, res) => {
  if (!contract) {
    return res.status(400).json({ 
      error: "Blockchain not configured - please set RPC_URL, PRIVATE_KEY, and WALLET_ADDRESS in .env file" 
    });
  }
  
  try {
    const owner = await contract.owner();
    const balance = await provider.getBalance(walletAddress);
    res.json({
      address: walletAddress,
      owner: owner,
      balance: ethers.formatEther(balance)
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Withdraw ETH
app.post("/send-eth", async (req, res) => {
  if (!contract) {
    return res.status(400).json({ 
      error: "Blockchain not configured - please set RPC_URL, PRIVATE_KEY, and WALLET_ADDRESS in .env file" 
    });
  }

  const { to, amount } = req.body;
  
  if (!to || !amount) {
    return res.status(400).json({ error: "Missing 'to' or 'amount' parameters" });
  }

  try {
    const tx = await contract.withdrawETH(to, ethers.parseEther(amount.toString()));
    const receipt = await tx.wait();
    res.json({ 
      status: "sent", 
      txHash: tx.hash,
      gasUsed: receipt.gasUsed.toString(),
      to: to,
      amount: amount
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Withdraw ERC20 tokens
app.post("/send-token", async (req, res) => {
  if (!contract) {
    return res.status(400).json({ 
      error: "Blockchain not configured - please set RPC_URL, PRIVATE_KEY, and WALLET_ADDRESS in .env file" 
    });
  }

  const { token, to, amount } = req.body;
  
  if (!token || !to || !amount) {
    return res.status(400).json({ error: "Missing 'token', 'to', or 'amount' parameters" });
  }

  try {
    const tx = await contract.withdrawToken(token, to, amount);
    const receipt = await tx.wait();
    res.json({ 
      status: "sent", 
      txHash: tx.hash,
      gasUsed: receipt.gasUsed.toString(),
      token: token,
      to: to,
      amount: amount
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Change wallet owner
app.post("/change-owner", async (req, res) => {
  if (!contract) {
    return res.status(400).json({ 
      error: "Blockchain not configured - please set RPC_URL, PRIVATE_KEY, and WALLET_ADDRESS in .env file" 
    });
  }

  const { newOwner } = req.body;
  
  if (!newOwner) {
    return res.status(400).json({ error: "Missing 'newOwner' parameter" });
  }

  try {
    const tx = await contract.changeOwner(newOwner);
    const receipt = await tx.wait();
    res.json({ 
      status: "owner changed", 
      txHash: tx.hash,
      gasUsed: receipt.gasUsed.toString(),
      newOwner: newOwner
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get transaction history for an address
app.get("/transaction-history/:address", async (req, res) => {
  if (!provider) {
    return res.status(400).json({ 
      error: "Blockchain not configured - please set RPC_URL, PRIVATE_KEY, and WALLET_ADDRESS in .env file" 
    });
  }

  const { address } = req.params;
  const { fromBlock = 0, limit = 10 } = req.query;

  if (!ethers.isAddress(address)) {
    return res.status(400).json({ error: "Invalid Ethereum address" });
  }

  try {
    // Simplified transaction history - in production use Etherscan API or Graph Protocol
    const transactions = [
      {
        hash: "0x1234567890abcdef...",
        from: address,
        to: "0x742d35Cc6634C0532925a3b8D45C3E3f3f2E8DD0",
        value: "0.1",
        gasPrice: "20",
        gasUsed: "21000",
        timestamp: Date.now() - 3600000,
        blockNumber: 12345678,
        status: "success",
        type: "sent"
      },
      {
        hash: "0xabcdef1234567890...",
        from: "0x742d35Cc6634C0532925a3b8D45C3E3f3f2E8DD0",
        to: address,
        value: "0.5",
        gasPrice: "18",
        gasUsed: "21000",
        timestamp: Date.now() - 7200000,
        blockNumber: 12345677,
        status: "success",
        type: "received"
      }
    ];

    res.json({
      address,
      transactions: transactions.slice(0, parseInt(limit))
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get token balance for ERC20 tokens
app.get("/token-balance/:tokenAddress/:walletAddress", async (req, res) => {
  if (!provider) {
    return res.status(400).json({ 
      error: "Blockchain not configured - please set RPC_URL, PRIVATE_KEY, and WALLET_ADDRESS in .env file" 
    });
  }

  const { tokenAddress, walletAddress } = req.params;

  if (!ethers.isAddress(tokenAddress) || !ethers.isAddress(walletAddress)) {
    return res.status(400).json({ error: "Invalid token or wallet address" });
  }

  try {
    const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
    
    const [balance, decimals, symbol, name] = await Promise.all([
      tokenContract.balanceOf(walletAddress),
      tokenContract.decimals(),
      tokenContract.symbol(),
      tokenContract.name()
    ]);

    res.json({
      tokenAddress,
      walletAddress,
      balance: ethers.formatUnits(balance, decimals),
      decimals,
      symbol,
      name
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Deploy a new ServerWallet contract
app.post("/deploy-contract", async (req, res) => {
  if (!signer) {
    return res.status(400).json({ 
      error: "Signer not configured - please set PRIVATE_KEY in .env file" 
    });
  }

  try {
    // Mock deployment response - in production, import compiled contract artifacts
    res.json({ 
      message: "Contract deployment endpoint ready",
      info: "To deploy: 1) Compile contracts with 'npm run compile', 2) Add bytecode here",
      deployerAddress: signer.address,
      estimatedGas: "500000",
      mockContractAddress: "0x" + "1".repeat(40)
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get gas estimates
app.post("/estimate-gas", async (req, res) => {
  if (!provider) {
    return res.status(400).json({ 
      error: "Blockchain not configured - please set RPC_URL in .env file" 
    });
  }

  const { to, value = "0", data = "0x" } = req.body;

  if (!to || !ethers.isAddress(to)) {
    return res.status(400).json({ error: "Valid 'to' address required" });
  }

  try {
    const gasEstimate = await provider.estimateGas({
      to,
      value: ethers.parseEther(value.toString()),
      data
    });

    const feeData = await provider.getFeeData();

    res.json({
      gasEstimate: gasEstimate.toString(),
      gasPrice: ethers.formatUnits(feeData.gasPrice || 0, 'gwei'),
      maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') : null,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') : null
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get network information
app.get("/network-info", async (req, res) => {
  if (!provider) {
    return res.status(400).json({ 
      error: "Blockchain not configured - please set RPC_URL in .env file" 
    });
  }

  try {
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    const feeData = await provider.getFeeData();

    res.json({
      chainId: network.chainId.toString(),
      name: network.name,
      blockNumber,
      gasPrice: ethers.formatUnits(feeData.gasPrice || 0, 'gwei'),
      maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') : null,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') : null
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`📝 Wallet Address: ${walletAddress}`);
  console.log(`👤 Owner: ${signer.address}`);
});
