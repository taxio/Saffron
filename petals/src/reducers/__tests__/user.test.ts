import { UserActionType, UserFetchRequestedAction } from '../../actions/user';
import { UserState } from '../../store';
import user from '../user';

describe('user reducer', () => {
  const initialState: UserState = {
    isFetching: false,
    error: null,
    user: null,
  };

  it('fetch requested', () => {
    const action: UserFetchRequestedAction = {
      type: UserActionType.USER_FETCH_REQUESTED,
    };
    const want: UserState = {
      ...initialState,
      isFetching: true,
    };
    expect(user(initialState, action)).toEqual(want);
  });
});
