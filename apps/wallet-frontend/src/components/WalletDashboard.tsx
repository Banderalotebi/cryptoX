import { useWallet } from '../hooks/useWallet';
import './WalletDashboard.css';

export const WalletDashboard = () => {
  const {
    account,
    balance,
    isConnected,
    chainId,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    isLoading,
    error,
  } = useWallet();

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getNetworkName = (chainId: number) => {
    const networks: Record<number, string> = {
      1: 'Ethereum Mainnet',
      11155111: 'Sepolia Testnet',
      137: 'Polygon Mainnet',
      80001: 'Polygon Mumbai',
      31337: 'Hardhat Local',
    };
    return networks[chainId] || `Chain ID: ${chainId}`;
  };

  if (!isConnected) {
    return (
      <div className="wallet-dashboard">
        <div className="connection-card">
          <h2>Connect Your Wallet</h2>
          <p>Connect your MetaMask wallet to start using CryptoX</p>
          <button
            onClick={connectWallet}
            disabled={isLoading}
            className="connect-button"
          >
            {isLoading ? 'Connecting...' : 'Connect MetaMask'}
          </button>
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-dashboard">
      <div className="dashboard-header">
        <h1>Wallet Dashboard</h1>
        <button onClick={disconnectWallet} className="disconnect-button">
          Disconnect
        </button>
      </div>

      <div className="wallet-cards">
        <div className="wallet-card balance-card">
          <h3>Account Balance</h3>
          <div className="balance-amount">
            {balance ? `${parseFloat(balance).toFixed(4)} ETH` : '0.0000 ETH'}
          </div>
          <button onClick={refreshBalance} className="refresh-button">
            Refresh Balance
          </button>
        </div>

        <div className="wallet-card account-card">
          <h3>Account Info</h3>
          <div className="account-info">
            <div className="account-row">
              <span className="label">Address:</span>
              <span className="value">{account ? formatAddress(account) : 'Not connected'}</span>
            </div>
            <div className="account-row">
              <span className="label">Network:</span>
              <span className="value">{chainId ? getNetworkName(chainId) : 'Unknown'}</span>
            </div>
          </div>
        </div>

        <div className="wallet-card actions-card">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button className="action-button send-button">
              Send Tokens
            </button>
            <button className="action-button receive-button">
              Receive Tokens
            </button>
            <button className="action-button history-button">
              Transaction History
            </button>
          </div>
        </div>
      </div>

      <div className="smart-contract-section">
        <div className="wallet-card contract-card">
          <h3>Smart Contract Interactions</h3>
          <p>Interact with your deployed ServerWallet contract</p>
          <div className="contract-actions">
            <button className="contract-button">
              Check Contract Balance
            </button>
            <button className="contract-button">
              Deploy New Contract
            </button>
            <button className="contract-button">
              Call Contract Function
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
