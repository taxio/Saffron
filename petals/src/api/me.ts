import * as model from '../model';
import * as util from './util';
import { deleteNullObj } from '../lib/util';

export const getMe = async (): Promise<model.User> => {
  return util.sendRequest(util.Methods.Get, '/me/', {}, true);
};

export const patchMe = async (screenName: string | null = null, gpa: number | null = null): Promise<model.User> => {
  const data = {
    screen_name: screenName,
    gpa,
  };
  return util.sendRequest(util.Methods.Patch, '/me/', data, true);
};

export const patchMeNullIgnore = async (
  screenName: string | null = null,
  gpa: number | null = null
): Promise<model.User> => {
  const data = {
    screen_name: screenName,
    gpa,
  };
  const normalized = deleteNullObj(data);
  return util.sendRequest(util.Methods.Patch, '/me/', normalized, true);
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
