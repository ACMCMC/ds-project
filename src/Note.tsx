import { useStore } from 'react-context-hook';
import noteIcon from './note.svg';

export type Note = {
  uuid: string
  title: string
  description: string
  price: number
  owner: string
  buyer: string[]
  forBuy: boolean
}

const buyNote = (note: Note, notes: Note[], setNotes: Function) => {
  // Buy the note

  const newNotes = notes.map(n => {
    if (n.uuid === note.uuid) {
      return {
        ...n,
        buyer: [...n.buyer, note.owner]
      }
    }
    return n;
  });
  // Update the note in the store
  setNotes(newNotes);
}

export function NoteComponent({ note }: { note: Note }) {
  const [notes, setNotes] = useStore<Note[]>('notes');
  const [acc] = useStore<string>('account');
  const bought = note.buyer.includes(acc);

  if (note.forBuy) {
    return (
      <div className="card m-5">
        <div className="card-header">
          {note.uuid}
              {note.owner === acc ? <span className="badge text-bg-success ms-3">Yours</span> : null}
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
                  <div className="input-group-text">ETH {note.price}</div>
                </div>
                <div className="btn-group" role="group" aria-label="First group">
                  <button className="btn btn-primary position-relative" onClick={() => buyNote(note, notes, setNotes)} disabled={bought}>Buy
                    {bought ? <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-secondary">Bought</span> : null}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card-footer text-muted">
          Owner: {note.owner}
        </div>
      </div>
    );
  } else {
    return (
      <div className="card text-bg-info m-5">
        <div className="card-header">
          {note.uuid}
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
          Owner: {note.owner}
        </div>
      </div>
    );
  }
}