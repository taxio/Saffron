import * as api from './api';

// const isLogin = (): boolean => {
//   const token: string | null = localStorage.getItem('token');
//   if (token == null) {
//     return false;
//   }
//
//   // TOFO: verify
//
//   return true;
// };
//
// const getToken = (): string | null => {
//   const token: string | null = localStorage.getItem('token');
//   return token;
// };

export enum PasswordValidationError {
  NONE,
  LENGTH,
  UNAVAILABLE,
}

const PasswordRegex = new RegExp('[^\x21-\x7e]+');

export const validatePassword = (password: string): PasswordValidationError => {
  if (password.length < 8) {
    return PasswordValidationError.LENGTH;
  }

  // 使用可能文字チェック
  const ret = password.match(PasswordRegex);
  if (ret) {
    return PasswordValidationError.UNAVAILABLE;
  }

  return PasswordValidationError.NONE;
};

const EmailRegex = new RegExp('.+@is\\.kit\\.ac\\.jp$');

export const validateEmail = (email: string): boolean => {
  const ret = email.match(EmailRegex);
  return Boolean(ret);
};

interface LoginResponse {
  token: string;
  non_field_errors: string[];
}

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  return await api.sendRequest(api.Methods.Post, '/auth/jwt/create/', { username, password });
};

export const logout = () => {
  // TODO: API
  localStorage.removeItem('token');
};
