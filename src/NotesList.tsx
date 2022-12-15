import React, { Component } from 'react';
import { Note } from './Note';
import noteIcon from './note.svg';

type NotesListProps = {
  notes: Note[]
}

export class NotesList extends Component<NotesListProps> {
  render() {
    // If there are no notes, display a message
    if (this.props.notes.length === 0) {
      return <div className="row g-0 border rounded m-5 p-5">
        <div className="d-flex col-lg-4 order-lg-1">
          <img src={noteIcon}></img>
        </div>
        <div className="col-lg-8 order-lg-2 my-auto showcase-text">
          <h2>No notes found</h2>
          <p className="lead mb-0">There are no notes available for sale at the moment. Please check back later.</p>
        </div>
      </div>
    }

    return (this.props.notes.map((note, key) =>
      <div className="card m-5" key={key}>
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
    ));
  }
}