import { Route, Routes, Link } from 'react-router-dom';
import { WalletDashboard } from '../components/WalletDashboard';
import { SendReceive } from '../components/SendReceive';
import { TransactionHistory } from '../components/TransactionHistory';
import './app.module.css';

export function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-brand">
          <h1>CryptoX Wallet</h1>
        </div>
        <div className="nav-links">
          <Link to="/" className="nav-link">Dashboard</Link>
          <Link to="/send-receive" className="nav-link">Send/Receive</Link>
          <Link to="/transactions" className="nav-link">Transactions</Link>
          <Link to="/contracts" className="nav-link">Smart Contracts</Link>
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<WalletDashboard />} />
          <Route path="/send-receive" element={<SendReceive />} />
          <Route path="/transactions" element={<TransactionHistory />} />
          <Route
            path="/contracts"
            element={
              <div className="coming-soon">
                <h2>Smart Contract Interactions</h2>
                <p>Coming soon! Interact with smart contracts here.</p>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
