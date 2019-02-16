import * as model from '../model';
import * as util from './util';

interface JwtCreateRequest {
  username: string;
  password: string;
}

interface JwtCreateResponse extends model.RequestError {
  access: string;
  refresh: string;
}

export const jwtCreate = async (username: string, password: string): Promise<JwtCreateResponse> => {
  const data: JwtCreateRequest = {
    username,
    password,
  };
  return util.sendRequest(util.Methods.Post, '/auth/jwt/create/', data, false);
};

export const logout = () => {
  localStorage.removeItem('token');
};

interface JwtRefreshRequest {
  token: string;
}

interface JwtRefreshResponse extends model.RequestError {
  token: string;
}

export const jwtRefresh = async (token: string): Promise<JwtRefreshResponse> => {
  const data: JwtRefreshRequest = { token };
  return util.sendRequest(util.Methods.Post, '/auth/jwt/refresh/', data, false);
};

interface JwtVerifyRequest {
  token: string;
}

interface JwtVerifyResponse extends model.RequestError {
  token: string;
  non_field_errors: string[];
}

export const jwtVerify = async (token: string): Promise<JwtVerifyResponse> => {
  const data: JwtVerifyRequest = { token };
  return util.sendRequest(util.Methods.Post, '/auth/jwt/verify/', data, false);
};
