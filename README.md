# ChainCred — Decentralized Academic Credential Network 🎓🔒

[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue.svg)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22.13-yellow.svg)](https://hardhat.org/)
[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-5.1.0-blueviolet.svg)](https://openzeppelin.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![Tests](https://img.shields.io/badge/Tests-24%2F24%20Passing-emerald.svg)]()

> **ChainCred** is a production-grade Web3 platform where authorized educational institutions issue verifiable, tamper-evident academic credentials directly to students' Ethereum wallets. Verifiers (recruiters, employers, institutions) can verify credentials in seconds directly through the blockchain without contacting the issuing university or exposing private student data.

---

## 📌 Problem Statement

Traditional academic credential verification relies on centralized university databases, manual physical transcripts, or third-party background check agencies. This legacy system suffers from critical flaws:

1. **Degree Fraud & Forgery:** Physical diplomas and PDF certificates are easily falsified with editing tools.
2. **High Verification Overhead:** Employers spend weeks contacting university registrars to confirm degree authenticity.
3. **Single Points of Failure:** University database corruption, cyberattacks, or institutional shutdown render credentials unverified.
4. **Privacy Violations:** Centralized clearinghouses collect and monetize sensitive student transcript records.

---

## 💡 The ChainCred Solution

ChainCred leverages Ethereum smart contracts and off-chain SHA-256 cryptography to decouple credential verification from university infrastructure:

* **Tamper-Evident Off-Chain Hashing:** Academic transcripts are stored off-chain. Only a SHA-256 fingerprint is recorded on-chain, guaranteeing 100% data integrity without publishing private personal information.
* **Decentralized Student Ownership:** Credentials reside as cryptographic assets associated with the student's Ethereum wallet.
* **Instant Public Verification:** Verifiers perform pure read-only smart contract queries (`0 ETH gas required`) to obtain definitive `VALID`, `REVOKED`, or `NOT FOUND` status.
* **Strict On-Chain Access Control:** Only platform-authorized educational institutions can issue credentials, and only the original issuing institution can revoke its credential.

---

## 🏗️ Architecture & Workflow

```
┌────────────────────────┐      ┌─────────────────────────┐      ┌───────────────────────────┐
│ Educational Issuer     │─────▶│ Off-Chain Data & SHA256 │─────▶│ Ethereum Smart Contract   │
│ (University Wallet)    │      │ Transcript Hashing      │      │ (ChainCred.sol)           │
└────────────────────────┘      └─────────────────────────┘      └─────────────┬─────────────┘
                                                                               │
                                                                               ▼
┌────────────────────────┐      ┌─────────────────────────┐      ┌───────────────────────────┐
│ Recruiter / Verifier   │◀─────│ Instant Status Query    │◀─────│ Student Recipient Wallet  │
│ (Public Verification)  │      │ (VALID/REVOKED/NOTFOUND)│      │ (Credential Holder)       │
└────────────────────────┘      └─────────────────────────┘      └───────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Smart Contract** | Solidity `0.8.20` | Core decentralized business logic & status management |
| **Security Base** | OpenZeppelin `v5.1.0` | Production-grade `Ownable` access control |
| **Dev Environment** | Hardhat | Local EVM compilation, testing, and deployment scripts |
| **Frontend App** | Next.js 14 (App Router) | Responsive SSR & client Web3 user interface |
| **Web3 Client** | Ethers.js `v6` | Wallet connection, contract state reading & transaction signing |
| **Styling** | Tailwind CSS | Sleek Web3 dark mode aesthetic & glassmorphism components |
| **Off-Chain Cryptography** | CryptoJS (SHA-256) | Deterministic transcript fingerprint generation |

---

## 👥 Core User Roles

### 1. Platform Admin / Owner
* **Role:** Platform governance.
* **Permissions:** Authorizes new educational institutions (`addIssuer`), deauthorizes issuers (`removeIssuer`), views platform metrics.
* **Access Control:** Restricted via OpenZeppelin `onlyOwner`. Arbitrary wallets cannot become issuers.

### 2. Authorized University Issuer
* **Role:** Accredited educational institution (e.g. MIT, Stanford).
* **Permissions:** Issues verifiable credentials (`issueCredential`), views issued history, revokes owned credentials (`revokeCredential`).
* **Access Control:** Restricted via `onlyAuthorizedIssuer` modifier.

### 3. Student Recipient
* **Role:** Credential recipient & holder.
* **Permissions:** Connects wallet, views credentials issued to their address, copies shareable verification links.
* **Immutability:** Students cannot modify or alter credential state.

### 4. Public Verifier
* **Role:** Employers, recruiters, background check agencies.
* **Permissions:** Enters Credential ID on `/verify/[id]` page to read status without wallet authentication or gas fees.
* **Sandbox Tool:** Includes an Off-Chain Hash Integrity Verifier to test raw JSON payload matching.

---

## 📜 Smart Contract Architecture (`ChainCred.sol`)

### Data Structure
```solidity
enum CredentialStatus { Valid, Revoked }

struct Credential {
    bytes32 id;             // Deterministic unique Keccak-256 identifier
    address recipient;      // Student wallet address
    address issuer;         // University wallet address
    string credentialType;  // e.g. "Bachelor of Science"
    string program;         // e.g. "Computer Science & AI"
    bytes32 credentialHash; // SHA-256 hash of off-chain transcript payload
    string metadataURI;     // IPFS URI link
    uint256 issueDate;      // Block timestamp at issuance
    uint256 expiryDate;     // Expiry timestamp (0 for non-expiring)
    CredentialStatus status;// Valid or Revoked
    bool exists;            // Existence flag
}
```

### Key Functions

| Function Signature | Modifier | Description |
| :--- | :--- | :--- |
| `addIssuer(address _issuer)` | `onlyOwner` | Authorizes an institution wallet address |
| `removeIssuer(address _issuer)` | `onlyOwner` | Deauthorizes an institution wallet address |
| `issueCredential(...)` | `onlyAuthorizedIssuer` | Generates unique ID, stores hash, & emits `CredentialIssued` |
| `revokeCredential(bytes32 _id, string _reason)` | `onlyIssuerOf(_id)` | Revokes credential state & emits `CredentialRevoked` |
| `verifyCredential(bytes32 _id)` | `view` | Public read endpoint returning validity, status, issuer, and hash |
| `getCredentialsByStudent(address _student)` | `view` | Returns array of Credential IDs issued to a student |
| `getCredentialsByIssuer(address _issuer)` | `view` | Returns array of Credential IDs issued by a university |

---

## 🔐 Smart Contract Security & Best Practices

1. **Strict Authorization Checks:** `onlyAuthorizedIssuer` prevents unauthorized issuance.
2. **Revocation Ownership Scoping:** `require(credentials[_id].issuer == msg.sender)` ensures only the original university can revoke its issued credential.
3. **Double Revocation Prevention:** `require(credentials[_id].status == Valid)` prevents repeated revocation.
4. **Zero-Address Validation:** Rejects zero-address recipient and issuer inputs.
5. **Deterministic Collison-Proof IDs:** IDs generated via `keccak256(msg.sender, recipient, credentialHash, timestamp, totalCount)`.
6. **Indexed Event Emissions:** Emits `IssuerAdded`, `IssuerRemoved`, `CredentialIssued`, and `CredentialRevoked` events for indexers.

---

## 🧪 Smart Contract Test Suite

ChainCred features a 100% passing Hardhat unit test suite covering all roles, edge cases, and security assertions.

```bash
  ChainCred Smart Contract
    Deployment & Ownership
      ✓ Should set the deployer as the owner/admin
      ✓ Should start with 0 total credentials
    Issuer Management
      ✓ Should allow admin to add an issuer and emit IssuerAdded event
      ✓ Should reject adding zero address as issuer
      ✓ Should reject adding an already authorized issuer
      ✓ Should prevent non-admin from adding issuers
      ✓ Should allow admin to remove an issuer and emit IssuerRemoved event
      ✓ Should reject removing non-authorized issuer
    Credential Issuance
      ✓ Should allow authorized issuer to issue credential and emit CredentialIssued event
      ✓ Should prevent unauthorized wallet from issuing credentials
      ✓ Should reject invalid recipient zero address
      ✓ Should reject empty credential type or program
      ✓ Should reject empty credential hash
    Credential Retrieval & Student Mapping
      ✓ Should retrieve student credentials correctly
      ✓ Should retrieve issuer credentials correctly
      ✓ Should return total credential count correctly
    Credential Revocation
      ✓ Should allow the original issuing institution to revoke its credential and emit CredentialRevoked event
      ✓ Should prevent another issuer from revoking the credential
      ✓ Should prevent student or arbitrary wallet from revoking
      ✓ Should prevent revoking an already revoked credential
      ✓ Should fail when revoking a nonexistent credential
    Public Credential Verification
      ✓ Should return VALID status for an active credential
      ✓ Should return REVOKED status after revocation
      ✓ Should return NOT FOUND for invalid credential ID

  24 passing (7s)
```

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
* Node.js `v18+`
* npm `v9+`
* MetaMask browser extension

### 2. Installation
```bash
git clone https://github.com/your-username/Chaincred.git
cd Chaincred
npm install
```

### 3. Run Smart Contract Tests
```bash
npm run test
```

### 4. Deploy & Seed Local Hardhat Blockchain
```bash
# Deploys contract and populates sample university issuers and credentials
npm run seed:local
```

### 5. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 License
MIT License. Built as an original portfolio project.
