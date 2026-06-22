// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SecurityLogs {
    struct Log {
        address user;
        string actionType;
        string details;
        uint256 timestamp;
        bytes32 logHash;
        bool isSuspicious;
    }

    Log[] public logs;
    mapping(address => uint256[]) public userLogs;
    mapping(address => uint256) public lastLoginTime;
    mapping(address => uint256) public loginCount;

    event LogAdded(address indexed user, string actionType, uint256 timestamp, bytes32 logHash, bool isSuspicious);

    function addLog(string memory actionType, string memory details, bytes32 logHash) public {
        bool suspicious = false;

        if (keccak256(bytes(actionType)) == keccak256(bytes("LOGIN"))) {
            if (block.timestamp - lastLoginTime[msg.sender] < 30) {
                loginCount[msg.sender]++;
            } else {
                loginCount[msg.sender] = 1;
            }
            lastLoginTime[msg.sender] = block.timestamp;

            if (loginCount[msg.sender] >= 3) {
                suspicious = true;
            }
        }

        Log memory newLog = Log({
            user: msg.sender,
            actionType: actionType,
            details: details,
            timestamp: block.timestamp,
            logHash: logHash,
            isSuspicious: suspicious
        });

        uint256 index = logs.length;
        logs.push(newLog);
        userLogs[msg.sender].push(index);

        emit LogAdded(msg.sender, actionType, block.timestamp, logHash, suspicious);
    }

    function getAllLogs() public view returns (Log[] memory) {
        return logs;
    }

    function getUserLogs(address user) public view returns (Log[] memory) {
        uint256[] memory indices = userLogs[user];
        Log[] memory result = new Log[](indices.length);
        for (uint256 i = 0; i < indices.length; i++) {
            result[i] = logs[indices[i]];
        }
        return result;
    }

    function getLogsCount() public view returns (uint256) {
        return logs.length;
    }
}