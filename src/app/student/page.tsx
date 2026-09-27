"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  GraduationCap, 
  Wallet, 
  Search, 
  RefreshCw, 
  ShieldCheck, 
  AlertCircle,
  Award,
  UserCheck
} from "lucide-react";
import { useWeb3 } from "@/context/Web3Context";
import { CredentialCard } from "@/components/CredentialCard";
import { CredentialData } from "@/types";
import { shortenAddress } from "@/lib/utils";

const DEMO_ALICE_ADDRESS = "0x90F79bf6EB2c4f870365E785982E1f101E93b906";
const DEMO_BOB_ADDRESS = "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65";

export default function StudentDashboard() {
  const { account, connectWallet, isConnecting, readOnlyContract } = useWeb3();

  const [targetWallet, setTargetWallet] = useState<string>(DEMO_ALICE_ADDRESS);
  const [credentials, setCredentials] = useState<CredentialData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Sync connected wallet when user connects MetaMask
  useEffect(() => {
    if (account) {
      setTargetWallet(account);
    }
  }, [account]);

  const fetchStudentCredentials = useCallback(async (queryAddress: string) => {
    if (!readOnlyContract || !queryAddress) return;

    try {
      setLoading(true);
      setError(null);

      // Call smart contract getter
      const ids: string[] = await readOnlyContract.getCredentialsByStudent(queryAddress);

      const creds: CredentialData[] = [];
      for (const id of ids) {
        const cred = await readOnlyContract.getCredential(id);
        creds.push({
          id: cred.id,
          recipient: cred.recipient,
          issuer: cred.issuer,
          credentialType: cred.credentialType,
          program: cred.program,
          credentialHash: cred.credentialHash,
          metadataURI: cred.metadataURI,
          issueDate: Number(cred.issueDate),
          expiryDate: Number(cred.expiryDate),
          status: Number(cred.status),
          exists: cred.exists,
        });
      }

      setCredentials(creds);
    } catch (err: any) {
      console.error("Error fetching student credentials:", err);
      setError("Failed to load credentials from the blockchain.");
    } finally {
      setLoading(false);
    }
  }, [readOnlyContract]);

  useEffect(() => {
    if (targetWallet) {
      fetchStudentCredentials(targetWallet);
    }
  }, [targetWallet, fetchStudentCredentials]);

  const filteredCredentials = credentials.filter(
    (c) =>
      c.program.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.credentialType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.issuer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-brand-500/20">
            <div className="w-full h-full bg-gray-950 rounded-[14px] flex items-center justify-center text-brand-400">
              <GraduationCap size={30} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-gray-100">Student Credentials</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/30">
                Ethereum Live
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              View and share tamper-evident academic credentials issued directly to student Ethereum wallets.
            </p>
          </div>
        </div>

        {/* Account Info or Connect */}
        <div className="flex flex-wrap items-center gap-3">
          {account ? (
            <div className="flex items-center gap-2 bg-gray-900/80 p-2.5 rounded-2xl border border-gray-800 font-mono text-xs text-gray-300">
              <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400">Connected</p>
                <p className="font-semibold text-gray-200">{shortenAddress(account, 4)}</p>
              </div>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 text-white font-semibold text-xs shadow-md transition flex items-center gap-2"
            >
              <Wallet size={14} />
              {isConnecting ? "Connecting..." : "Connect MetaMask"}
            </button>
          )}

          {/* Quick Demo Wallet Switchers */}
          <div className="flex items-center gap-1.5 bg-gray-950 p-1.5 rounded-xl border border-gray-800">
            <button
              onClick={() => setTargetWallet(DEMO_ALICE_ADDRESS)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                targetWallet.toLowerCase() === DEMO_ALICE_ADDRESS.toLowerCase()
                  ? "bg-brand-600 text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Alice (MIT Student)
            </button>
            <button
              onClick={() => setTargetWallet(DEMO_BOB_ADDRESS)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                targetWallet.toLowerCase() === DEMO_BOB_ADDRESS.toLowerCase()
                  ? "bg-brand-600 text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              Bob (Stanford Student)
            </button>
          </div>
        </div>
      </div>

      {/* Wallet Query Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <UserCheck size={16} className="text-brand-400 shrink-0" />
          <span className="text-gray-400 font-mono uppercase">Querying Student Wallet:</span>
          <input
            type="text"
            value={targetWallet}
            onChange={(e) => setTargetWallet(e.target.value)}
            placeholder="0x..."
            className="bg-gray-950 border border-gray-800 px-3 py-1.5 rounded-xl text-gray-200 font-mono text-xs w-full sm:w-80 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchStudentCredentials(targetWallet)}
            className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 transition flex items-center gap-1.5 font-mono"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search size={16} className="absolute left-3.5 top-3 text-gray-500" />
            <input
              type="text"
              placeholder="Filter credentials by program, degree, issuer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-gray-200 focus:outline-none focus:border-brand-500 transition"
            />
          </div>

          <div className="text-xs font-mono text-gray-400 flex items-center gap-2">
            <Award size={14} className="text-brand-400" />
            <span>Credentials Found: <strong>{credentials.length}</strong></span>
          </div>
        </div>

        {/* Credentials Grid */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw size={28} className="animate-spin text-brand-500 mx-auto" />
            <p className="text-xs font-mono text-gray-400">Querying Ethereum Smart Contract...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
            <AlertCircle size={20} className="shrink-0" />
            <p>{error}</p>
          </div>
        ) : filteredCredentials.length === 0 ? (
          <div className="glass-card p-12 rounded-3xl text-center border border-gray-800 space-y-3">
            <Award size={40} className="text-gray-600 mx-auto" />
            <h3 className="text-base font-bold text-gray-300">No Credentials Found</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              No academic credentials found on-chain for wallet address{" "}
              <code className="text-gray-200 font-mono break-all">{targetWallet}</code>.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCredentials.map((cred) => (
              <CredentialCard key={cred.id} credential={cred} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
