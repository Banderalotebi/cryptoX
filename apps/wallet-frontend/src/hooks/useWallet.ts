import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import '../types/wallet';

interface WalletState {
  account: string | null;
  balance: string | null;
  provider: ethers.BrowserProvider | null;
  isConnected: boolean;
  chainId: number | null;
}

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    account: null,
    balance: null,
    provider: null,
    isConnected: false,
    chainId: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      const provider = await detectEthereumProvider();
      if (provider && window.ethereum) {
        const ethersProvider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await ethersProvider.listAccounts();
        
        if (accounts.length > 0) {
          const account = accounts[0].address;
          const balance = await ethersProvider.getBalance(account);
          const network = await ethersProvider.getNetwork();
          
          setWalletState({
            account,
            balance: ethers.formatEther(balance),
            provider: ethersProvider,
            isConnected: true,
            chainId: Number(network.chainId),
          });
        }
      }
    } catch (err) {
      console.error('Error checking wallet connection:', err);
      setError('Failed to check wallet connection');
    }
  };

  const connectWallet = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const provider = await detectEthereumProvider();
      
      if (!provider) {
        throw new Error('MetaMask is not installed. Please install MetaMask to use this application.');
      }

      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      await ethersProvider.send('eth_requestAccounts', []);
      
      const accounts = await ethersProvider.listAccounts();
      const account = accounts[0].address;
      const balance = await ethersProvider.getBalance(account);
      const network = await ethersProvider.getNetwork();
      
      setWalletState({
        account,
        balance: ethers.formatEther(balance),
        provider: ethersProvider,
        isConnected: true,
        chainId: Number(network.chainId),
      });
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      console.error('Error connecting wallet:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setWalletState({
      account: null,
      balance: null,
      provider: null,
      isConnected: false,
      chainId: null,
    });
  };

  const refreshBalance = async () => {
    if (walletState.provider && walletState.account) {
      try {
        const balance = await walletState.provider.getBalance(walletState.account);
        setWalletState(prev => ({
          ...prev,
          balance: ethers.formatEther(balance),
        }));
      } catch (err) {
        console.error('Error refreshing balance:', err);
      }
    }
  };

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    isLoading,
    error,
  };
};
