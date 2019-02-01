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

const UsernameRegex = new RegExp('^[bmd]\\d{7}$');

export const validateUsername = (username: string): boolean => {
  const ret = username.match(UsernameRegex);
  return Boolean(ret);
};
