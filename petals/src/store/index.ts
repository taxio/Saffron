import { compose, createStore } from 'redux';
import { FormStateMap } from 'redux-form';
import reducers from '../reducers';

export interface AuthState {
  isLogin: boolean;
}

export interface PetalsStore {
  auth: AuthState;
  form: FormStateMap;
}

const composeEnhancers =
  typeof window === 'object' && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
    : compose;

const enhancer = composeEnhancers();

export const configureStore = () => {
  return createStore(reducers, enhancer);
};
