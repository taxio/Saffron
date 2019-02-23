import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import App from './App';
import { refreshToken } from './lib/auth';
import { bodyTheme } from './lib/theme';
import registerServiceWorker from './registerServiceWorker';
import { configureStore, initSaga, PetalsStore } from './store';

const store: Store<PetalsStore> = configureStore();
initSaga();

if (store.getState().auth.isLogin) {
  refreshToken();
}

document.body.style.backgroundColor = bodyTheme.backgroundColor;
document.body.style.margin = bodyTheme.margin;

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
