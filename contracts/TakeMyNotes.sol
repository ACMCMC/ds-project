pragma solidity >=0.4.22 <0.6.0;

contract TakeMyNotes {

    struct ClassNotesOwnership {
        address owner; // Address of the owner
        uint16 price; // Price of the notes
        bool forSale; // Are the notes for sale?
    }

    mapping (string => ClassNotesOwnership) public classNotesOwnership;

    classNotesOwnership[] public classNotesOwnerships;

    /**
     * Sets the owner of the notes to the address of the message sender
     * @param id The ID of the notes
     */
    function addClassNotes(string id, uint16 price) public {
        classNotesOwnership[id] = ClassNotesOwnership(msg.sender, price, true);
    }
    
    address private client;

    struct NoteTaker {
        bool notesTaken;     // true if the person has already taken the class notes
        address delegate;
        uint notesID;        // index of the notes taken
    }

    constructor(){
        client = msg.sender;
        emit ClientSet(address(0), client);        
    }

    function changeClient(address newClient) public isClient {
        emit ClientSet(client, newClient);
        client = newClient;
    }

    function getClient() external view returns (address) {
        return client;
    }

    modifier isClient() {
        _;
    }

}