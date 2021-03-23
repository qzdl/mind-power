import React from "react";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
// HashRouter can be switched for BrowserRouter is not static (aka if there is a
// server behind this, not SPA)
import { Navigation, Home, Index, Dashboard } from "./components";

function App() {
  return (
    <div className="App">
      <Router>
        <Navigation />
        <Switch>
          <Route path="/" exact component={() => <Home />} />
          <Route path="/index" exact component={() => <Index />} />
          <Route path="/dashboard" exact component={() => <Dashboard />} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
