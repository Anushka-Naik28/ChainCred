🎓 ChainCred – Decentralized Academic Credential Network

   A sleek, modern Web3 platform designed to revolutionize academic degree verification. ChainCred merges blockchain security with off-chain cryptographic hashing, offering a tamper-evident, instant credential verification system for educational institutions, students, and employers.

⚠️ The Problem
Traditional degree verification relies on centralized databases, paper transcripts, or manual third-party background checks. Students face weeks of verification delays, physical diplomas are easily forged, university database breaches expose sensitive student data, and institutional shutdowns leave credentials unverified.

💡 The Solution
ChainCred provides a streamlined, trustworthy credential verification experience. With off-chain SHA-256 transcript hashing, smart-contract access control, and instant public verification, it ensures zero degree fraud, complete privacy preservation, and 100% data integrity without gas fees for verifiers.

🔑 Key Features
1. Authorized Issuer Network – Admin-governed accreditation for educational institutions.
2. Off-Chain Hashing & Privacy – Zero personal student data stored on-chain; only cryptographic SHA-256 fingerprints.
3. Instant Public Verification – Read-only, 0-gas credential checks for employers & recruiters.
4. Student Credential Vault – Wallet-connected dashboard for students to view & share credentials.
5. Admin & Issuer Dashboards – Dedicated portals for institutional management & credential revocation.
6. Modern UI/UX – Dark-themed Web3 glassmorphism design with interactive hash integrity checker.

🛠️ Tech Stack
Frontend: Next.js 14 (App Router), React.js, Tailwind CSS
Smart Contracts: Solidity 0.8.20, OpenZeppelin v5.1.0
Blockchain Dev & Testing: Hardhat, Ethers.js v6
Cryptography: CryptoJS (SHA-256)
Deployment: Vercel (Frontend), Hardhat / Sepolia Testnet (Smart Contracts)

🚀 How It Works
1. Platform Admin authorizes accredited university wallet addresses.
2. Universities generate SHA-256 transcript hashes and issue credentials on-chain.
3. Students receive credentials in their wallet-connected personal dashboard.
4. Employers verify credential status (VALID, REVOKED, or NOT FOUND) instantly using the Credential ID.
5. Universities can log in to manage, track, or revoke credentials if necessary.

🔮 Future Improvements
Multi-chain support (Polygon, Arbitrum, Optimism).
Zero-Knowledge Proofs (ZK-SNARKs) for selective disclosure of grades & GPA.
Decentralized Storage integration (IPFS & Arweave for encrypted metadata).
Soulbound Tokens (SBT - ERC-5192) support for non-transferable diplomas.


