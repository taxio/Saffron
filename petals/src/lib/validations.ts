import { isFloatStr } from './util';

export enum PasswordValidationError {
  NONE,
  NO_INPUT,
  LENGTH,
  UNAVAILABLE,
}

const PasswordRegex = new RegExp('[^\x21-\x7e]+');

export const validatePassword = (password: string | null): PasswordValidationError => {
  if (!password || password.length === 0) {
    return PasswordValidationError.NO_INPUT;
  }
  if (password.length < 8) {
    return PasswordValidationError.LENGTH;
  }

  // 使用可能文字チェック
  const ret = password.match(PasswordRegex);
  if (ret) {
    return PasswordValidationError.UNAVAILABLE;
  }

  return PasswordValidationError.NONE;
};

export const validatePasswordWithErrMsg = (password: string): string => {
  switch (validatePassword(password)) {
    case PasswordValidationError.NO_INPUT:
      return 'パスワードを入力してください';
    case PasswordValidationError.LENGTH:
      return '8文字以上にしてください';
    case PasswordValidationError.UNAVAILABLE:
      return '使用不可能な文字が含まれています';
  }
  return '';
};

export enum UsernameValidationError {
  NONE,
  NO_INPUT,
  UNAVAILABLE,
}

const UsernameRegex = new RegExp('^[bmd]\\d{7}$');

export const validateUsername = (username: string | null): UsernameValidationError => {
  if (!username || username.length === 0) {
    return UsernameValidationError.NO_INPUT;
  }
  const ret = username.match(UsernameRegex);
  if (!Boolean(ret)) {
    return UsernameValidationError.UNAVAILABLE;
  }
  return UsernameValidationError.NONE;
};

export const validateUsernameWithErrMsg = (username: string | null): string => {
  switch (validateUsername(username)) {
    case UsernameValidationError.NO_INPUT:
      return 'ユーザー名を入力してください';
    case UsernameValidationError.UNAVAILABLE:
      return '大学のユーザー名を入力してください';
  }
  return '';
};

export enum GpaValidationError {
  NONE,
  NO_INPUT,
  NOT_NUMBER,
  OUT_OF_RANGE,
}

export const validateGpaString = (gpa: string | null): GpaValidationError => {
  if (!gpa) {
    return GpaValidationError.NO_INPUT;
  }
  if (!isFloatStr(gpa)) {
    return GpaValidationError.NOT_NUMBER;
  }
  const gpaNum = parseFloat(gpa);
  if (isNaN(gpaNum)) {
    return GpaValidationError.NOT_NUMBER;
  }
  if (gpaNum < 0.0 || gpaNum > 4.0) {
    return GpaValidationError.OUT_OF_RANGE;
  }
  return GpaValidationError.NONE;
};
