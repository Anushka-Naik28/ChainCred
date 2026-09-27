import CryptoJS from "crypto-js";

export function shortenAddress(address: string, chars = 4): string {
  if (!address || address.length < 10) return address || "";
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

export function formatDate(timestamp: number | string): string {
  if (!timestamp || Number(timestamp) === 0) return "Never";
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Computes a standard 0x-prefixed 32-byte hash of raw credential JSON string
 * matching Solidity bytes32 representation.
 */
export function computeCredentialHash(payloadObject: Record<string, any>): string {
  const jsonString = JSON.stringify(payloadObject);
  const hashHex = CryptoJS.SHA256(jsonString).toString(CryptoJS.enc.Hex);
  return "0x" + hashHex;
}

export function copyToClipboard(text: string): Promise<boolean> {
  return navigator.clipboard.writeText(text)
    .then(() => true)
    .catch(() => false);
}
