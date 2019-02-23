import * as AppErr from '../api/AppErrors';
import * as AuthApi from '../api/auth';

const ACCESS_TOKEN_KEY = 'access';
const REFRESH_TOKEN_KEY = 'refresh';

export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const login = async (username: string, password: string) => {
  return AuthApi.jwtCreate(username, password).then(res => {
    localStorage.setItem(ACCESS_TOKEN_KEY, res.access);
    localStorage.setItem(REFRESH_TOKEN_KEY, res.refresh);
  });
};

export const logout = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
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
  const token = getAccessToken();
  if (!token) {
    return false;
  }

  const payload = parseJwtTokenPayload(token);
  const now = Math.floor(new Date().getTime() / 1000);

  return now <= payload.exp;
};

export const refreshToken = async () => {
  const token = getRefreshToken();
  if (!token) {
    throw new AppErr.UnAuthorizedError('ログインしてください');
  }

  return AuthApi.jwtRefresh(token).then(res => {
    localStorage.setItem(ACCESS_TOKEN_KEY, res.access);
  });
};
