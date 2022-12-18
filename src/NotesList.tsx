import React, { Component } from 'react';
import { Note, NoteComponent } from './Note';
import noteIcon from './note.svg';

type NotesListProps = {
  notes: Map<string, Note>
}

export default function NotesList(props: NotesListProps) {
  const notesList = Array.from(props.notes.values());

  // If there are no notes, display a message
  if (props.notes.size === 0) {
    return <div className="row g-0 border rounded p-5">
      <div className="d-flex col-lg-4 order-lg-1 mb-2">
        <img src={noteIcon}></img>
      </div>
      <div className="col-lg-8 order-lg-2 my-auto showcase-text">
        <h2>No notes found</h2>
        <p className="lead mb-0">We haven't found any notes. Please check back later.</p>
      </div>
    </div>
  }

  return (
    <>
      {notesList.map((note) =>
        <div className="my-4" key={note.id}>
          <NoteComponent note={note}></NoteComponent>
        </div>
      )}
    </>
  );
}