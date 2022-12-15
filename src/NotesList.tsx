import React, { Component } from 'react';
import { Note, NoteComponent } from './Note';
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
          <p className="lead mb-0">We haven't found any notes. Please check back later.</p>
        </div>
      </div>
    }

    return (this.props.notes.map((note, key) =>
      <div className="m-5" key={key}>
        <NoteComponent note={note}></NoteComponent>
      </div>
    ));
  }
}