export enum Methods {
  Get,
  Post,
}

const convertMethodName = (method: Methods): string => {
  switch (method) {
    case Methods.Get:
      return 'GET';
    case Methods.Post:
      return 'POST';
  }
  throw new Error(`${method} not found`);
};

export const sendRequest = async (
  method: Methods,
  path: string,
  data: object,
  auth: boolean = true
): Promise<Response> => {
  const headers: Headers = new Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Accept', 'application/json');
  if (auth) {
    headers.append('Authorization', `JWT ${localStorage.getItem('token')}`);
  }

  let options: object = {
    method: convertMethodName(method),
    headers,
  };

  let url: string = process.env.REACT_APP_API_ENDPOINT + path;
  switch (method) {
    case Methods.Post:
      options = { ...options, body: JSON.stringify(data) };
      break;
    case Methods.Get:
      url += '?' + convertGetQueries(data);
      break;
  }

  return await fetch(url, options);
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
