export enum AuthActionType {
  SET_LOGIN_STATE = 'SET_LOGIN_STATE',
}

export interface SetLoginStateAuthAction {
  type: AuthActionType.SET_LOGIN_STATE;
  isLogin: boolean;
}

export function setLoginState(isLogin: boolean): SetLoginStateAuthAction {
  return {
    type: AuthActionType.SET_LOGIN_STATE,
    isLogin,
  };
}

export type AuthAction = SetLoginStateAuthAction;
