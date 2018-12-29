import { MuiThemeProvider } from '@material-ui/core';
import * as React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import theme from './lib/theme';

import Header from './components/Header';
import Home from './components/Home';
import Login from './components/Login';

const App = () => (
  <MuiThemeProvider theme={theme}>
    <BrowserRouter>
      <React.Fragment>
        {/*<Route path="/" component={Header} />*/}
        <Header />
        <Switch>
          <Route exact={true} path="/" component={Home} />
          <Route path="/login" component={Login} />
        </Switch>
      </React.Fragment>
    </BrowserRouter>
  </MuiThemeProvider>
);

export default App;
