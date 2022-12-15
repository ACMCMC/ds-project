import { useState } from "react";
import { useStore } from "react-context-hook";
import { Navigate } from "react-router";
import { Note } from "../Note";

export default function UploadNote() {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [notes, setNotes] = useStore<Note[]>('notes');
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);

  const handleSubmit = (e: any) => {
    e.preventDefault();

    setNotes([...notes, { owner: '0x', description: 'test', price: 0, title: (name as string), uuid: (notes.length + 1).toString(), buyer: ['0x'] }]);
  }

  return (
    <div className="container-flex align-items-center">
      <form className="p-5 col-12 col-md-6" onSubmit={e => { handleSubmit(e) }}>
        <div className="my-3">
          <label htmlFor="name" className="form-label">Name</label>
          <input type="text" className="form-control" id="name" aria-describedby="nameHelp" onChange={e => setName(e.target.value)} value={name} />
          <div id="namehelp" className="form-text">A descriptive name to identify the notes.</div>
        </div>
        <div className="my-3">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea className="form-control" id="description" aria-describedby="descriptionHelp" onChange={e => setDescription(e.target.value)} value={description} />
          <div id="descriptionHelp" className="form-text">The summary of the notes.</div>
        </div>
        <div className="my-3">
          <label htmlFor="description" className="form-label">Description</label>
          <div className="input-group">
            <span className="input-group-text">ETH</span>
            <input type="text" className="form-control" aria-label="Amount (to the nearest ETH)" />
          </div>
          <div id="priceHelp" className="form-text">The price of the notes.</div>
        </div>
        <div className="my-3">
          <label htmlFor="pdf" className="form-label">PDF File</label>
          <input
            className="form-control"
            id="pdf"
            aria-describedby="fileHelp"
            type="file"
            accept="application/pdf"
            onChange={(e) => setSelectedFile(e.target.files === null ? undefined : e.target.files[0])}
          />
          <div id="fileHelp" className="form-text">The notes, in PDF format.</div>
        </div>
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
}