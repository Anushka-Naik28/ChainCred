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
  console.log("🚀 Deploying & Seeding ChainCred Smart Contract...");

  const signers = await ethers.getSigners();
  const admin = signers[0];
  const mitIssuer = signers[1] || admin;
  const stanfordIssuer = signers[2] || admin;
  const studentAlice = signers[3] || admin;
  const studentBob = signers[4] || admin;

  console.log(`📍 Deployer / Admin Wallet: ${admin.address}`);

  const ChainCred = await ethers.getContractFactory("ChainCred");
  const chainCred = await ChainCred.deploy();
  await chainCred.waitForDeployment();

  const contractAddress = await chainCred.getAddress();
  console.log(`✅ ChainCred deployed to: ${contractAddress}`);

  // Save Contract Info for Frontend
  const artifactPath = path.join(__dirname, "../artifacts/contracts/ChainCred.sol/ChainCred.json");
  let artifactAbi = [];
  if (fs.existsSync(artifactPath)) {
    artifactAbi = JSON.parse(fs.readFileSync(artifactPath, "utf8")).abi;
  }

  const contractInfo = {
    address: contractAddress,
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    deployer: admin.address,
    abi: artifactAbi,
  };

  const libDir = path.join(__dirname, "../src/lib");
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
  }
  fs.writeFileSync(path.join(libDir, "contractInfo.json"), JSON.stringify(contractInfo, null, 2));
  console.log("📁 Saved contract info to src/lib/contractInfo.json");

  // --- SEED DATA ---
  console.log("\n🌱 Authorizing Educational Institutions...");
  await (await chainCred.addIssuer(mitIssuer.address)).wait();
  console.log(`  └─ Authorized MIT (${mitIssuer.address})`);

  await (await chainCred.addIssuer(stanfordIssuer.address)).wait();
  console.log(`  └─ Authorized Stanford (${stanfordIssuer.address})`);

  // MIT Issues Credential 1 to Alice
  const chainCredMIT = chainCred.connect(mitIssuer);
  const rawRecord1 = JSON.stringify({
    studentName: "Alice Vance",
    studentWallet: studentAlice.address,
    degree: "Bachelor of Science",
    program: "Computer Science & Artificial Intelligence",
    institution: "Massachusetts Institute of Technology (MIT)",
    gpa: "3.95 / 4.00",
    honors: "Summa Cum Laude",
  });
  const hash1 = ethers.keccak256(ethers.toUtf8Bytes(rawRecord1));

  console.log("\n📜 Issuing Credential 1 (MIT → Alice)...");
  const tx1 = await chainCredMIT.issueCredential(
    studentAlice.address,
    "Bachelor of Science",
    "Computer Science & AI",
    hash1,
    "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
    0
  );
  const receipt1 = await tx1.wait();
  const credId1 = getCredentialIssuedId(receipt1, chainCred);
  console.log(`  └─ Credential ID 1: ${credId1}`);

  // Stanford Issues Credential 2 to Bob
  const chainCredStanford = chainCred.connect(stanfordIssuer);
  const rawRecord2 = JSON.stringify({
    studentName: "Bob Smith",
    studentWallet: studentBob.address,
    degree: "Master of Science",
    program: "Cybersecurity & Cryptography",
    institution: "Stanford University",
    gpa: "4.00 / 4.00",
  });
  const hash2 = ethers.keccak256(ethers.toUtf8Bytes(rawRecord2));

  console.log("\n📜 Issuing Credential 2 (Stanford → Bob)...");
  const tx2 = await chainCredStanford.issueCredential(
    studentBob.address,
    "Master of Science",
    "Cybersecurity & Cryptography",
    hash2,
    "ipfs://bafybeicg263jnbvvpt54l255p67g6n3tpy3bxl73zrm537yfqoogx6mjsu",
    0
  );
  const receipt2 = await tx2.wait();
  const credId2 = getCredentialIssuedId(receipt2, chainCred);
  console.log(`  └─ Credential ID 2: ${credId2}`);

  // MIT Issues & Revokes Credential 3 for Revocation Demo
  const rawRecord3 = JSON.stringify({
    studentName: "Alice Vance",
    studentWallet: studentAlice.address,
    degree: "Certificate of Completion",
    program: "Quantum Computing Lab",
    institution: "MIT",
  });
  const hash3 = ethers.keccak256(ethers.toUtf8Bytes(rawRecord3));

  console.log("\n📜 Issuing Credential 3 (MIT → Alice)...");
  const tx3 = await chainCredMIT.issueCredential(
    studentAlice.address,
    "Professional Certificate",
    "Quantum Computing Lab",
    hash3,
    "ipfs://bafybeihk373xnbvvpt54l255p67g6n3tpy3bxl73zrm537yfqoogx6mjsv",
    0
  );
  const receipt3 = await tx3.wait();
  const credId3 = getCredentialIssuedId(receipt3, chainCred);
  console.log(`  └─ Credential ID 3: ${credId3}`);

  console.log("⚠️ Revoking Credential 3 for revocation demo...");
  await (await chainCredMIT.revokeCredential(credId3, "Curriculum Refund / Course withdrawal")).wait();
  console.log(`  └─ Revoked Credential ID 3`);

  console.log("\n🎉 Deployment & Seeding Completed Successfully!");
  console.log("-----------------------------------------");
  console.log(`👑 Admin Account:    ${admin.address}`);
  console.log(`🏫 MIT Issuer:       ${mitIssuer.address}`);
  console.log(`🏫 Stanford Issuer:  ${stanfordIssuer.address}`);
  console.log(`🎓 Alice Student:   ${studentAlice.address}`);
  console.log(`🎓 Bob Student:     ${studentBob.address}`);
  console.log(`📜 Credential ID 1 (Valid):   ${credId1}`);
  console.log(`📜 Credential ID 2 (Valid):   ${credId2}`);
  console.log(`📜 Credential ID 3 (Revoked): ${credId3}`);
  console.log("-----------------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Deploy & Seed failed:", err);
    process.exit(1);
  });
