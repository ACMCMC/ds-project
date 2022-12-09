// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "truffle/Assert.sol"; // Truffle support for assertions
import "truffle/DeployedAddresses.sol"; // Truffle support for getting contract addresses
import "../contracts/Crowdfund.sol"; // The contract we want to test

contract TestCrowdfund { // Test contracts have to start with "Test"
    function testGoal() public { // Test functions have to start with "test"
        Crowdfund crowdfund = Crowdfund(DeployedAddresses.Crowdfund());
        Assert.equal(crowdfund.getGoal(), 100 ether, "Goal should be 100 Ether");
    }
}
