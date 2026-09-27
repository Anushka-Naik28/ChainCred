"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Search, 
  Building2, 
  GraduationCap, 
  UserCheck, 
  Lock, 
  Zap, 
  CheckCircle2, 
  ArrowRight,
  Database,
  Key,
  Globe
} from "lucide-react";
import { useWeb3 } from "@/context/Web3Context";

export default function Home() {
  const router = useRouter();
  const { readOnlyContract, account, connectWallet, isIssuer, isAdmin } = useWeb3();
  
  const [searchId, setSearchId] = useState("");
  const [totalCredentials, setTotalCredentials] = useState<number | null>(null);
  const [totalIssuers, setTotalIssuers] = useState<number | null>(null);

  useEffect(() => {
    async function fetchStats() {
      if (!readOnlyContract) return;
      try {
        const count = await readOnlyContract.getCredentialCount();
        setTotalCredentials(Number(count));

        const issuers = await readOnlyContract.getAllIssuers();
        setTotalIssuers(issuers.length);
      } catch (err) {
        console.warn("Error fetching homepage stats:", err);
      }
    }
    fetchStats();
  }, [readOnlyContract]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      router.push(`/verify/${searchId.trim()}`);
    }
  };

  return (
    <div className="space-y-24 pb-16">
      
      {/* HERO SECTION */}
      <section className="relative pt-16 pb-12 sm:pt-24 sm:pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse-slow">
            <ShieldCheck size={14} className="text-brand-400" />
            <span>Verifiable Academic Credentials Network</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-100 tracking-tight max-w-4xl mx-auto leading-tight">
            Instant, Tamper-Proof <br className="hidden sm:inline" />
            <span className="text-gradient">Academic Credentials</span> on Ethereum
          </h1>

          <p className="mt-6 text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Eliminate degree fraud. Educational institutions issue cryptographically signed, 
            verifiable credentials directly to students&apos; blockchain wallets. 
            Recruiters verify credentials in seconds without contacting issuing universities.
          </p>

          {/* Quick Search Verification Box */}
          <form onSubmit={handleSearch} className="mt-10 max-w-2xl mx-auto relative group">
            <div className="glass-panel p-2 rounded-2xl border border-gray-800 shadow-2xl flex items-center gap-2 group-focus-within:border-brand-500/60 transition">
              <div className="pl-3 text-gray-400">
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder="Enter 66-character Credential ID (0x...)"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="w-full bg-transparent px-2 py-3 text-sm text-gray-100 placeholder-gray-500 font-mono focus:outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-brand-500/25 transition shrink-0 flex items-center gap-1.5"
              >
                Verify Now
                <ArrowRight size={16} />
              </button>
            </div>
          </form>

          {/* Call to Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {!account ? (
              <button
                onClick={connectWallet}
                className="px-6 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-200 text-sm font-semibold transition flex items-center gap-2"
              >
                <Key size={16} className="text-brand-400" />
                Connect Wallet
              </button>
            ) : (
              <Link
                href={isIssuer ? "/issuer" : isAdmin ? "/admin" : "/student"}
                className="px-6 py-3 rounded-xl bg-brand-600/20 hover:bg-brand-600/30 border border-brand-500/40 text-brand-300 text-sm font-semibold transition flex items-center gap-2"
              >
                <UserCheck size={16} />
                Open Your Dashboard ({isAdmin ? "Admin" : isIssuer ? "Issuer" : "Student"})
              </Link>
            )}

            <Link
              href="/verify"
              className="px-6 py-3 rounded-xl bg-gray-900/60 hover:bg-gray-800/80 text-gray-300 text-sm font-semibold transition flex items-center gap-2 border border-gray-800"
            >
              <Globe size={16} className="text-emerald-400" />
              Public Verification Portal
            </Link>
          </div>

          {/* Live Metrics Grid */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="glass-card p-5 rounded-2xl text-center border border-gray-800">
              <span className="text-3xl font-extrabold text-gradient font-mono">
                {totalCredentials !== null ? totalCredentials : "3+"}
              </span>
              <p className="text-xs text-gray-400 font-mono mt-1">Credentials Issued</p>
            </div>
            <div className="glass-card p-5 rounded-2xl text-center border border-gray-800">
              <span className="text-3xl font-extrabold text-gradient-cyan font-mono">
                {totalIssuers !== null ? totalIssuers : "2+"}
              </span>
              <p className="text-xs text-gray-400 font-mono mt-1">Authorized Universities</p>
            </div>
            <div className="glass-card p-5 rounded-2xl text-center border border-gray-800 col-span-2 md:col-span-1">
              <span className="text-3xl font-extrabold text-emerald-400 font-mono">100%</span>
              <p className="text-xs text-gray-400 font-mono mt-1">Tamper-Proof Integrity</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-mono font-bold text-brand-400 uppercase tracking-widest mb-2">
            Architecture Workflow
          </h2>
          <h3 className="text-3xl font-bold text-gray-100">How ChainCred Operates</h3>
          <p className="text-xs text-gray-400 mt-2">
            A seamless, secure 4-step lifecycle powered by Ethereum smart contracts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-gray-800 relative">
            <div className="w-10 h-10 rounded-xl bg-brand-600/20 text-brand-400 font-mono font-bold text-lg flex items-center justify-center mb-4">
              01
            </div>
            <h4 className="text-base font-bold text-gray-200 mb-2">University Authorization</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Platform owner authorizes verified educational institutions on the smart contract. Arbitrary wallets cannot issue credentials.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-gray-800 relative">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 font-mono font-bold text-lg flex items-center justify-center mb-4">
              02
            </div>
            <h4 className="text-base font-bold text-gray-200 mb-2">Off-Chain Hash Generation</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Academic details are hashed off-chain using SHA-256. Zero private student data is leaked onto the public blockchain.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-gray-800 relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 font-mono font-bold text-lg flex items-center justify-center mb-4">
              03
            </div>
            <h4 className="text-base font-bold text-gray-200 mb-2">On-Chain Issuance</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Authorized university signs transaction. Unique Credential ID is anchored to the student&apos;s wallet address.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-gray-800 relative">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 text-cyan-400 font-mono font-bold text-lg flex items-center justify-center mb-4">
              04
            </div>
            <h4 className="text-base font-bold text-gray-200 mb-2">Instant Verifier Check</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Recruiters query the public contract using Credential ID. Instant VALID / REVOKED / NOT FOUND result with zero friction.
            </p>
          </div>
        </div>
      </section>

      {/* WHY BLOCKCHAIN SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-gray-800 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono">
              <Lock size={14} /> Zero Data Privacy Leaks
            </div>
            <h3 className="text-3xl font-extrabold text-gray-100 leading-tight">
              Why Blockchain Instead of a Traditional Database?
            </h3>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Traditional databases are centralized single points of failure subject to database corruption, unauthorized record modification, and university closure. 
              ChainCred solves this by combining off-chain data privacy with immutable on-chain cryptography.
            </p>

            <ul className="space-y-3 text-xs sm:text-sm text-gray-300">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span><strong>Cryptographic Tamper-Evidence:</strong> Records cannot be falsified or altered post-issuance.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span><strong>Revocation Control:</strong> Only the original issuing university can revoke its credential.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span><strong>Decentralized Student Ownership:</strong> Credentials reside directly in student wallet addresses.</span>
              </li>
            </ul>
          </div>

          {/* Visual Code Box */}
          <div className="bg-gray-950 p-6 rounded-2xl border border-gray-800 font-mono text-xs text-gray-300 space-y-3">
            <div className="flex items-center justify-between text-gray-400 border-b border-gray-900 pb-2">
              <span>Solidity Smart Contract Logic</span>
              <span className="text-[10px] text-brand-400">ChainCred.sol</span>
            </div>
            <pre className="text-brand-300 overflow-x-auto text-[11px] leading-relaxed">
{`struct Credential {
  bytes32 id;
  address recipient;
  address issuer;
  string credentialType;
  string program;
  bytes32 credentialHash;
  CredentialStatus status;
}

function verifyCredential(bytes32 id)
  external view returns (bool isValid, ...)
`}
            </pre>
            <div className="pt-2 border-t border-gray-900 flex items-center justify-between text-[11px] text-gray-400">
              <span className="flex items-center gap-1"><Database size={12}/> Pure Read-Only Query</span>
              <span className="text-emerald-400 font-bold">0 ETH Gas Required</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
