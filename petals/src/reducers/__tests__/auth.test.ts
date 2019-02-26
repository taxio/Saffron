import { AuthActionType, SetLoginStateAuthAction } from '../../actions/auth';
import { AuthState } from '../../store';
import auth from '../auth';

describe('auth reducer', () => {
  const initialState: AuthState = {
    isLogin: false,
  };

  it('set login state true', () => {
    const action: SetLoginStateAuthAction = {
      type: AuthActionType.SET_LOGIN_STATE,
      isLogin: true,
    };
    const want: AuthState = {
      isLogin: true,
    };
    expect(auth(initialState, action)).toEqual(want);
  });

  it('set login state false', () => {
    const action: SetLoginStateAuthAction = {
      type: AuthActionType.SET_LOGIN_STATE,
      isLogin: false,
    };
    const prevState: AuthState = { ...initialState, isLogin: true };
    const want: AuthState = {
      isLogin: false,
    };
    expect(auth(prevState, action)).toEqual(want);
  });

  it('other action', () => {
    // @ts-ignore
    expect(auth(initialState, { type: 'hoge' })).toEqual(initialState);
  });
});
