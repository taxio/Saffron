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

export const validatePassword = (password: string): PasswordValidationError => {
  if (password.length < 8) {
    return PasswordValidationError.LENGTH;
  }

  // TODO: 使用可能文字チェック
  // 正規表現作ってそれにマッチしてるかチェック

  return PasswordValidationError.NONE;
};
