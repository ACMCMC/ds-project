import { useState } from "react";
import { useStore } from "react-context-hook";
import { Navigate } from "react-router";
import { Note } from "../Note";
import { NotesList } from "../NotesList";

export default function Profile() {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [price, setPrice] = useState<number>(0.0);
  const [notes, setNotes] = useStore<Note[]>('notes');
  const [address] = useStore<string>('address');
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);

  const handleSubmit = (e: any) => {
    e.preventDefault();

    setNotes([...notes, { owner: '0x', description: 'test', price: 0, title: (name as string), uuid: (notes.length + 1).toString(), buyer: ['0x'] }]);
  }

  return (
    <div className="container-fluid align-items-center">
      <div className="p-5 col-12 col-md-6 mx-auto" onSubmit={e => { handleSubmit(e) }}>
        <h1>Profile</h1>
        <div>
        <dl>
          <dt>Address</dt>
          <dd>{address}</dd>
        </dl>
        </div>
        <h2>Notes</h2>
        <NotesList notes={[]}></NotesList>
      </div>
    </div>
  );
}