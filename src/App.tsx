import { Component } from 'react';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import './App.css';
import logo from './logo.svg';
import { Note } from './Note';
import { NotesList } from './NotesList';
import truffleFile from './NotesExchange.json';

const NOTES_EXCHANGE_ADDRESS = 'FILL_ME';

type AppState = {
  account: string,
  notes: Note[],
  notesCount: number,
  notesExchange?: Contract
}

class App extends Component<any, AppState> {
  componentWillMount() {
    this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = new Web3(Web3.givenProvider || "http://localhost:8545")
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const notesExchange = new Contract(truffleFile.abi as AbiItem[], NOTES_EXCHANGE_ADDRESS);
    this.setState({ notesExchange })
    const notesCount: number = await notesExchange.methods.getNotesCount().call();
    this.setState({ notesCount })
    for (var i = 1; i <= notesCount; i++) {
      const note = await notesExchange.methods.getNote(i).call()
      this.setState({
        notes: [...this.state.notes, note]
      })
    }
  }

  constructor(props: any) {
    super(props)
    this.state = { account: '', notes: [], notesCount: 0, notesExchange: undefined }
  }

  render() {
    return (
      <div>
        {/* Navigation */}
        <nav className="navbar navbar-light bg-light static-top">
          <div className="container">
            <img src={logo} className="logo" alt="logo" />
            <a className="navbar-brand">NotesExchange</a>
            <p className='navbar-text my-0'>Your account: {this.state.account}</p>
          </div>
        </nav>
        {/* Masthead */}
        <header className="masthead">
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
        <section className="showcase">
          <div className="container-fluid p-0">
            <NotesList notes={this.state.notes} />
          </div>
        </section>
        {/* Testimonials */}
        <section className="testimonials text-center bg-light">
          <div className="container">
            <h2 className="mb-5">What people are saying...</h2>
            <div className="row">
              <div className="col-lg-4">
                <div className="testimonial-item mx-auto mb-5 mb-lg-0">
                  <img className="img-fluid rounded-circle mb-3" src="assets/img/testimonials-1.jpg" alt="..." />
                  <h5>Xiana C.</h5>
                  <p className="font-weight-light mb-0">"This is fantastic! I love NotesExchange!"</p>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="testimonial-item mx-auto mb-5 mb-lg-0">
                  <img className="img-fluid rounded-circle mb-3" src="assets/img/testimonials-2.jpg" alt="..." />
                  <h5>Aldan C.</h5>
                  <p className="font-weight-light mb-0">"Using NotesExchange has changed the way I see modern education - it can be treated as a decentralized system, where everyone is free to teach and learn from others."</p>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="testimonial-item mx-auto mb-5 mb-lg-0">
                  <img className="img-fluid rounded-circle mb-3" src="assets/img/testimonials-3.jpg" alt="..." />
                  <h5>John D.</h5>
                  <p className="font-weight-light mb-0">"Thanks so much for making these resources available to us!"</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Call to Action */}
        {/* Footer */}
        <footer className="footer bg-light">
          <div className="container">
            <div className="row">
              <div className="col-lg-6 h-100 text-center text-lg-start my-auto">
                {/*<ul className="list-inline mb-2">
                  <li className="list-inline-item"><a href="#!">About</a></li>
                  <li className="list-inline-item">⋅</li>
                  <li className="list-inline-item"><a href="#!">Contact</a></li>
                  <li className="list-inline-item">⋅</li>
                  <li className="list-inline-item"><a href="#!">Terms of Use</a></li>
                  <li className="list-inline-item">⋅</li>
                  <li className="list-inline-item"><a href="#!">Privacy Policy</a></li>
    </ul>*/}
                <p className="text-muted small mb-4 mb-lg-0">&copy; NotesExchange, 2022. All Rights Reserved.</p>
              </div>
              <div className="col-lg-6 h-100 text-center text-lg-end my-auto">
                <ul className="list-inline mb-0">
                  <li className="list-inline-item me-4">
                    <a href="#!"><i className="bi-facebook fs-3"></i></a>
                  </li>
                  <li className="list-inline-item me-4">
                    <a href="#!"><i className="bi-twitter fs-3"></i></a>
                  </li>
                  <li className="list-inline-item">
                    <a href="#!"><i className="bi-instagram fs-3"></i></a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }
}

export default App;
