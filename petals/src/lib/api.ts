enum Methods {
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

export const sendRequest = (method: Methods, path: string, data: object): Promise<Response> => {
  const headers: Headers = new Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Accept', 'application/json');

  let options: object = {
    method: convertMethodName(method),
    headers,
  };

  let url: string = path;
  switch (method) {
    case Methods.Post:
      options = { ...options, body: JSON.stringify(data) };
      break;
    case Methods.Get:
      url += '?' + convertGetQueries(data);
      break;
  }

  return fetch(url, options);
};

export const convertGetQueries = (data: object): string => {
  const buf = [];
  for (const key of Object.keys(data)) {
    if (data[key] instanceof Object) {
      throw new Error('not correct data');
    }
    buf.push(`${key}=${data[key]}`);
  }
  return buf.join('&');
};