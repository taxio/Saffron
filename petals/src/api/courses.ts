import * as util from './util';

interface Course {
  pk: number;
  name: string;
  year: number;
}

const getCourses = async (): Promise<Course[]> => {
  const res = await util.sendRequest(util.Methods.Get, '/courses/', {});
  if (res.status >= 400) {
    throw await res.json();
  }
  return await res.json();
};

export const getCouseList = async (): Promise<Course[]> => {
  return getCourses().then(res => {
    return res;
  });
};

interface JoinRequest {
  pin_code: string;
}

interface JoinResponse extends Course {
  non_field_errors: string;
  pin_code: string;
}

const postJoin = async (coursePk: number, data: JoinRequest): Promise<JoinResponse> => {
  const res = await util.sendRequest(util.Methods.Post, `/courses/${coursePk}/join/`, data);
  if (res.status >= 400) {
    throw await res.json();
  }
  return await res.json();
};

export const joinCourse = async (coursePk: number, pinCode: string): Promise<JoinResponse> => {
  const req: JoinRequest = { pin_code: pinCode };
  return postJoin(coursePk, req);
};
