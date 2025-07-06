require("dotenv").config();
const express = require("express");
const { ethers } = require("ethers");
const app = express();

app.use(express.json());

const walletAbi = [
  "function withdrawETH(address to, uint256 amount) external",
  "function withdrawToken(address token, address to, uint256 amount) external",
  "function owner() view returns (address)",
  "function changeOwner(address newOwner) external"
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`📝 Wallet Address: ${walletAddress}`);
  console.log(`👤 Owner: ${signer.address}`);
});
