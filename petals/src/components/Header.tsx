import { AppBar, Toolbar, Typography } from '@material-ui/core';
import * as React from 'react';

class Header extends React.Component {
  public render() {
    return (
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" color="inherit">
            Saffron
          </Typography>
        </Toolbar>
      </AppBar>
    );
  }
}

export default Header;
