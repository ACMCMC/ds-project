import { useStore } from 'react-context-hook';
import { Contract } from 'web3-eth-contract';
import noteIcon from './note.svg';

/*
From Contract:

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
*/

export type Note = {
  id: string
  notesValue: number
  noteTaker: string
  owners: string[]
  forBuy: boolean
  notesHash: string
  title: string
  description: string
}

export function parseNote(originalNote: any) {
  const parsedNote: Note = {
    ...(originalNote as Note),
    notesValue: parseInt(originalNote.notesValue),
  }
  return parsedNote;
}

const buyNote = (note: Note, notesExchange: Contract, account: string) => {
  notesExchange.methods.buyNotes(note.id).send({ from: account, value: note.notesValue });
}

export function NoteComponent({ note }: { note: Note }) {
  const [notes, setNotes] = useStore<Map<string, Note>>('notes');
  const [acc] = useStore<string>('account');
  const [notesExchange] = useStore<Contract>('notesExchange');
  const bought = note.owners.includes(acc);

  if (note.forBuy) {
    return (
      <div className="card">
        <div className="card-header">
          {note.id}
              {note.noteTaker === acc ? <span className="badge text-bg-success ms-3">Yours</span> : null}
        </div>
        <div className="card-body">
          <div className="d-flex p-0">
            <div className="col flex-grow-0 ps-3 pe-4">
              <img src={noteIcon} className="mx-auto" alt="Notes icon" style={{ height: "auto", width: "auto" }}></img>
            </div>
            <div className="col flex-fill">
              <h5 className="card-title">{note.title}</h5>
              <p className="card-text">{note.description}</p>
              <div className="btn-toolbar" role="toolbar" aria-label="Toolbar">
                <div className="input-group me-2">
                  <div className="input-group-text">Price</div>
                  <div className="input-group-text">ETH {note.notesValue}</div>
                </div>
                <div className="btn-group" role="group" aria-label="First group">
                  <button className="btn btn-primary position-relative" onClick={() => buyNote(note, notesExchange, acc)} disabled={bought}>Buy
                    {bought ? <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-secondary">Bought</span> : null}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card-footer text-muted">
          Owner: {note.noteTaker}
        </div>
      </div>
    );
  } else {
    return (
      <div className="card text-bg-info m-5">
        <div className="card-header">
          {note.id}
        </div>
        <div className="card-body">
          <div className="d-flex p-0">
            <div className="col flex-grow-0 ps-3 pe-4">
              <img src={noteIcon} className="mx-auto" alt="Notes icon" style={{ height: "auto", width: "auto" }}></img>
            </div>
            <div className="col flex-fill">
              <h5 className="card-title">{note.title}</h5>
              <p className="card-text">{note.description}</p>
            </div>
          </div>
        </div>
        <div className="card-footer text-muted">
          Owner: {note.noteTaker}
        </div>
      </div>
    );
  }
}