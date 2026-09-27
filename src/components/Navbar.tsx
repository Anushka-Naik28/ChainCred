"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ShieldCheck, 
  Wallet, 
  UserCheck, 
  GraduationCap, 
  Building2, 
  ShieldAlert, 
  Copy, 
  Check, 
  LogOut,
  Search
} from "lucide-react";
import { useWeb3 } from "@/context/Web3Context";
import { shortenAddress, copyToClipboard } from "@/lib/utils";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { account, connectWallet, disconnectWallet, isConnecting, isAdmin, isIssuer } = useWeb3();
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleCopy = async () => {
    if (!account) return;
    const success = await copyToClipboard(account);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/verify", label: "Public Verify", icon: Search },
    { href: "/student", label: "Student Dashboard", icon: GraduationCap },
    { href: "/issuer", label: "Issuer Portal", icon: Building2 },
    { href: "/admin", label: "Admin Console", icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-gray-800/60 bg-gray-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition">
            <div className="w-full h-full bg-gray-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck size={22} className="text-brand-500 group-hover:scale-110 transition" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg text-gray-100 tracking-tight flex items-center gap-1.5">
              Chain<span className="text-gradient">Cred</span>
            </span>
            <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">Decentralized Credentials</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition flex items-center gap-1.5 ${
                  isActive
                    ? "bg-brand-500/15 text-brand-300 border border-brand-500/30"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-900/60"
                }`}
              >
                {Icon && <Icon size={15} className={isActive ? "text-brand-400" : "text-gray-500"} />}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Wallet Connection */}
        <div className="flex items-center gap-3">
          {account ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-200 text-xs font-mono transition shadow-sm"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{shortenAddress(account)}</span>
                {isAdmin && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-sans font-semibold border border-amber-500/30">
                    Admin
                  </span>
                )}
                {isIssuer && !isAdmin && (
                  <span className="px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 text-[10px] font-sans font-semibold border border-brand-500/30">
                    Issuer
                  </span>
                )}
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 glass-panel rounded-2xl p-3 shadow-2xl border border-gray-800 text-xs z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-2 border-b border-gray-800/80 mb-2">
                    <p className="text-gray-400 text-[11px]">Connected Wallet</p>
                    <p className="font-mono text-gray-200 text-xs truncate mt-0.5">{account}</p>
                    <div className="mt-2 flex items-center gap-1.5">
                      {isAdmin && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] flex items-center gap-1">
                          <ShieldCheck size={12} /> Platform Admin
                        </span>
                      )}
                      {isIssuer && (
                        <span className="px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/30 text-[10px] flex items-center gap-1">
                          <Building2 size={12} /> University Issuer
                        </span>
                      )}
                      {!isAdmin && !isIssuer && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] flex items-center gap-1">
                          <UserCheck size={12} /> Student Wallet
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleCopy}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800/80 transition"
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-gray-400" />}
                    <span>{copied ? "Address Copied!" : "Copy Full Address"}</span>
                  </button>

                  <button
                    onClick={() => {
                      disconnectWallet();
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition mt-1"
                  >
                    <LogOut size={14} />
                    <span>Disconnect Wallet</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-medium text-xs sm:text-sm shadow-md shadow-brand-500/20 transition flex items-center gap-2 disabled:opacity-50"
            >
              <Wallet size={16} />
              <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
