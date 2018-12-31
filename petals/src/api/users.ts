import * as util from './util';

interface CreateRequest {
  username: string;
  password: string;
  screenName: string | null;
  gpa: number | null;
}

interface CreateResponse {
  pk: number;
  username: string;
  email: string;
  screenName: string;
}

export const create = async (data: CreateRequest): Promise<CreateResponse> => {
  return await util.sendRequest(util.Methods.Post, '/users/create/', data);
};
