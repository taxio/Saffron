import { call, put, takeLatest } from 'redux-saga/effects';
import { UserActionType, UserFetchRequestedAction } from '../actions/user';
import * as meApi from '../api/me';

function* fetchUser(action: UserFetchRequestedAction) {
  try {
    const user = yield call(meApi.getMe);
    yield put({ type: UserActionType.USER_FETCH_SUCCEEDED, user });
  } catch (error) {
    yield put({ type: UserActionType.USER_FETCH_FAILED, error });
  }
}

export const userSagas = [takeLatest(UserActionType.USER_FETCH_REQUESTED, fetchUser)];
