import { useStore } from 'react-context-hook';
import { Contract } from 'web3-eth-contract';
import noteIcon from './note.svg';
import { ethToWei } from './utils';

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
  notesExchange.methods.buyNotes(note.id).send({ from: account, value: ethToWei(note.notesValue) });
}

const enableSelling = (note: Note, notesExchange: Contract, account: string) => {
  notesExchange.methods.enableNotesForSale(note.id).send({ from: account });
}

const disableSelling = (note: Note, notesExchange: Contract, account: string) => {
  notesExchange.methods.disableNotesForSale(note.id).send({ from: account });
}

export function NoteComponent({ note }: { note: Note }) {
  const [notes, setNotes] = useStore<Map<string, Note>>('notes');
  const [acc] = useStore<string>('account');
  const [notesExchange] = useStore<Contract>('notesExchange');
  const bought = note.owners.includes(acc);
  const owns = note.noteTaker === acc;

  return (
    <div className="card">
      <div className="card-header">
        Notes {note.id}
        {owns ? <span className="badge text-bg-info ms-3">You wrote them</span> : null}
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
                {owns && note.forBuy ? <button className="btn btn-secondary" onClick={() => disableSelling(note, notesExchange, acc)}>Disable selling</button> : null}
                {owns && !note.forBuy ? <button className="btn btn-warning" onClick={() => enableSelling(note, notesExchange, acc)}>Enable selling</button> : null}
                <button className="btn btn-primary position-relative" onClick={() => buyNote(note, notesExchange, acc)} disabled={bought || !note.forBuy}>Buy
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
}