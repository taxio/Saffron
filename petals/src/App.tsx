import { MuiThemeProvider } from '@material-ui/core';
import * as React from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import { muiTheme } from './lib/theme';

import About from './components/About';
import * as AuthComponents from './components/Auth';
import * as CourseComponents from './components/Course';
import Header from './components/Header';
import Home from './components/Home';
import NotFound from './components/NotFound';
import Profile from './components/Profile';
import ProfileEdit from './components/ProfileEdit';
import TermsOfService from './components/TermsOfService';
import { isLogin, logout, refreshToken } from './lib/auth';

const TokenRefreshWrapper: React.FC = props => {
  refreshToken().catch(() => {
    logout();
  });
  return <React.Fragment>{props.children}</React.Fragment>;
};

const AuthorizedRoute: React.FC<{ exact: boolean; path: string; component: any }> = props => {
  const _isLogin = isLogin();
  if (_isLogin) {
    return <Route exact={props.exact} path={props.path} component={props.component} />;
  }
  return <Redirect to={'/'} />;
};

const App: React.FC = () => (
  <MuiThemeProvider theme={muiTheme}>
    <BrowserRouter>
      <TokenRefreshWrapper>
        <Header />
        <Switch>
          <Route exact={true} path="/" component={Home} />
          <Route path="/auth" component={AuthRouter} />
          <AuthorizedRoute exact={false} path={'/profile'} component={ProfileRouter} />
          <AuthorizedRoute exact={false} path={'/course'} component={CourseRouter} />
          <Route exact={true} path="/about" component={About} />
          <Route exact={true} path={`/termsofservice`} component={TermsOfService} />
          <Route exact={true} path="/activate" component={AuthComponents.Activation} />
          <Route exact={true} path="/password/reset/confirm" component={AuthComponents.PasswordResetActivation} />
        </Switch>
      </TokenRefreshWrapper>
    </BrowserRouter>
  </MuiThemeProvider>
);

const AuthRouter: React.FC = () => (
  <Switch>
    <Route exact={true} path={`/auth/login`} component={AuthComponents.Login} />
    <Route exact={true} path={`/auth/signup`} component={AuthComponents.Signup} />
    <Route exact={true} path={'/auth/password/reset'} component={AuthComponents.PasswordReset} />
    <AuthorizedRoute exact={true} path={'/auth/password/change'} component={AuthComponents.ChangePassword} />
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
    {/*<Route exact={true} path={`/course/admin`} component={CourseAdmin} />*/}
    <Route exact={true} path={`/course/create`} component={CourseComponents.CourseCreateManager} />
  </Switch>
);

export default App;
