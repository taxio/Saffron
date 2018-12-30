// const isLogin = (): boolean => {
//   const token: string | null = localStorage.getItem('token');
//   if (token == null) {
//     return false;
//   }
//
//   // TOFO: verify
//
//   return true;
// };
//
// const getToken = (): string | null => {
//   const token: string | null = localStorage.getItem('token');
//   return token;
// };

export enum PasswordValidationError {
  NONE,
  LENGTH,
  UNAVAILABLE,
}

const PasswordRegex = new RegExp('[^\x21-\x7e]+');

export const validatePassword = (password: string): PasswordValidationError => {
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

const EmailRegex = new RegExp('.+@is\\.kit\\.ac\\.jp$');

export const validateEmail = (email: string): boolean => {
  const ret = email.match(EmailRegex);
  return Boolean(ret);
};
