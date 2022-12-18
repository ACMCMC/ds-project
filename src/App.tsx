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
import { parseService, Service, TransactionState } from './Service';
import FulfillService from './routes/FulfillService';
import { weiToEth } from './utils';

const NOTES_EXCHANGE_ADDRESS = truffleFile.networks[5777].address;
var listenersReady = false;

const loadBlockchainData = async (setAccount: Function, setNotesExchange: Function, setNotes: Function, notes: Map<string, Note>, setServices: Function, services: Map<string, Service>) => {
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

  /*const notesCount: number = await notesExchange.methods.getNotesCount().call();
  console.log('There are ' + notesCount + ' notes in the contract.');
  const loadedNotes: Note[] = [];
  for (var i = 0; i < notesCount; i++) {
    const rawNote = await notesExchange.methods.getNote(i).call();
    const parsedNote: Note = {
      id: rawNote[0],
      notesValue: rawNote[1],
      noteTaker: rawNote[2],
      owners: rawNote[3],
      forBuy: rawNote[4],
      notesHash: rawNote[5],
      title: rawNote[6],
      description: rawNote[7]
    }
    loadedNotes.push(parseNote(parsedNote))
  }
  console.log('loadedNotes: ', loadedNotes);
  setNotes(
    loadedNotes
  )

  const servicesCount: number = await notesExchange.methods.getServicesCount().call();
  console.log('There are ' + servicesCount + ' services in the contract.');
  const loadedServices: Service[] = [];
  for (var i = 0; i < servicesCount; i++) {
    const rawService = await notesExchange.methods.getService(i).call()
    console.log(rawService)
    const parsedService: Service = {
      id: rawService[0],
      notes: rawService[1],
      transactionState: rawService[2],
      depositedMoney: rawService[3],
      renter: rawService[4],
      fulfiller: rawService[5],
      subject: rawService[6],
      deadline: rawService[7]
    }
    loadedServices.push(parseService(parsedService, notes));
  }
  console.log('loadedServices: ', loadedServices);
  setServices(
    loadedServices
  )*/

  if (!listenersReady) {
    listenersReady = true;
    setupListeners(notesExchange, setNotes, notes, setServices, services);
  }
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

  const updateService = (error: Error, event: any) => {
    console.log('event: ', event);
    const publishedService: Service = event.returnValues.renting;
    const newServices = services;
    newServices.set(publishedService.id, parseService(publishedService, notes));
    setServices(newServices);
  }

  notesExchange.events.NotesPublished({
  }, updateNote);

  notesExchange.events.NotesServicePending({
  }, updateService);

  notesExchange.events.NotesServiceAborted({
  }, updateService);

  notesExchange.events.NotesServiceAwaitingAcceptance({
  }, updateService);

  notesExchange.events.NotesServiceCompleted({
  }, updateService);

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
  const [services, setServices] = useStore<Map<string, Service>>('services');
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
        <Route path="/fulfill-service" element={<FulfillService></FulfillService>} />
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
