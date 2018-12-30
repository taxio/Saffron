import { MuiThemeProvider } from '@material-ui/core';
import * as React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import theme from './lib/theme';

import Header from './components/Header';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import TermsOfService from './components/TermsOfService';

const App = () => (
  <MuiThemeProvider theme={theme}>
    <BrowserRouter>
      <React.Fragment>
        <Header />
        <Switch>
          <Route exact={true} path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/signup" component={Signup} />
          <Route path="/termsofservice" component={TermsOfService} />
        </Switch>
      </React.Fragment>
    </BrowserRouter>
  </MuiThemeProvider>
);

export default App;
