import React from "react";
import Link from "next/link";
import { ShieldCheck, ExternalLink, Github, Code2, Database } from "lucide-react";
import contractInfo from "../lib/contractInfo.json";
import { shortenAddress } from "@/lib/utils";

export const Footer: React.FC = () => {
  const contractAddress = contractInfo?.address || "0x0000000000000000000000000000000000000000";

  return (
    <footer className="border-t border-gray-800/80 bg-gray-950/90 text-gray-400 py-12 text-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Column 1: Brand */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-500/40 flex items-center justify-center">
              <ShieldCheck size={18} className="text-brand-400" />
            </div>
            <span className="font-extrabold text-lg text-gray-100 tracking-tight">
              Chain<span className="text-gradient">Cred</span>
            </span>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed max-w-md">
            ChainCred is an Ethereum-compatible decentralized academic credential network. 
            Educational institutions issue tamper-evident credentials directly to students&apos; blockchain wallets. 
            Verifiers can verify academic credentials instantly on-chain with zero privacy leaks.
          </p>
          <div className="flex items-center gap-2 text-xs font-mono text-gray-400 bg-gray-900/60 p-2.5 rounded-xl border border-gray-800 w-fit">
            <Database size={14} className="text-brand-400 shrink-0" />
            <span>Smart Contract:</span>
            <code className="text-gray-300 font-semibold">{shortenAddress(contractAddress, 6)}</code>
          </div>
        </div>

        {/* Column 2: Navigation */}
        <div className="flex flex-col gap-2.5">
          <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider font-mono">Platform Navigation</h4>
          <Link href="/" className="hover:text-brand-300 text-xs transition">Home</Link>
          <Link href="/verify" className="hover:text-brand-300 text-xs transition">Public Verification</Link>
          <Link href="/student" className="hover:text-brand-300 text-xs transition">Student Dashboard</Link>
          <Link href="/issuer" className="hover:text-brand-300 text-xs transition">Issuer Portal</Link>
          <Link href="/admin" className="hover:text-brand-300 text-xs transition">Admin Console</Link>
        </div>

        {/* Column 3: Tech Stack */}
        <div className="flex flex-col gap-2.5">
          <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider font-mono">Architecture</h4>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Code2 size={14} className="text-emerald-400" /> Solidity & Hardhat
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <ShieldCheck size={14} className="text-indigo-400" /> OpenZeppelin Security
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <ExternalLink size={14} className="text-cyan-400" /> Next.js & Ethers v6
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-gray-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
        <p>© 2026 ChainCred Decentralized Network. Portfolio Project Built from Scratch.</p>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Ethereum Testnet Operational
          </span>
        </div>
      </div>
    </footer>
  );
};
