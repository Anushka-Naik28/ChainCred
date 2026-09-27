// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ChainCred — Decentralized Academic Credential Network
 * @notice Smart contract for managing authorized educational issuers, issuing verifiable academic credentials,
 * checking tamper-evident credential integrity, and enabling decentralized credential revocation.
 */
contract ChainCred is Ownable {

    enum CredentialStatus { Valid, Revoked }

    struct Credential {
        bytes32 id;             // Unique ID (keccak256 hash)
        address recipient;      // Student wallet address
        address issuer;         // Educational institution wallet address
        string credentialType;  // e.g., "Bachelor of Science", "Master of Arts", "Certificate"
        string program;         // e.g., "Computer Science", "Data Engineering"
        bytes32 credentialHash; // SHA-256 / Keccak-256 hash of off-chain academic payload
        string metadataURI;     // Off-chain URI (IPFS / API endpoint) for metadata
        uint256 issueDate;      // Block timestamp at issuance
        uint256 expiryDate;     // Expiry timestamp (0 if non-expiring)
        CredentialStatus status;// Valid or Revoked
        bool exists;            // Existence flag
    }

    // --- State Variables ---
    
    // Mapping of authorized educational institution issuers
    mapping(address => bool) public authorizedIssuers;
    address[] public issuerList;

    // Mapping from Credential ID => Credential Struct
    mapping(bytes32 => Credential) private credentials;
    bytes32[] public allCredentialIds;

    // Mapping from Student Wallet => Array of Credential IDs
    mapping(address => bytes32[]) private studentCredentials;

    // Mapping from Issuer Wallet => Array of Credential IDs
    mapping(address => bytes32[]) private issuerCredentials;

    // --- Events ---
    event IssuerAdded(address indexed issuer, uint256 timestamp);
    event IssuerRemoved(address indexed issuer, uint256 timestamp);
    event CredentialIssued(
        bytes32 indexed id,
        address indexed recipient,
        address indexed issuer,
        string credentialType,
        uint256 timestamp
    );
    event CredentialRevoked(
        bytes32 indexed id,
        address indexed issuer,
        string reason,
        uint256 timestamp
    );

    // --- Modifiers ---
    modifier onlyAuthorizedIssuer() {
        require(authorizedIssuers[msg.sender], "ChainCred: Caller is not an authorized issuer");
        _;
    }

    /**
     * @notice Contract constructor initializing the admin/owner.
     */
    constructor() Ownable(msg.sender) {}

    // ==========================================
    // 1. ADMIN / ISSUER MANAGEMENT FUNCTIONS
    // ==========================================

    /**
     * @notice Authorize an educational institution to issue credentials.
     * @param _issuer Address of the institution wallet.
     */
    function addIssuer(address _issuer) external onlyOwner {
        require(_issuer != address(0), "ChainCred: Invalid issuer address");
        require(!authorizedIssuers[_issuer], "ChainCred: Issuer already authorized");

        authorizedIssuers[_issuer] = true;
        issuerList.push(_issuer);

        emit IssuerAdded(_issuer, block.timestamp);
    }

    /**
     * @notice Deauthorize an educational institution from issuing new credentials.
     * @param _issuer Address of the institution wallet.
     */
    function removeIssuer(address _issuer) external onlyOwner {
        require(authorizedIssuers[_issuer], "ChainCred: Address is not an authorized issuer");

        authorizedIssuers[_issuer] = false;

        // Remove from issuerList array
        for (uint256 i = 0; i < issuerList.length; i++) {
            if (issuerList[i] == _issuer) {
                issuerList[i] = issuerList[issuerList.length - 1];
                issuerList.pop();
                break;
            }
        }

        emit IssuerRemoved(_issuer, block.timestamp);
    }

    /**
     * @notice Check whether an address is an authorized issuer.
     * @param _issuer Address to query.
     */
    function isAuthorizedIssuer(address _issuer) external view returns (bool) {
        return authorizedIssuers[_issuer];
    }

    /**
     * @notice Get array of all authorized issuer addresses.
     */
    function getAllIssuers() external view returns (address[] memory) {
        return issuerList;
    }

    // ==========================================
    // 2. CREDENTIAL ISSUANCE FUNCTIONS
    // ==========================================

    /**
     * @notice Issue a new verifiable academic credential.
     * @param _recipient Wallet address of the student recipient.
     * @param _credentialType Name of credential (e.g. Bachelor of Science).
     * @param _program Academic program or course.
     * @param _credentialHash SHA-256/Keccak-256 hash of off-chain record.
     * @param _metadataURI URI string pointing to off-chain credential metadata.
     * @param _expiryDate Unix timestamp of expiration (0 for non-expiring).
     * @return credentialId Generated unique credential identifier.
     */
    function issueCredential(
        address _recipient,
        string calldata _credentialType,
        string calldata _program,
        bytes32 _credentialHash,
        string calldata _metadataURI,
        uint256 _expiryDate
    ) external onlyAuthorizedIssuer returns (bytes32 credentialId) {
        require(_recipient != address(0), "ChainCred: Invalid recipient address");
        require(bytes(_credentialType).length > 0, "ChainCred: Credential type required");
        require(bytes(_program).length > 0, "ChainCred: Program name required");
        require(_credentialHash != bytes32(0), "ChainCred: Credential hash required");
        if (_expiryDate > 0) {
            require(_expiryDate > block.timestamp, "ChainCred: Expiry date must be in the future");
        }

        // Generate unique deterministic & timestamped Credential ID
        credentialId = keccak256(
            abi.encodePacked(
                msg.sender,
                _recipient,
                _credentialHash,
                block.timestamp,
                allCredentialIds.length
            )
        );

        require(!credentials[credentialId].exists, "ChainCred: Credential ID collision");

        Credential memory newCred = Credential({
            id: credentialId,
            recipient: _recipient,
            issuer: msg.sender,
            credentialType: _credentialType,
            program: _program,
            credentialHash: _credentialHash,
            metadataURI: _metadataURI,
            issueDate: block.timestamp,
            expiryDate: _expiryDate,
            status: CredentialStatus.Valid,
            exists: true
        });

        credentials[credentialId] = newCred;
        allCredentialIds.push(credentialId);
        studentCredentials[_recipient].push(credentialId);
        issuerCredentials[msg.sender].push(credentialId);

        emit CredentialIssued(
            credentialId,
            _recipient,
            msg.sender,
            _credentialType,
            block.timestamp
        );

        return credentialId;
    }

    // ==========================================
    // 3. CREDENTIAL REVOCATION FUNCTIONS
    // ==========================================

    /**
     * @notice Revoke an issued academic credential.
     * @dev Only the original issuing institution can revoke its credential.
     * @param _id Unique credential identifier.
     * @param _reason Human-readable reason for revocation.
     */
    function revokeCredential(bytes32 _id, string calldata _reason) external {
        require(credentials[_id].exists, "ChainCred: Credential does not exist");
        require(credentials[_id].issuer == msg.sender, "ChainCred: Only original issuing institution can revoke");
        require(credentials[_id].status == CredentialStatus.Valid, "ChainCred: Credential is already revoked");

        credentials[_id].status = CredentialStatus.Revoked;

        emit CredentialRevoked(_id, msg.sender, _reason, block.timestamp);
    }

    // ==========================================
    // 4. RETRIEVAL & VERIFICATION FUNCTIONS
    // ==========================================

    /**
     * @notice Fetch full details of a credential by ID.
     * @param _id Credential identifier.
     */
    function getCredential(bytes32 _id) external view returns (Credential memory) {
        require(credentials[_id].exists, "ChainCred: Credential does not exist");
        return credentials[_id];
    }

    /**
     * @notice Public verification endpoint for verifiers.
     * @param _id Credential identifier to query.
     */
    function verifyCredential(bytes32 _id) external view returns (
        bool exists,
        bool isValid,
        address recipient,
        address issuer,
        string memory credentialType,
        string memory program,
        bytes32 credentialHash,
        string memory metadataURI,
        uint256 issueDate,
        uint256 expiryDate,
        CredentialStatus status
    ) {
        Credential memory cred = credentials[_id];
        if (!cred.exists) {
            return (false, false, address(0), address(0), "", "", bytes32(0), "", 0, 0, CredentialStatus.Revoked);
        }

        bool valid = (cred.status == CredentialStatus.Valid);
        if (cred.expiryDate > 0 && block.timestamp >= cred.expiryDate) {
            valid = false;
        }

        return (
            true,
            valid,
            cred.recipient,
            cred.issuer,
            cred.credentialType,
            cred.program,
            cred.credentialHash,
            cred.metadataURI,
            cred.issueDate,
            cred.expiryDate,
            cred.status
        );
    }

    /**
     * @notice Get all credential IDs associated with a student's wallet address.
     * @param _student Student recipient wallet address.
     */
    function getCredentialsByStudent(address _student) external view returns (bytes32[] memory) {
        return studentCredentials[_student];
    }

    /**
     * @notice Get all credential IDs issued by an institution wallet address.
     * @param _issuer Institution wallet address.
     */
    function getCredentialsByIssuer(address _issuer) external view returns (bytes32[] memory) {
        return issuerCredentials[_issuer];
    }

    /**
     * @notice Get total count of credentials issued on-chain.
     */
    function getCredentialCount() external view returns (uint256) {
        return allCredentialIds.length;
    }

    /**
     * @notice Get array of all credential IDs.
     */
    function getAllCredentialIds() external view returns (bytes32[] memory) {
        return allCredentialIds;
    }
}
