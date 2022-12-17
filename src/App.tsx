import { Component, StrictMode, useEffect } from 'react';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import './App.css';
import { Note, parseNote } from './Note';
import NotesList from './NotesList';
import truffleFile from './NotesExchange.json';
import NavBar from './NavBar';
import Footer from './footer';
import {
  BrowserRouter,
  createBrowserRouter,
  Route,
  Routes,
  RouterProvider,
} from "react-router-dom";
import ReactDOM from "react-dom/client";
import Home from './routes/Home';
import { withStore, useStore } from 'react-context-hook';
import UploadNote from './routes/UploadNote';
import Profile from './routes/Profile';
import RequestService from './routes/RequestService';
import { parseService, Service } from './Service';

const NOTES_EXCHANGE_ADDRESS = '0x8E624C6169CC9bb0d848B1D71AA5453f4Df3b509';

const loadBlockchainData = async (setAccount: Function, setNotesExchange: Function, setNotes: Function, notes: Map<string, Note>, setServices: Function, services: Map<string, Service>) => {
  if (Web3.givenProvider === null) {
    return;
  }
  const web3 = new Web3(Web3.givenProvider)
  const accounts = await web3.eth.getAccounts()
  setAccount(accounts[0])
  console.log('account: ', accounts[0]);
  const notesExchange = new web3.eth.Contract(truffleFile.abi as AbiItem[], NOTES_EXCHANGE_ADDRESS);
  setNotesExchange(notesExchange);
  const notesCount: number = await notesExchange.methods.getNotesCount().call();
  const loadedNotes: Note[] = [];
  for (var i = 0; i < notesCount; i++) {
    const note = await notesExchange.methods.getNote(i).call()
    loadedNotes.push(note)
  }
  setNotes(
    loadedNotes
  )

  const servicesCount: number = await notesExchange.methods.getRentingsCount().call();
  const loadedRentings: Service[] = [];
  for (var i = 0; i < servicesCount; i++) {
    const renting = await notesExchange.methods.getRenting(i).call()
    loadedRentings.push(parseService(renting, notes));
  }
  setServices(
    loadedRentings
  )

  setupListeners(notesExchange, setNotes, notes, setServices, services);
}

const setupListeners = (notesExchange: Contract, setNotes: Function, notes: Map<string, Note>, setServices: Function, services: Map<string, Service>) => {
  console.log('Setting up listeners...');

  const getNotesMap = (notesList: Note[]) => {
    const map = new Map<string, Note>();
    for (var i = 0; i < notesList.length; i++) {
      map.set(notesList[i].id, notesList[i]);
    }

    return map;
  }

  const updateNote = (error: Error, event: any) => {
    console.log('event: ', event);
    const publishedNote: Note = event.returnValues.notes;
    const newNotes = notes;
    newNotes.set(publishedNote.id, parseNote(publishedNote));
    setNotes(newNotes);
  }

  const updateRenting = (error: Error, event: any) => {
    console.log('event: ', event);
    const publishedService: Service = event.returnValues.renting;
    const newServices = services;
    newServices.set(publishedService.id, parseService(publishedService, notes));
    setServices(newServices);
  }

  notesExchange.events.NotesPublished({
  }, updateNote);

  notesExchange.events.NotesRentingCreated({
  }, updateRenting);

  notesExchange.events.NotesRentingAborted({
  }, updateRenting);

  notesExchange.events.NotesRentingFulfilled({
  }, updateRenting);

  notesExchange.events.NotesSold({
  }, updateNote);

  notesExchange.events.NotesForSaleEnabled({
  }, updateNote);

  notesExchange.events.NotesForSaleDisabled({
  }, updateNote);
}

const App = () => {
  const [account, setAccount] = useStore<string>('account');
  const [notes, setNotes] = useStore<Map<string, Note>>('notes');
  const [services, setServices] = useStore<Map<string, Service>>('rentings');
  const [notesExchange, setNotesExchange] = useStore('notesExchange');

  useEffect(() => {
    loadBlockchainData(setAccount, setNotesExchange, setNotes, notes, setServices, services);
  }, []);

  return (
    <BrowserRouter>
      <NavBar></NavBar>
      <Routes>
        <Route path="/" element={<Home></Home>} />
        <Route path="/upload" element={<UploadNote></UploadNote>} />
        <Route path="/profile" element={<Profile></Profile>} />
        <Route path="/request-service" element={<RequestService></RequestService>} />
      </Routes>
      <Footer></Footer>
    </BrowserRouter>
  );
}

type AppState = {
  account: string | undefined,
  notes: Map<string, Note>,
  rentings: Map<string, Service>,
  notesExchange?: Contract
}

const initialState: AppState = {
  account: undefined,
  notes: new Map<string, Note>(),
  rentings: new Map<string, Service>(),
  notesExchange: undefined
};

export default withStore(App, initialState);
