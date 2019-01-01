import { MuiThemeProvider } from '@material-ui/core';
import * as React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import theme from './lib/theme';

import Activation from './components/Auth/Activation';
import Header from './components/Header';
import Home from './components/Home';
import Login from './components/Login';
import NotFound from './components/NotFound';
import SentMail from './components/SendMail';
import Signup from './components/Signup';
import TermsOfService from './components/TermsOfService';

const App = () => (
  <MuiThemeProvider theme={theme}>
    <BrowserRouter>
      <React.Fragment>
        <Header />
        <Switch>
          <Route exact={true} path="/" component={Home} />
          <Route path="/auth" component={AuthRouter} />
          <Route exact={true} path="/activate/:uid/:token" component={Activation} />
        </Switch>
      </React.Fragment>
    </BrowserRouter>
  </MuiThemeProvider>
);

const AuthRouter = () => (
  <Switch>
    <Route exact={true} path={`/auth/login`} component={Login} />
    <Route exact={true} path={`/auth/signup`} component={Signup} />
    <Route exact={true} path={`/auth/termsofservice`} component={TermsOfService} />
    <Route exact={true} path={`/auth/sentmail`} component={SentMail} />
    <Route exact={true} component={NotFound} />
  </Switch>
);

export default App;
