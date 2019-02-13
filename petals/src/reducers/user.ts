import { UserAction, UserActionType } from '../actions/user';
import { UserState } from '../store';

const initialState: UserState = {
  isFetching: false,
  error: null,
  user: null,
};

function user(state: UserState = initialState, action: UserAction): UserState {
  switch (action.type) {
    case UserActionType.USER_FETCH_REQUESTED:
      return {
        ...state,
        isFetching: true,
        error: null,
      };

    case UserActionType.UESR_UPDATE_REQUESTED:
      return {
        ...state,
        isFetching: true,
        error: null,
      };

    case UserActionType.USER_FETCH_SUCCEEDED:
      return {
        ...state,
        isFetching: false,
        user: action.user,
        error: null,
      };

    case UserActionType.USER_FETCH_FAILED:
      return {
        ...state,
        isFetching: false,
        error: action.error,
      };

    default:
      return state;
  }
}

export default user;
