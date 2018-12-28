const isLogin = (): boolean => {
  const token: string | null = localStorage.getItem('token');
  if (token == null) {
    return false;
  }

  // TOFO: verify

  return true;
};

const getToken = (): string | null => {
  const token: string | null = localStorage.getItem('token');
  return token;
};
