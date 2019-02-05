import * as util from './util';

interface JwtCreateRequest {
  username: string;
  password: string;
}

interface JwtCreateResponse {
  token: string;
  non_field_errors: string[];
}

export const jwtCreate = async (username: string, password: string): Promise<JwtCreateResponse> => {
  const data: JwtCreateRequest = {
    username,
    password,
  };
  return util.sendRequest(util.Methods.Post, '/auth/jwt/create/', data, false);
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
