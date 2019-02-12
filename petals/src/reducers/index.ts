import { combineReducers } from 'redux';
import { reducer as reduxFormReducer } from 'redux-form';
import auth from './auth';
import user from './user';

const reducers = combineReducers({
  auth,
  user,
  form: reduxFormReducer,
});

export default reducers;
