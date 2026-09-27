const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

function getCredentialIssuedId(receipt, contract) {
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed && parsed.name === "CredentialIssued") {
        return parsed.args[0];
      }
    } catch (e) {}
  }
  return null;
}

async function main() {
  console.log("🌱 Starting Seed Script for ChainCred...");

  const signers = await ethers.getSigners();
  const admin = signers[0];
  const mitIssuer = signers[1] || admin;
  const stanfordIssuer = signers[2] || admin;
  const studentAlice = signers[3] || admin;
  const studentBob = signers[4] || admin;

  const contractInfoPath = path.join(__dirname, "../src/lib/contractInfo.json");
  if (!fs.existsSync(contractInfoPath)) {
    console.error("❌ contractInfo.json not found! Run deploy script first.");
    process.exit(1);
  }

  const { address, abi } = JSON.parse(fs.readFileSync(contractInfoPath, "utf8"));
  const chainCredAdmin = new ethers.Contract(address, abi, admin);

  console.log(`📌 Connecting to deployed contract at ${address}...`);

  // 1. Authorize Issuers (ignoring if already authorized)
  console.log(`➕ Authorizing MIT Issuer (${mitIssuer.address})...`);
  if (!(await chainCredAdmin.isAuthorizedIssuer(mitIssuer.address))) {
    const tx1 = await chainCredAdmin.addIssuer(mitIssuer.address);
    await tx1.wait();
  }

  console.log(`➕ Authorizing Stanford Issuer (${stanfordIssuer.address})...`);
  if (!(await chainCredAdmin.isAuthorizedIssuer(stanfordIssuer.address))) {
    const tx2 = await chainCredAdmin.addIssuer(stanfordIssuer.address);
    await tx2.wait();
  }

  // 2. MIT Issues Credential to Alice
  const chainCredMIT = new ethers.Contract(address, abi, mitIssuer);

  const rawRecord1 = JSON.stringify({
    studentName: "Alice Vance",
    studentWallet: studentAlice.address,
    degree: "Bachelor of Science",
    program: "Computer Science & Artificial Intelligence",
    institution: "Massachusetts Institute of Technology (MIT)",
    gpa: "3.95 / 4.00",
    honors: "Summa Cum Laude",
    graduationDate: "2024-05-15",
  });
  const hash1 = ethers.keccak256(ethers.toUtf8Bytes(rawRecord1));

  console.log(`📜 MIT issuing B.S. CS credential to Alice (${studentAlice.address})...`);
  const issueTx1 = await chainCredMIT.issueCredential(
    studentAlice.address,
    "Bachelor of Science",
    "Computer Science & AI",
    hash1,
    "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
    0 // Non-expiring
  );
  const receipt1 = await issueTx1.wait();
  const credId1 = getCredentialIssuedId(receipt1, chainCredMIT);
  console.log(`  └─ Credential ID 1: ${credId1}`);

  // 3. Stanford Issues Credential to Bob
  const chainCredStanford = new ethers.Contract(address, abi, stanfordIssuer);

  const rawRecord2 = JSON.stringify({
    studentName: "Bob Smith",
    studentWallet: studentBob.address,
    degree: "Master of Science",
    program: "Cybersecurity & Cryptography",
    institution: "Stanford University",
    gpa: "4.00 / 4.00",
    honors: "Distinguished Scholar",
    graduationDate: "2024-06-20",
  });
  const hash2 = ethers.keccak256(ethers.toUtf8Bytes(rawRecord2));

  console.log(`📜 Stanford issuing M.S. Cybersecurity credential to Bob (${studentBob.address})...`);
  const issueTx2 = await chainCredStanford.issueCredential(
    studentBob.address,
    "Master of Science",
    "Cybersecurity & Cryptography",
    hash2,
    "ipfs://bafybeicg263jnbvvpt54l255p67g6n3tpy3bxl73zrm537yfqoogx6mjsu",
    0
  );
  const receipt2 = await issueTx2.wait();
  const credId2 = getCredentialIssuedId(receipt2, chainCredStanford);
  console.log(`  └─ Credential ID 2: ${credId2}`);

  // 4. MIT Issues a 3rd Credential to Alice and then Revokes it for demo
  const rawRecord3 = JSON.stringify({
    studentName: "Alice Vance",
    studentWallet: studentAlice.address,
    degree: "Certificate of Completion",
    program: "Quantum Computing Lab",
    institution: "Massachusetts Institute of Technology (MIT)",
    graduationDate: "2023-11-10",
  });
  const hash3 = ethers.keccak256(ethers.toUtf8Bytes(rawRecord3));

  console.log(`📜 MIT issuing Quantum Certificate to Alice...`);
  const issueTx3 = await chainCredMIT.issueCredential(
    studentAlice.address,
    "Professional Certificate",
    "Quantum Computing Lab",
    hash3,
    "ipfs://bafybeihk373xnbvvpt54l255p67g6n3tpy3bxl73zrm537yfqoogx6mjsv",
    0
  );
  const receipt3 = await issueTx3.wait();
  const credId3 = getCredentialIssuedId(receipt3, chainCredMIT);
  console.log(`  └─ Credential ID 3: ${credId3}`);

  console.log(`⚠️ Revoking Credential 3 for revocation demo...`);
  const revokeTx = await chainCredMIT.revokeCredential(credId3, "Curriculum change / Refunded course");
  await revokeTx.wait();
  console.log(`  └─ Revoked Credential ID 3`);

  console.log("\n🎉 Seed script finished successfully!");
  console.log("-----------------------------------------");
  console.log(`👑 Admin Account (0):    ${admin.address}`);
  console.log(`🏫 MIT Issuer Account (1): ${mitIssuer.address}`);
  console.log(`🏫 Stanford Issuer (2):    ${stanfordIssuer.address}`);
  console.log(`🎓 Alice Student (3):     ${studentAlice.address}`);
  console.log(`🎓 Bob Student (4):       ${studentBob.address}`);
  console.log(`📜 Credential ID 1 (Valid):   ${credId1}`);
  console.log(`📜 Credential ID 2 (Valid):   ${credId2}`);
  console.log(`📜 Credential ID 3 (Revoked): ${credId3}`);
  console.log("-----------------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  });
