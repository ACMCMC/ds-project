import { useState } from "react";
import { useStore } from "react-context-hook";
import { Navigate } from "react-router";
import { Contract } from "web3-eth-contract";
import { Note } from "../Note";
import { ethToWei } from "../utils";

export default function RequestService() {
  const [name, setName] = useState<string>('');
  const [otherAccount, setOtherAccount] = useState<string>('');
  const [price, setPrice] = useState<number>(0.0);
  const [day, setDay] = useState<number>(1);
  const [month, setMonth] = useState<number>(1);
  const [year, setYear] = useState<number>(2022);
  const [notesExchange] = useStore<Contract>('notesExchange');
  const [thisAccount] = useStore<string>('account');

  const handleSubmit = (e: any) => {
    e.preventDefault();

    if (!name || !otherAccount || !price || !day || !month || !year) {
      return;
    }

    // Take day, month and year, and turn it into a Date object
    const deadline: Date = new Date(year, month, day)

    notesExchange.methods.createNotesService(name, deadline.getTime(), otherAccount).send({ from: thisAccount, value: ethToWei(price) });
  }

  return (
    <div className="container-fluid align-items-center">
      <form className="p-5 col-12 col-md-6 mx-auto g-0 border rounded my-5 p-5" onSubmit={e => { handleSubmit(e) }}>
        <h1>Request a service</h1>
        <div className="my-3">
          <label htmlFor="name" className="form-label">Subject</label>
          <input type="text" className="form-control" id="name" aria-describedby="nameHelp" onChange={e => setName(e.target.value)} value={name} />
          <div id="namehelp" className="form-text">What exactly would you like to get?</div>
        </div>
        <div className="my-3">
          <label htmlFor="fulfiller" className="form-label">Fulfiller</label>
          <input type="text" className="form-control" id="fulfiller" aria-describedby="fulfHelp" onChange={e => setOtherAccount(e.target.value)} value={otherAccount} />
          <div id="fulfhelp" className="form-text">Who would you like to get it from?</div>
        </div>
        <div className="my-3">
          <label htmlFor="deadline" className="form-label">Deadline</label>
          <div className="input-group">
            <span className="input-group-text">DD</span>
            <input
              type="number"
              step="1"
              min="1"
              max="31"
              className="form-control"
              id="day"
              aria-label="day"
              onChange={e => setDay(e.target.valueAsNumber)}
              value={day} />
            <span className="input-group-text">MM</span>
            <input
              type="number"
              step="1"
              min="1"
              max="12"
              className="form-control"
              id="month"
              aria-label="month"
              onChange={e => setMonth(e.target.valueAsNumber)}
              value={month} />
            <span className="input-group-text">YYYY</span>
            <input
              type="number"
              step="1"
              min="2022"
              className="form-control"
              id="year"
              aria-label="year"
              onChange={e => setYear(e.target.valueAsNumber)}
              value={year} />
          </div>
          <div id="dateHelp" className="form-text">The maximum date to get the result of the service.</div>
        </div>
        <div className="my-3">
          <label htmlFor="price" className="form-label">Price</label>
          <div className="input-group">
            <span className="input-group-text">ETH</span>
            <input
              type="number"
              step="1"
              min="0"
              className="form-control"
              id="price"
              aria-label="Amount (to the nearest ETH)"
              onChange={e => setPrice(e.target.valueAsNumber)}
              value={price} />
          </div>
          <div id="priceHelp" className="form-text">The price of the notes.</div>
        </div>
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
}