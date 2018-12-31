import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import { Provider } from 'react-redux';
import { createStore, Store } from 'redux';
import auth from './reducers/auth';

import { isLogin } from './api/auth';
import { Auth } from './store/AuthState';

const store: Store<Auth> = createStore(auth, { isLogin: isLogin() });

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
