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

const NOTES_EXCHANGE_ADDRESS = '0x4a9eB39dc878aC5a35B4E920C689Ff4fcD3C3488';

const loadBlockchainData = async (setAccount: Function, setNotesExchange: Function, setNotes: Function, notes: Map<string, Note>) => {
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
  console.log('notesCount: ', notesCount);
  /*const notes: Note[] = []
  for (var i = 1; i <= notesCount; i++) {
    const note = await notesExchange.methods.getNote(i).call()
    notes.push(note)
  }
  setNotes(
    notes
  )*/

  setupListeners(notesExchange, setNotes, notes);
}

const setupListeners = (notesExchange: Contract, setNotes: Function, notes: Map<string, Note>) => {
  console.log('Setting up listeners...');

  const getNotesMap = (notesList: Note[]) => {
    const map = new Map<string, Note>();
    for (var i = 0; i < notesList.length; i++) {
      map.set(notesList[i].id, notesList[i]);
    }

    return map;
  }

  notesExchange.events.NotesPublished({
  }, (error: Error, event: any) => {
    console.log('event: ', event);
    const publishedNote: Note = event.returnValues.notes;
    const newNotes = notes;
    newNotes.set(publishedNote.id, parseNote(publishedNote));
    setNotes(newNotes);
  });

  notesExchange.events.NotesSold({
  }, (error: Error, event: any) => {
    console.log('event: ', event);
    const soldNote: Note = event.returnValues.notes;
    const newNotes = notes;
    newNotes.set(soldNote.id, parseNote(soldNote));
    setNotes(newNotes);
  });

  notesExchange.getPastEvents('NotesPublished', {
    fromBlock: 0
  }, (error: Error, events: any[]) => {
    console.log('events: ', events);
    const notes = getNotesMap(events.map(e => parseNote(e.returnValues.notes)));
    setNotes(notes);
  });
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home></Home>,
  },
  {
    path: "/upload",
    element: <UploadNote></UploadNote>,
  },
]);

type AppState = {
  account: string | undefined,
  notes: Map<string, Note>,
  notesExchange?: Contract
}

const App = () => {
  const [account, setAccount] = useStore<string>('account');
  const [notes, setNotes] = useStore<Map<string, Note>>('notes');
  const [notesExchange, setNotesExchange] = useStore('notesExchange');

  useEffect(() => {
    loadBlockchainData(setAccount, setNotesExchange, setNotes, notes);
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

const initialState: AppState = {
  account: undefined,
  notes: new Map<string, Note>(),
  notesExchange: undefined
};

export default withStore(App, initialState);
