import React, { Component } from 'react';
import { Note, NoteComponent } from './Note';
import { Service, ServiceComponent } from './Service';
import noteIcon from './service.svg';

export default function ServicesList({ services }: { services: Map<string, Service> }) {
  const servicesList = Array.from(services.values());

  // If there are no notes, display a message
  if (servicesList.length === 0) {
    return <div className="row g-0 border rounded my-3 p-5">
      <div className="d-flex col-lg-4 order-lg-1 mb-2">
        <img src={noteIcon}></img>
      </div>
      <div className="col-lg-8 order-lg-2 my-auto showcase-text">
        <h2>No services found</h2>
        <p className="lead mb-0">We haven't found any services. Please check back later.</p>
      </div>
    </div>
  }

  return (
    <>
      {servicesList.map((serv) =>
        <div className="py-3" key={serv.id}>
          <ServiceComponent service={serv}></ServiceComponent>
        </div>
      )}
    </>);
}