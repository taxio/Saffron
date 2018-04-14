import React from 'react';
import { Route, Switch } from 'react-router';
import { HashRouter } from 'react-router-dom';

import TopPage from './components/TopPage';

export const App = () => (
  <HashRouter>
    <Route path="/" component={ MainRoute } />
  </HashRouter>
);

const MainRoute = () => (
  <Switch>
    <Route path="/" component={ TopPage }/>
  </Switch>
);
