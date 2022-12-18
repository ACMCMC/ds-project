import { useState } from "react";
import { useStore } from "react-context-hook";
import { Navigate } from "react-router";
import { Note } from "../Note";
import NotesList from "../NotesList";
import { Service } from "../Service";
import ServicesList from "../ServicesList";

export default function Profile() {
  const [notes, setNotes] = useStore<Map<string, Note>>('notes');
  const [services, setServices] = useStore<Map<string, Service>>('services');
  const [acc] = useStore<string>('account');

  // Filter the notes map to only include the notes that the user owns
  const userNotesMap = new Map<string, Note>();
  for (var [key, note] of Array.from(notes.entries())) {
    if (note.noteTaker === acc || note.owners.includes(acc)) {
      userNotesMap.set(key, note);
    }
  }

  // Filter the services map to only include the notes that the user fulfills or requests
  const userRequesterServicesMap = new Map<string, Service>();
  const userFulfillerServicesMap = new Map<string, Service>();
  for (var [key, serv] of Array.from(services.entries())) {
    if (serv.fulfiller === acc) {
      userFulfillerServicesMap.set(key, serv);
    }
    if (serv.renter === acc) {
      userRequesterServicesMap.set(key, serv);
    }
  }

  return (
    <div className="container-fluid align-items-center ">
      <div className="p-5 col-12 col-md-6 mx-auto g-0 border rounded my-5 p-5">
        <h1>Profile</h1>
        <h3>Account</h3>
          <p>{acc}</p>
        <h3 className="mt-5">My notes</h3>
        <NotesList notes={userNotesMap}></NotesList>
        <h3 className="mt-5">Services I requested</h3>
        <ServicesList services={userRequesterServicesMap}></ServicesList>
        <h3 className="mt-5">Services I fulfill</h3>
        <ServicesList services={userFulfillerServicesMap}></ServicesList>
      </div>
    </div>
  );
}