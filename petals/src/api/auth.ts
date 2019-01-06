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

const UsernameRegex = new RegExp('^[bmd]\\d{7}$');

export const validateUsername = (email: string): boolean => {
  const ret = email.match(UsernameRegex);
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
  const res = await util.sendRequest(util.Methods.Post, '/auth/jwt/create/', data, false);
  if (res.status >= 400) {
    throw await res.json();
  }
  return await res.json();
};

export const login = async (username: string, password: string): Promise<boolean> => {
  const req: JwtCreateRequest = { username, password };
  return jwtCreate(req)
    .then(res => {
      localStorage.setItem('token', res.token);
      return true;
    })
    .catch(errJson => {
      return false;
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
  const res = await util.sendRequest(util.Methods.Post, '/auth/jwt/refresh/', data, false);
  if (res.status >= 400) {
    throw await res.json();
  }
  return await res.json();
};

export const refreshToken = async (token: string): Promise<boolean> => {
  const req: JwtRefreshRequest = { token };
  return jwtRefresh(req)
    .then(res => {
      localStorage.setItem('token', res.token);
      return true;
    })
    .catch(errJson => {
      return false;
    });
};

interface JwtVerifyRequest {
  token: string;
}

interface JwtVerifyResponse {
  token: string;
  non_field_errors: string[];
}

const jwtVerify = async (data: JwtVerifyRequest): Promise<JwtVerifyResponse> => {
  const res = await util.sendRequest(util.Methods.Post, '/auth/jwt/verify/', data, false);
  if (res.status >= 400) {
    throw await res.json();
  }
  return await res.json();
};

export const verifyToken = async (token: string): Promise<boolean> => {
  const req: JwtVerifyRequest = { token };
  return jwtVerify(req)
    .then(res => {
      return true;
    })
    .catch(errJson => {
      return false;
    });
};

interface JwtPayload {
  user_id: number;
  username: string;
  exp: number;
  email: string;
}

export const parseJwtTokenPayload = (token: string): JwtPayload => {
  const base64Token = token.split('.')[1];
  const decodedToken = new Buffer(base64Token, 'base64');
  return JSON.parse(decodedToken.toString());
};

export const isLogin = (): boolean => {
  const token = localStorage.getItem('token');
  if (!token) {
    return false;
  }

  const payload = parseJwtTokenPayload(token);
  const now = Math.floor(new Date().getTime() / 1000);

  return now <= payload.exp;
};
