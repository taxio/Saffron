import { AppBar, Button, IconButton, Menu, MenuItem, Toolbar, Typography } from '@material-ui/core';
import { AccountCircle } from '@material-ui/icons';
import * as React from 'react';
// import { Link } from 'react-router-dom';
// import {connect} from "react-redux";
// import {Dispatch} from "redux";
//
// import {login, AuthAction} from '../actions';

// const ToLoginForm = () => <Link to="/login" />;

interface HeaderState {
  isLogin: boolean;
  anchorEl: any;
}

class Header extends React.Component<{}, HeaderState> {
  constructor(props: any) {
    super(props);

    this.state = {
      isLogin: false,
      anchorEl: null,
    };

    this.handleLogout.bind(this);
    this.handleMenu.bind(this);
    this.handleClose.bind(this);
  }

  public handleLogout = (): void => {
    this.setState({ isLogin: false });
  };

  public handleMenu = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    this.setState({ anchorEl: e.currentTarget });
  };

  public handleClose = () => {
    this.setState({
      isLogin: true,
      anchorEl: null,
    });
  };

  public render() {
    const anchorEl = this.state.anchorEl;
    const open = Boolean(this.state.anchorEl);
    return (
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" color="inherit" style={{ flex: 1, textDecoration: 'none' }}>
            Saffron
          </Typography>
          {this.state.isLogin ? (
            <Button color="inherit" onClick={this.handleLogout}>
              Logout
            </Button>
          ) : (
            <React.Fragment>
              <IconButton
                aria-owns={open ? 'menu-appbar' : undefined}
                aria-haspopup="true"
                onClick={this.handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={open}
                onClose={this.handleClose}
              >
                <MenuItem onClick={this.handleClose}>Login</MenuItem>
                <MenuItem onClick={this.handleClose}>Sign up</MenuItem>
              </Menu>
            </React.Fragment>
          )}
        </Toolbar>
      </AppBar>
    );
  }
}

// function mapStateToProps(): {} {
//   return {};
// }
//
// function mapDispatchToProps(dispatch: Dispatch<AuthAction>) {
// }

export default Header;
