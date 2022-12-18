import { useState } from "react";
import { useStore } from "react-context-hook";
import { Navigate, useLocation } from "react-router";
import { useSearchParams } from "react-router-dom";
import { servicesVersion } from "typescript";
import { Contract } from "web3-eth-contract";
import { Note, NoteComponent } from "../Note";
import { Service, ServiceComponent } from "../Service";

export default function FulfillService() {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [acc] = useStore<string>('account');
  const [notesExchange] = useStore<Contract>('notesExchange');
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const {state} = useLocation();
  const { id } = state;
  const service = useStore<Map<string, Service>>('services')[0].get(id) as Service;

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!name || !description || !selectedFile) {
      return;
    }

    const reader = new FileReader();
    reader.readAsArrayBuffer(selectedFile);
    reader.onloadend = async (evt) => {
      if (evt.target?.result) {
        var fileByteArray: any[] = [];
        const array = new Uint8Array(fileByteArray);
        for (let i = 0; i < array.length; i++) {
          fileByteArray.push(array[i]);
        }
        notesExchange.methods.fulfillNotesService(service.id, name, description, fileByteArray).send({ from: acc });
        console.log('publishing fulfilled notes');
      }
    }
  }

  return (
    <div className="container-fluid align-items-center">
      <form className="p-5 col-12 col-md-6 mx-auto g-0 border rounded my-5 p-5" onSubmit={e => { handleSubmit(e) }}>
        <h1>Fulfill a service</h1>
        <div className="g-0 border rounded my-3 p-3 bg-light">
          <ServiceComponent service={service}></ServiceComponent>
        </div>
        <p><b>Good job!</b></p>
        <p>When you upload the notes for this service, the status will become <b>Awaiting Acceptance</b>. When the requester accepts it, you will get the whole price.</p>
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
        <button type="submit" className="btn btn-primary" disabled={!name || !description || !selectedFile}>Submit</button>
      </form>
    </div>
  );
}