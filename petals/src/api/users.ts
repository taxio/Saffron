import * as model from '../model';
import * as util from './util';

interface CreateRequest {
  username: string;
  password: string;
  screen_name: string;
}

interface CreateResponse extends model.RequestError {
  username: string;
  email: string;
  screen_name: string;
}

export const create = async (username: string, password: string, screenName: string): Promise<CreateResponse> => {
  const data: CreateRequest = {
    username,
    password,
    screen_name: screenName,
  };
  return util.sendRequest(util.Methods.Post, '/users/create/', data, false);
};

interface ActivateRequest {
  uid: string;
  token: string;
}

interface ActivateResponse {}

export const activate = async (uid: string, token: string): Promise<ActivateResponse> => {
  const data: ActivateRequest = { uid, token };
  return util.sendRequest(util.Methods.Post, '/users/activate/', data, false);
};
