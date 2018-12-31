import * as util from './util';

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

interface JwtCreateRequest {
  username: string;
  password: string;
}

interface JwtCreateResponse {
  token: string;
  non_field_errors: string[];
}

const jwtCreate = async (data: JwtCreateRequest): Promise<JwtCreateResponse> => {
  return await util.sendRequest(util.Methods.Post, '/auth/jwt/create/', data);
};

export const login = async (username: string, password: string): Promise<boolean> => {
  const req: JwtCreateRequest = { username, password };
  return jwtCreate(req).then(res => {
    if (res.token) {
      localStorage.setItem('token', res.token);
    }
    return Boolean(res.token);
  });
};

export const logout = () => {
  // TODO: API
  localStorage.removeItem('token');
};

interface JwtRefreshRequest {
  token: string;
}

interface JwtRefreshResponse {
  token: string;
  non_field_errors: string[];
}

const jwtRefresh = async (data: JwtRefreshRequest): Promise<JwtRefreshResponse> => {
  return await util.sendRequest(util.Methods.Post, '/auth/jwt/refresh/', data);
};

export const refreshToken = async (token: string): Promise<boolean> => {
  const req: JwtRefreshRequest = { token };
  return jwtRefresh(req).then(res => {
    if (res.token) {
      localStorage.setItem('token', res.token);
    }
    return Boolean(res.token);
  });
};

interface JwtVerifyReequest {
  token: string;
}

interface JwtVerifyResponse {
  token: string;
  non_field_errors: string[];
}

const jwtVerify = async (data: JwtVerifyReequest): Promise<JwtVerifyResponse> => {
  return await util.sendRequest(util.Methods.Post, '/auth/jwt/verify/', data);
};

export const verifyToken = async (token: string): Promise<boolean> => {
  const req: JwtVerifyReequest = { token };
  return jwtVerify(req).then(res => {
    return Boolean(res.token);
  });
};
