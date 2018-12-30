import * as auth from './auth';

describe('validatePassword', () => {
  it('correct', () => {
    expect(auth.validatePassword('hogehogehoge')).toBe(auth.PasswordValidationError.NONE);
  });
  it('short password', () => {
    expect(auth.validatePassword('hoge')).toBe(auth.PasswordValidationError.LENGTH);
  });
  it('with space', () => {
    expect(auth.validatePassword('hogehoge ')).toBe(auth.PasswordValidationError.UNAVAILABLE);
  });
  it('unavailable', () => {
    expect(auth.validatePassword('hogehoge😳')).toBe(auth.PasswordValidationError.UNAVAILABLE);
  });
});

describe('validateEmail', () => {
  it('correct', () => {
    expect(auth.validateEmail('hoge@is.kit.ac.jp')).toBe(true);
  });
  it('incorrect', () => {
    expect(auth.validateEmail('foo')).toBe(false);
  });
  it('no username', () => {
    expect(auth.validateEmail('@is.kit.ac.jp')).toBe(false);
  });
  it('edge case1', () => {
    expect(auth.validateEmail('hoge@isakitbaccjp')).toBe(false);
  });
  it('edge case2', () => {
    expect(auth.validateEmail('hoge@is.kit.ac.jphogehoge')).toBe(false);
  });
});
