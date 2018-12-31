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
  non_field_errors: string[];
}

const create = async (data: CreateRequest): Promise<CreateResponse> => {
  return await util.sendRequest(util.Methods.Post, '/users/create/', data);
};

export const createUser = async (username: string, password: string): Promise<boolean> => {
  const req: CreateRequest = { username, password, screenName: null, gpa: null };
  return create(req).then(res => {
    return Boolean(res.non_field_errors);
  });
};
