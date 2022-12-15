import { Component, StrictMode, useEffect } from 'react';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import './App.css';
import { Note } from './Note';
import { NotesList } from './NotesList';
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

const NOTES_EXCHANGE_ADDRESS = '0x30BAA2B5118B5Fe1F8658338cB9F62eA6B0c5d1F';

const loadBlockchainData = async (setAccount: Function, setNotesExchange: Function, setNotes: Function) => {
  if (Web3.givenProvider === null) {
    return;
  }
  const web3 = new Web3(Web3.givenProvider)
  const accounts = await web3.eth.getAccounts()
  setAccount(accounts[0])
  console.log('account: ', accounts[0]);
  const notesExchange = new web3.eth.Contract(truffleFile.abi as AbiItem[], NOTES_EXCHANGE_ADDRESS);
  setNotesExchange(notesExchange)
  const notesCount: number = await notesExchange.methods.getNotesCount().call();
  console.log('notesCount: ', notesCount);
  const notes: Note[] = []
  for (var i = 1; i <= notesCount; i++) {
    const note = await notesExchange.methods.getNote(i).call()
    notes.push(note)
  }
  setNotes(
    notes
  )
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
  notes: Note[],
  notesExchange?: Contract
}

const App = () => {
  const [account, setAccount] = useStore('account');
  const [notes, setNotes] = useStore('notes');
  const [notesExchange, setNotesExchange] = useStore('notesExchange');

  useEffect(() => {
    loadBlockchainData(setAccount, setNotesExchange, setNotes);
  }, []);

  return (
      <BrowserRouter>
          <NavBar></NavBar>
          <Routes>
            <Route path="/" element={<Home></Home>} />
            <Route path="/upload" element={<UploadNote></UploadNote>} />
            <Route path="/profile" element={<Profile></Profile>} />
          </Routes>
          <Footer></Footer>
      </BrowserRouter>
  );
}

const initialState: AppState = {
  account: undefined,
  notes: [],
  notesExchange: undefined
};

export default withStore(App, initialState);
