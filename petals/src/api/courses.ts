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

interface Config {
  show_gpa: boolean;
  show_username: boolean;
}

interface PostCourseRequest {
  name: string;
  pin_code: string;
  year: number;
  config: Config;
}

const postCourse = async (data: PostCourseRequest): Promise<Course> => {
  const res = await util.sendRequest(util.Methods.Post, '/courses/', data);
  if (res.status >= 400) {
    throw await res.json();
  }
  return await res.json();
};

export const createCourse = async (
  name: string,
  pinCode: string,
  year: number,
  showGpa: boolean,
  showUsername: boolean
): Promise<Course> => {
  const req: PostCourseRequest = {
    name,
    pin_code: pinCode,
    year,
    config: { show_gpa: showGpa, show_username: showUsername },
  };
  return postCourse(req).then(res => {
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

interface Lab {
  name: string;
  capacity: number;
}

const postLabs = async (courseId: number, data: Lab): Promise<{}> => {
  const res = await util.sendRequest(util.Methods.Post, `/courses/${courseId}/labs/`, data);
  if (res.status >= 400) {
    throw await res.json();
  }
  return await res.json();
};

export const addLab = async (courseId: number, labName: string, labCapacity: number): Promise<{}> => {
  const req: Lab = { name: labName, capacity: labCapacity };
  return postLabs(courseId, req);
};
