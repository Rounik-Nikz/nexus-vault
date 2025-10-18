// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title FileRegistry
 * @dev This contract manages file metadata storage and role-based access control.
 * It allows admins to store file CIDs from IPFS and the owner to manage admins.
 */
contract FileRegistry {
    // --- State Variables ---

    address public owner;

    struct File {
        string cid;
        string filename;
        address uploader;
        uint256 timestamp;
    }

    File[] public files;
    mapping(address => bool) public admins;

    // --- Events ---

    event FileStored(
    string cid,
    string filename,
    address indexed uploader,
    uint256 timestamp
    );
    
    event AdminGranted(address indexed admin);
    event AdminRevoked(address indexed admin);

    // --- Modifiers ---

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    modifier onlyAdmin() {
        require(admins[msg.sender], "Caller is not an admin");
        _;
    }

    // --- Constructor ---

    constructor() {
        owner = msg.sender;
        admins[msg.sender] = true; // The owner is also an admin by default
    }

    // --- Functions ---

    /**
     * @dev Stores a file's metadata on the blockchain.
     * Can only be called by an admin.
     * @param _cid The IPFS Content Identifier (CID).
     * @param _filename The original name of the file.
     */
    function storeFile(string memory _cid, string memory _filename) public onlyAdmin {
        files.push(File({
            cid: _cid,
            filename: _filename,
            uploader: msg.sender,
            timestamp: block.timestamp
        }));
        emit FileStored(_cid, _filename, msg.sender, block.timestamp);
    }

    /**
     * @dev Grants admin privileges to an address.
     * Can only be called by the contract owner.
     * @param _admin The address to grant admin rights to.
     */
    function grantAdmin(address _admin) public onlyOwner {
        require(_admin != address(0), "Invalid admin address");
        admins[_admin] = true;
        emit AdminGranted(_admin);
    }

    /**
     * @dev Revokes admin privileges from an address.
     * Can only be called by the contract owner.
     * @param _admin The address to revoke admin rights from.
     */
    function revokeAdmin(address _admin) public onlyOwner {
        require(_admin != owner, "Cannot revoke owner's admin status");
        admins[_admin] = false;
        emit AdminRevoked(_admin);
    }

    // --- Getter Functions ---

    /**
     * @dev Returns the total number of files stored.
     * @return The count of files.
     */
    function totalFiles() public view returns (uint256) {
        return files.length;
    }

    /**
     * @dev Retrieves file metadata by its index.
     * @param _index The index of the file in the files array.
     * @return The file's metadata.
     */
    function getFile(uint256 _index) public view returns (string memory, string memory, address, uint256) {
        require(_index < files.length, "Index out of bounds");
        File storage file = files[_index];
        return (file.cid, file.filename, file.uploader, file.timestamp);
    }

    /**
     * @dev Returns an array of all current admin addresses.
     * Note: This is a helper for demonstration and can be gas-intensive.
     * In a production environment, you would rely on events.
     */
    function getAdmins() public pure returns (address[] memory) {
        // This is a placeholder for a more complex implementation if needed
        // For this project, we will rely on the backend to track admins via events.
        // Returning a dynamic array of addresses like this from storage is an anti-pattern
        // due to potential high gas costs. We'll manage this list off-chain.
        address[] memory adminList = new address[](0);
        return adminList;
    }
}