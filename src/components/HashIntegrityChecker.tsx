"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, ShieldAlert, FileCode, RefreshCw } from "lucide-react";
import { computeCredentialHash } from "@/lib/utils";

interface HashIntegrityCheckerProps {
  onChainHash: string;
  recipient?: string;
  credentialType?: string;
  program?: string;
}

export const HashIntegrityChecker: React.FC<HashIntegrityCheckerProps> = ({
  onChainHash,
  recipient = "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
  credentialType = "Bachelor of Science",
  program = "Computer Science & Artificial Intelligence",
}) => {
  const defaultPayload = {
    studentName: "Alice Vance",
    studentWallet: recipient,
    degree: credentialType,
    program: program,
    institution: "Massachusetts Institute of Technology (MIT)",
    gpa: "3.95 / 4.00",
    honors: "Summa Cum Laude",
  };

  const [jsonInput, setJsonInput] = useState(JSON.stringify(defaultPayload, null, 2));
  const [computedHash, setComputedHash] = useState<string | null>(null);
  const [isMatch, setIsMatch] = useState<boolean | null>(null);

  // Auto-verify on mount or payload update
  useEffect(() => {
    try {
      const parsedObj = JSON.parse(jsonInput);
      const hash = computeCredentialHash(parsedObj);
      setComputedHash(hash);
      setIsMatch(hash.toLowerCase() === onChainHash.toLowerCase());
    } catch (e) {
      // If sample JSON doesn't match custom contract hash, re-compute
    }
  }, [jsonInput, onChainHash]);

  const handleVerify = () => {
    try {
      const parsedObj = JSON.parse(jsonInput);
      const hash = computeCredentialHash(parsedObj);
      setComputedHash(hash);
      setIsMatch(hash.toLowerCase() === onChainHash.toLowerCase());
    } catch (e) {
      setComputedHash("Invalid JSON payload format");
      setIsMatch(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-gray-800 space-y-4">
      <div className="flex items-center justify-between border-b border-gray-800 pb-3">
        <div className="flex items-center gap-2">
          <FileCode size={20} className="text-brand-400" />
          <h3 className="text-base font-bold text-gray-100">Off-Chain Data Integrity Sandbox</h3>
        </div>
        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest bg-gray-900 px-2 py-1 rounded border border-gray-800">
          SHA-256 Verifier
        </span>
      </div>

      <p className="text-xs text-gray-400 leading-relaxed">
        Paste or edit the off-chain JSON transcript to verify its mathematical SHA-256 fingerprint against the tamper-evident hash stored on the Ethereum blockchain.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Input Payload */}
        <div>
          <label className="block text-xs font-mono font-semibold text-gray-300 mb-1">
            Off-Chain Academic JSON Payload
          </label>
          <textarea
            rows={8}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full p-3 rounded-xl bg-gray-950 border border-gray-800 text-gray-200 text-xs font-mono focus:outline-none focus:border-brand-500 transition"
          />
          <button
            onClick={handleVerify}
            className="mt-2.5 w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-md shadow-brand-600/20"
          >
            <RefreshCw size={14} />
            Compute & Compare Hash
          </button>
        </div>

        {/* Right: Hash Comparison */}
        <div className="space-y-3 bg-gray-900/50 p-4 rounded-xl border border-gray-800 flex flex-col justify-between">
          <div className="space-y-3">
            <div>
              <span className="text-[11px] font-mono text-gray-400 uppercase">On-Chain Immutable Hash:</span>
              <code className="block font-mono text-xs text-emerald-400 bg-gray-950 p-2 rounded border border-gray-800 break-all select-all mt-1">
                {onChainHash}
              </code>
            </div>

            <div>
              <span className="text-[11px] font-mono text-gray-400 uppercase">Computed Off-Chain Hash:</span>
              <code className="block font-mono text-xs text-brand-300 bg-gray-950 p-2 rounded border border-gray-800 break-all select-all mt-1">
                {computedHash || "Click compute to calculate..."}
              </code>
            </div>
          </div>

          {/* Verification Result Banner */}
          {isMatch !== null && (
            <div
              className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2.5 animate-in fade-in ${
                isMatch
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                  : "bg-rose-500/15 border-rose-500/40 text-rose-300"
              }`}
            >
              {isMatch ? (
                <>
                  <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
                  <div>
                    <p>100% MATCH — UNTAMPERED RECORD</p>
                    <p className="text-[11px] font-normal opacity-90">
                      The off-chain data mathematically matches the on-chain SHA-256 fingerprint exactly!
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <ShieldAlert size={20} className="text-rose-400 shrink-0" />
                  <div>
                    <p>HASH MISMATCH — ALTERED DATA</p>
                    <p className="text-[11px] font-normal opacity-90">
                      The provided JSON record has been modified or tampered with!
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
