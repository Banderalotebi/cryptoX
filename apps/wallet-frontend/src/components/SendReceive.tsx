import { useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../hooks/useWallet';
import './SendReceive.css';

export const SendReceive = () => {
  const { provider, account, isConnected, refreshBalance } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Send form state
  const [sendForm, setSendForm] = useState({
    to: '',
    amount: '',
    gasLimit: '21000',
  });

  const handleSendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !account) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const signer = await provider.getSigner();
      
      // Validate inputs
      if (!ethers.isAddress(sendForm.to)) {
        throw new Error('Invalid recipient address');
      }

      const amountWei = ethers.parseEther(sendForm.amount);
      
      // Check balance
      const balance = await provider.getBalance(account);
      if (amountWei > balance) {
        throw new Error('Insufficient balance');
      }

      // Send transaction
      const tx = await signer.sendTransaction({
        to: sendForm.to,
        value: amountWei,
        gasLimit: parseInt(sendForm.gasLimit),
      });

      setSuccess(`Transaction sent! Hash: ${tx.hash}`);
      
      // Wait for confirmation
      await tx.wait();
      setSuccess(`Transaction confirmed! Hash: ${tx.hash}`);
      
      // Refresh balance
      await refreshBalance();
      
      // Reset form
      setSendForm({ to: '', amount: '', gasLimit: '21000' });
      
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  const copyAddressToClipboard = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setSuccess('Address copied to clipboard!');
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  if (!isConnected) {
    return (
      <div className="send-receive">
        <div className="not-connected">
          <h2>Wallet Not Connected</h2>
          <p>Please connect your wallet to send and receive tokens.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="send-receive">
      <div className="send-receive-container">
        
        {/* Send Tokens Section */}
        <div className="section-card send-section">
          <h2>Send Tokens</h2>
          <form onSubmit={handleSendSubmit} className="send-form">
            <div className="form-group">
              <label htmlFor="recipient">Recipient Address</label>
              <input
                type="text"
                id="recipient"
                value={sendForm.to}
                onChange={(e) => setSendForm(prev => ({ ...prev, to: e.target.value }))}
                placeholder="0x..."
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="amount">Amount (ETH)</label>
              <input
                type="number"
                id="amount"
                value={sendForm.amount}
                onChange={(e) => setSendForm(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.0"
                step="0.000001"
                min="0"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="gasLimit">Gas Limit</label>
              <input
                type="number"
                id="gasLimit"
                value={sendForm.gasLimit}
                onChange={(e) => setSendForm(prev => ({ ...prev, gasLimit: e.target.value }))}
                min="21000"
                required
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="send-button"
            >
              {isLoading ? 'Sending...' : 'Send Transaction'}
            </button>
          </form>
        </div>

        {/* Receive Tokens Section */}
        <div className="section-card receive-section">
          <h2>Receive Tokens</h2>
          <div className="receive-content">
            <p>Share your wallet address to receive tokens:</p>
            
            <div className="address-display">
              <div className="address-text">
                {account}
              </div>
              <button
                onClick={copyAddressToClipboard}
                className="copy-button"
              >
                Copy Address
              </button>
            </div>

            <div className="qr-placeholder">
              <div className="qr-code-box">
                <p>QR Code</p>
                <p className="qr-note">
                  Scan this QR code with a mobile wallet to send tokens to your address
                </p>
              </div>
            </div>

            <div className="receive-tips">
              <h3>Tips for Receiving Tokens:</h3>
              <ul>
                <li>Always verify the sender's identity</li>
                <li>Double-check the token contract address</li>
                <li>Be aware of network fees</li>
                <li>Confirm transactions on the blockchain explorer</li>
              </ul>
            </div>
          </div>
        </div>

      </div>

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
