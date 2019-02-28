import * as vl from '../validations';

describe('validatePassword', () => {
  it('correct', () => {
    expect(vl.validatePassword('hogehogehoge')).toBe(vl.PasswordValidationError.NONE);
  });
  it('short password', () => {
    expect(vl.validatePassword('hoge')).toBe(vl.PasswordValidationError.LENGTH);
  });
  it('with space', () => {
    expect(vl.validatePassword('hogehoge ')).toBe(vl.PasswordValidationError.UNAVAILABLE);
  });
  it('unavailable', () => {
    expect(vl.validatePassword('hogehoge😳')).toBe(vl.PasswordValidationError.UNAVAILABLE);
  });
  it('no input', () => {
    expect(vl.validatePassword('')).toBe(vl.PasswordValidationError.NO_INPUT);
  });
});

describe('validateUsername', () => {
  it('correct', () => {
    expect(vl.validateUsername('b1111111')).toBe(vl.UsernameValidationError.NONE);
    expect(vl.validateUsername('m1111111')).toBe(vl.UsernameValidationError.NONE);
    expect(vl.validateUsername('d1111111')).toBe(vl.UsernameValidationError.NONE);
  });
  it('short', () => {
    expect(vl.validateUsername('b111111')).toBe(vl.UsernameValidationError.UNAVAILABLE);
  });
  it('bad prefix', () => {
    expect(vl.validateUsername('a1111111')).toBe(vl.UsernameValidationError.UNAVAILABLE);
  });
  it('no input', () => {
    expect(vl.validateUsername('')).toBe(vl.UsernameValidationError.NO_INPUT);
  });
});

describe('validateGpaString', () => {
  it('correct', () => {
    expect(vl.validateGpaString('2.5')).toBe(vl.GpaValidationError.NONE);
  });
  it('no input', () => {
    expect(vl.validateGpaString('')).toBe(vl.GpaValidationError.NO_INPUT);
  });
  it('not number', () => {
    expect(vl.validateGpaString('hoge')).toBe(vl.GpaValidationError.NOT_NUMBER);
    expect(vl.validateGpaString('0.1hoge')).toBe(vl.GpaValidationError.NOT_NUMBER);
    expect(vl.validateGpaString('12hoge')).toBe(vl.GpaValidationError.NOT_NUMBER);
  });
  it('out of range', () => {
    expect(vl.validateGpaString('4.1')).toBe(vl.GpaValidationError.OUT_OF_RANGE);
  });
});