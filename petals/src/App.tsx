import { MuiThemeProvider } from '@material-ui/core';
import * as React from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import { muiTheme } from './lib/theme';

import About from './components/About';
import * as AuthComponents from './components/Auth';
import * as CourseComponents from './components/Course';
import Footer from './components/Footer';
import Header from './components/Header';
import Home from './components/Home';
import NotFound from './components/NotFound';
import Profile from './components/Profile';
import ProfileEdit from './components/ProfileEdit';
import Settings from './components/Settings';
import TermsOfService from './components/TermsOfService';
import { isLogin, logout, refreshToken } from './lib/auth';

const TokenRefreshWrapper: React.FC = props => {
  refreshToken().catch(() => {
    logout();
  });
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        flexDirection: 'column',
      }}
    >
      {props.children}
    </div>
  );
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
          <Route exact={true} path="/about" component={About} />
          <Route exact={true} path="/termsofservice" component={TermsOfService} />
          <Route exact={true} path="/faq" component={() => <div>TODO</div>} />

          <Route exact={true} path="/login" component={AuthComponents.Login} />
          <Route exact={true} path="/signup" component={AuthComponents.Signup} />
          <Route exact={true} path="/activate" component={AuthComponents.Activation} />
          <Route exact={true} path="/password/reset" component={AuthComponents.PasswordReset} />
          <Route exact={true} path="/password/reset/confirm" component={AuthComponents.PasswordResetActivation} />

          <AuthorizedRoute exact={false} path={'/profile'} component={ProfileRouter} />
          <AuthorizedRoute exact={false} path={'/settings'} component={SettingsRouter} />
          <AuthorizedRoute exact={false} path={'/courses'} component={CourseRouter} />

          <Route exact={true} component={NotFound} />
        </Switch>
        <Footer />
      </TokenRefreshWrapper>
    </BrowserRouter>
  </MuiThemeProvider>
);

const ProfileRouter: React.FC = () => (
  <Switch>
    <Route exact={true} path={`/profile`} component={Profile} />
    <Route exact={true} path={`/profile/edit`} component={ProfileEdit} />
    <Route exact={true} path={`/profile/password/change`} component={AuthComponents.ChangePassword} />
  </Switch>
);

const SettingsRouter: React.FC = () => (
  <Switch>
    <Route exact={true} path={`/settings`} component={Settings} />
    <Route exact={true} path={`/settings/password`} component={AuthComponents.ChangePassword} />
  </Switch>
);

const CourseRouter: React.FC = () => (
  <Switch>
    <Route exact={true} path={`/courses`} component={() => <div>TODO</div>} />
    <Route exact={true} path={`/courses/create`} component={CourseComponents.CourseCreateManager} />
    <Route exact={true} path={`/courses/:coursePk`} component={() => <div>TODO</div>} />
    <Route exact={true} path={`/courses/:coursePk/labs/:labPk`} component={() => <div>TODO</div>} />
    <Route exact={true} path={`/courses/:coursePk/hopes`} component={() => <div>TODO</div>} />
    <Route exact={true} path={`/courses/:coursePk/admin`} component={() => <div>TODO</div>} />
    <Route exact={true} path={`/courses/:coursePk/join`} component={() => <div>TODO</div>} />
  </Switch>
);

export default App;
