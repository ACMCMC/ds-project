import { Component } from 'react';
import { useStore } from 'react-context-hook';
import Web3 from 'web3';

const connectToMetaMask = async (setAccount: any) => {
  const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
  if (accounts.length > 0) {
    console.log(accounts[0]);
    setAccount(accounts[0]);
  }
}

export default function ConnectButton() {
  const [account, setAccount] = useStore('account');

  if (account) {
    return (
      <span>Connected to MetaMask</span>
    );
  }
  else if ((window as any).ethereum) {
    return (
      <button className="btn btn-primary" onClick={() => connectToMetaMask(setAccount)}>Connect to MetaMask</button>
    );
  } else {
    return (
      <span>Install MetaMask to use this app</span>
    );
  }
}