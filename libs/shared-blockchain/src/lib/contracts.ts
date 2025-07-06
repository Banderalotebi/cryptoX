/**
 * Contract ABIs and interfaces for the crypto wallet
 */

export const SERVER_WALLET_ABI = [
  "constructor()",
  "function deposit() external payable",
  "function withdrawETH(address to, uint256 amount) external",
  "function withdrawToken(address token, address to, uint256 amount) external",
  "function owner() view returns (address)",
  "function changeOwner(address newOwner) external",
  "function getBalance() external view returns (uint256)",
  "function transfer(address to, uint256 amount) external",
  "event Deposit(address indexed user, uint256 amount)",
  "event Withdrawal(address indexed user, uint256 amount)",
  "event Transfer(address indexed from, address indexed to, uint256 amount)",
  "event OwnerChanged(address indexed oldOwner, address indexed newOwner)"
];

export const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

export interface ContractInterface {
  address: string;
  abi: string[];
  name: string;
  description: string;
}

export const COMMON_CONTRACTS: { [key: string]: ContractInterface } = {
  USDC: {
    address: "0xA0b86a33E6441a8cC662108c60EB33f8aF2c8B6b", // Sepolia USDC
    abi: ERC20_ABI,
    name: "USD Coin",
    description: "Stablecoin pegged to USD"
  },
  USDT: {
    address: "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06", // Sepolia USDT
    abi: ERC20_ABI,
    name: "Tether USD",
    description: "Stablecoin pegged to USD"
  }
};

export const NETWORK_CONFIG = {
  mainnet: {
    chainId: 1,
    name: "Ethereum Mainnet",
    rpcUrl: "https://mainnet.infura.io/v3/YOUR_PROJECT_ID",
    blockExplorer: "https://etherscan.io"
  },
  sepolia: {
    chainId: 11155111,
    name: "Sepolia Testnet",
    rpcUrl: "https://sepolia.infura.io/v3/YOUR_PROJECT_ID",
    blockExplorer: "https://sepolia.etherscan.io"
  },
  goerli: {
    chainId: 5,
    name: "Goerli Testnet",
    rpcUrl: "https://goerli.infura.io/v3/YOUR_PROJECT_ID",
    blockExplorer: "https://goerli.etherscan.io"
  }
};
