const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ChainCred Smart Contract", function () {
  let chainCred;
  let admin, issuer1, issuer2, student1, student2, verifier, unauthorized;

  const sampleHash1 = ethers.keccak256(ethers.toUtf8Bytes("Student John Doe - B.S. CS - GPA 3.9"));
  const sampleHash2 = ethers.keccak256(ethers.toUtf8Bytes("Student Jane Smith - M.S. AI - GPA 4.0"));
  const sampleURI = "ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco";

  beforeEach(async function () {
    [admin, issuer1, issuer2, student1, student2, verifier, unauthorized] = await ethers.getSigners();

    const ChainCredFactory = await ethers.getContractFactory("ChainCred");
    chainCred = await ChainCredFactory.deploy();
    await chainCred.waitForDeployment();
  });

  describe("Deployment & Ownership", function () {
    it("Should set the deployer as the owner/admin", async function () {
      expect(await chainCred.owner()).to.equal(admin.address);
    });

    it("Should start with 0 total credentials", async function () {
      expect(await chainCred.getCredentialCount()).to.equal(0);
    });
  });

  describe("Issuer Management", function () {
    it("Should allow admin to add an issuer and emit IssuerAdded event", async function () {
      await expect(chainCred.connect(admin).addIssuer(issuer1.address))
        .to.emit(chainCred, "IssuerAdded");

      expect(await chainCred.isAuthorizedIssuer(issuer1.address)).to.be.true;

      const issuers = await chainCred.getAllIssuers();
      expect(issuers).to.include(issuer1.address);
    });

    it("Should reject adding zero address as issuer", async function () {
      await expect(
        chainCred.connect(admin).addIssuer(ethers.ZeroAddress)
      ).to.be.revertedWith("ChainCred: Invalid issuer address");
    });

    it("Should reject adding an already authorized issuer", async function () {
      await chainCred.connect(admin).addIssuer(issuer1.address);
      await expect(
        chainCred.connect(admin).addIssuer(issuer1.address)
      ).to.be.revertedWith("ChainCred: Issuer already authorized");
    });

    it("Should prevent non-admin from adding issuers", async function () {
      await expect(
        chainCred.connect(unauthorized).addIssuer(issuer1.address)
      ).to.be.revertedWithCustomError(chainCred, "OwnableUnauthorizedAccount");
    });

    it("Should allow admin to remove an issuer and emit IssuerRemoved event", async function () {
      await chainCred.connect(admin).addIssuer(issuer1.address);
      expect(await chainCred.isAuthorizedIssuer(issuer1.address)).to.be.true;

      await expect(chainCred.connect(admin).removeIssuer(issuer1.address))
        .to.emit(chainCred, "IssuerRemoved");

      expect(await chainCred.isAuthorizedIssuer(issuer1.address)).to.be.false;
      const issuers = await chainCred.getAllIssuers();
      expect(issuers).to.not.include(issuer1.address);
    });

    it("Should reject removing non-authorized issuer", async function () {
      await expect(
        chainCred.connect(admin).removeIssuer(issuer1.address)
      ).to.be.revertedWith("ChainCred: Address is not an authorized issuer");
    });
  });

  describe("Credential Issuance", function () {
    beforeEach(async function () {
      await chainCred.connect(admin).addIssuer(issuer1.address);
    });

    it("Should allow authorized issuer to issue credential and emit CredentialIssued event", async function () {
      const tx = await chainCred.connect(issuer1).issueCredential(
        student1.address,
        "Bachelor of Science",
        "Computer Science",
        sampleHash1,
        sampleURI,
        0
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(log => log.fragment && log.fragment.name === "CredentialIssued");
      expect(event).to.not.be.undefined;

      const credId = event.args[0];
      expect(event.args[1]).to.equal(student1.address);
      expect(event.args[2]).to.equal(issuer1.address);
      expect(event.args[3]).to.equal("Bachelor of Science");

      const cred = await chainCred.getCredential(credId);
      expect(cred.recipient).to.equal(student1.address);
      expect(cred.issuer).to.equal(issuer1.address);
      expect(cred.credentialType).to.equal("Bachelor of Science");
      expect(cred.program).to.equal("Computer Science");
      expect(cred.credentialHash).to.equal(sampleHash1);
      expect(cred.status).to.equal(0); // Valid
    });

    it("Should prevent unauthorized wallet from issuing credentials", async function () {
      await expect(
        chainCred.connect(unauthorized).issueCredential(
          student1.address,
          "Bachelor of Science",
          "Computer Science",
          sampleHash1,
          sampleURI,
          0
        )
      ).to.be.revertedWith("ChainCred: Caller is not an authorized issuer");
    });

    it("Should reject invalid recipient zero address", async function () {
      await expect(
        chainCred.connect(issuer1).issueCredential(
          ethers.ZeroAddress,
          "Bachelor of Science",
          "Computer Science",
          sampleHash1,
          sampleURI,
          0
        )
      ).to.be.revertedWith("ChainCred: Invalid recipient address");
    });

    it("Should reject empty credential type or program", async function () {
      await expect(
        chainCred.connect(issuer1).issueCredential(
          student1.address,
          "",
          "Computer Science",
          sampleHash1,
          sampleURI,
          0
        )
      ).to.be.revertedWith("ChainCred: Credential type required");

      await expect(
        chainCred.connect(issuer1).issueCredential(
          student1.address,
          "Bachelor of Science",
          "",
          sampleHash1,
          sampleURI,
          0
        )
      ).to.be.revertedWith("ChainCred: Program name required");
    });

    it("Should reject empty credential hash", async function () {
      await expect(
        chainCred.connect(issuer1).issueCredential(
          student1.address,
          "Bachelor of Science",
          "Computer Science",
          ethers.ZeroHash,
          sampleURI,
          0
        )
      ).to.be.revertedWith("ChainCred: Credential hash required");
    });
  });

  describe("Credential Retrieval & Student Mapping", function () {
    let credId1, credId2;

    beforeEach(async function () {
      await chainCred.connect(admin).addIssuer(issuer1.address);

      const tx1 = await chainCred.connect(issuer1).issueCredential(
        student1.address,
        "Bachelor of Science",
        "Computer Science",
        sampleHash1,
        sampleURI,
        0
      );
      const receipt1 = await tx1.wait();
      credId1 = receipt1.logs.find(l => l.fragment && l.fragment.name === "CredentialIssued").args[0];

      const tx2 = await chainCred.connect(issuer1).issueCredential(
        student1.address,
        "Master of Science",
        "Artificial Intelligence",
        sampleHash2,
        sampleURI,
        0
      );
      const receipt2 = await tx2.wait();
      credId2 = receipt2.logs.find(l => l.fragment && l.fragment.name === "CredentialIssued").args[0];
    });

    it("Should retrieve student credentials correctly", async function () {
      const studentCreds = await chainCred.getCredentialsByStudent(student1.address);
      expect(studentCreds.length).to.equal(2);
      expect(studentCreds[0]).to.equal(credId1);
      expect(studentCreds[1]).to.equal(credId2);
    });

    it("Should retrieve issuer credentials correctly", async function () {
      const issuerCreds = await chainCred.getCredentialsByIssuer(issuer1.address);
      expect(issuerCreds.length).to.equal(2);
      expect(issuerCreds[0]).to.equal(credId1);
    });

    it("Should return total credential count correctly", async function () {
      expect(await chainCred.getCredentialCount()).to.equal(2);
    });
  });

  describe("Credential Revocation", function () {
    let credId;

    beforeEach(async function () {
      await chainCred.connect(admin).addIssuer(issuer1.address);
      await chainCred.connect(admin).addIssuer(issuer2.address);

      const tx = await chainCred.connect(issuer1).issueCredential(
        student1.address,
        "Bachelor of Science",
        "Computer Science",
        sampleHash1,
        sampleURI,
        0
      );
      const receipt = await tx.wait();
      credId = receipt.logs.find(l => l.fragment && l.fragment.name === "CredentialIssued").args[0];
    });

    it("Should allow the original issuing institution to revoke its credential and emit CredentialRevoked event", async function () {
      await expect(chainCred.connect(issuer1).revokeCredential(credId, "Academic Dishonesty"))
        .to.emit(chainCred, "CredentialRevoked");

      const cred = await chainCred.getCredential(credId);
      expect(cred.status).to.equal(1); // Revoked
    });

    it("Should prevent another issuer from revoking the credential", async function () {
      await expect(
        chainCred.connect(issuer2).revokeCredential(credId, "Unauthorized attempt")
      ).to.be.revertedWith("ChainCred: Only original issuing institution can revoke");
    });

    it("Should prevent student or arbitrary wallet from revoking", async function () {
      await expect(
        chainCred.connect(student1).revokeCredential(credId, "Self revoke")
      ).to.be.revertedWith("ChainCred: Only original issuing institution can revoke");
    });

    it("Should prevent revoking an already revoked credential", async function () {
      await chainCred.connect(issuer1).revokeCredential(credId, "First revocation");
      await expect(
        chainCred.connect(issuer1).revokeCredential(credId, "Second revocation")
      ).to.be.revertedWith("ChainCred: Credential is already revoked");
    });

    it("Should fail when revoking a nonexistent credential", async function () {
      const fakeId = ethers.keccak256(ethers.toUtf8Bytes("nonexistent"));
      await expect(
        chainCred.connect(issuer1).revokeCredential(fakeId, "Fake ID")
      ).to.be.revertedWith("ChainCred: Credential does not exist");
    });
  });

  describe("Public Credential Verification", function () {
    let credId;

    beforeEach(async function () {
      await chainCred.connect(admin).addIssuer(issuer1.address);
      const tx = await chainCred.connect(issuer1).issueCredential(
        student1.address,
        "Bachelor of Engineering",
        "Software Engineering",
        sampleHash1,
        sampleURI,
        0
      );
      const receipt = await tx.wait();
      credId = receipt.logs.find(l => l.fragment && l.fragment.name === "CredentialIssued").args[0];
    });

    it("Should return VALID status for an active credential", async function () {
      const result = await chainCred.verifyCredential(credId);
      expect(result.exists).to.be.true;
      expect(result.isValid).to.be.true;
      expect(result.recipient).to.equal(student1.address);
      expect(result.issuer).to.equal(issuer1.address);
      expect(result.credentialType).to.equal("Bachelor of Engineering");
      expect(result.program).to.equal("Software Engineering");
      expect(result.credentialHash).to.equal(sampleHash1);
      expect(result.status).to.equal(0); // Valid
    });

    it("Should return REVOKED status after revocation", async function () {
      await chainCred.connect(issuer1).revokeCredential(credId, "Course withdrawal");

      const result = await chainCred.verifyCredential(credId);
      expect(result.exists).to.be.true;
      expect(result.isValid).to.be.false;
      expect(result.status).to.equal(1); // Revoked
    });

    it("Should return NOT FOUND for invalid credential ID", async function () {
      const fakeId = ethers.keccak256(ethers.toUtf8Bytes("nonexistent_id"));
      const result = await chainCred.verifyCredential(fakeId);
      expect(result.exists).to.be.false;
      expect(result.isValid).to.be.false;
    });
  });
});
