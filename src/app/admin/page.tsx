"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  ShieldCheck, 
  UserPlus, 
  UserX, 
  Building2, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Database,
  Lock
} from "lucide-react";
import { useWeb3 } from "@/context/Web3Context";
import { shortenAddress } from "@/lib/utils";

export default function AdminConsole() {
  const { account, connectWallet, isAdmin, contract, readOnlyContract, refreshRole } = useWeb3();

  const [issuers, setIssuers] = useState<string[]>([]);
  const [newIssuerAddress, setNewIssuerAddress] = useState("");
  const [totalCredentialsCount, setTotalCredentialsCount] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchAdminData = useCallback(async () => {
    if (!readOnlyContract) return;

    try {
      setLoading(true);
      const list: string[] = await readOnlyContract.getAllIssuers();
      setIssuers(list);

      const count = await readOnlyContract.getCredentialCount();
      setTotalCredentialsCount(Number(count));
    } catch (err) {
      console.error("Failed to fetch admin console data:", err);
    } finally {
      setLoading(false);
    }
  }, [readOnlyContract]);

  useEffect(() => {
    if (account) {
      fetchAdminData();
    }
  }, [account, fetchAdminData]);

  // Handle Add Issuer
  const handleAddIssuer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract || !newIssuerAddress) return;

    if (!newIssuerAddress.startsWith("0x") || newIssuerAddress.length !== 42) {
      setError("Please enter a valid 42-character Ethereum address.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMsg(null);

      const tx = await contract.addIssuer(newIssuerAddress);
      await tx.wait();

      setSuccessMsg(`Institution ${shortenAddress(newIssuerAddress)} successfully authorized!`);
      setNewIssuerAddress("");
      await fetchAdminData();
      await refreshRole();
    } catch (err: any) {
      console.error("Add issuer error:", err);
      setError(err?.reason || err?.message || "Failed to add issuer address.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Remove Issuer
  const handleRemoveIssuer = async (issuerAddr: string) => {
    if (!contract) return;

    try {
      setSubmitting(true);
      setError(null);
      setSuccessMsg(null);

      const tx = await contract.removeIssuer(issuerAddr);
      await tx.wait();

      setSuccessMsg(`Institution ${shortenAddress(issuerAddr)} removed from authorized issuers.`);
      await fetchAdminData();
      await refreshRole();
    } catch (err: any) {
      console.error("Remove issuer error:", err);
      setError(err?.reason || err?.message || "Failed to remove issuer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-brand-600 to-indigo-500 p-0.5 shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-gray-950 rounded-[14px] flex items-center justify-center text-amber-400">
              <ShieldCheck size={30} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-gray-100">Platform Admin Console</h1>
              {isAdmin && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-xs font-mono border border-amber-500/30">
                  Platform Owner
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Authorize educational institutions, manage issuer access control, and monitor network statistics.
            </p>
          </div>
        </div>

        {account && (
          <button
            onClick={fetchAdminData}
            className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 text-xs font-mono transition flex items-center gap-2"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh Admin Data
          </button>
        )}
      </div>

      {/* Access Restriction Check */}
      {!account ? (
        <div className="glass-card p-12 rounded-3xl text-center border border-gray-800 max-w-xl mx-auto space-y-4">
          <Lock size={40} className="text-amber-400 mx-auto" />
          <h2 className="text-xl font-bold text-gray-200">Admin Wallet Connection Required</h2>
          <p className="text-xs text-gray-400">
            Connect the deployer/owner wallet address to access administrative controls.
          </p>
          <button
            onClick={connectWallet}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs transition"
          >
            Connect Wallet
          </button>
        </div>
      ) : !isAdmin ? (
        <div className="glass-card p-10 rounded-3xl border border-rose-500/30 bg-rose-500/10 text-rose-200 space-y-4 max-w-2xl mx-auto text-center">
          <Lock size={48} className="text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold">Access Denied: Owner Only</h2>
          <p className="text-xs leading-relaxed max-w-md mx-auto text-rose-300">
            Connected address <code className="font-mono bg-rose-950/80 px-2 py-0.5 rounded text-rose-200">{shortenAddress(account, 6)}</code> does not possess smart contract ownership permissions.
          </p>
          <p className="text-xs text-gray-400">
            Only the contract deployer can add or remove authorized educational institution issuers.
          </p>
        </div>
      ) : (
        /* Main Admin Content */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Add Issuer Form */}
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-3xl border border-gray-800 space-y-4">
              <div className="flex items-center gap-2.5 text-gray-100 border-b border-gray-800 pb-3">
                <UserPlus size={20} className="text-amber-400" />
                <h2 className="text-base font-bold">Authorize University Issuer</h2>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle size={16} />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleAddIssuer} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-semibold text-gray-300 mb-1.5 uppercase">
                    Institution Wallet Address
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0x..."
                    value={newIssuerAddress}
                    onChange={(e) => setNewIssuerAddress(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 text-xs font-mono text-gray-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-brand-600 hover:from-amber-400 hover:to-brand-500 text-gray-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <RefreshCw size={14} className="animate-spin" /> : <UserPlus size={16} />}
                  <span>{submitting ? "Executing Transaction..." : "Authorize Institution Address"}</span>
                </button>
              </form>
            </div>

            {/* Platform Quick Stats Card */}
            <div className="glass-card p-6 rounded-3xl border border-gray-800 space-y-3">
              <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">Platform Metrics</h3>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-gray-950 p-3 rounded-xl border border-gray-800">
                  <span className="text-xs text-gray-400">Total Issuers</span>
                  <p className="text-2xl font-mono font-bold text-amber-400">{issuers.length}</p>
                </div>
                <div className="bg-gray-950 p-3 rounded-xl border border-gray-800">
                  <span className="text-xs text-gray-400">Total Credentials</span>
                  <p className="text-2xl font-mono font-bold text-brand-400">{totalCredentialsCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Registered Issuers Table */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-gray-800 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Building2 size={20} className="text-brand-400" />
                <h2 className="text-base font-bold text-gray-100">Registered Educational Institutions</h2>
              </div>
              <span className="text-xs font-mono text-gray-400">{issuers.length} Authorized</span>
            </div>

            {issuers.length === 0 ? (
              <p className="text-xs text-gray-400 py-8 text-center">No educational institution issuers registered yet.</p>
            ) : (
              <div className="space-y-3">
                {issuers.map((issuerAddr, idx) => (
                  <div
                    key={issuerAddr}
                    className="glass-card p-4 rounded-2xl border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-gray-900 text-gray-400 text-xs font-mono font-bold flex items-center justify-center border border-gray-800">
                        {idx + 1}
                      </span>
                      <div>
                        <code className="text-xs font-mono text-gray-200 font-semibold">{issuerAddr}</code>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                            <CheckCircle size={10} /> Active Issuer
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveIssuer(issuerAddr)}
                      disabled={submitting}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-medium transition flex items-center gap-1 shrink-0"
                    >
                      <UserX size={14} />
                      Deauthorize
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
