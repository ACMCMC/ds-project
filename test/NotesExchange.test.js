const NotesExchange = artifacts.require("NotesExchange");

contract("NotesExchange", accounts => {
    // Deploy the contract
    before(async () => {
        instance = await NotesExchange.deployed();
    });

    it('ensures that the starting balance is 0', async () => {
        let balance = await instance.getBalance();
        assert.equal(balance, 0);
    })
});