import { AppBar, Button, IconButton, Menu, MenuItem, Toolbar, Typography } from '@material-ui/core';
import { AccountCircle } from '@material-ui/icons';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { AuthAction, setLoginState } from '../actions/auth';
import { Auth } from '../store/AuthState';

import { logout } from '../api/auth';

interface HeaderProps extends RouteComponentProps<any> {
  isLogin: boolean;
  setLoginState: (isLogin: boolean) => void;
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
    this.handleClickLogin = this.handleClickLogin.bind(this);
    this.handleClickSignup = this.handleClickSignup.bind(this);
  }

  public handleLogout() {
    if (window.confirm('ログアウトしてもよろしいですか？')) {
      logout();
      this.props.setLoginState(false);
    }
  }

  public handleMenu(e: React.MouseEvent<HTMLElement, MouseEvent>) {
    this.setState({ anchorEl: e.currentTarget });
  }

  public handleClickLogin() {
    this.props.history.push('/auth/login');
    this.setState({ anchorEl: null });
  }

  public handleClickSignup() {
    this.props.history.push('/auth/signup');
    this.setState({ anchorEl: null });
  }
  public handleClose() {
    this.setState({ anchorEl: null });
  }

  public render() {
    const anchorEl = this.state.anchorEl;
    const open = Boolean(this.state.anchorEl);

    return (
      <AppBar position="static" style={{ boxShadow: 'none' }}>
        <Toolbar>
          <Typography
            variant="h6"
            color="inherit"
            style={{ flex: 1, textDecoration: 'none' }}
            onClick={() => this.props.history.push('/')}
          >
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
                <MenuItem onClick={this.handleClickLogin}>Login</MenuItem>
                <MenuItem onClick={this.handleClickSignup}>Sign up</MenuItem>
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
  setLoginState: (isLogin: boolean) => void;
}

function mapStateToProps(state: Auth): StateFromProps {
  return {
    isLogin: state.isLogin,
  };
}

function mapDispatchToProps(dispatch: Dispatch<AuthAction>): DispatchFromProps {
  return {
    setLoginState: (isLogin: boolean) => {
      dispatch(setLoginState(isLogin));
    },
  };
}

export default withRouter(
  connect<StateFromProps, DispatchFromProps, {}>(
    mapStateToProps,
    mapDispatchToProps
  )(Header)
);
