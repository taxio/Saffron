import React, { Component } from 'react';
import {HashRouter, Switch, Route} from 'react-router-dom';

import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Home from './components/Home';

class Base extends Component {
  render() {
    return(
      <div>
        <NavBar/>
        {this.props.children}
        <Footer/>
      </div>
    );
  }
}

class App extends Component {
  render() {
    return (
      <HashRouter>
        <Route path='/' component={MainRoute}/>
      </HashRouter>
    );
  }
}

const MainRoute = () => (
  <Base>
    <Switch>
      <Route path='/' component={Home}/>
    </Switch>
  </Base>
);

export default App;
