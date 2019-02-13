import * as util from './util';

interface ChangeRequest {
  new_password: string;
  current_password: string;
}

interface ChangeResponse {}

export const change = async (newPassword: string, currentPassword: string): Promise<ChangeResponse> => {
  const data: ChangeRequest = {
    new_password: newPassword,
    current_password: currentPassword,
  };
  return util.sendRequest(util.Methods.Post, '/password/', data, true);
};

interface ResetRequest {
  email: string;
}

interface ResetResponse {}

export const reset = async (email: string): Promise<ResetResponse> => {
  const data: ResetRequest = { email };
  return util.sendRequest(util.Methods.Post, '/password/reset/', data, false);
};

interface ResetConfirmRequest {
  uid: string;
  token: string;
  new_password: string;
}

interface ResetConfirmResponse {}

export const resetConfirm = async (uid: string, token: string, newPassword: string): Promise<ResetConfirmResponse> => {
  const data: ResetConfirmRequest = {
    uid,
    token,
    new_password: newPassword,
  };
  return util.sendRequest(util.Methods.Post, '/password/reset/confirm/', data, false);
};
