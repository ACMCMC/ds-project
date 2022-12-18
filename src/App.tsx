import { Component, StrictMode, useEffect, useRef } from 'react';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import './App.css';
import { Note, parseNote } from './Note';
import truffleFile from './NotesExchange.json';
import NavBar from './NavBar';
import Footer from './footer';
import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";
import Home from './routes/Home';
import { withStore, useStore } from 'react-context-hook';
import UploadNote from './routes/UploadNote';
import Profile from './routes/Profile';
import RequestService from './routes/RequestService';
import { parseService, Service } from './Service';
import FulfillService from './routes/FulfillService';
import DelegateService from './routes/DelegateService';

const NOTES_EXCHANGE_ADDRESS = truffleFile.networks[5777].address;

const loadBlockchainData = async (setAccount: Function, setNotesExchange: Function, setNotes: Function, setServices: Function) => {
  if (Web3.givenProvider === null) {
    return;
  }
  const web3 = new Web3(Web3.givenProvider)
  const accounts = await web3.eth.getAccounts()
  setAccount(accounts[0])
  const notesExchange = new web3.eth.Contract(truffleFile.abi as AbiItem[], NOTES_EXCHANGE_ADDRESS);
  setNotesExchange(notesExchange);

  const allNotes = await notesExchange.methods.getAllNotes().call();
  const parsedNotes = new Map<string, Note>();
  for (const rawNote of allNotes) {
    const parsedNote = parseNote(rawNote);
    parsedNotes.set(parsedNote.id, parsedNote);
  }
  setNotes(parsedNotes);

  const allServices = await notesExchange.methods.getAllServices().call();
  const parsedServices = new Map<string, Service>();
  for (const rawService of allServices) {
    const parsedService = parseService(rawService, parsedNotes);
    parsedServices.set(parsedService.id, parsedService);
  }
  setServices(parsedServices);
}

const setupListeners = (notesExchange: Contract, useRef: React.MutableRefObject<{
  notes: Map<string, Note>;
  services: Map<string, Service>;
}>, setNotes: Function, setServices: Function) => {
  let subscriptions: any[] = [];

  const updateNote = (error: Error, event: any) => {
    console.log('event: ', event);
    const publishedNote: Note = event.returnValues.notes;
    // Create a copy of the map
    const newNotes = new Map<string, Note>(useRef.current.notes);
    newNotes.set(publishedNote.id, parseNote(publishedNote));
    setNotes(newNotes);
  }

  const updateService = (error: Error, event: any) => {
    console.log('Event: ', event);
    const publishedService: Service = event.returnValues.renting;
    // Create a copy of the map
    const newServices = new Map<string, Service>(useRef.current.services);
    newServices.set(publishedService.id, parseService(publishedService, useRef.current.notes));
    setServices(newServices);
  }

  subscriptions.push(notesExchange.events.NotesPublished({
  }, updateNote));

  subscriptions.push(notesExchange.events.NotesServicePending({
  }, updateService));

  subscriptions.push(notesExchange.events.NotesServiceAborted({
  }, updateService));

  subscriptions.push(notesExchange.events.NotesServiceAwaitingAcceptance({
  }, updateService));

  subscriptions.push(notesExchange.events.NotesServiceCompleted({
  }, updateService));
  
  subscriptions.push(notesExchange.events.NotesServiceDelegated({
  }, updateService));

  subscriptions.push(notesExchange.events.NotesSold({
  }, updateNote));

  subscriptions.push(notesExchange.events.NotesForSaleEnabled({
  }, updateNote));

  subscriptions.push(notesExchange.events.NotesForSaleDisabled({
  }, updateNote));

  console.log('Subscriptions: ', subscriptions);
}

const App = () => {
  const [account, setAccount] = useStore<string>('account');
  const [notes, setNotes] = useStore<Map<string, Note>>('notes'); // [state, setState
  const [services, setServices] = useStore<Map<string, Service>>('services');
  const [notesExchange, setNotesExchange] = useStore<Contract>('notesExchange');
  const stateRef = useRef<{ notes: Map<string, Note>, services: Map<string, Service> }>() as React.MutableRefObject<{
    notes: Map<string, Note>;
    services: Map<string, Service>;
  }>;

  stateRef.current = { notes, services };

  useEffect(() => {
    loadBlockchainData(setAccount, setNotesExchange, setNotes, setServices);
  }, []);

  useEffect(() => {
    if (notesExchange) {
      setupListeners(notesExchange, stateRef, setNotes, setServices);
    }
  }, [notesExchange]);


  return (
    <BrowserRouter>
      <NavBar></NavBar>
      <Routes>
        <Route path="/" element={<Home></Home>} />
        <Route path="/upload" element={<UploadNote></UploadNote>} />
        <Route path="/profile" element={<Profile></Profile>} />
        <Route path="/request-service" element={<RequestService></RequestService>} />
        <Route path="/fulfill-service" element={<FulfillService></FulfillService>} />
        <Route path="/delegate-service" element={<DelegateService></DelegateService>} />
      </Routes>
      <Footer></Footer>
    </BrowserRouter>
  );
}

type AppState = {
  account: string | undefined,
  notes: Map<string, Note>,
  services: Map<string, Service>,
  notesExchange?: Contract
}

const initialState: AppState = {
  account: undefined,
  notes: new Map<string, Note>(),
  services: new Map<string, Service>(),
  notesExchange: undefined
};

export default withStore(App, initialState);
