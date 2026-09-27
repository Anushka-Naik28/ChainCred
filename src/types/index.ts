export enum CredentialStatus {
  Valid = 0,
  Revoked = 1,
}

export interface CredentialData {
  id: string; // bytes32 hex string
  recipient: string; // address
  issuer: string; // address
  credentialType: string; // e.g. "Bachelor of Science"
  program: string; // e.g. "Computer Science"
  credentialHash: string; // bytes32 SHA-256 / Keccak hash
  metadataURI: string;
  issueDate: number; // unix timestamp
  expiryDate: number; // unix timestamp or 0
  status: CredentialStatus;
  exists: boolean;
}

export interface VerificationResult {
  exists: boolean;
  isValid: boolean;
  recipient: string;
  issuer: string;
  credentialType: string;
  program: string;
  credentialHash: string;
  metadataURI: string;
  issueDate: number;
  expiryDate: number;
  status: CredentialStatus;
}

export interface IssueCredentialInput {
  recipient: string;
  credentialType: string;
  program: string;
  studentName?: string;
  gpa?: string;
  honors?: string;
  metadataURI?: string;
  expiryDate?: string;
}

export interface UserRole {
  isAdmin: boolean;
  isIssuer: boolean;
  isStudent: boolean;
}
