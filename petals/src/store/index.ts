import { applyMiddleware, compose, createStore } from 'redux';
import { FormStateMap } from 'redux-form';
import createSagaMiddleware from 'redux-saga';
import reducers from '../reducers';

import * as model from '../model';
import { rootSaga } from '../saga';

export interface AuthState {
  isLogin: boolean;
}

export interface UserState {
  isFetching: boolean;
  error: Error | null;
  user: model.User | null;
}

export interface PetalsStore {
  auth: AuthState;
  user: UserState;
  form: FormStateMap;
}

const sagaMiddleware = createSagaMiddleware();

const composeEnhancers =
  typeof window === 'object' && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
    : compose;

const enhancer = composeEnhancers(applyMiddleware(sagaMiddleware));

export const configureStore = () => {
  return createStore(reducers, enhancer);
};

export const initSaga = () => {
  sagaMiddleware.run(rootSaga);
};
