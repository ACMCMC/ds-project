import { useState } from "react";
import { useStore } from "react-context-hook";
import { Navigate } from "react-router";
import { Note } from "../Note";
import { NotesList } from "../NotesList";

export default function Profile() {
  const [notes, setNotes] = useStore<Note[]>('notes');
  const [acc] = useStore<string>('account');

  const userNotes = notes.filter(note => note.owner === acc);

  return (
    <div className="container-fluid align-items-center">
      <div className="p-5 col-12 col-md-6 mx-auto">
        <h1>Profile</h1>
        <div>
        <dl>
          <dt>Account</dt>
          <dd>{acc}</dd>
        </dl>
        </div>
        <h2>Notes</h2>
        <NotesList notes={userNotes}></NotesList>
      </div>
    </div>
  );
}