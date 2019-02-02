import { MuiThemeProvider } from '@material-ui/core';
import * as React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { muiTheme } from './lib/theme';

import About from './components/About';
import Activation from './components/Auth/Activation';
import ChangePassword from './components/Auth/ChangePassword';
import PasswordResetActivation from './components/Auth/PasswordResetActivation';
import CourseAdmin from './components/CourseAdmin';
import Header from './components/Header';
import Home from './components/Home';
import Login from './components/Login';
import NotFound from './components/NotFound';
import PasswordReset from './components/PasswordReset';
import Profile from './components/Profile';
import ProfileEdit from './components/ProfileEdit';
import Signup from './components/Signup';
import TermsOfService from './components/TermsOfService';

const App: React.FC = () => (
  <MuiThemeProvider theme={muiTheme}>
    <BrowserRouter>
      <React.Fragment>
        <Header />
        <Switch>
          <Route exact={true} path="/" component={Home} />
          <Route path="/auth" component={AuthRouter} />
          <Route path="/profile" component={ProfileRouter} />
          <Route path="/course" component={CourseRouter} />
          <Route exact={true} path="/about" component={About} />
          <Route exact={true} path={`/termsofservice`} component={TermsOfService} />
          <Route exact={true} path="/activate" component={Activation} />
          <Route exact={true} path="/password/reset/confirm" component={PasswordResetActivation} />
        </Switch>
      </React.Fragment>
    </BrowserRouter>
  </MuiThemeProvider>
);

const AuthRouter: React.FC = () => (
  <Switch>
    <Route exact={true} path={`/auth/login`} component={Login} />
    <Route exact={true} path={`/auth/signup`} component={Signup} />
    <Route exact={true} path={`/auth/passwordreset`} component={PasswordReset} />
    <Route exact={true} path={`/auth/password/change`} component={ChangePassword} />
    <Route exact={true} component={NotFound} />
  </Switch>
);

const ProfileRouter: React.FC = () => (
  <Switch>
    <Route exact={true} path={`/profile`} component={Profile} />
    <Route exact={true} path={`/profile/edit`} component={ProfileEdit} />
  </Switch>
);

const CourseRouter: React.FC = () => (
  <Switch>
    <Route exact={true} path={`/course/admin`} component={CourseAdmin} />
  </Switch>
);

export default App;
