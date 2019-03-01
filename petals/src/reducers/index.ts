import { combineReducers } from 'redux';
import { reducer as reduxFormReducer } from 'redux-form';
import auth from './auth';
import notification from './notification';
import user from './user';

const reducers = combineReducers({
  auth,
  user,
  form: reduxFormReducer,
  notification,
});

export default reducers;
