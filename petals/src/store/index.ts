import { createStore } from 'redux';
import { FormStateMap } from 'redux-form';
import reducers from '../reducers';

export interface AuthState {
  isLogin: boolean;
}

export interface PetalsStore {
  auth: AuthState;
  form: FormStateMap;
}

export const configureStore = () => {
  return createStore(reducers);
};
