import { deleteNullObj } from '../lib/util';
import * as model from '../model';
import * as util from './util';

export const getCourses = async (): Promise<model.Course[]> => {
  return util.sendRequest(util.Methods.Get, '/courses/', {}, true);
};

interface PostCourseRequest {
  name: string;
  pin_code: string;
  year: number;
  config: {
    show_username: boolean;
    show_gpa: boolean;
  };
}

export const postCourse = async (
  name: string,
  pinCode: string,
  year: number,
  showName: boolean,
  showGPA: boolean
): Promise<model.Course> => {
  const data: PostCourseRequest = {
    name,
    pin_code: pinCode,
    year,
    config: {
      show_username: showName,
      show_gpa: showGPA,
    },
  };
  return util.sendRequest(util.Methods.Post, '/courses/', data, true);
};

export const getAdmins = async (coursePk: number): Promise<model.User[]> => {
  return util.sendRequest(util.Methods.Get, `/courses/${coursePk}/admins/`, {}, true);
};

export const patchAdmin = async (coursePk: number, userPk: number): Promise<{}> => {
  return util.sendRequest(util.Methods.Patch, `/courses/${coursePk}/admins/${userPk}/`, {}, true);
};

export const deleteAdmin = async (coursePk: number, userPk: number): Promise<{}> => {
  return util.sendRequest(util.Methods.Delete, `/courses/${coursePk}/admins/${userPk}/`, {}, true);
};

export const getConfig = async (coursePk: number): Promise<model.CourseConfig> => {
  return util.sendRequest(util.Methods.Get, `/courses/${coursePk}/config/`, {}, true);
};

interface PostConfigRequest {
  show_gpa: boolean;
  show_username: boolean;
  rank_limit: number;
}

export const postConfig = async (coursePk: number, showGPA: boolean, showName: boolean): Promise<{}> => {
  const data: PostConfigRequest = {
    show_gpa: showGPA,
    show_username: showName,
    rank_limit: 3,
  };
  return util.sendRequest(util.Methods.Post, `/courses/${coursePk}/config/`, data, true);
};

interface JoinRequest {
  pin_code: string;
}

export const join = async (coursePk: number, pinCode: string): Promise<model.Course> => {
  const data: JoinRequest = { pin_code: pinCode };
  return util.sendRequest(util.Methods.Post, `/courses/${coursePk}/join/`, data, true);
};

export const getLabs = async (coursePk: number): Promise<model.Lab[]> => {
  return util.sendRequest(util.Methods.Get, `/courses/${coursePk}/labs/`, {}, true);
};

interface PostLabRequest {
  name: string;
  capacity: number;
}

export const postLab = async (coursePk: number, name: string, capacity: number): Promise<model.Lab> => {
  const data: PostLabRequest = { name, capacity };
  return util.sendRequest(util.Methods.Post, `/courses/${coursePk}/labs/`, data, true);
};

export const patchLab = async (
  coursePk: number,
  labPk: number,
  name: string | null,
  capacity: number | null
): Promise<model.Lab> => {
  const data = deleteNullObj({ name, capacity });
  return util.sendRequest(util.Methods.Patch, `/courses/${coursePk}/labs/${labPk}/`, data, true);
};

export const deleteLab = async (coursePk: number, labPk: number): Promise<{}> => {
  return util.sendRequest(util.Methods.Delete, `/courses/${coursePk}/labs/${labPk}/`, {}, true);
};

export const getRanks = async (coursePk: number): Promise<model.Course[]> => {
  return util.sendRequest(util.Methods.Delete, `/courses/${coursePk}/ranks/`, {}, true);
};

export const postRanks = async (coursePk: number, labPks: number[]): Promise<{}> => {
  const data: any[] = [];
  labPks.forEach(labPk => {
    data.push({ lab: labPk });
  });
  return util.sendRequest(util.Methods.Post, `/courses/${coursePk}/ranks/`, data, true);
};

export const getCourse = async (coursePk: number): Promise<model.Course> => {
  return util.sendRequest(util.Methods.Get, `/courses/${coursePk}/`, {}, true);
};

interface PatchCourseRequest {
  name: string | null;
  pin_code: string | null;
  year: number | null;
  config: {
    show_username: boolean | null;
    show_gpa: boolean | null;
  };
}

export const patchCourse = async (
  coursePk: number,
  name: string | null = null,
  pinCode: string | null = null,
  year: number | null = null,
  showName: boolean | null = null,
  showGPA: boolean | null = null
): Promise<model.Course> => {
  const data: PatchCourseRequest = {
    name,
    pin_code: pinCode,
    year,
    config: {
      show_username: showName,
      show_gpa: showGPA,
    },
  };
  const normalized = deleteNullObj(data);
  return util.sendRequest(util.Methods.Patch, `/courses/${coursePk}/`, normalized, true);
};

export const deleteCourse = async (coursePk: number): Promise<{}> => {
  return util.sendRequest(util.Methods.Delete, `/courses/${coursePk}/`, {}, true);
};
