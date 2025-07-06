import { ethers } from 'ethers';

/**
 * Shared wallet utilities for blockchain operations
 */

export interface WalletConfig {
  rpcUrl: string;
  privateKey?: string;
  walletAddress?: string;
}

export interface TransactionData {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gasUsed?: string;
  timestamp: number;
  blockNumber: number;
  status: 'success' | 'failed' | 'pending';
}

export interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  contractAddress: string;
}

export class WalletUtils {
  private provider: ethers.JsonRpcProvider;
  private signer?: ethers.Wallet;

  constructor(config: WalletConfig) {
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    
    if (config.privateKey) {
      this.signer = new ethers.Wallet(config.privateKey, this.provider);
    }
  }

  /**
   * Get ETH balance for an address
   */
  async getBalance(address: string): Promise<string> {
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  /**
   * Get transaction history for an address
   */
  async getTransactionHistory(
    address: string, 
    fromBlock: number = 0, 
    toBlock: number | string = 'latest'
  ): Promise<TransactionData[]> {
    try {
      // Get sent transactions
      const sentTxs = await this.provider.getLogs({
        fromBlock,
        toBlock,
        topics: [null, ethers.zeroPadValue(address, 32)]
      });

      // Get received transactions
      const receivedTxs = await this.provider.getLogs({
        fromBlock,
        toBlock,
        topics: [null, null, ethers.zeroPadValue(address, 32)]
      });

      const allTxHashes = new Set([
        ...sentTxs.map(tx => tx.transactionHash),
        ...receivedTxs.map(tx => tx.transactionHash)
      ]);

      const transactions: TransactionData[] = [];

      for (const hash of allTxHashes) {
        if (hash) {
          const tx = await this.provider.getTransaction(hash);
          const receipt = await this.provider.getTransactionReceipt(hash);
          
          if (tx && receipt) {
            transactions.push({
              hash: tx.hash,
              from: tx.from,
              to: tx.to || '',
              value: ethers.formatEther(tx.value),
              gasPrice: ethers.formatUnits(tx.gasPrice || 0, 'gwei'),
              gasUsed: receipt.gasUsed.toString(),
              timestamp: Date.now(), // In a real implementation, get block timestamp
              blockNumber: receipt.blockNumber,
              status: receipt.status === 1 ? 'success' : 'failed'
            });
          }
        }
      }

      return transactions.sort((a, b) => b.blockNumber - a.blockNumber);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }

  /**
   * Get ERC20 token balance
   */
  async getTokenBalance(tokenAddress: string, walletAddress: string): Promise<string> {
    const tokenAbi = [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)",
      "function name() view returns (string)"
    ];

    try {
      const contract = new ethers.Contract(tokenAddress, tokenAbi, this.provider);
      const balance = await contract.balanceOf(walletAddress);
      const decimals = await contract.decimals();
      
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      console.error('Error fetching token balance:', error);
      return '0';
    }
  }

  /**
   * Get multiple token balances
   */
  async getTokenBalances(tokenAddresses: string[], walletAddress: string): Promise<TokenBalance[]> {
    const balances: TokenBalance[] = [];

    for (const tokenAddress of tokenAddresses) {
      try {
        const tokenAbi = [
          "function balanceOf(address owner) view returns (uint256)",
          "function decimals() view returns (uint8)",
          "function symbol() view returns (string)",
          "function name() view returns (string)"
        ];

        const contract = new ethers.Contract(tokenAddress, tokenAbi, this.provider);
        const [balance, decimals, symbol, name] = await Promise.all([
          contract.balanceOf(walletAddress),
          contract.decimals(),
          contract.symbol(),
          contract.name()
        ]);

        balances.push({
          symbol,
          name,
          balance: ethers.formatUnits(balance, decimals),
          decimals,
          contractAddress: tokenAddress
        });
      } catch (error) {
        console.error(`Error fetching balance for token ${tokenAddress}:`, error);
      }
    }

    return balances;
  }

  /**
   * Validate Ethereum address
   */
  static isValidAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  /**
   * Format wei to ether with specified decimal places
   */
  static formatEther(wei: string | bigint, decimals: number = 4): string {
    return parseFloat(ethers.formatEther(wei)).toFixed(decimals);
  }

  /**
   * Parse ether to wei
   */
  static parseEther(ether: string): bigint {
    return ethers.parseEther(ether);
  }

  /**
   * Get gas estimate for a transaction
   */
  async estimateGas(
    to: string,
    value: string = '0',
    data: string = '0x'
  ): Promise<bigint> {
    return await this.provider.estimateGas({
      to,
      value: ethers.parseEther(value),
      data
    });
  }

  /**
   * Get current gas price
   */
  async getGasPrice(): Promise<string> {
    const gasPrice = await this.provider.getFeeData();
    return ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei');
  }
}
