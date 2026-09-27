"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  ShieldCheck, 
  Building2, 
  UserCheck, 
  Calendar, 
  Hash, 
  ExternalLink, 
  RefreshCw, 
  ArrowLeft,
  GraduationCap,
  Copy,
  Check
} from "lucide-react";
import { useWeb3 } from "@/context/Web3Context";
import { VerificationBadge } from "@/components/VerificationBadge";
import { HashIntegrityChecker } from "@/components/HashIntegrityChecker";
import { VerificationResult, CredentialStatus } from "@/types";
import { shortenAddress, formatDate, copyToClipboard } from "@/lib/utils";

export default function DirectVerificationPage() {
  const params = useParams();
  const rawId = params?.id as string;
  const credentialId = rawId?.startsWith("0x") ? rawId : `0x${rawId}`;

  const { readOnlyContract } = useWeb3();

  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchVerification = useCallback(async () => {
    if (!readOnlyContract || !credentialId) return;

    try {
      setLoading(true);

      // Call public read-only smart contract function
      const res = await readOnlyContract.verifyCredential(credentialId);

      setResult({
        exists: res.exists,
        isValid: res.isValid,
        recipient: res.recipient,
        issuer: res.issuer,
        credentialType: res.credentialType,
        program: res.program,
        credentialHash: res.credentialHash,
        metadataURI: res.metadataURI,
        issueDate: Number(res.issueDate),
        expiryDate: Number(res.expiryDate),
        status: Number(res.status) as CredentialStatus,
      });
    } catch (err) {
      console.error("Verification query error:", err);
      setResult({
        exists: false,
        isValid: false,
        recipient: "",
        issuer: "",
        credentialType: "",
        program: "",
        credentialHash: "",
        metadataURI: "",
        issueDate: 0,
        expiryDate: 0,
        status: CredentialStatus.Revoked,
      });
    } finally {
      setLoading(false);
    }
  }, [readOnlyContract, credentialId]);

  useEffect(() => {
    fetchVerification();
  }, [fetchVerification]);

  const handleCopy = async () => {
    const success = await copyToClipboard(credentialId);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back Button */}
      <Link
        href="/verify"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-gray-400 hover:text-gray-200 transition"
      >
        <ArrowLeft size={14} />
        Back to Verification Search
      </Link>

      {loading ? (
        <div className="py-24 text-center space-y-4">
          <RefreshCw size={36} className="animate-spin text-brand-500 mx-auto" />
          <p className="text-sm font-mono text-gray-300">Querying Ethereum Smart Contract Verification State...</p>
        </div>
      ) : !result || !result.exists ? (
        /* NOT FOUND STATE */
        <div className="glass-panel p-12 rounded-3xl border border-amber-500/30 text-center space-y-6">
          <VerificationBadge exists={false} isValid={false} size="lg" />
          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-extrabold text-gray-100">Credential Not Found on Chain</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              No academic record matches Credential ID{" "}
              <code className="text-amber-300 font-mono break-all">{credentialId}</code>.
            </p>

            {credentialId.length === 42 && (
              <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs text-left space-y-2 mt-4">
                <p className="font-bold flex items-center gap-1.5">
                  💡 Notice: You entered a Wallet Address!
                </p>
                <p className="text-[11px] text-gray-300 leading-relaxed">
                  <code className="font-mono">{shortenAddress(credentialId)}</code> is a student wallet address (42 characters) rather than a 66-character Credential ID.
                </p>
                <Link
                  href="/student"
                  className="inline-block px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition mt-1"
                >
                  View Credentials on Student Dashboard →
                </Link>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400">
            Please verify that the Credential ID is spelled correctly or ask the issuing institution for the valid transaction hash.
          </p>
        </div>
      ) : (
        /* FOUND STATE (VALID OR REVOKED) */
        <div className="space-y-8">
          
          {/* Main Status Header Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-800 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 p-0.5 shadow-lg shadow-brand-500/20 shrink-0">
                  <div className="w-full h-full bg-gray-950 rounded-[14px] flex items-center justify-center text-brand-400">
                    <GraduationCap size={30} />
                  </div>
                </div>
                <div>
                  <span className="text-xs font-mono font-semibold text-brand-400 uppercase tracking-wider">
                    {result.credentialType}
                  </span>
                  <h1 className="text-2xl font-bold text-gray-100">{result.program}</h1>
                </div>
              </div>

              <VerificationBadge
                exists={result.exists}
                isValid={result.isValid}
                status={result.status}
                expiryDate={result.expiryDate}
                size="lg"
              />
            </div>

            {/* Credential ID Banner */}
            <div className="bg-gray-950 p-4 rounded-2xl border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest">Credential ID on Blockchain</span>
                <p className="text-gray-200 font-semibold break-all">{credentialId}</p>
              </div>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 transition flex items-center gap-1.5 shrink-0"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? "Copied" : "Copy ID"}</span>
              </button>
            </div>

            {/* Credential Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs pt-2">
              <div className="glass-card p-4 rounded-2xl border border-gray-800 space-y-2">
                <span className="flex items-center gap-1.5 text-gray-400 font-mono uppercase text-[11px]">
                  <Building2 size={14} className="text-brand-400" /> Issuing University Wallet
                </span>
                <p className="font-mono text-sm text-gray-100 font-semibold break-all bg-gray-950 p-2.5 rounded-xl border border-gray-800">
                  {result.issuer}
                </p>
              </div>

              <div className="glass-card p-4 rounded-2xl border border-gray-800 space-y-2">
                <span className="flex items-center gap-1.5 text-gray-400 font-mono uppercase text-[11px]">
                  <UserCheck size={14} className="text-emerald-400" /> Student Recipient Wallet
                </span>
                <p className="font-mono text-sm text-gray-100 font-semibold break-all bg-gray-950 p-2.5 rounded-xl border border-gray-800">
                  {result.recipient}
                </p>
              </div>

              <div className="glass-card p-4 rounded-2xl border border-gray-800 space-y-2">
                <span className="flex items-center gap-1.5 text-gray-400 font-mono uppercase text-[11px]">
                  <Calendar size={14} className="text-indigo-400" /> Issue Timestamp
                </span>
                <p className="text-sm text-gray-100 font-medium bg-gray-950 p-2.5 rounded-xl border border-gray-800">
                  {formatDate(result.issueDate)}
                </p>
              </div>

              <div className="glass-card p-4 rounded-2xl border border-gray-800 space-y-2">
                <span className="flex items-center gap-1.5 text-gray-400 font-mono uppercase text-[11px]">
                  <Hash size={14} className="text-cyan-400" /> On-Chain Tamper-Evident Hash
                </span>
                <p className="font-mono text-sm text-gray-100 font-semibold break-all bg-gray-950 p-2.5 rounded-xl border border-gray-800 select-all">
                  {result.credentialHash}
                </p>
              </div>
            </div>
          </div>

          {/* Off-Chain Data Integrity Sandbox Component */}
          <HashIntegrityChecker
            onChainHash={result.credentialHash}
            recipient={result.recipient}
            credentialType={result.credentialType}
            program={result.program}
          />
        </div>
      )}
    </div>
  );
}
