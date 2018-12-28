import { MuiThemeProvider } from '@material-ui/core';
import * as React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import theme from './lib/theme';

import Header from './components/Header';
import Home from './components/Home';

const App = () => (
  <MuiThemeProvider theme={theme}>
    <Header />
    <BrowserRouter>
      <Route exact={true} path="/" component={Home} />
    </BrowserRouter>
  </MuiThemeProvider>
);

export default App;
