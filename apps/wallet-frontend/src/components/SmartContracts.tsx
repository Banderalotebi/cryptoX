import { useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../hooks/useWallet';
import './SmartContracts.css';

// ServerWallet ABI - this would typically be imported from your compiled contracts
const SERVER_WALLET_ABI = [
  "constructor()",
  "function deposit() external payable",
  "function withdraw(uint256 amount) external",
  "function getBalance() external view returns (uint256)",
  "function transfer(address to, uint256 amount) external",
  "event Deposit(address indexed user, uint256 amount)",
  "event Withdrawal(address indexed user, uint256 amount)",
  "event Transfer(address indexed from, address indexed to, uint256 amount)"
];

export const SmartContracts = () => {
  const { provider, account, isConnected } = useWallet();
  const [contractAddress, setContractAddress] = useState('');
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Contract interaction states
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [contractBalance, setContractBalance] = useState<string | null>(null);

  const connectToContract = async () => {
    if (!provider || !contractAddress) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!ethers.isAddress(contractAddress)) {
        throw new Error('Invalid contract address');
      }

      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(contractAddress, SERVER_WALLET_ABI, signer);
      
      // Test connection by calling a view function
      await contractInstance.getBalance();
      
      setContract(contractInstance);
      setSuccess('Successfully connected to contract!');
      
      // Load contract balance
      await loadContractBalance(contractInstance);
      
    } catch (err: any) {
      setError(err.message || 'Failed to connect to contract');
      console.error('Contract connection error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadContractBalance = async (contractInstance?: ethers.Contract) => {
    const contractToUse = contractInstance || contract;
    if (!contractToUse) return;

    try {
      const balance = await contractToUse.getBalance();
      setContractBalance(ethers.formatEther(balance));
    } catch (err) {
      console.error('Error loading contract balance:', err);
    }
  };

  const handleDeposit = async () => {
    if (!contract || !depositAmount) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const amountWei = ethers.parseEther(depositAmount);
      const tx = await contract.deposit({ value: amountWei });
      
      setSuccess(`Deposit transaction sent! Hash: ${tx.hash}`);
      
      await tx.wait();
      setSuccess(`Deposit confirmed! ${depositAmount} ETH deposited successfully.`);
      
      // Refresh contract balance
      await loadContractBalance();
      setDepositAmount('');
      
    } catch (err: any) {
      setError(err.message || 'Deposit failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!contract || !withdrawAmount) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const amountWei = ethers.parseEther(withdrawAmount);
      const tx = await contract.withdraw(amountWei);
      
      setSuccess(`Withdrawal transaction sent! Hash: ${tx.hash}`);
      
      await tx.wait();
      setSuccess(`Withdrawal confirmed! ${withdrawAmount} ETH withdrawn successfully.`);
      
      // Refresh contract balance
      await loadContractBalance();
      setWithdrawAmount('');
      
    } catch (err: any) {
      setError(err.message || 'Withdrawal failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!contract || !transferTo || !transferAmount) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!ethers.isAddress(transferTo)) {
        throw new Error('Invalid recipient address');
      }

      const amountWei = ethers.parseEther(transferAmount);
      const tx = await contract.transfer(transferTo, amountWei);
      
      setSuccess(`Transfer transaction sent! Hash: ${tx.hash}`);
      
      await tx.wait();
      setSuccess(`Transfer confirmed! ${transferAmount} ETH sent to ${transferTo}`);
      
      // Refresh contract balance
      await loadContractBalance();
      setTransferTo('');
      setTransferAmount('');
      
    } catch (err: any) {
      setError(err.message || 'Transfer failed');
    } finally {
      setIsLoading(false);
    }
  };

  const deployNewContract = async () => {
    if (!provider) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      setSuccess('Contract deployment would be handled here. This requires the compiled contract bytecode.');
      // In a real implementation, you would:
      // 1. Import the contract factory
      // 2. Deploy with constructor parameters
      // 3. Wait for deployment
      // 4. Set the contract address
      
    } catch (err: any) {
      setError(err.message || 'Deployment failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="smart-contracts">
        <div className="not-connected">
          <h2>Wallet Not Connected</h2>
          <p>Please connect your wallet to interact with smart contracts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="smart-contracts">
      <div className="contracts-header">
        <h1>Smart Contract Interactions</h1>
        <p>Interact with your ServerWallet smart contract</p>
      </div>

      {/* Contract Connection Section */}
      <div className="section-card connection-section">
        <h2>Connect to Contract</h2>
        <div className="connection-form">
          <div className="form-group">
            <label htmlFor="contractAddress">Contract Address</label>
            <input
              type="text"
              id="contractAddress"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="0x..."
              className="form-input"
            />
          </div>
          <div className="connection-actions">
            <button
              onClick={connectToContract}
              disabled={isLoading || !contractAddress}
              className="connect-button"
            >
              {isLoading ? 'Connecting...' : 'Connect to Contract'}
            </button>
            <button
              onClick={deployNewContract}
              disabled={isLoading}
              className="deploy-button"
            >
              Deploy New Contract
            </button>
          </div>
        </div>
        
        {contract && (
          <div className="contract-info">
            <div className="info-card">
              <h3>Contract Connected</h3>
              <div className="contract-details">
                <div className="detail-row">
                  <span className="label">Address:</span>
                  <span className="value">{contractAddress}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Balance:</span>
                  <span className="value">
                    {contractBalance ? `${parseFloat(contractBalance).toFixed(4)} ETH` : 'Loading...'}
                  </span>
                </div>
              </div>
              <button onClick={() => loadContractBalance()} className="refresh-balance">
                Refresh Balance
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Contract Interactions */}
      {contract && (
        <div className="interactions-grid">
          
          {/* Deposit Section */}
          <div className="section-card deposit-section">
            <h2>Deposit ETH</h2>
            <div className="interaction-form">
              <div className="form-group">
                <label htmlFor="depositAmount">Amount (ETH)</label>
                <input
                  type="number"
                  id="depositAmount"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.0"
                  step="0.001"
                  min="0"
                  className="form-input"
                />
              </div>
              <button
                onClick={handleDeposit}
                disabled={isLoading || !depositAmount}
                className="action-button deposit-button"
              >
                {isLoading ? 'Processing...' : 'Deposit'}
              </button>
            </div>
          </div>

          {/* Withdraw Section */}
          <div className="section-card withdraw-section">
            <h2>Withdraw ETH</h2>
            <div className="interaction-form">
              <div className="form-group">
                <label htmlFor="withdrawAmount">Amount (ETH)</label>
                <input
                  type="number"
                  id="withdrawAmount"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.0"
                  step="0.001"
                  min="0"
                  className="form-input"
                />
              </div>
              <button
                onClick={handleWithdraw}
                disabled={isLoading || !withdrawAmount}
                className="action-button withdraw-button"
              >
                {isLoading ? 'Processing...' : 'Withdraw'}
              </button>
            </div>
          </div>

          {/* Transfer Section */}
          <div className="section-card transfer-section">
            <h2>Transfer ETH</h2>
            <div className="interaction-form">
              <div className="form-group">
                <label htmlFor="transferTo">Recipient Address</label>
                <input
                  type="text"
                  id="transferTo"
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  placeholder="0x..."
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="transferAmount">Amount (ETH)</label>
                <input
                  type="number"
                  id="transferAmount"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="0.0"
                  step="0.001"
                  min="0"
                  className="form-input"
                />
              </div>
              <button
                onClick={handleTransfer}
                disabled={isLoading || !transferTo || !transferAmount}
                className="action-button transfer-button"
              >
                {isLoading ? 'Processing...' : 'Transfer'}
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Status Messages */}
      {error && (
        <div className="status-message error-message">
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div className="status-message success-message">
          <strong>Success:</strong> {success}
        </div>
      )}
    </div>
  );
};
