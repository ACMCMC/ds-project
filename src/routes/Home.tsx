import { Note } from '../Note';
import NotesList from '../NotesList';
import { useStore } from 'react-context-hook';
import faceIcon from '../face.svg';
import { Navigate, useNavigate } from 'react-router';
import ServicesList from '../ServicesList';

export default function Home() {
  const [notes] = useStore<Map<string, Note>>('notes');
  const navigate = useNavigate();

  return (
    <div>
      {/* Masthead */}
      <header className="bg-dark text-white">
        <div className="container position-relative">
          <div className="row justify-content-center">
            <div className="col-xl-6">
              <div className="text-center">
                {/* Page heading */}
                <h1 className="my-5">Exchange class notes with other students around the world!</h1>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Icons Grid */}
      <section className="features-icons bg-light text-center">
        <div className="container pt-4 pb-3">
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
      <div className="container col-4 mx-auto pt-5 pb-3">
          <button className="col-5 btn btn-primary" onClick={() => navigate('/upload')}>Upload my notes</button>
          <button className="offset-2 col-5 btn btn-primary" onClick={() => navigate('/request-service')}>Request a service</button>
      </div>
      <section className="showcase mt-5">
        <div className="container-fluid p-0">
          <h2 className='ms-5'>Services I can fulfill</h2>
          <ServicesList services={[]} />
        </div>
      </section>
      <section className="showcase">
        <div className="container-fluid p-0">
          <h2 className='ms-5'>All notes</h2>
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
