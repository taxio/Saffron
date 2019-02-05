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

interface Course {
  pk: number;
  name: string;
  year: number;
}

interface GetMeResponse {
  pk: number;
  username: string;
  email: string;
  screen_name: string;
  gpa: number | null;
  is_admin: boolean;
  joined: boolean;
  courses: Course[];
}

const getMe = async (): Promise<GetMeResponse> => {
  const res = await util.sendRequest(util.Methods.Get, '/users/me/', {});
  if (res.status >= 400) {
    throw await res.json();
  }
  return await res.json();
};

export const getMeInfo = async (): Promise<GetMeResponse> => {
  return getMe().then(res => {
    return res;
  });
};

interface PatchMeRequest {
  screen_name: string;
  gpa: number | null;
}

const patchMe = async (data: PatchMeRequest): Promise<GetMeResponse> => {
  const res = await util.sendRequest(util.Methods.Patch, '/users/me/', data);
  if (res.status >= 400) {
    throw await res.json();
  }
  return await res.json();
};

export const editMeInfo = async (screenName: string, gpa: number | null): Promise<boolean> => {
  const req: PatchMeRequest = { screen_name: screenName, gpa };
  return patchMe(req)
    .then(res => {
      return true;
    })
    .catch(errJson => {
      return false;
    });
};
