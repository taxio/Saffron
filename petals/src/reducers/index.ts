import { combineReducers } from 'redux';
import { reducer as reduxFormReducer } from 'redux-form';
import auth from './auth';

const reducers = combineReducers({
  auth,
  form: reduxFormReducer,
});

export default reducers;
