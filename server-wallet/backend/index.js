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

// Initialize provider and signer
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const walletAddress = process.env.WALLET_ADDRESS;
const contract = new ethers.Contract(walletAddress, walletAbi, signer);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ status: "Server Wallet API is running", timestamp: new Date().toISOString() });
});

// Get wallet info
app.get("/wallet-info", async (req, res) => {
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
