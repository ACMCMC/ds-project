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
            await instance.publishNotesForSale({from: accounts[0], value: 0});
        })  
    });

    it("lets a user publish a note for sale", async () => {
        await instance.publishNotesForSale({from: accounts[0], value: 1});
        let balance = await instance.getBalance();
        assert.equal(balance, 1);
        let notesCount = await instance.getNotesCount();
        assert.equal(notesCount, 1);
    });

    it("retrieves a note previously published", async () => {
        await instance.publishNotesForSale({from: accounts[0], value: 2});
        let note = await instance.getNote(1);
        assert.equal(note[0], 0);
        assert.equal(note[2], accounts[0]);
        assert.equal(note[4], true);
    })
});