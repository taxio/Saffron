import { AuthAction, AuthActionType } from '../actions/auth';
import { Auth } from '../store/AuthState';

function auth(state: Auth, action: AuthAction): Auth {
  switch (action.type) {
    case AuthActionType.LOGIN:
      return {
        isLogin: action.isLogin,
      };

    case AuthActionType.LOGOUT:
      return {
        isLogin: action.isLogin,
      };

    case AuthActionType.SIGNUP:
      return state;

    default:
      return state;
  }
}

export default auth;
