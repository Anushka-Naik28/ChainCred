"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShieldCheck, ArrowRight, Database, CheckCircle2, Lock } from "lucide-react";

export default function VerificationSearchPage() {
  const router = useRouter();
  const [credentialId, setCredentialId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = credentialId.trim();
    if (!cleaned) return;

    // If user enters a 42-character wallet address instead of a 66-character credential ID
    if (cleaned.length === 42 && cleaned.startsWith("0x")) {
      router.push(`/student`);
    } else {
      router.push(`/verify/${cleaned}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      
      {/* Title Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-mono">
          <ShieldCheck size={14} className="text-brand-400" />
          <span>Public Ethereum Credential Verifier</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-100 tracking-tight">
          Verify an Academic Credential
        </h1>

        <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
          Verify any degree, certificate, or academic credential directly on the Ethereum blockchain. No wallet authentication required.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 shadow-2xl space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-semibold text-gray-300 mb-2 uppercase">
              Credential Identifier (ID / Hash)
            </label>
            <div className="relative">
              <Search size={18} className="absolute left-4 top-3.5 text-gray-500" />
              <input
                type="text"
                required
                placeholder="Enter 66-character Credential ID (e.g. 0x9f83a...)"
                value={credentialId}
                onChange={(e) => setCredentialId(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-900 border border-gray-800 text-sm font-mono text-gray-100 placeholder-gray-500 focus:outline-none focus:border-brand-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-lg shadow-brand-500/25 transition flex items-center justify-center gap-2"
          >
            <span>Query Smart Contract Verification</span>
            <ArrowRight size={18} />
          </button>
        </form>
      </div>

      {/* Verification Standard Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
        <div className="glass-card p-5 rounded-2xl border border-gray-800 text-center space-y-2">
          <Database size={24} className="text-brand-400 mx-auto" />
          <h3 className="text-sm font-bold text-gray-200">Decentralized Query</h3>
          <p className="text-[11px] text-gray-400">Direct read-only call to Ethereum smart contract data.</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-gray-800 text-center space-y-2">
          <CheckCircle2 size={24} className="text-emerald-400 mx-auto" />
          <h3 className="text-sm font-bold text-gray-200">Real-Time Status</h3>
          <p className="text-[11px] text-gray-400">Instant determination of VALID or REVOKED credential state.</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-gray-800 text-center space-y-2">
          <Lock size={24} className="text-indigo-400 mx-auto" />
          <h3 className="text-sm font-bold text-gray-200">Zero Privacy Leak</h3>
          <p className="text-[11px] text-gray-400">Privacy preserved using off-chain SHA-256 integrity hashes.</p>
        </div>
      </div>
    </div>
  );
}
