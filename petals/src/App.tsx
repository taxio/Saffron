import { MuiThemeProvider } from '@material-ui/core';
import * as React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { muiTheme } from './lib/theme';

import About from './components/About';
import Activation from './components/Auth/Activation';
import PasswordResetActivation from './components/Auth/PasswordResetActivation';
import Header from './components/Header';
import Home from './components/Home';
import Login from './components/Login';
import NotFound from './components/NotFound';
import PasswordReset from './components/PasswordReset';
import Profile from './components/Profile';
import Signup from './components/Signup';
import TermsOfService from './components/TermsOfService';

const App = () => (
  <MuiThemeProvider theme={muiTheme}>
    <BrowserRouter>
      <React.Fragment>
        <Header />
        <Switch>
          <Route exact={true} path="/" component={Home} />
          <Route path="/auth" component={AuthRouter} />
          <Route path="/profile" component={ProfileRouter} />
          <Route exact={true} path="/about" component={About} />
          <Route exact={true} path={`/termsofservice`} component={TermsOfService} />
          <Route exact={true} path="/activate" component={Activation} />
          <Route exact={true} path="/password/reset/confirm" component={PasswordResetActivation} />
        </Switch>
      </React.Fragment>
    </BrowserRouter>
  </MuiThemeProvider>
);

const AuthRouter = () => (
  <Switch>
    <Route exact={true} path={`/auth/login`} component={Login} />
    <Route exact={true} path={`/auth/signup`} component={Signup} />
    <Route exact={true} path={`/auth/passwordreset`} component={PasswordReset} />
    <Route exact={true} component={NotFound} />
  </Switch>
);

const ProfileRouter = () => (
  <Switch>
    <Route exact={true} path={`/profile`} component={Profile} />
  </Switch>
);

export default App;
