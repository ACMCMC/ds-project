import { useState } from "react";
import { useStore } from "react-context-hook";
import { Navigate } from "react-router";
import { Note } from "../Note";
import NotesList from "../NotesList";

export default function Profile() {
  const [notes, setNotes] = useStore<Map<string, Note>>('notes');
  const [acc] = useStore<string>('account');

  const allNotes: Note[] = Array.from(notes.values());
  const userNotes = allNotes.filter(note => note.noteTaker === acc);
  const userNotesMap = new Map<string, Note>();
  for (var i = 0; i < userNotes.length; i++) {
    userNotesMap.set(userNotes[i].id, userNotes[i]);
  }

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
        <NotesList notes={userNotesMap}></NotesList>
      </div>
    </div>
  );
}