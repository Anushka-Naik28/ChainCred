import React from "react";
import { CheckCircle2, AlertOctagon, HelpCircle, Clock } from "lucide-react";
import { CredentialStatus } from "@/types";

interface VerificationBadgeProps {
  exists: boolean;
  isValid: boolean;
  status?: CredentialStatus;
  expiryDate?: number;
  size?: "sm" | "md" | "lg";
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  exists,
  isValid,
  status,
  expiryDate,
  size = "md",
}) => {
  const isExpired = expiryDate && expiryDate > 0 && Date.now() / 1000 > expiryDate;

  let sizeClasses = "px-3 py-1 text-xs";
  let iconSize = 14;

  if (size === "lg") {
    sizeClasses = "px-5 py-2.5 text-base font-semibold";
    iconSize = 20;
  } else if (size === "sm") {
    sizeClasses = "px-2.5 py-0.5 text-xs";
    iconSize = 12;
  }

  if (!exists) {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 ${sizeClasses}`}>
        <HelpCircle size={iconSize} />
        <span>NOT FOUND</span>
      </div>
    );
  }

  if (status === CredentialStatus.Revoked || !isValid) {
    if (isExpired) {
      return (
        <div className={`inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 ${sizeClasses}`}>
          <Clock size={iconSize} />
          <span>EXPIRED</span>
        </div>
      );
    }

    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/40 shadow-sm shadow-rose-950 ${sizeClasses}`}>
        <AlertOctagon size={iconSize} />
        <span>REVOKED</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-950 ${sizeClasses}`}>
      <CheckCircle2 size={iconSize} />
      <span>VALID & VERIFIED</span>
    </div>
  );
};
