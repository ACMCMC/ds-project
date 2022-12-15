import { useStore } from 'react-context-hook';
import serviceIcon from './service.svg';

export type Service = {
  uuid: string,
  title: string,
  price: number,
  requester: string,
  fulfiller: string,
  deadline: Date
}

export function ServiceComponent({ service }: { service: Service }) {
  const [acc] = useStore<string>('account');

  //if (note.forBuy) {
    return (
      <div className="card m-5">
        <div className="card-header">
          {service.uuid}
              {service.fulfiller === acc ? <span className="badge text-bg-success ms-3">You provide it</span> : null}
        </div>
        <div className="card-body">
          <div className="d-flex p-0">
            <div className="col flex-grow-0 ps-3 pe-4">
              <img src={serviceIcon} className="mx-auto" alt="Notes icon" style={{ height: "auto", width: "auto" }}></img>
            </div>
            <div className="col flex-fill">
              <h5 className="card-title">{service.title}</h5>
              <div className="btn-toolbar" role="toolbar" aria-label="Toolbar">
                <div className="input-group me-2">
                  <div className="input-group-text">Price</div>
                  <div className="input-group-text">ETH {service.price}</div>
                </div>
                <div className="btn-group" role="group" aria-label="First group">
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card-footer text-muted">
          Requester: {service.requester}
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