// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract NotesExchange {
    uint public notesValue;                 // The amount of money that the renter has to pay
    address payable public renter;          // The address of the renter
    address payable public noteTaker;       // The address of the classmate who will take the notes
    enum State { Pending, Established, WaitingClaim, Completed, Aborted }                // Possible states for the transaction
    State public transactionState;          // The current state of the transaction. Default value: Pending
    bytes32 public notesHash;                   // The hash of the notes taken by the noteTaker

    /* To rent the notes, both renter and noteTaker have to deposit twice the value of the notes.
       When the transaction is completed, the noteTaker will receive 3 times the value of the notes.
       The renter will receive the value of the notes. 
       This motivates both parties to complete the transaction as soon as possible.
    */


    // Modifier that checks if the caller is the noteTaker
    modifier onlyNoteTaker() {      
        require(msg.sender == noteTaker, "Only the note taker can call this function");
        _;
    }

    // Modifier that checks if the caller is the renter
    modifier onlyRenter() {
        require(msg.sender == renter, "Only the renter can call this function");
        _;
    }

    // Modifier that checks if the transaction is in the state passed as argument
    modifier inState(State expectedState) {
        require(transactionState == expectedState, "Invalid state");
        _;
    }

    // Events to keep a record of the transaction
    event Aborted();        
    event NoteTakingConfirmed();
    event NotesReceived();
    
    constructor() payable {
        require(msg.value % 2 == 0, "The deposit must be double the notes value");
        noteTaker = payable(msg.sender);
        notesValue = msg.value / 2;
        // The paid amount is stored in the balance of the contract
    }

    // The noteTaker can abort a transaction until a renter has confirmed it
    function abortNoteTaking() public onlyNoteTaker inState(State.Pending) {
        emit Aborted();                                     // Emit the event to log it
        // To prevent a re-entrancy attack, the state is changed before sending the money
        transactionState = State.Aborted;
        noteTaker.transfer(address(this).balance);          // Return the deposit money to the noteTaker
    }

    // Register an address as the renter, store its deposit and change the state of the transaction
    function confirmNoteTaking() public inState(State.Pending) payable {
        require(msg.value == 2 * notesValue, "The deposit must be double the notes value");
        emit NoteTakingConfirmed();
        renter = payable(msg.sender);
        transactionState = State.Established;
    }

    // The noteTaker can submit the notes, proving that he has taken them
    function sumbitProofOfNotesTaken(bytes32 _notesHash) public onlyNoteTaker inState(State.Established) {
        transactionState = State.WaitingClaim;
        notesHash = _notesHash;
    }

    // The renter can abort the transaction when the notes were submitted if he wants a refund
    function requestRefund() public onlyRenter inState(State.WaitingClaim) {
        emit Aborted();
        transactionState = State.Aborted;
        renter.transfer(2 * notesValue);
        noteTaker.transfer(2 * notesValue);
    }

    // The renter can confirm that he has received the notes to retrieve half of the deposit and pay the noteTaker
    function confirmNotesReceived() public onlyRenter inState(State.WaitingClaim) {
        emit NotesReceived();
        // To prevent a re-entrancy attack, the state is changed before sending the money
        transactionState = State.Completed;
        noteTaker.transfer(3 * notesValue);
        renter.transfer(notesValue);
    }

    // Get the balance of the contract
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}