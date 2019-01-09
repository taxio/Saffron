const intReg = new RegExp('[^0-9]+');

export const isIntStr = (val: string): boolean => {
  if (!val) {
    return false;
  }
  return !Boolean(val.match(intReg));
};
