"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import contractInfo from "../lib/contractInfo.json";

interface Web3ContextType {
  account: string | null;
  chainId: number | null;
  targetChainId: number;
  isCorrectNetwork: boolean;
  isConnecting: boolean;
  isAdmin: boolean;
  isIssuer: boolean;
  contract: ethers.Contract | null;
  readOnlyContract: ethers.Contract | null;
  provider: ethers.BrowserProvider | null;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const TARGET_CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "31337", 10);
const DEFAULT_RPC = process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545";

const Web3Context = createContext<Web3ContextType>({
  account: null,
  chainId: null,
  targetChainId: TARGET_CHAIN_ID,
  isCorrectNetwork: true,
  isConnecting: false,
  isAdmin: false,
  isIssuer: false,
  contract: null,
  readOnlyContract: null,
  provider: null,
  error: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  switchNetwork: async () => {},
  refreshRole: async () => {},
});

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [readOnlyContract, setReadOnlyContract] = useState<ethers.Contract | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isIssuer, setIsIssuer] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const contractAddress = contractInfo?.address || "";
  const contractAbi = contractInfo?.abi || [];

  // 1. Initialize Read-Only Provider & Contract
  useEffect(() => {
    if (!contractAddress || contractAbi.length === 0) return;

    try {
      const readOnlyProv = new ethers.JsonRpcProvider(DEFAULT_RPC);

      const roContract = new ethers.Contract(contractAddress, contractAbi, readOnlyProv);
      setReadOnlyContract(roContract);
    } catch (err) {
      console.warn("Read-only contract init notice:", err);
    }
  }, [contractAddress]);

  // 2. Check Role Function
  const checkRole = useCallback(
    async (userAccount: string, activeContract: ethers.Contract) => {
      if (!userAccount || !activeContract) return;

      try {
        const ownerAddress: string = await activeContract.owner();
        const adminFlag = ownerAddress.toLowerCase() === userAccount.toLowerCase();
        setIsAdmin(adminFlag);

        const issuerFlag: boolean = await activeContract.isAuthorizedIssuer(userAccount);
        setIsIssuer(issuerFlag);
      } catch (err) {
        console.error("Failed to query contract roles:", err);
      }
    },
    []
  );

  // 3. Connect Wallet
  const connectWallet = async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      setError("MetaMask wallet is not installed in your browser.");
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      const browserProvider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await browserProvider.send("eth_requestAccounts", []);

      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const network = await browserProvider.getNetwork();
      const currentChainId = Number(network.chainId);

      const signer = await browserProvider.getSigner();
      const userAddress = await signer.getAddress();

      setAccount(userAddress);
      setChainId(currentChainId);
      setProvider(browserProvider);

      if (contractAddress && contractAbi.length > 0) {
        const signedContract = new ethers.Contract(contractAddress, contractAbi, signer);
        setContract(signedContract);
        await checkRole(userAddress, signedContract);
      }
    } catch (err: any) {
      console.error("Wallet connection error:", err);
      setError(err?.message || "Failed to connect wallet.");
    } finally {
      setIsConnecting(false);
    }
  };

  // 4. Disconnect Wallet
  const disconnectWallet = () => {
    setAccount(null);
    setContract(null);
    setIsAdmin(false);
    setIsIssuer(false);
  };

  // 5. Switch Network
  const switchNetwork = async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) return;

    const hexChainId = "0x" + TARGET_CHAIN_ID.toString(16);
    try {
      await (window as any).ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexChainId }],
      });
    } catch (switchError: any) {
      // Chain not added to MetaMask
      if (switchError.code === 4902) {
        try {
          await (window as any).ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: hexChainId,
                chainName: "ChainCred Localhost",
                rpcUrls: ["http://127.0.0.1:8545"],
                nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
              },
            ],
          });
        } catch (addError) {
          console.error("Failed to add network:", addError);
        }
      }
    }
  };

  const refreshRole = async () => {
    if (account && contract) {
      await checkRole(account, contract);
    }
  };

  // 6. Listen for Account and Network Changes
  useEffect(() => {
    if (typeof window === "undefined" || !(window as any).ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        connectWallet();
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    (window as any).ethereum.on("accountsChanged", handleAccountsChanged);
    (window as any).ethereum.on("chainChanged", handleChainChanged);

    return () => {
      if ((window as any).ethereum.removeListener) {
        (window as any).ethereum.removeListener("accountsChanged", handleAccountsChanged);
        (window as any).ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [account, contractAddress]);

  const isCorrectNetwork = chainId === null || chainId === TARGET_CHAIN_ID;

  return (
    <Web3Context.Provider
      value={{
        account,
        chainId,
        targetChainId: TARGET_CHAIN_ID,
        isCorrectNetwork,
        isConnecting,
        isAdmin,
        isIssuer,
        contract,
        readOnlyContract,
        provider,
        error,
        connectWallet,
        disconnectWallet,
        switchNetwork,
        refreshRole,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
