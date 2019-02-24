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
