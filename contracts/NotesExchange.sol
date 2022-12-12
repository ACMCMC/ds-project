// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

contract NotesExchange {
    address payable public owner;           // The address of the owner of the contract
    mapping(uint => notes) public notesList;     
    uint private notesTotalCount;                         // The number of notes available in the market

    enum State { Pending, Established, WaitingClaim, Completed, Aborted }                // Possible states for the transaction

    struct notes{
        uint id;        // Or use the hash?
        uint notesValue;
        address payable noteTaker;
        address payable renter;
        bool forBuy;
        State transactionState;         // The current state of the transaction. Default value: Pending
        bytes32 notesHash;
    }

    /* To rent the notes, both renter and noteTaker have to deposit twice the value of the notes.
       When the transaction is completed, the noteTaker will receive 3 times the value of the notes.
       The renter will receive the value of the notes. 
       This motivates both parties to complete the transaction as soon as possible.
    */

    // Events to keep a record of the transaction
    event NotesSold(
        uint notesId,
        uint notesValue,
        address payable noteTaker,
        address payable renter
    );

    event NotesPublishedForSale(
        uint notesId,
        uint notesValue,
        address payable noteTaker,
        address payable renter,
    );

    event NotesPublishedForRenting(
        uint notesId,
        uint notesValue,
        address payable noteTaker,
        address payable renter,
    );

    event Aborted(
        uint notesId,
        uint notesValue,
        address payable noteTaker,
        address payable renter
    );

    event NoteTakingConfirmed(
        uint notesId,
        uint notesValue,
        address payable noteTaker,
        address payable renter
    );

    event NotesReceived(
        uint notesId,
        uint notesValue,
        address payable noteTaker,
        address payable renter
    );
    
    // Modifier that checks if the caller is the noteTaker
    modifier onlyNoteTaker(int notesId) {      
        Notes storage notes = notesList[notesId];
        require(msg.sender == notes.noteTaker, "Only the note taker can call this function");
        _;
    }

    // Modifier that checks if the caller is the renter
    modifier onlyRenter(int notesId) {
        Notes storage notes = notesList[notesId];
        require(msg.sender == notes.renter, "Only the renter can call this function");
        _;
    }

    // Modifier that checks if the transaction is in the state passed as argument
    modifier inState(int notesId, State expectedState) {
        Notes storage notes = notesList[notesId];
        require(notes.state == expectedState, "Invalid state");
        _;
    }

    constructor(){
        owner = payable(msg.sender);
    }

    function buyNotes(uint notesId) public payable {
        Notes storage notes = notesList[notesId];
        require(notes.forBuy, "The notes are not for sale");
        require(msg.value >= notes.notesValue, "Not enough money to buy the notes");

        address payable renter = payable(msg.sender);
        // transfer the notes (don't know how to do this yet)
        notes.forBuy = false;
        soldNotesCount++;

        payable(notes.noteTaker).transfer(notes.notesValue);
        renter.transfer(msg.value - notes.notesValue);
        emit NotesSold(notes.id, notes.notesValue, notes.noteTaker, notes.renter);
    }

    function publishNotesForSale(uint notesId, uint price){
        require(price > 0, "The price must be greater than 0");

        Notes storage newNotes;
        notes.forBuy = true;
        notes.notesValue = price;
        notes.noteTaker = payable(msg.sender);
        notes.renter = payable(address(this));
        notes.id = notesCount;
        notesCount++;

        // Add the notes to the list of notes
        notesList[notesCount] = newNotes;
        emit NotesPublishedForSale(notes.id, notes.notesValue, notes.noteTaker, notes.renter);
    }


    function publishNotesForRenting(uint notesId, uint notesValue) payable {
        require(msg.value > 0, "The value of the notes must be greater than 0");
        require(msg.value % 2 == 0, "The deposit must be double the notes value");

        Notes storage newNotes;
        notes.forBuy = false;
        notes.notesValue = msg.value / 2;
        notes.noteTaker = payable(msg.sender);
        notes.renter = payable(address(this));
        notes.id = notesCount;
        notesCount++;

        // Add the notes to the list of notes
        notesList[notesCount] = newNotes;
        emit NotesPublishedForRenting(notes.id, notes.notesValue, notes.noteTaker, notes.renter);
    }


    // The noteTaker can abort a transaction until a renter has confirmed it
    function abortNoteTaking(int notesId) public onlyNoteTaker(notesId) inState(notesId, State.Pending) {
        Notes storage notes = notesList[notesId];

        emit Aborted(notes.id, notes.notesValue, notes.noteTaker, notes.renter);
        // To prevent a re-entrancy attack, the state is changed before sending the money
        notes.state = State.Aborted;

        noteTaker.transfer(notes.value * 2);          // Return the deposit money to the noteTaker
    }

    // Register an address as the renter, store its deposit and change the state of the transaction
    function rentNotes(int notesId) public payable inState(notesId, State.Pending) {
        Notes storage notes = notesList[notesId];

        emit NoteTakingConfirmed(notes.id, notes.notesValue, notes.noteTaker, notes.renter);
        notes.state = State.Established;
        notes.renter = payable(msg.sender);
    }

    // The noteTaker can submit the notes, proving that he has taken them
    function sumbitProofOfNotesTaken(int notesId, bytes32 _notesHash) public onlyNoteTaker(notesId) inState(notesId, State.Established) {
        Notes storage notes = notesList[notesId];
        notes.state = State.WaitingClaim;
        notes.notesHAsh = _notesHash;
    }

    // The renter can abort the transaction when the notes were submitted if he wants a refund
    function requestRefund() public onlyRenter inState(notesId, State.WaitingClaim) {
        Notes storage notes = notesList[notesId];
        emit Aborted(notes.id, notes.notesValue, notes.noteTaker, notes.renter);
        notes.state = State.Aborted;
        notes.renter.transfer(2 * notesValue);
        notes.noteTaker.transfer(2 * notesValue);
    }

    // The renter can confirm that he has received the notes to retrieve half of the deposit and pay the noteTaker
    function confirmNotesReceived() public onlyRenter(notesId) inState(notesId, State.WaitingClaim) {
        Notes storage notes = notesList[notesId];
        emit NotesReceived(notes.id, notes.notesValue, notes.noteTaker, notes.renter);
        // To prevent a re-entrancy attack, the state is changed before sending the money
        notes.state = State.Completed;
        notes.noteTaker.transfer(3 * notesValue);
        notes.renter.transfer(notesValue);
    }

    // Get the balance of the contract
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

        function getAllNotesOnSale() public view returns (Notes[] memory){
        Notes[] memory notesOnSale = new Notes[](notesCount - NotesSold);
        uint idx = 0;
        for (uint i = 0; i < notesTotalCount; i++) {
            if (notesList[i].forBuy) {
                notesOnSale[idx] = notesList[i];
                idx++;
            }
        }
        return notesOnSale;
    }

    function getMyNotes() public view returns (Notes[] memory){
        uint myNotesCount = 0;
        for (uint i = 0; i < notesTotalCount; i++) {
            if (notesList[i].renter == msg.sender) {
                myNotesCount++;
            }
        }

        Notes[] memory myNotes = new Notes[](myNotesCount);
        uint idx = 0;
        for (uint i = 0; i < notesTotalCount; i++) {
            if (notesList[i].renter == msg.sender) {
                myNotes[idx] = notesList[i];
                idx++;
            }
        }
        return myNotes;
    }

    function getMyNotesOnSale() public view returns (Notes[] memory){
        uint myNotesCount = 0;
        for (uint i = 0; i < notesTotalCount; i++) {notesForRent
        Notes[] memory myNotes = new Notes[](myNotesCount);
        uint idx = 0;
        for (uint i = 0; i < notesTotalCount; i++) {
            if (notesList[i].noteTaker == msg.sender && notesList[i].forBuy) {
                myNotes[idx] = notesList[i];
                idx++;
            }
        }
        return myNotes;
    }
}