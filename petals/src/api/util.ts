import { getAccessToken } from '../lib/auth';
import * as AppErr from './AppErrors';

export enum Methods {
  Delete,
  Get,
  Post,
  Patch,
}

const convertMethodName = (method: Methods): string => {
  switch (method) {
    case Methods.Delete:
      return 'DELETE';
    case Methods.Get:
      return 'GET';
    case Methods.Post:
      return 'POST';
    case Methods.Patch:
      return 'PATCH';
  }
  throw new Error(`${method} not found`);
};

const handleFetchErrors = (res: Response): Response => {
  if (res.ok) {
    return res;
  }

  switch (res.status) {
    case 400:
      throw new AppErr.BadRequestError('Bad Request');
    case 401:
      throw new AppErr.UnAuthorizedError('ログインしてください');
    case 403:
      throw new AppErr.ForbiddenError('アクセス権限がありません');
    case 404:
      throw new AppErr.NotFoundError('Not Found');
    case 500:
      throw new AppErr.InternalServerError('Internal Server Error');
    case 502:
      throw new AppErr.BadGateWayError('Bad Gateway');
    default:
      throw new AppErr.UnhandledError('予期しないエラーが起こりました');
  }
};

export const sendRequest = async (
  method: Methods,
  path: string,
  data: object | any[],
  auth: boolean = true
): Promise<any> => {
  const headers: Headers = new Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Accept', 'application/json');
  if (auth) {
    const accessToken = getAccessToken();
    if (!accessToken) {
      throw new AppErr.UnAuthorizedError('ログインしてください');
    }
    headers.append('Authorization', `JWT ${accessToken}`);
  }

  let options: object = {
    method: convertMethodName(method),
    headers,
  };

  var process;
  let url: string = process.env.REACT_APP_API_ENDPOINT + path;
  switch (method) {
    case Methods.Patch:
    case Methods.Post:
      options = { ...options, body: JSON.stringify(data) };
      break;
    case Methods.Get:
      url += '?' + convertGetQueries(data);
      break;
  }

  return fetch(url, options)
    .catch(e => {
      throw Error(e);
    })
    .then(handleFetchErrors)
    .then(res => {
      return res.status === 204 ? {} : res.json();
    });
};

export const convertGetQueries = (data: object): string => {
  const buf = [];
  for (const key of Object.keys(data)) {
    if (data[key] instanceof Object) {
      throw new Error('not correct data');
    }
    const convertedKey = convertCamelToSnake(key);
    buf.push(`${convertedKey}=${data[key]}`);
  }
  return buf.join('&');
};

const CamelToSnakeRegex = new RegExp('[A-Z]', 'g');

export const convertCamelToSnake = (camelStr: string): string => {
  return camelStr.replace(CamelToSnakeRegex, (s: string) => {
    return '_' + s.charAt(0).toLowerCase();
  });
};
