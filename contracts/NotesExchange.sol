// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/Base64.sol"; // npm dependency

contract NotesExchange {
    address payable public owner; // The address of the owner of the contract (manager of the system)
    mapping(uint256 => Notes) private notesMapping; // The mapping of all notes that exist
    mapping(uint256 => NotesService) private rentingList; // The list of all renting offers that exist, indexed by their ID
    uint256 private notesTotalCount = 0; // The total number of notes that exist
    uint256 private rentingTotalCount = 0; // The total number of notes that exist

    /* Possible states for a renting transaction:
     *   - Pending: The note taking offer has been created by the noteTaker, but has not been fulfilled yet.
     *   - AwaitingAcceptance: The fulfiller has submitted the notes but the requester still has to say that they are good.
     *   - Completed: The note taking offer has been completed by the noteTaker and the renter has claimed the notes.
     *   - Aborted: Several possibilities:
     *     1. The note taking offer has been aborted by the noteTaker while it was pending.
     *     2. The fulfiller submitted the notes, but they were rejected by the renter. The fulfiller gets 1/2 of the deposit, the renter the other half.
     *     3. The deadline has passed and the user has requested a refund.
     */
    enum State {
        Pending,
        AwaitingAcceptance,
        Completed,
        Aborted
    }

    struct Notes {
        uint256 id; // Or use the hash?
        uint256 notesValue; // The value of the notes.
        address payable noteTaker; // The address of the note taker
        address payable[] owners; // The address of the people who have purchased the notes
        bool forBuy; // Indicates if the notes are for sale or for renting
        bytes32 notesHash; // The hash of the notes
        string title;
        string description;
    }

    struct NotesService {
        uint256 id;
        Notes notes;
        State transactionState; // The current state of the renting transaction. Default value: Pending
        uint256 depositedMoney; // The total money sent. This is the value of the notes.
        address payable renter;
        address payable fulfiller;
        string subject;
        uint256 deadline; // The deadline for the note taker to complete the transaction
    }

    /* To rent the notes, both renter and noteTaker have to deposit twice the value of the notes.
       When the transaction is completed, the noteTaker will receive 3 times the value of the notes.
       The renter will receive the value of the notes. 
       This motivates both parties to complete the transaction as soon as possible.
    */

    // Events to keep a record of the transaction
    event NotesSold(Notes notes, address renter);

    event NotesForSaleEnabled(Notes notes);

    event NotesForSaleDisabled(Notes notes);

    event NotesPublished(Notes notes);

    event NotesServicePending(NotesService renting);

    event NotesServiceAborted(NotesService renting);

    event NotesServiceAwaitingAcceptance(NotesService renting);

    event NotesServiceCompleted(NotesService renting);

    // Modifier that checks if the caller is the noteTaker
    modifier onlyNoteTaker(Notes memory note) {
        require(
            payable(msg.sender) == note.noteTaker,
            "Only the note taker can call this function."
        );
        _;
    }

    // Modifier that checks if the caller is the renter
    modifier onlyRenter(Notes memory note) {
        require(
            owns(msg.sender, note),
            "Only the renter can call this function"
        );
        _;
    }

    // Modifier that checks if the caller is the fulfiller of the service
    modifier onlyFulfiller(NotesService memory renting) {
        require(
            renting.fulfiller == payable(msg.sender),
            "Only the fulfiller can call this function"
        );
        _;
    }

    // Modifier that checks if the transaction is in the state passed as argument
    modifier inState(NotesService memory renting, State expectedState) {
        require(renting.transactionState == expectedState, "Invalid state");
        _;
    }

    constructor() {
        // Establish the owner of the contract
        owner = payable(msg.sender);
    }

    // Converts Wei to ETH
    function weiToEth(uint256 weiAmount) public pure returns (uint256) {
        return weiAmount / 1e18;
    }

    // Function to check if an address has bought a note
    function owns(address renter, Notes memory note)
        public
        pure
        returns (bool)
    {
        for (uint256 i = 0; i < note.owners.length; i++) {
            if (note.owners[i] == renter) {
                return true;
            }
        }
        return false;
    }

    // Function to buy notes that were published for sale
    function buyNotes(uint256 notesId) public payable {
        Notes storage notes = notesMapping[notesId];
        require(notes.forBuy, "The notes are not for sale");
        require(
            msg.value >= notes.notesValue,
            "Not enough money to buy the notes"
        );

        address payable renter = payable(msg.sender);
        notes.owners.push(renter);

        // To avoid reentrancy attacks, the transfer of the money is done last

        payable(notes.noteTaker).transfer(notes.notesValue);
        renter.transfer(msg.value - notes.notesValue);

        // Register the transaction through an event
        emit NotesSold(notes, renter);
    }

    // Function to publish already taken notes for sale
    function publishNotesForSale(
        string memory title,
        string memory description,
        uint256 notesValue,
        bytes memory data
    ) public payable {
        string memory pdf = Base64.encode(data);
        bytes32 notesHash = keccak256(
            abi.encodePacked(title, description, pdf)
        );

        // Initialize a new notes struct
        Notes memory newNotes;
        newNotes.forBuy = true;
        newNotes.notesValue = notesValue;
        newNotes.noteTaker = payable(msg.sender);
        newNotes.owners = new address payable[](0);
        newNotes.id = notesTotalCount;
        newNotes.notesHash = notesHash;
        newNotes.title = title;
        newNotes.description = description;

        // Add the notes to the list of notes
        notesMapping[newNotes.id] = newNotes;
        emit NotesPublished(newNotes);
        notesTotalCount++;
    }

    function enableNotesForSale(uint256 notesId)
        public
        onlyNoteTaker(notesMapping[notesId])
    {
        notesMapping[notesId].forBuy = true;
        emit NotesForSaleEnabled(notesMapping[notesId]);
    }

    function disableNotesForSale(uint256 notesId)
        public
        onlyNoteTaker(notesMapping[notesId])
    {
        notesMapping[notesId].forBuy = false;
        emit NotesForSaleDisabled(notesMapping[notesId]);
    }

    // Function to publish a renting offer to take notes in the future
    function createNotesService(
        string memory subject,
        uint256 deadline,
        address fulfiller
    ) public payable {
        require(
            msg.value % 2 == 0,
            "The deposit must be double the notes value"
        );

        // Initialize a new notes struct
        NotesService memory renting;
        renting.deadline = deadline;
        renting.fulfiller = payable(fulfiller);
        renting.depositedMoney = msg.value;
        renting.renter = payable(msg.sender);
        renting.transactionState = State.Pending;
        renting.id = rentingTotalCount;
        renting.subject = subject;

        // Add the notes to the list of notes
        rentingList[renting.id] = renting;
        emit NotesServicePending(renting);
        rentingTotalCount++;
    }

    // Function to abort a renting offer. The fulfiller can abort before fulfilling the service.
    function rejectService(uint256 rentingId)
        public
        inState(rentingList[rentingId], State.Pending)
        onlyFulfiller(rentingList[rentingId])
    {
        NotesService storage renting = rentingList[rentingId];

        // To prevent a re-entrancy attack, the state is changed before sending the money
        renting.transactionState = State.Aborted;
        emit NotesServiceAborted(renting);

        renting.renter.transfer(renting.depositedMoney); // Return the deposit money to the noteTaker
    }

    function cancelRequestedService(uint256 rentingId)
        private
        inState(rentingList[rentingId], State.Pending)
    {
        NotesService storage renting = rentingList[rentingId];
        require(
            renting.renter == payable(msg.sender),
            "Only the renter can call this function"
        );
        // To prevent a re-entrancy attack, the state is changed before sending the money
        renting.transactionState = State.Aborted;
        emit NotesServiceAborted(renting);

        renting.renter.transfer(renting.depositedMoney / 2); // Return half the deposit money to the renter
        renting.fulfiller.transfer(renting.depositedMoney / 2); // Return half the deposit money to the noteTaker
    }

    // Function to abort a renting offer. The fulfiller can abort before fulfilling the service.
    function claimRefund(uint256 rentingId) public {
        NotesService storage renting = rentingList[rentingId];
        require(
            renting.renter == payable(msg.sender),
            "Only the renter can call this function"
        );

        if (renting.transactionState == State.Pending) {
            claimRefundDeadlinePassed(renting);
        } else if (renting.transactionState == State.AwaitingAcceptance) {
            claimRefundNotAccepted(renting);
        }
    }

    function claimRefundDeadlinePassed(NotesService storage renting)
        private
        inState(renting, State.Pending)
    {
        require(
            renting.deadline < block.timestamp,
            "The deadline has not passed yet"
        );

        // To prevent a re-entrancy attack, the state is changed before sending the money
        renting.transactionState = State.Aborted;
        emit NotesServiceAborted(renting);

        renting.renter.transfer(renting.depositedMoney); // Return the deposit money to the renter
    }

    function claimRefundNotAccepted(NotesService storage renting)
        private
        inState(renting, State.AwaitingAcceptance)
    {
        // To prevent a re-entrancy attack, the state is changed before sending the money
        renting.transactionState = State.Aborted;
        emit NotesServiceAborted(renting);

        renting.renter.transfer(renting.depositedMoney / 2); // Return half the deposit money to the renter
        renting.fulfiller.transfer(renting.depositedMoney / 2); // Return half the deposit money to the noteTaker
    }

    // The fulfiller has done its job and is waiting for the noteTaker to accept the service
    function fulfillNotesService(
        uint256 rentingId,
        string memory title,
        string memory description,
        bytes memory data
    )
        public
        payable
        inState(rentingList[rentingId], State.Pending)
        onlyFulfiller(rentingList[rentingId])
    {
        NotesService storage renting = rentingList[rentingId];

        renting.transactionState = State.AwaitingAcceptance;

        string memory pdf = Base64.encode(data);
        bytes32 notesHash = keccak256(
            abi.encodePacked(title, description, pdf)
        );

        // Initialize a new notes struct
        Notes memory newNotes;
        newNotes.forBuy = false;
        newNotes.notesValue = weiToEth(renting.depositedMoney);
        newNotes.noteTaker = payable(msg.sender);
        newNotes.owners = new address payable[](0);
        newNotes.id = notesTotalCount;
        newNotes.notesHash = notesHash;
        newNotes.title = title;
        newNotes.description = description;

        // Add the notes to the list of notes
        notesMapping[newNotes.id] = newNotes;
        emit NotesPublished(newNotes);
        notesTotalCount++;

        renting.notes = newNotes;
        emit NotesServiceAwaitingAcceptance(renting);
    }

    function acceptNotesService(uint256 rentingId)
        public
        inState(rentingList[rentingId], State.AwaitingAcceptance)
    {
        NotesService storage renting = rentingList[rentingId];
        require(
            renting.renter == payable(msg.sender),
            "Only the renter can call this function"
        );

        // To prevent a re-entrancy attack, the state is changed before sending the money
        renting.transactionState = State.Completed;
        emit NotesServiceCompleted(renting);

        renting.fulfiller.transfer(renting.depositedMoney); // Send the deposit money to the noteTaker
        renting.notes.owners[0] = renting.renter; // Set the noteTaker as the owner of the notes
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
            if (notesMapping[i].forBuy) {
                notesOnSale[idx] = notesMapping[i];
                idx++;
            }
        }
        return notesOnSale;
    }

    // Get all notes that are owned by the caller
    function getMyNotes() public view returns (Notes[] memory) {
        uint256 myNotesCount = 0;
        for (uint256 i = 0; i < notesTotalCount; i++) {
            if (owns(msg.sender, notesMapping[i])) {
                myNotesCount++;
            }
        }

        Notes[] memory myNotes = new Notes[](myNotesCount);
        uint256 idx = 0;
        for (uint256 i = 0; i < notesTotalCount; i++) {
            if (owns(msg.sender, notesMapping[i])) {
                myNotes[idx] = notesMapping[i];
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
            if (
                notesMapping[i].noteTaker == msg.sender &&
                notesMapping[i].forBuy
            ) {
                myNotes[idx] = notesMapping[i];
                idx++;
            }
        }
        return myNotes;
    }

    // Get all notes
    function getAllNotes() public view returns (Notes[] memory) {
        Notes[] memory allNotes = new Notes[](notesTotalCount);
        for (uint256 i = 0; i < notesTotalCount; i++) {
            allNotes[i] = notesMapping[i];
        }
        return allNotes;
    }

    // Get all services
    function getAllServices() public view returns (NotesService[] memory) {
        NotesService[] memory allServs = new NotesService[](rentingTotalCount);
        for (uint256 i = 0; i < rentingTotalCount; i++) {
            allServs[i] = rentingList[i];
        }
        return allServs;
    }

    // Get the total number of notes
    function getNotesCount() public view returns (uint256) {
        return notesTotalCount;
    }

    // Get the details of a note
    function getNote(uint256 notesId) public view returns (Notes memory) {
        Notes memory notes = notesMapping[notesId];
        address[] memory owners; // We need to cast this
        for (uint256 i = 0; i < notes.owners.length; i++) {
            owners[i] = notes.owners[i];
        }
        return (notes);
    }

    // Get the total number of notes
    function getServicesCount() public view returns (uint256) {
        return rentingTotalCount;
    }

    // Get the details of a note
    function getService(uint256 rentingId)
        public
        view
        returns (NotesService memory)
    {
        NotesService memory renting = rentingList[rentingId];
        return (renting);
    }
}
