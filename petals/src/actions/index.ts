export enum AuthActionType {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
}

export interface LoginAuthAction {
  type: AuthActionType.LOGIN;
  isLogin: boolean;
}

export function login(username: string, password: string): LoginAuthAction {
  console.log(`login ${username} : ${password}`);
  return {
    type: AuthActionType.LOGIN,
    isLogin: true,
  };
}

export type AuthAction = LoginAuthAction;
