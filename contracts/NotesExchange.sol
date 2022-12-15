// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract NotesExchange {
    address payable public owner;                           // The address of the owner of the contract (manager of the system)
    mapping(uint256 => Notes) private notesList;            // The list of all notes that exist
    uint256 private notesTotalCount = 0;                    // The total number of notes that exist

    /* Possible states for a renting transaction:
    *   - Pending: The note taking offer has been created by the noteTaker, but has no renter yet.
    *   - Aborted: The note taking offer has been aborted by the noteTaker while it was pending.
    *   - Established: The note taking offer has been accepted by the renter.
    *   - WaitingClaim: The note taking offer has been completed by the noteTaker, but the renter has not claimed the notes yet.
    *   - Completed: The note taking offer has been completed by the noteTaker and the renter has claimed the notes.
    * A buy/sell transaction does not use states. Instead, it is indicated by the forBuy attribute.
    */
    enum State { Pending, Established, WaitingClaim, Completed, Aborted } 

    struct Notes {
        uint256 id;                           // Or use the hash?
        uint256 notesValue;                   // The value of the notes. The deposit for a renting transaction is twice the value of the notes.
        address payable noteTaker;            // The address of the note taker
        address payable renter;               // The address of the renter
        bool forBuy;                          // Indicates if the notes are for sale or for renting 
        State transactionState;               // The current state of the renting transaction. Default value: Pending
        bytes32 notesHash;                    // The hash of the notes
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

    constructor() {         // Establish the owner of the contract
        owner = payable(msg.sender);
    }

    // Function to buy notes that were published for sale
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

        // To avoid reentrancy attacks, the transfer of the money is done last

        payable(notes.noteTaker).transfer(notes.notesValue);
        renter.transfer(msg.value - notes.notesValue);

        // Register the transaction through an event
        emit NotesSold(
            notes.id,
            notes.notesValue,
            notes.noteTaker,
            notes.renter
        );
    }

    // Function to publish already taken notes for sale
    function publishNotesForSale() public payable {
        require(msg.value > 0, "The price must be greater than 0");

        // Initialize a new notes struct
        Notes memory newNotes;
        newNotes.forBuy = true;
        newNotes.notesValue = msg.value;
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

    // Function to publish a renting offer to take notes in the future
    function publishNotesForRenting()
        public
        payable
    {
        require(msg.value > 0, "The value of the notes must be greater than 0");
        require(
            msg.value % 2 == 0,
            "The deposit must be double the notes value"
        );

        // Initialize a new notes struct
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

    // Function to abort a renting offer. The noteTaker can abort while no renter has not accepted the offer.
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

    // Get all notes that are currently marked as being forBuy
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

    // Get all notes that are owned by the caller
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

    // Get all notes that are owned by the caller and are for sale
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

    // Get the total number of notes
    function getNotesCount() public view returns (uint256) {
        return notesTotalCount;
    }

    // Get the details of a note
    function getNote(uint256 notesId)
        public
        view
        returns (
            uint256,
            uint256,
            address,
            address,
            bool,
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
            notes.forBuy,
            notes.transactionState,
            notes.notesHash
        );
    }
}
