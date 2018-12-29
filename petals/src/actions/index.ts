export enum AuthActionType {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  SIGNUP = 'SIGNUP',
}

export interface LoginAuthAction {
  type: AuthActionType.LOGIN;
  isLogin: boolean;
}

export function login(username: string, password: string): LoginAuthAction {
  // TODO: Login API
  console.log(`login ${username} : ${password}`);
  return {
    type: AuthActionType.LOGIN,
    isLogin: true,
  };
}

export interface LogoutAuthAction {
  type: AuthActionType.LOGOUT;
  isLogin: boolean;
}

export function logout(): LogoutAuthAction {
  // TODO: Logout API
  console.log('logout');
  return {
    type: AuthActionType.LOGOUT,
    isLogin: false,
  };
}

export interface SignupAuthAction {
  type: AuthActionType.SIGNUP;
}

export function signup(username: string, password: string): SignupAuthAction {
  // TODO: Sign up API
  console.log(`signup ${username} : ${password}`);
  return {
    type: AuthActionType.SIGNUP,
  };
}

export type AuthAction = LoginAuthAction | LogoutAuthAction | SignupAuthAction;
