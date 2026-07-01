import React, { useContext } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import About from "./components/about.js";
import SampleHeader from './components/sampleheader';
import MedList from "./components/medlist.js";
import Navbar from "./components/navbar.js";
import SignUp from "./components/signup.js";
import Login from "./components/login.js";
import AuthContext from "./context/authcontext";

// bootstrap
import "./styles/bootstrap.min.css";

// needed to print pdf
import ReactToPrint from "react-to-print";

//styling used for Printing
import "./styles/printingstyles.css"

//styling used for App
import "./styles/app.css"

// Main App component
class ComponentToPrint extends React.Component {
    render() {
      return (
        <div>
          <SampleHeader />
        </div>
      );
  }
}

// This button needed to print
class PButton extends React.Component {
  render() {
    return (
      <div>
        <ReactToPrint
          trigger={() => <button>Print this out!</button>}
          content={() => this.componentRef}
        />
        <ComponentToPrint ref={(el) => (this.componentRef = el)} />
      </div>
    );
  }
}

function Routed() {
  const { loggedIn } = useContext(AuthContext);

  return (
    <main>
          <Router>
      <Navbar />
      
        <Route exact path="/"> 
          <About />
        </Route>
        <Switch>
        {loggedIn === false && (
          <>
            <Route exact path="/sign-up">
              <SignUp />
            </Route>
            <Route exact path="/login">
              <Login />
            </Route>
          </>
        )}
        {loggedIn === true && (
          <>
            <Route path="/med-list">
              <MedList />
            </Route>
          </>
        )}
      </Switch>
    </Router>
    </main>
  );
}

export default Routed;
