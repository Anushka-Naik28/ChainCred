"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useWeb3 } from "@/context/Web3Context";

export const NetworkBanner: React.FC = () => {
  const { isCorrectNetwork, targetChainId, switchNetwork, account } = useWeb3();

  if (!account || isCorrectNetwork) return null;

  return (
    <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-3 text-amber-300 text-sm flex flex-wrap items-center justify-between gap-3 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <AlertTriangle className="text-amber-400 shrink-0" size={18} />
        <span>
          <strong>Wrong Network Detected!</strong> Please switch your wallet to Chain ID{" "}
          <code className="bg-amber-950/60 px-1.5 py-0.5 rounded text-amber-200 font-mono text-xs">
            {targetChainId} (Localhost / Sepolia)
          </code>{" "}
          to interact with ChainCred.
        </span>
      </div>
      <button
        onClick={switchNetwork}
        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-950 font-semibold text-xs transition flex items-center gap-1.5 shadow-sm"
      >
        <RefreshCw size={14} />
        Switch Network
      </button>
    </div>
  );
};
