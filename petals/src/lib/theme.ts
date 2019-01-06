import { createMuiTheme } from '@material-ui/core';

export const muiTheme = createMuiTheme({
  typography: {
    useNextVariants: true,
  },
  palette: {
    primary: {
      light: '#FFECB3',
      main: '#FFC107',
      dark: '#FFA000',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#E040FB',
      contrastText: '#FFFFFF',
    },
  },
});

// @ts-ignore
export const bodyTheme: CSSStyleDeclaration = {
  margin: '0px',
  backgroundColor: '#FCF7E4',
};
