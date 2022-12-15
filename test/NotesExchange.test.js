const assert = require('assert');

const NotesExchange = artifacts.require("NotesExchange");

contract("NotesExchange", accounts => {

    let instance;   // Instance of the contract

    // Deploy the contract
    beforeEach(async () => {
        instance = await NotesExchange.deployed();
    });

    it('ensures that the starting balance is 0', async () => {
        let balance = await instance.getBalance();
        assert.equal(balance, 0);
    });

    it("ensures that notes for sale can't have non-positive price", async ()=> {
        assert.rejects(async () => {
            await instance.publishNotesForSale(0, {from: accounts[0]});
        })  
    });

    it("lets a user publish a note for sale", async () => {
        await instance.publishNotesForSale({from: accounts[0], value: 1});
        let balance = await instance.getBalance();
        assert.equal(balance, 1);
    });
});