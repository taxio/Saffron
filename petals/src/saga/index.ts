import { all } from 'redux-saga/effects';
import { userSagas } from './user';

export function* rootSaga() {
  yield all([...userSagas]);
}
