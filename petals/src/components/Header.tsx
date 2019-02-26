import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import AccountCircle from '@material-ui/icons/AccountCircle';

import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Dispatch } from 'redux';

import { AuthAction, setLoginState } from '../actions/auth';
import { logout } from '../lib/auth';
import { PetalsStore } from '../store';

interface HeaderProps extends RouteComponentProps<any> {
  isLogin: boolean;
  setLoginState: (isLogin: boolean) => void;
}

const Header: React.FC<HeaderProps> = props => {
  const [showDialog, setShowDialog] = React.useState<boolean>(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const handleOpenDialog = () => {
    setShowDialog(true);
    setAnchorEl(null);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
  };

  const handleLogout = () => {
    logout();
    props.setLoginState(false);
    props.history.push('/');
    setShowDialog(false);
    setAnchorEl(null);
  };

  const handleMenu = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClickLogin = () => {
    props.history.push('/login');
    setAnchorEl(null);
  };

  const handleClickSignup = () => {
    props.history.push('/signup');
    setAnchorEl(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleToProfile = () => {
    props.history.push('/profile');
    setAnchorEl(null);
  };

  return (
    <AppBar position="static" style={{ boxShadow: 'none' }}>
      <Toolbar>
        <Typography
          variant="h6"
          color="inherit"
          style={{ flex: 1, textDecoration: 'none' }}
          onClick={() => props.history.push('/')}
        >
          Saffron
        </Typography>

        {props.isLogin ? (
          <React.Fragment>
            <IconButton
              aria-owns={open ? 'menu-appbar' : undefined}
              aria-haspopup="true"
              onClick={handleMenu}
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
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleToProfile}>設定</MenuItem>
              <MenuItem onClick={handleOpenDialog}>ログアウト</MenuItem>
            </Menu>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <IconButton
              aria-owns={open ? 'menu-appbar' : undefined}
              aria-haspopup="true"
              onClick={handleMenu}
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
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClickLogin}>ログイン</MenuItem>
              <MenuItem onClick={handleClickSignup}>新規登録</MenuItem>
            </Menu>
          </React.Fragment>
        )}
        <Dialog fullWidth={true} maxWidth="xs" open={showDialog} onClose={handleCloseDialog}>
          <DialogTitle>ログアウトしてもよろしいですか？</DialogTitle>
          <DialogActions>
            <Button color="secondary" onClick={handleLogout}>
              はい
            </Button>
            <Button onClick={handleCloseDialog}>いいえ</Button>
          </DialogActions>
        </Dialog>
      </Toolbar>
    </AppBar>
  );
};

interface StateFromProps {
  isLogin: boolean;
}

interface DispatchFromProps {
  setLoginState: (isLogin: boolean) => void;
}

function mapStateToProps(state: PetalsStore): StateFromProps {
  return {
    isLogin: state.auth.isLogin,
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
