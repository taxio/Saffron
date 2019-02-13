import * as model from '../model';
import * as util from './util';

export const getYears = async (): Promise<model.Year[]> => {
  return util.sendRequest(util.Methods.Get, '/years/', {}, true);
};
