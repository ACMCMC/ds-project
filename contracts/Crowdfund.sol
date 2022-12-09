/*
pragma solidity ^0.5.0;

contract Crowdfund {
    
    mapping(address => uint) pledges;
    uint sum = 0;
    uint goal = 100 ether;
    bool campaingLive = true;

    function getGoal() external view returns (uint) {
        return goal;
    }

    function getSum() external view returns (uint) {
        return sum;
    }

    function donate(address donor) external payable {
        require(msg.value > 0 && donor != address(0) && campaingLive);
        sum += msg.value;
        pledges[donor] += msg.value;
    }

    function endCampaing(address payable beneficiary) external returns (bool) {
        require(campaingLive);
        campaingLive = false;
        beneficiary.transfer(sum);
        return sum >= goal;
    }
}
*/