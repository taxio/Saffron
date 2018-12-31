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

describe('validateUsername', () => {
  it('correct', () => {
    expect(auth.validateUsername('b1111111')).toBe(true);
    expect(auth.validateUsername('m1111111')).toBe(true);
    expect(auth.validateUsername('d1111111')).toBe(true);
  });
  it('short', () => {
    expect(auth.validateUsername('b111111')).toBe(false);
  });
  it('bad prefix', () => {
    expect(auth.validateUsername('a1111111')).toBe(false);
  });
});
