import { useState } from "react";
import { useStore } from "react-context-hook";
import { useLocation } from "react-router";
import { Contract } from "web3-eth-contract";
import { Service, ServiceComponent } from "../Service";

export default function DelegateService() {
  const [otherAcc, setOtherAcc] = useState<string>('');
  const [acc] = useStore<string>('account');
  const [notesExchange] = useStore<Contract>('notesExchange');
  const { state } = useLocation();
  const { id } = state;
  const service = useStore<Map<string, Service>>('services')[0].get(id) as Service;

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!otherAcc) {
      return;
    }

    notesExchange.methods.delegateNotesService(service.id, otherAcc).send({ from: acc });
  }

  return (
    <div className="container-fluid align-items-center">
      <form className="p-5 col-12 col-md-6 mx-auto g-0 border rounded my-5 p-5" onSubmit={e => { handleSubmit(e) }}>
        <h1>Delegate a service</h1>
        <div className="g-0 border rounded my-3 p-3 bg-light">
          <ServiceComponent service={service}></ServiceComponent>
        </div>
        <p>Are you unable to complete a service? You can delegate it to another user.</p>
        <div className="my-3">
          <label htmlFor="name" className="form-label">Fulfiller</label>
          <input type="text" className="form-control" id="name" aria-describedby="nameHelp" onChange={e => setOtherAcc(e.target.value)} value={otherAcc} />
          <div id="namehelp" className="form-text">Who would you like to delegate the service to?</div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={!otherAcc}>Submit</button>
      </form>
    </div>
  );
}