import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../hooks/useWallet';
import './TransactionHistory.css';

interface Transaction {
  hash: string;
  blockNumber: number;
  from: string;
  to: string | null;
  value: string;
  gasUsed?: string;
  gasPrice?: string;
  timestamp: number;
  status: 'success' | 'failed' | 'pending';
  type: 'sent' | 'received' | 'contract';
}

export const TransactionHistory = () => {
  const { provider, account, isConnected } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected && account && provider) {
      fetchTransactionHistory();
    }
  }, [isConnected, account, provider]);

  const fetchTransactionHistory = async () => {
    if (!provider || !account) return;

    setIsLoading(true);
    setError(null);

    try {
      // Get the latest block number
      const latestBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, latestBlock - 1000); // Last 1000 blocks

      // Fetch transactions where user is sender
      const sentFilter = {
        fromBlock,
        toBlock: 'latest',
        topics: [],
      };

      // This is a simplified version - in a real app, you'd use a more efficient method
      // like querying an indexing service (Alchemy, Moralis, etc.)
      const mockTransactions: Transaction[] = [
        {
          hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          blockNumber: latestBlock - 10,
          from: account,
          to: '0x742d35Cc6634C0532925a3b8F0C9A5c5B2C8b9C8',
          value: ethers.formatEther('1500000000000000000'), // 1.5 ETH
          gasUsed: '21000',
          gasPrice: '20000000000',
          timestamp: Date.now() - 86400000, // 1 day ago
          status: 'success',
          type: 'sent',
        },
        {
          hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          blockNumber: latestBlock - 25,
          from: '0x742d35Cc6634C0532925a3b8F0C9A5c5B2C8b9C8',
          to: account,
          value: ethers.formatEther('2000000000000000000'), // 2.0 ETH
          gasUsed: '21000',
          gasPrice: '18000000000',
          timestamp: Date.now() - 172800000, // 2 days ago
          status: 'success',
          type: 'received',
        },
        {
          hash: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
          blockNumber: latestBlock - 50,
          from: account,
          to: null, // Contract creation
          value: '0',
          gasUsed: '500000',
          gasPrice: '25000000000',
          timestamp: Date.now() - 259200000, // 3 days ago
          status: 'success',
          type: 'contract',
        },
      ];

      setTransactions(mockTransactions);
    } catch (err: any) {
      setError('Failed to fetch transaction history');
      console.error('Error fetching transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address: string | null) => {
    if (!address) return 'Contract Creation';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'sent':
        return '↗️';
      case 'received':
        return '↙️';
      case 'contract':
        return '📄';
      default:
        return '💫';
    }
  };

  const openInExplorer = (hash: string) => {
    // This would open the transaction in a block explorer
    // For now, just copy to clipboard
    navigator.clipboard.writeText(hash);
    alert('Transaction hash copied to clipboard!');
  };

  if (!isConnected) {
    return (
      <div className="transaction-history">
        <div className="not-connected">
          <h2>Wallet Not Connected</h2>
          <p>Please connect your wallet to view transaction history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="transaction-history">
      <div className="history-header">
        <h1>Transaction History</h1>
        <button onClick={fetchTransactionHistory} disabled={isLoading} className="refresh-button">
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading transaction history...</p>
        </div>
      ) : (
        <div className="transactions-container">
          {transactions.length === 0 ? (
            <div className="no-transactions">
              <h3>No Transactions Found</h3>
              <p>Your transaction history will appear here once you make your first transaction.</p>
            </div>
          ) : (
            <div className="transactions-list">
              {transactions.map((tx) => (
                <div key={tx.hash} className={`transaction-card ${tx.type}`}>
                  <div className="transaction-icon">
                    {getTransactionTypeIcon(tx.type)}
                  </div>
                  
                  <div className="transaction-details">
                    <div className="transaction-row">
                      <div className="transaction-main">
                        <span className="transaction-type">
                          {tx.type === 'sent' ? 'Sent' : tx.type === 'received' ? 'Received' : 'Contract'}
                        </span>
                        <span className={`transaction-amount ${tx.type}`}>
                          {tx.type === 'contract' ? 'Contract Creation' : `${parseFloat(tx.value).toFixed(4)} ETH`}
                        </span>
                      </div>
                      <div className="transaction-meta">
                        <span className="transaction-time">{formatTimestamp(tx.timestamp)}</span>
                        <span className={`transaction-status ${tx.status}`}>{tx.status}</span>
                      </div>
                    </div>
                    
                    <div className="transaction-addresses">
                      <div className="address-row">
                        <span className="label">From:</span>
                        <span className="address">{formatAddress(tx.from)}</span>
                      </div>
                      <div className="address-row">
                        <span className="label">To:</span>
                        <span className="address">{formatAddress(tx.to)}</span>
                      </div>
                    </div>
                    
                    <div className="transaction-technical">
                      <div className="tech-row">
                        <span className="label">Block:</span>
                        <span className="value">{tx.blockNumber}</span>
                      </div>
                      <div className="tech-row">
                        <span className="label">Gas:</span>
                        <span className="value">{tx.gasUsed}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="transaction-actions">
                    <button
                      onClick={() => openInExplorer(tx.hash)}
                      className="explorer-button"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
