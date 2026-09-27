"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  GraduationCap, 
  ShieldCheck, 
  Hash, 
  Loader2, 
  AlertCircle,
  Sparkles,
  CheckCircle
} from "lucide-react";
import { useWeb3 } from "@/context/Web3Context";
import { computeCredentialHash } from "@/lib/utils";

interface IssueCredentialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const IssueCredentialModal: React.FC<IssueCredentialModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { contract, account } = useWeb3();

  const [recipient, setRecipient] = useState("");
  const [credentialType, setCredentialType] = useState("Bachelor of Science");
  const [program, setProgram] = useState("Computer Science");
  const [studentName, setStudentName] = useState("");
  const [gpa, setGpa] = useState("3.85 / 4.00");
  const [honors, setHonors] = useState("Cum Laude");
  const [metadataURI, setMetadataURI] = useState("ipfs://QmCredentialMetadataHashSample");
  const [expiryDate, setExpiryDate] = useState("");

  const [generatedHash, setGeneratedHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  // Re-compute off-chain SHA256 hash live whenever fields change
  useEffect(() => {
    const payload = {
      studentName: studentName || "Anonymous Student",
      studentWallet: recipient || "0x000...",
      degree: credentialType,
      program: program,
      gpa: gpa,
      honors: honors,
      issuerWallet: account,
      issueTimestamp: Math.floor(Date.now() / 1000),
    };
    const hash = computeCredentialHash(payload);
    setGeneratedHash(hash);
  }, [recipient, credentialType, program, studentName, gpa, honors, account]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract) {
      setError("Wallet is not connected or contract not initialized.");
      return;
    }

    if (!recipient || !recipient.startsWith("0x") || recipient.length !== 42) {
      setError("Please enter a valid 42-character Ethereum recipient wallet address.");
      return;
    }

    if (!credentialType || !program) {
      setError("Credential type and program name are required.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setTxHash(null);

      const expiryTimestamp = expiryDate ? Math.floor(new Date(expiryDate).getTime() / 1000) : 0;

      // Submit issueCredential transaction
      const tx = await contract.issueCredential(
        recipient,
        credentialType,
        program,
        generatedHash,
        metadataURI,
        expiryTimestamp
      );

      setTxHash(tx.hash);
      const receipt = await tx.wait();

      const event = receipt.logs.find((log: any) => log.fragment && log.fragment.name === "CredentialIssued");
      const credId = event ? event.args[0] : null;

      setSuccessId(credId);
      onSuccess();
    } catch (err: any) {
      console.error("Issuance transaction failed:", err);
      const msg = err?.reason || err?.message || "Transaction was rejected or failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 sm:p-8 border border-gray-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-white transition bg-gray-900 p-2 rounded-xl border border-gray-800"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand-600/20 border border-brand-500/40 flex items-center justify-center text-brand-400">
            <GraduationCap size={26} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-100">Issue Academic Credential</h2>
            <p className="text-xs text-gray-400">
              Create a tamper-evident, verifiable credential on the blockchain.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle size={18} className="shrink-0 text-rose-400" />
            <div>
              <p className="font-semibold">Issuance Failure</p>
              <p className="mt-0.5 opacity-90">{error}</p>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {successId && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-start gap-2.5">
            <CheckCircle size={18} className="shrink-0 text-emerald-400" />
            <div className="space-y-1">
              <p className="font-bold">Credential Successfully Issued!</p>
              <p>Credential ID on Blockchain:</p>
              <code className="block bg-gray-900 p-2 rounded font-mono text-[11px] text-emerald-200 break-all select-all">
                {successId}
              </code>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Recipient Wallet */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase font-mono">
              Student Wallet Address <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-gray-900/90 border border-gray-800 text-gray-100 text-sm font-mono focus:outline-none focus:border-brand-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Credential Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase font-mono">
                Credential Type <span className="text-rose-400">*</span>
              </label>
              <select
                value={credentialType}
                onChange={(e) => setCredentialType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-900/90 border border-gray-800 text-gray-100 text-sm focus:outline-none focus:border-brand-500 transition"
              >
                <option value="Bachelor of Science">Bachelor of Science (B.S.)</option>
                <option value="Master of Science">Master of Science (M.S.)</option>
                <option value="Doctor of Philosophy">Doctor of Philosophy (Ph.D.)</option>
                <option value="Bachelor of Arts">Bachelor of Arts (B.A.)</option>
                <option value="Professional Certificate">Professional Certificate</option>
                <option value="Executive Diploma">Executive Diploma</option>
              </select>
            </div>

            {/* Academic Program */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 uppercase font-mono">
                Program / Major <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Computer Science & AI"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-900/90 border border-gray-800 text-gray-100 text-sm focus:outline-none focus:border-brand-500 transition"
              />
            </div>
          </div>

          {/* Additional Off-chain fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-gray-900/40 border border-gray-800/80">
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">Student Full Name</label>
              <input
                type="text"
                placeholder="Jane Doe"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-gray-200 text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">GPA / Score</label>
              <input
                type="text"
                placeholder="3.90 / 4.00"
                value={gpa}
                onChange={(e) => setGpa(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-gray-200 text-xs focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">Honors / Distinction</label>
              <input
                type="text"
                placeholder="Summa Cum Laude"
                value={honors}
                onChange={(e) => setHonors(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-gray-200 text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Generated Off-Chain Hash Showcase */}
          <div className="p-4 rounded-2xl bg-brand-950/30 border border-brand-500/25 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-300 font-mono flex items-center gap-1.5">
                <Hash size={14} /> Generated Tamper-Evident SHA-256 Hash
              </span>
              <span className="text-[10px] text-brand-400 uppercase tracking-widest font-mono">Off-Chain Integrity</span>
            </div>
            <code className="block font-mono text-xs text-brand-200 bg-gray-950/80 p-2.5 rounded-xl border border-brand-500/20 break-all select-all">
              {generatedHash}
            </code>
            <p className="text-[11px] text-gray-400 leading-tight">
              🔒 This SHA-256 hash is computed off-chain and will be recorded permanently on-chain. 
              The student&apos;s private data remains private off-chain while remaining fully verifiable.
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 text-sm font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Issuing on Blockchain...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Issue Credential</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
