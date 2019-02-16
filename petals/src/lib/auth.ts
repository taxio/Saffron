import * as AuthApi from '../api/auth';

export const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

export const login = async (username: string, password: string) => {
  return AuthApi.jwtCreate(username, password).then(res => {
    localStorage.setItem('accessToken', res.access);
    localStorage.setItem('refreshToken', res.refresh);
  });
};

export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
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
