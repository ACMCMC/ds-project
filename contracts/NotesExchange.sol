// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract NotesExchange {
    address payable public owner; // The address of the owner of the contract
    mapping(uint256 => Notes) private notesList;
    uint256 private notesTotalCount = 0; // The number of notes available in the market

    enum State {
        Pending,
        Established,
        WaitingClaim,
        Completed,
        Aborted
    } // Possible states for the transaction

    struct Notes {
        uint256 id; // Or use the hash?
        uint256 notesValue;
        address payable noteTaker;
        address payable delegate;
        address payable renter;
        bool forBuy;
        State transactionState; // The current state of the transaction. Default value: Pending
        bytes32 notesHash;
    }

    /* To rent the notes, both renter and noteTaker have to deposit twice the value of the notes.
       When the transaction is completed, the noteTaker will receive 3 times the value of the notes.
       The renter will receive the value of the notes. 
       This motivates both parties to complete the transaction as soon as possible.
    */

    // Events to keep a record of the transaction
    event NotesSold(
        uint256 notesId,
        uint256 notesValue,
        address payable noteTaker,
        address payable renter
    );

    event NotesPublishedForSale(
        uint256 notesId,
        uint256 notesValue,
        address payable noteTaker,
        address payable renter
    );

    event NotesPublishedForRenting(
        uint256 notesId,
        uint256 notesValue,
        address payable noteTaker,
        address payable renter
    );

    event Aborted(
        uint256 notesId,
        uint256 notesValue,
        address payable noteTaker,
        address payable renter
    );

    event NoteTakingConfirmed(
        uint256 notesId,
        uint256 notesValue,
        address payable noteTaker,
        address payable renter
    );

    event NotesReceived(
        uint256 notesId,
        uint256 notesValue,
        address payable noteTaker,
        address payable renter
    );

    // Modifier that checks if the caller is the noteTaker
    modifier onlyNoteTaker(uint256 notesId) {
        Notes storage notes = notesList[notesId];
        require(
            msg.sender == notes.noteTaker,
            "Only the note taker can call this function"
        );
        _;
    }

    // Modifier that checks if the caller is the renter
    modifier onlyRenter(uint256 notesId) {
        Notes storage notes = notesList[notesId];
        require(
            msg.sender == notes.renter,
            "Only the renter can call this function"
        );
        _;
    }

    // Modifier that checks if the transaction is in the state passed as argument
    modifier inState(uint256 notesId, State expectedState) {
        Notes storage notes = notesList[notesId];
        require(notes.transactionState == expectedState, "Invalid state");
        _;
    }

    constructor() {
        owner = payable(msg.sender);
    }

    function buyNotes(uint256 notesId) public payable {
        Notes storage notes = notesList[notesId];
        require(notes.forBuy, "The notes are not for sale");
        require(
            msg.value >= notes.notesValue,
            "Not enough money to buy the notes"
        );

        address payable renter = payable(msg.sender);
        // transfer the notes (don't know how to do this yet)
        notes.forBuy = false;
        //soldNotesCount++; // TODO: check if this is necessary

        payable(notes.noteTaker).transfer(notes.notesValue);
        renter.transfer(msg.value - notes.notesValue);
        emit NotesSold(
            notes.id,
            notes.notesValue,
            notes.noteTaker,
            notes.renter
        );
    }

    function publishNotesForSale(uint256 price) public {
        require(price > 0, "The price must be greater than 0");

        Notes memory newNotes;
        newNotes.forBuy = true;
        newNotes.notesValue = price;
        newNotes.noteTaker = payable(msg.sender);
        newNotes.renter = payable(address(this));
        newNotes.id = notesTotalCount;
        notesTotalCount++;

        // Add the notes to the list of notes
        notesList[notesTotalCount] = newNotes;
        emit NotesPublishedForSale(
            newNotes.id,
            newNotes.notesValue,
            newNotes.noteTaker,
            newNotes.renter
        );
    }

    function publishNotesForRenting()
        public
        payable
    {
        require(msg.value > 0, "The value of the notes must be greater than 0");
        require(
            msg.value % 2 == 0,
            "The deposit must be double the notes value"
        );

        Notes memory newNotes;
        newNotes.forBuy = false;
        newNotes.notesValue = msg.value / 2;
        newNotes.noteTaker = payable(msg.sender);
        newNotes.renter = payable(address(this));
        newNotes.id = notesTotalCount;
        notesTotalCount++;

        // Add the notes to the list of notes
        notesList[notesTotalCount] = newNotes;
        emit NotesPublishedForRenting(
            newNotes.id,
            newNotes.notesValue,
            newNotes.noteTaker,
            newNotes.renter
        );
    }

    // The noteTaker can abort a transaction until a renter has confirmed it
    function abortNoteTaking(uint256 notesId)
        public
        onlyNoteTaker(notesId)
        inState(notesId, State.Pending)
    {
        Notes storage notes = notesList[notesId];

        emit Aborted(notes.id, notes.notesValue, notes.noteTaker, notes.renter);
        // To prevent a re-entrancy attack, the state is changed before sending the money
        notes.transactionState = State.Aborted;

        notes.noteTaker.transfer(notes.notesValue * 2); // Return the deposit money to the noteTaker
    }

    // Register an address as the renter, store its deposit and change the state of the transaction
    function rentNotes(uint256 notesId)
        public
        payable
        inState(notesId, State.Pending)
    {
        Notes storage notes = notesList[notesId];

        emit NoteTakingConfirmed(
            notes.id,
            notes.notesValue,
            notes.noteTaker,
            notes.renter
        );
        notes.transactionState = State.Established;
        notes.renter = payable(msg.sender);
    }

    // The noteTaker can submit the notes, proving that he has taken them
    function sumbitProofOfNotesTaken(uint256 notesId, bytes32 _notesHash)
        public
        onlyNoteTaker(notesId)
        inState(notesId, State.Established)
    {
        Notes storage notes = notesList[notesId];
        notes.transactionState = State.WaitingClaim;
        notes.notesHash = _notesHash;
    }

    // The renter can abort the transaction when the notes were submitted if he wants a refund
    function requestRefund(uint256 notesId)
        public
        onlyRenter(notesId)
        inState(notesId, State.WaitingClaim)
    {
        Notes storage notes = notesList[notesId];
        emit Aborted(notes.id, notes.notesValue, notes.noteTaker, notes.renter);
        notes.transactionState = State.Aborted;
        notes.renter.transfer(2 * notes.notesValue);
        notes.noteTaker.transfer(2 * notes.notesValue);
    }

    // The renter can confirm that he has received the notes to retrieve half of the deposit and pay the noteTaker
    function confirmNotesReceived(uint256 notesId)
        public
        onlyRenter(notesId)
        inState(notesId, State.WaitingClaim)
    {
        Notes storage notes = notesList[notesId];
        emit NotesReceived(
            notes.id,
            notes.notesValue,
            notes.noteTaker,
            notes.renter
        );
        // To prevent a re-entrancy attack, the state is changed before sending the money
        notes.transactionState = State.Completed;
        notes.noteTaker.transfer(3 * notes.notesValue);
        notes.renter.transfer(notes.notesValue);
    }

    // Get the balance of the contract
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getAllNotesOnSale() public view returns (Notes[] memory) {
        //Notes[] memory notesOnSale = new Notes[](notesTotalCount - NotesSold); // Do we want to keep track of the notes sold?
        Notes[] memory notesOnSale = new Notes[](notesTotalCount);
        uint256 idx = 0;
        for (uint256 i = 0; i < notesTotalCount; i++) {
            if (notesList[i].forBuy) {
                notesOnSale[idx] = notesList[i];
                idx++;
            }
        }
        return notesOnSale;
    }

    function getMyNotes() public view returns (Notes[] memory) {
        uint256 myNotesCount = 0;
        for (uint256 i = 0; i < notesTotalCount; i++) {
            if (notesList[i].renter == msg.sender) {
                myNotesCount++;
            }
        }

        Notes[] memory myNotes = new Notes[](myNotesCount);
        uint256 idx = 0;
        for (uint256 i = 0; i < notesTotalCount; i++) {
            if (notesList[i].renter == msg.sender) {
                myNotes[idx] = notesList[i];
                idx++;
            }
        }
        return myNotes;
    }

    function getMyNotesOnSale() public view returns (Notes[] memory) {
        uint256 myNotesCount = 0;
        Notes[] memory myNotes = new Notes[](myNotesCount);
        uint256 idx = 0;
        for (uint256 i = 0; i < notesTotalCount; i++) {
            if (notesList[i].noteTaker == msg.sender && notesList[i].forBuy) {
                myNotes[idx] = notesList[i];
                idx++;
            }
        }
        return myNotes;
    }

    function getNotesCount() public view returns (uint256) {
        return notesTotalCount;
    }

    function getNote(uint256 notesId)
        public
        view
        returns (
            uint256,
            uint256,
            address,
            address,
            State,
            bytes32
        )
    {
        Notes memory notes = notesList[notesId];
        return (
            notes.id,
            notes.notesValue,
            notes.noteTaker,
            notes.renter,
            notes.transactionState,
            notes.notesHash
        );
    }
}
