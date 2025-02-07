// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract QuantumIdentity {
    struct Identity {
        string name;
        string publicKey;
        string metadata;
        bool isVerified;
    }

    mapping(address => Identity) public identities;
    mapping(address => bool) public verifiers;
    address public owner;

    event IdentityRegistered(address indexed user, string name, string publicKey);
    event IdentityVerified(address indexed user, bool status);

    constructor() {
        owner = msg.sender;
        verifiers[msg.sender] = true;
    }

    function registerIdentity(string memory _name, string memory _publicKey, string memory _metadata) public {
        require(bytes(identities[msg.sender].name).length == 0, "Identity already registered");
        identities[msg.sender] = Identity(_name, _publicKey, _metadata, false);
        emit IdentityRegistered(msg.sender, _name, _publicKey);
    }

    function verifyIdentity(address _user, bool _status) public {
        require(verifiers[msg.sender], "Not authorized");
        identities[_user].isVerified = _status;
        emit IdentityVerified(_user, _status);
    }

    function addVerifier(address _verifier) public {
        require(msg.sender == owner, "Only owner can add verifiers");
        verifiers[_verifier] = true;
    }
}
