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

export function NoteComponent({ note }: { note: Note }) {
  if (note.forBuy) {
    return (
      <div className="card m-5">
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
              <p className="card-text"><small className="text-muted">Price: {note.price} ETH</small></p>
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