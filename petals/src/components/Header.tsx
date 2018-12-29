import { AppBar, Button, IconButton, Menu, MenuItem, Toolbar, Typography } from '@material-ui/core';
import { AccountCircle } from '@material-ui/icons';
import * as React from 'react';
import { Link } from 'react-router-dom';

import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { AuthAction, logout } from '../actions/auth';
import { Auth } from '../store/AuthState';

interface HeaderProps {
  isLogin: boolean;
  logout: () => void;
}

interface HeaderState {
  anchorEl: any;
}

class Header extends React.Component<HeaderProps, HeaderState> {
  constructor(props: any) {
    super(props);

    this.state = {
      anchorEl: null,
    };

    this.handleLogout = this.handleLogout.bind(this);
    this.handleMenu = this.handleMenu.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  public handleLogout = (): void => {
    this.props.logout();
  };

  public handleMenu = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    this.setState({ anchorEl: e.currentTarget });
  };

  public handleClose = () => {
    this.setState({ anchorEl: null });
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

          {this.props.isLogin ? (
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
                <MenuItem onClick={this.handleClose}>
                  <Link to="/login" style={{ textDecoration: 'none' }}>
                    Login
                  </Link>
                </MenuItem>
                <MenuItem onClick={this.handleClose}>
                  <Link to="/signup" style={{ textDecoration: 'none' }}>
                    Sign up
                  </Link>
                </MenuItem>
              </Menu>
            </React.Fragment>
          )}
        </Toolbar>
      </AppBar>
    );
  }
}

interface StateFromProps {
  isLogin: boolean;
}

interface DispatchFromProps {
  logout: () => void;
}

function mapStateToProps(state: Auth): StateFromProps {
  return {
    isLogin: state.isLogin,
  };
}

function mapDispatchToProps(dispatch: Dispatch<AuthAction>): DispatchFromProps {
  return {
    logout: () => {
      dispatch(logout());
    },
  };
}

export default connect<StateFromProps, DispatchFromProps, {}>(
  mapStateToProps,
  mapDispatchToProps
)(Header);
