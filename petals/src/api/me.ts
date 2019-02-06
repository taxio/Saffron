import * as model from '../model';
import * as util from './util';

export const getMe = async (): Promise<model.User> => {
  return util.sendRequest(util.Methods.Get, '/me/', {}, true);
};

interface PatchMeRequest {
  screen_name: string;
  gpa: number | null;
}

export const patchMe = async (screenName: string, gpa: number | null): Promise<model.User> => {
  const data: PatchMeRequest = {
    screen_name: screenName,
    gpa,
  };
  return util.sendRequest(util.Methods.Patch, '/me/', data, true);
};

interface DeleteMeRequest {
  current_password: string;
}

export const deleteMe = async (password: string): Promise<{}> => {
  const data: DeleteMeRequest = {
    current_password: password,
  };
  return util.sendRequest(util.Methods.Post, '/me/delete/', data, true);
};
