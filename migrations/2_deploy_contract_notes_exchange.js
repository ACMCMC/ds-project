const NotesExchange = artifacts.require("NotesExchange");

// Include the NotesExchange contract in the migration
module.exports = function(deployer) {
    deployer.deploy(NotesExchange);
};