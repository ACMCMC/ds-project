import { useState } from "react";
import { useStore } from "react-context-hook";
import { Navigate } from "react-router";
import { Note } from "../Note";

export default function UploadNote() {
  const [name, setName] = useState<string>('');
  const [notes, setNotes] = useStore<Note[]>('notes');

  const handleSubmit = (e: any) => {
    e.preventDefault();

    setNotes([...notes, {owner: '0x', description: 'test', price: 0, title: (name as string), uuid: (notes.length + 1).toString(), buyer: ['0x']}]);
  }

  return <form className="m-5" onSubmit={e => {handleSubmit(e)}}>
    <div className="my-3">
      <label htmlFor="name" className="form-label">Name</label>
      <input type="text" className="form-control" id="name" aria-describedby="nameHelp" onChange={e => setName(e.target.value)} value={name}/>
      <div id="namehelp" className="form-text">A descriptive name to identify the notes.</div>
    </div>
    <button type="submit" className="btn btn-primary">Submit</button>
  </form>
}