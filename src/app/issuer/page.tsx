"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Building2, 
  Plus, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle, 
  Ban, 
  GraduationCap, 
  Search,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useWeb3 } from "@/context/Web3Context";
import { IssueCredentialModal } from "@/components/IssueCredentialModal";
import { CredentialCard } from "@/components/CredentialCard";
import { CredentialData } from "@/types";
import { shortenAddress } from "@/lib/utils";

export default function IssuerDashboard() {
  const { account, connectWallet, isIssuer, contract, readOnlyContract } = useWeb3();

  const [issuedCredentials, setIssuedCredentials] = useState<CredentialData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Revocation state
  const [revokeTargetId, setRevokeTargetId] = useState<string | null>(null);
  const [revokeReason, setRevokeReason] = useState("Academic Dishonesty / Curriculum update");
  const [revoking, setRevoking] = useState(false);
  const [revokeError, setRevokeError] = useState<string | null>(null);

  const fetchIssuedCredentials = useCallback(async () => {
    if (!account || !readOnlyContract) return;

    try {
      setLoading(true);
      const ids: string[] = await readOnlyContract.getCredentialsByIssuer(account);

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

      setIssuedCredentials(creds);
    } catch (err) {
      console.error("Failed to fetch issued credentials:", err);
    } finally {
      setLoading(false);
    }
  }, [account, readOnlyContract]);

  useEffect(() => {
    if (account && isIssuer) {
      fetchIssuedCredentials();
    }
  }, [account, isIssuer, fetchIssuedCredentials]);

  // Revoke function handler
  const handleRevokeConfirm = async () => {
    if (!contract || !revokeTargetId) return;

    try {
      setRevoking(true);
      setRevokeError(null);

      const tx = await contract.revokeCredential(revokeTargetId, revokeReason);
      await tx.wait();

      setRevokeTargetId(null);
      await fetchIssuedCredentials();
    } catch (err: any) {
      console.error("Revocation failed:", err);
      setRevokeError(err?.reason || err?.message || "Failed to revoke credential.");
    } finally {
      setRevoking(false);
    }
  };

  const filteredCredentials = issuedCredentials.filter(
    (c) =>
      c.program.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.credentialType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-brand-500/20">
            <div className="w-full h-full bg-gray-950 rounded-[14px] flex items-center justify-center text-brand-400">
              <Building2 size={30} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-gray-100">University Issuer Portal</h1>
              {isIssuer && (
                <span className="px-2.5 py-0.5 rounded-full bg-brand-500/15 text-brand-300 text-xs font-mono border border-brand-500/30">
                  Authorized University
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Issue tamper-evident academic credentials and manage credential lifecycle revocation.
            </p>
          </div>
        </div>

        {/* Action Button */}
        {account && isIssuer && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-brand-500/25 transition flex items-center gap-2 shrink-0"
          >
            <Plus size={18} />
            Issue New Credential
          </button>
        )}
      </div>

      {/* Access Restriction Check */}
      {!account ? (
        <div className="glass-card p-12 rounded-3xl text-center border border-gray-800 max-w-xl mx-auto space-y-4">
          <Building2 size={40} className="text-brand-400 mx-auto" />
          <h2 className="text-xl font-bold text-gray-200">Connect Institution Wallet</h2>
          <p className="text-xs text-gray-400">
            Connect your university wallet to access the credential issuance dashboard.
          </p>
          <button
            onClick={connectWallet}
            className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition"
          >
            Connect Wallet
          </button>
        </div>
      ) : !isIssuer ? (
        <div className="glass-card p-10 rounded-3xl border border-amber-500/30 bg-amber-500/10 text-amber-200 space-y-4 max-w-2xl mx-auto text-center">
          <AlertTriangle size={48} className="text-amber-400 mx-auto" />
          <h2 className="text-xl font-bold">Wallet Not Authorized as Issuer</h2>
          <p className="text-xs leading-relaxed max-w-md mx-auto text-amber-300">
            Connected address <code className="font-mono bg-amber-950/80 px-2 py-0.5 rounded text-amber-200">{shortenAddress(account, 6)}</code> is not registered as an authorized educational institution issuer.
          </p>
          <p className="text-xs text-gray-400">
            Please ask the platform owner/admin to add your institution address in the Admin Console.
          </p>
        </div>
      ) : (
        /* Main Issuer Content */
        <div className="space-y-6">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search size={16} className="absolute left-3.5 top-3 text-gray-500" />
              <input
                type="text"
                placeholder="Search issued credentials by recipient, program..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-gray-200 focus:outline-none focus:border-brand-500 transition"
              />
            </div>

            <button
              onClick={fetchIssuedCredentials}
              className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 text-xs font-mono transition flex items-center gap-2"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh Issued List ({issuedCredentials.length})
            </button>
          </div>

          {/* Credentials List */}
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw size={28} className="animate-spin text-brand-500 mx-auto" />
              <p className="text-xs font-mono text-gray-400">Fetching issued credentials from blockchain...</p>
            </div>
          ) : filteredCredentials.length === 0 ? (
            <div className="glass-card p-12 rounded-3xl text-center border border-gray-800 space-y-3">
              <GraduationCap size={40} className="text-gray-600 mx-auto" />
              <h3 className="text-base font-bold text-gray-300">No Credentials Issued Yet</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Click &quot;Issue New Credential&quot; to issue your institution&apos;s first verifiable academic record!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCredentials.map((cred) => (
                <CredentialCard
                  key={cred.id}
                  credential={cred}
                  showIssuerControls={true}
                  onRevokeClick={(id) => setRevokeTargetId(id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Issue Modal */}
      <IssueCredentialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchIssuedCredentials();
        }}
      />

      {/* Revocation Confirmation Dialog */}
      {revokeTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 border border-rose-500/40 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                <Ban size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-100">Revoke Credential</h3>
                <p className="text-xs text-gray-400">This action is permanent and recorded on-chain.</p>
              </div>
            </div>

            {revokeError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{revokeError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono font-semibold text-gray-300 mb-1">
                Target Credential ID
              </label>
              <code className="block bg-gray-950 p-2.5 rounded-xl text-xs font-mono text-gray-400 break-all border border-gray-800">
                {revokeTargetId}
              </code>
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold text-gray-300 mb-1">
                Revocation Reason / Note <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-gray-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
              <button
                onClick={() => setRevokeTargetId(null)}
                className="px-4 py-2 rounded-xl bg-gray-900 text-gray-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleRevokeConfirm}
                disabled={revoking}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-md shadow-rose-600/30 disabled:opacity-50"
              >
                {revoking ? <RefreshCw size={14} className="animate-spin" /> : <Ban size={14} />}
                <span>{revoking ? "Revoking on Blockchain..." : "Confirm Revocation"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
