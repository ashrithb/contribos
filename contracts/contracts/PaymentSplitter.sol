// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract PaymentSplitter {
    address public owner;
    address[] public contributors;
    mapping(address => uint256) public weights;
    uint256 public totalWeight;

    event PaymentReceived(address indexed from, uint256 amount);
    event PaymentSplit(address indexed to, uint256 amount);
    event TokenPaymentSplit(address indexed token, address indexed to, uint256 amount);
    event WeightsUpdated(address[] contributors, uint256[] newWeights);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor(address[] memory _contributors, uint256[] memory _weights) {
        require(_contributors.length == _weights.length, "Length mismatch");
        owner = msg.sender;
        _setWeights(_contributors, _weights);
    }

    receive() external payable {
        emit PaymentReceived(msg.sender, msg.value);
    }

    function splitPayment() external {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance");
        for (uint256 i = 0; i < contributors.length; i++) {
            uint256 share = (balance * weights[contributors[i]]) / totalWeight;
            if (share > 0) {
                payable(contributors[i]).transfer(share);
                emit PaymentSplit(contributors[i], share);
            }
        }
    }

    function splitTokenPayment(address token) external {
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No token balance");
        for (uint256 i = 0; i < contributors.length; i++) {
            uint256 share = (balance * weights[contributors[i]]) / totalWeight;
            if (share > 0) {
                IERC20(token).transfer(contributors[i], share);
                emit TokenPaymentSplit(token, contributors[i], share);
            }
        }
    }

    function updateWeights(address[] memory _contributors, uint256[] memory _weights) external onlyOwner {
        _setWeights(_contributors, _weights);
    }

    function _setWeights(address[] memory _contributors, uint256[] memory _weights) internal {
        // Clear old weights
        for (uint256 i = 0; i < contributors.length; i++) {
            weights[contributors[i]] = 0;
        }
        contributors = _contributors;
        totalWeight = 0;
        for (uint256 i = 0; i < _contributors.length; i++) {
            weights[_contributors[i]] = _weights[i];
            totalWeight += _weights[i];
        }
        emit WeightsUpdated(_contributors, _weights);
    }

    function getContributors() external view returns (address[] memory) {
        return contributors;
    }

    function getWeight(address contributor) external view returns (uint256) {
        return weights[contributor];
    }
}
