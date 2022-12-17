import { useStore } from 'react-context-hook';
import { Contract } from 'web3-eth-contract';
import { Note } from './Note';
import serviceIcon from './service.svg';

/*
From Contract:

    struct NotesRenting {
        uint256 id;
        Notes notes;
        State transactionState; // The current state of the renting transaction. Default value: Pending
        uint256 depositedMoney; // The total money sent. Half of it is the value of the notes.
        address payable renter;
        address payable fulfiller;
        string subject;
        uint deadline; // The deadline for the note taker to complete the transaction
    }
*/

export type Service = {
  id: string,
  notes?: Note,
  transactionState: TransactionState,
  depositedMoney: number,
  renter: string,
  fulfiller: string,
  subject: string,
  deadline: Date
}

enum TransactionState {
  Pending,
  Established,
  WaitingClaim,
  Completed,
  Aborted
}

export function parseService(originalService: any, notes: Map<string, Note>) {
  const parsedService: Service = {
    ...(originalService as Service),
    notes: originalService.notes ? notes.get(originalService.notes) : undefined,
    transactionState: TransactionState.Pending,
    depositedMoney: parseInt(originalService.depositedMoney),
    deadline: new Date(originalService.deadline)
  }
  return parsedService;
}

const rejectService = (service: Service, notesExchange: Contract, acc: string) => {
  notesExchange.methods.buyNotes(service.id).send({ from: acc });
}

export function ServiceComponent({ service }: { service: Service }) {
  const [acc] = useStore<string>('account');
  const [notesExchange] = useStore<Contract>('notesExchange');

  //if (note.forBuy) {
  return (
    <div className="card py-3">
      <div className="card-header">
        {service.id}
        {service.fulfiller === acc ? <span className="badge text-bg-success ms-3">You provide it</span> : null}
      </div>
      <div className="card-body">
        <div className="d-flex p-0">
          <div className="col flex-grow-0 ps-3 pe-4">
            <img src={serviceIcon} className="mx-auto" alt="Notes icon" style={{ height: "auto", width: "auto" }}></img>
          </div>
          <div className="col flex-fill">
            <h5 className="card-title">{service.subject}</h5>
            <div className="btn-toolbar" role="toolbar" aria-label="Toolbar">
              <div className="input-group me-2">
                <div className="input-group-text">Deadline</div>
                <div className="input-group-text">{service.deadline.toISOString()}</div>
              </div>
              <div className="input-group me-2">
                <div className="input-group-text">Price</div>
                <div className="input-group-text">ETH {service.depositedMoney}</div>
              </div>
              <div className="btn-group" role="group" aria-label="First group">
                <button className="btn btn-secondary position-relative" onClick={() => rejectService(service, notesExchange, acc)} >Reject</button>
                <button className="btn btn-primary position-relative" onClick={() => {}} >Fulfill</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="card-footer text-muted">
        Requester: {service.renter}
      </div>
    </div>
  );
  /*} else {
    return (
      <div className="card text-bg-info m-5">
        <div className="card-header">
          {note.uuid}
        </div>
        <div className="card-body">
          <div className="d-flex p-0">
            <div className="col flex-grow-0 ps-3 pe-4">
              <img src={noteIcon} className="mx-auto" alt="Notes icon" style={{ height: "auto", width: "auto" }}></img>
            </div>
            <div className="col flex-fill">
              <h5 className="card-title">{note.title}</h5>
              <p className="card-text">{note.description}</p>
            </div>
          </div>
        </div>
        <div className="card-footer text-muted">
          Owner: {note.owner}
        </div>
      </div>
    );
  }*/
}