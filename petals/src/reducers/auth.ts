import { AuthAction, AuthActionType } from '../actions/auth';
import { isLogin } from '../api/auth';
import { AuthState } from '../store';

const initialState: AuthState = {
  isLogin: isLogin(),
};

function auth(state: AuthState = initialState, action: AuthAction): AuthState {
  switch (action.type) {
    case AuthActionType.SET_LOGIN_STATE:
      return {
        isLogin: action.isLogin,
      };

    default:
      return state;
  }
}

export default auth;
