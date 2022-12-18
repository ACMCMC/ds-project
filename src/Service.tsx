import { useStore } from 'react-context-hook';
import { useNavigate, useNavigation } from 'react-router';
import { Contract } from 'web3-eth-contract';
import { Note } from './Note';
import serviceIcon from './service.svg';
import { weiToEth } from './utils';

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

export enum TransactionState {
  Pending,
  AwaitingAcceptance,
  Completed,
  Aborted
}

export function parseService(originalService: any, notes: Map<string, Note>) {
  const parsedService: Service = {
    ...(originalService as Service),
    notes: originalService.notes ? notes.get(originalService.notes) : undefined,
    transactionState: parseInt(originalService.transactionState),
    depositedMoney: weiToEth(parseInt(originalService.depositedMoney)),
    deadline: new Date(parseInt(originalService.deadline))
  }
  return parsedService;
}

const rejectService = (service: Service, notesExchange: Contract, acc: string) => {
  notesExchange.methods.rejectService(service.id).send({ from: acc });
}

const claimRefund = (service: Service, notesExchange: Contract, acc: string) => {
  notesExchange.methods.claimRefund(service.id).send({ from: acc });
}

const acceptNotesService = (service: Service, notesExchange: Contract, acc: string) => {
  notesExchange.methods.acceptNotesService(service.id).send({ from: acc });
}

const cancelRequestedService = (service: Service, notesExchange: Contract, acc: string) => {
  notesExchange.methods.cancelRequestedService(service.id).send({ from: acc });
}

export function ServiceComponent({ service }: { service: Service }) {
  const [acc] = useStore<string>('account');
  const [notesExchange] = useStore<Contract>('notesExchange');
  const navigation = useNavigate();
  const isCurrentUserFulfiller = service.fulfiller === acc;
  const isCurrentUserRequester = service.renter === acc;
  const isDeadlinePassed = service.deadline < new Date();

  return (
    <div className="card">
      <div className="card-header">
        Service {service.id}
        {isCurrentUserRequester ? <span className="badge text-bg-info ms-3">You requested it</span> : null}
        {isCurrentUserFulfiller ? <span className="badge text-bg-info ms-3">You fulfill it</span> : null}
        {service.transactionState === TransactionState.Pending ? <span className="badge text-bg-warning ms-3">Pending</span> : null}
        {service.transactionState === TransactionState.AwaitingAcceptance ? <span className="badge text-bg-info ms-3">Awaiting acceptance</span> : null}
        {service.transactionState === TransactionState.Completed ? <span className="badge text-bg-success ms-3">Completed</span> : null}
        {service.transactionState === TransactionState.Aborted ? <span className="badge text-bg-danger ms-3">Aborted</span> : null}
      </div>
      <div className="card-body">
        <div className="d-flex p-0">
          <div className="col flex-grow-0 ps-3 pe-4">
            <img src={serviceIcon} className="mx-auto" alt="Notes icon" style={{ height: "auto", width: "auto" }}></img>
          </div>
          <div className="col flex-fill">
            <h5 className="card-title">{service.subject}</h5>
            <div className="btn-toolbar mt-4" role="toolbar" aria-label="Toolbar">
              <div className="input-group me-2">
                <div className="input-group-text">Deadline</div>
                <div className="input-group-text">{service.deadline.toLocaleDateString()}</div>
              </div>
              <div className="input-group me-2">
                <div className="input-group-text">Price</div>
                <div className="input-group-text">ETH {service.depositedMoney}</div>
              </div>
            </div>
            <div className="btn-toolbar mt-2" role="toolbar" aria-label="Toolbar">
              <div className="btn-group" role="group" aria-label="First group">
                {isCurrentUserRequester && service.transactionState === TransactionState.Pending ? <button className="btn btn-warning position-relative" onClick={() => { cancelRequestedService(service, notesExchange, acc) }} disabled={isDeadlinePassed}>Cancel</button> : null}
                {isCurrentUserFulfiller && service.transactionState === TransactionState.Pending ? <button className="btn btn-warning position-relative" onClick={() => rejectService(service, notesExchange, acc)}>Reject</button> : null}
                {isCurrentUserFulfiller && service.transactionState === TransactionState.Pending ? <button className="btn btn-warning position-relative" onClick={() => navigation('/delegate-service', { state: { id: service.id } }) } disabled={isDeadlinePassed}>Delegate</button> : null}
                {isCurrentUserFulfiller && service.transactionState === TransactionState.Pending ? <button className="btn btn-success position-relative" onClick={() => { navigation('/fulfill-service', { state: { id: service.id } }) }}>Fulfill</button> : null}
                {isCurrentUserRequester && service.transactionState === TransactionState.Pending ? <button className="btn btn-success position-relative" onClick={() => { claimRefund(service, notesExchange, acc) }} disabled={!isDeadlinePassed}>Claim refund</button> : null}
                {isCurrentUserRequester && service.transactionState === TransactionState.AwaitingAcceptance ? <button className="btn btn-warning position-relative" onClick={() => { claimRefund(service, notesExchange, acc) }}>Claim refund</button> : null}
                {isCurrentUserRequester && service.transactionState === TransactionState.AwaitingAcceptance ? <button className="btn btn-success position-relative" onClick={() => { acceptNotesService(service, notesExchange, acc) }}>Accept</button> : null}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="card-footer text-muted">
        Requester: {service.renter}
      </div>
      <div className="card-footer text-muted">
        Fulfiller: {service.fulfiller}
      </div>
    </div>
  );
}