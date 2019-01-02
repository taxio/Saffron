import { createMuiTheme } from '@material-ui/core';

const theme = createMuiTheme({
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

export default theme;
