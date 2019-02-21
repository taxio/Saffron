const intReg = new RegExp('[^0-9]+');

export const isIntStr = (val: string): boolean => {
  if (!val) {
    return false;
  }
  return !Boolean(val.match(intReg));
};

export const deleteNullObj = (data: object): object => {
  Object.keys(data).map(v => {
    if (data[v] == null) {
      delete data[v];
    }
    if (data[v] instanceof Object) {
      const _v = deleteNullObj(data[v]);
      if (Object.keys(_v).length === 0) {
        delete data[v];
      } else {
        data[v] = _v;
      }
    }
  });
  return data;
};
