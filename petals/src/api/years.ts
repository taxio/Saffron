import * as util from './util';

interface Year {
  pk: number;
  year: number;
  courses: Course[];
}

interface Course {
  pk: number;
  name: string;
  year: number;
}

const getYears = async (): Promise<Year[]> => {
  const res = await util.sendRequest(util.Methods.Get, '/years/', {});
  if (res.status >= 400) {
    return await res.json();
  }
  return await res.json();
};

export const getYearCouseList = async (): Promise<Year[]> => {
  return await getYears().then(res => {
    return res;
  });
};
