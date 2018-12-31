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
  const res = await util.sendRequest(util.Methods.Post, '/users/create/', data);
  if (res.status >= 400) {
    throw await res.json();
  }
  return await res.json();
};

export const createUser = async (username: string, password: string): Promise<boolean> => {
  const req: CreateRequest = { username, password, screenName: null, gpa: null };
  return create(req)
    .then(res => {
      return true;
    })
    .catch(errJson => {
      // TODO: errJson(エラーメッセージ)を活用する
      return false;
    });
};
