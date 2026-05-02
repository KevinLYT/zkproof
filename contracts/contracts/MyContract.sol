// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IGroth16Verifier {
    function verifyProof(
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint[3] calldata _pubSignals
    ) external view returns (bool);
}

contract MyContract {
    uint256 private constant FIELD_SIZE =
        21888242871839275222246405745257275088548364400416034343698204186575808495617;

    struct Message {
        address from;
        address to;
        string content;
        uint256 timestamp;
        uint256 nullifierHash;
    }

    IGroth16Verifier public verifier;
    address public owner;
    uint256 public merkleRoot;

    mapping(uint256 => bool) public usedNullifierHashes;
    mapping(address => Message[]) private receivedMessages;

    event MessageSent(
        address indexed from,
        address indexed to,
        string content,
        uint256 timestamp,
        uint256 nullifierHash,
        uint256 messageHash
    );

    event MerkleRootUpdated(uint256 oldRoot, uint256 newRoot);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address _verifier, uint256 _merkleRoot) {
        require(_verifier != address(0), "Invalid verifier");
        verifier = IGroth16Verifier(_verifier);
        owner = msg.sender;
        merkleRoot = _merkleRoot;
    }

    function computeMessageHash(
        string calldata _content
    ) external pure returns (uint256) {
        return uint256(sha256(bytes(_content))) % FIELD_SIZE;
    }

    function updateMerkleRoot(uint256 _newRoot) external onlyOwner {
        uint256 oldRoot = merkleRoot;
        merkleRoot = _newRoot;
        emit MerkleRootUpdated(oldRoot, _newRoot);
    }

    function sendMessageWithProof(
        address _to,
        string calldata _content,
        uint[2] calldata _pA,
        uint[2][2] calldata _pB,
        uint[2] calldata _pC,
        uint256 _nullifierHash
    ) external {
        require(_to != address(0), "Invalid recipient");
        require(bytes(_content).length > 0, "Empty content");
        require(!usedNullifierHashes[_nullifierHash], "Proof already used");

        uint256 messageHash = uint256(sha256(bytes(_content))) % FIELD_SIZE;
        uint[3] memory pubSignals = [merkleRoot, messageHash, _nullifierHash];

        bool ok = verifier.verifyProof(_pA, _pB, _pC, pubSignals);
        require(ok, "Invalid zk proof");

        usedNullifierHashes[_nullifierHash] = true;

        receivedMessages[_to].push(
            Message({
                from: msg.sender,
                to: _to,
                content: _content,
                timestamp: block.timestamp,
                nullifierHash: _nullifierHash
            })
        );

        emit MessageSent(
            msg.sender,
            _to,
            _content,
            block.timestamp,
            _nullifierHash,
            messageHash
        );
    }

    function receiveMessagesContentWithSender(
        address _address
    ) external view returns (string[] memory, address[] memory) {
        uint256 messageCount = receivedMessages[_address].length;

        string[] memory contents = new string[](messageCount);
        address[] memory senders = new address[](messageCount);

        for (uint256 i = 0; i < messageCount; i++) {
            contents[i] = receivedMessages[_address][i].content;
            senders[i] = receivedMessages[_address][i].from;
        }

        return (contents, senders);
    }
}
