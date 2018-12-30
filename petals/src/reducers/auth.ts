import { AuthAction, AuthActionType } from '../actions/auth';
import { Auth } from '../store/AuthState';

function auth(state: Auth, action: AuthAction): Auth {
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
