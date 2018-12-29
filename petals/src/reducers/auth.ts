import { AuthAction, AuthActionType } from '../actions';
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

    default:
      return state;
  }
}

export default auth;
