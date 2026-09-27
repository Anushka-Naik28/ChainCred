"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  GraduationCap, 
  Building2, 
  Calendar, 
  Hash, 
  ExternalLink, 
  Copy, 
  Check, 
  Ban,
  ShieldCheck
} from "lucide-react";
import { VerificationBadge } from "./VerificationBadge";
import { CredentialData } from "@/types";
import { shortenAddress, formatDate, copyToClipboard } from "@/lib/utils";

interface CredentialCardProps {
  credential: CredentialData;
  showIssuerControls?: boolean;
  onRevokeClick?: (credentialId: string) => void;
}

export const CredentialCard: React.FC<CredentialCardProps> = ({
  credential,
  showIssuerControls = false,
  onRevokeClick,
}) => {
  const router = useRouter();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const verifyUrl = typeof window !== "undefined"
    ? `${window.location.origin}/verify/${credential.id}`
    : `/verify/${credential.id}`;

  const handleCopyLink = async () => {
    const success = await copyToClipboard(verifyUrl);
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyId = async () => {
    const success = await copyToClipboard(credential.id);
    if (success) {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const isValid = Number(credential.status) === 0;

  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between group">
      {/* Background Decorative Emblem */}
      <div className="absolute -right-8 -bottom-8 opacity-5 text-brand-400 group-hover:opacity-10 transition duration-500">
        <GraduationCap size={200} />
      </div>

      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-600/30 to-indigo-600/30 border border-brand-500/30 flex items-center justify-center text-brand-300 shrink-0">
              <GraduationCap size={24} />
            </div>
            <div>
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-brand-400">
                {credential.credentialType}
              </span>
              <h3 className="text-lg font-bold text-gray-100 group-hover:text-brand-200 transition">
                {credential.program}
              </h3>
            </div>
          </div>
          <VerificationBadge
            exists={credential.exists}
            isValid={isValid}
            status={credential.status}
            expiryDate={credential.expiryDate}
          />
        </div>

        {/* Details Grid */}
        <div className="space-y-3 my-5 py-4 border-y border-gray-800/70 text-xs">
          {/* Issuer Wallet */}
          <div className="flex items-center justify-between text-gray-400">
            <span className="flex items-center gap-1.5 text-gray-400">
              <Building2 size={14} className="text-gray-400" /> Issuing Institution:
            </span>
            <span className="font-mono text-gray-200 bg-gray-900/80 px-2 py-0.5 rounded border border-gray-800">
              {shortenAddress(credential.issuer)}
            </span>
          </div>

          {/* Student Wallet */}
          <div className="flex items-center justify-between text-gray-400">
            <span className="flex items-center gap-1.5 text-gray-400">
              <ShieldCheck size={14} className="text-gray-400" /> Student Recipient:
            </span>
            <span className="font-mono text-gray-200 bg-gray-900/80 px-2 py-0.5 rounded border border-gray-800">
              {shortenAddress(credential.recipient)}
            </span>
          </div>

          {/* Issue Date */}
          <div className="flex items-center justify-between text-gray-400">
            <span className="flex items-center gap-1.5 text-gray-400">
              <Calendar size={14} className="text-gray-400" /> Issue Timestamp:
            </span>
            <span className="text-gray-300 font-medium">
              {formatDate(credential.issueDate)}
            </span>
          </div>

          {/* Credential Hash */}
          <div className="flex items-center justify-between text-gray-400">
            <span className="flex items-center gap-1.5 text-gray-400">
              <Hash size={14} className="text-gray-400" /> Tamper-Proof Hash:
            </span>
            <span className="font-mono text-gray-400 truncate max-w-[140px]" title={credential.credentialHash}>
              {shortenAddress(credential.credentialHash, 4)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyId}
            className="px-2.5 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 text-xs transition flex items-center gap-1"
            title="Copy Credential ID"
          >
            {copiedId ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copiedId ? "ID Copied" : "ID"}</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="px-2.5 py-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 text-xs transition flex items-center gap-1"
            title="Copy Shareable Verification Link"
          >
            {copiedLink ? <Check size={13} className="text-emerald-400" /> : <ExternalLink size={13} />}
            <span>{copiedLink ? "Link Copied" : "Share Link"}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {showIssuerControls && isValid && onRevokeClick && (
            <button
              onClick={() => onRevokeClick(credential.id)}
              className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 text-xs font-medium transition flex items-center gap-1"
            >
              <Ban size={13} />
              Revoke
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              router.push(`/verify/${credential.id}`);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md shadow-brand-600/20 transition flex items-center gap-1.5 cursor-pointer z-10"
          >
            Verify On-Chain
            <ExternalLink size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
