import { Note } from '../Note';
import NotesList from '../NotesList';
import { useStore } from 'react-context-hook';
import faceIcon from '../face.svg';
import { Navigate, useNavigate } from 'react-router';
import ServicesList from '../ServicesList';
import { Service } from '../Service';
import logo from '../logo_white.svg';

export default function Home() {
  const [services] = useStore<Map<string, Service>>('services');
  const [notes] = useStore<Map<string, Note>>('notes');
  const navigate = useNavigate();

  console.log('BHFZERBHJZE')

  return (
    <div>
      {/* Masthead */}
      <header className="bg-primary text-white">
        <div className="d-flex flex-column position-relative justify-content-center" style={{ minHeight: "70vh" }}>
          <div className="row justify-content-center">
            <div className="col-10 col-md-6">
              <div className="text-center">
                {/* Page heading */}
                <img src={logo} style={{minHeight: "10vh"}} className="logo" alt="logo" />
                <h1 className="display-1">NotesExchange</h1>
              </div>
            </div>
          </div>
          <div className="row justify-content-center">
            <div className="col-10 col-md-6">
              <div className="text-center">
                {/* Page heading */}
                <h2 className="mt-2 display-6">Exchange class notes with other students around the world!</h2>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Icons Grid */}
      <section className="features-icons bg-light text-center">
        <div className="container pt-5 pb-4">
          <div className="row">
            <div className="col-lg-4">
              <div className="features-icons-item mx-auto mb-5 mb-lg-0 mb-lg-3">
                <div className="features-icons-icon d-flex"><i className="bi-window m-auto text-primary"></i></div>
                <h2>Easy to Use</h2>
                <p className="lead mb-0">Our platform removes all of the hassle of traditional note sharing!</p>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="features-icons-item mx-auto mb-5 mb-lg-0 mb-lg-3">
                <div className="features-icons-icon d-flex"><i className="bi-layers m-auto text-primary"></i></div>
                <h3>Secure</h3>
                <p className="lead mb-0">You can be certain to get what you pay for - if anything goes wrong, you'll get your money back!</p>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="features-icons-item mx-auto mb-0 mb-lg-3">
                <div className="features-icons-icon d-flex"><i className="bi-terminal m-auto text-primary"></i></div>
                <h3>Anonymous</h3>
                <p className="lead mb-0">You never provide any ID data to us! Anonimity is guaranteed by Web3 technologies.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Image Showcases */}
      <div className='text-center pt-5 pb-4'>
        <h3>Get started today!</h3>
      </div>
      <div className="container col-8 col-md-6 mx-auto pb-3">
        <button className="col-5 btn btn-primary" onClick={() => navigate('/upload')}>Upload my notes</button>
        <button className="offset-2 col-5 btn btn-primary" onClick={() => navigate('/request-service')}>Request a service</button>
      </div>
      <section className="showcase">
        <div className="container-fluid p-5">
          <h2 className=''>All services</h2>
          <ServicesList services={services} />
        </div>
      </section>
      <section className="showcase">
        <div className="container-fluid p-0 p-5">
          <h2 className=''>All notes</h2>
          <NotesList notes={notes} />
        </div>
      </section>
      {/* Testimonials */}
      <section className="testimonials text-center bg-light py-5">
        <div className="container">
          <h2 className="mb-5">What people are saying...</h2>
          <div className="row">
            <div className="col-lg-4">
              <div className="testimonial-item mx-auto mb-5 mb-lg-0">
                <img className="img-fluid rounded-circle mb-3" src={faceIcon} alt="..." />
                <h5>Xiana C.</h5>
                <p className="font-weight-light mb-0">"This is fantastic! I love NotesExchange!"</p>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="testimonial-item mx-auto mb-5 mb-lg-0">
                <img className="img-fluid rounded-circle mb-3" src={faceIcon} alt="..." />
                <h5>Aldan C.</h5>
                <p className="font-weight-light mb-0">"Using NotesExchange has changed the way I see modern education - it can be treated as a decentralized system, where everyone is free to teach and learn from others."</p>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="testimonial-item mx-auto mb-5 mb-lg-0">
                <img className="img-fluid rounded-circle mb-3" src={faceIcon} alt="..." />
                <h5>John D.</h5>
                <p className="font-weight-light mb-0">"Thanks so much for making these resources available to us!"</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Call to Action */}
    </div>
  );
}
