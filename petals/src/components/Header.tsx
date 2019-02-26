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
import MoreHoriz from '@material-ui/icons/MoreHoriz';

import { createStyles, withStyles, WithStyles } from '@material-ui/core/styles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';

import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Dispatch } from 'redux';

import { AuthAction, setLoginState } from '../actions/auth';
import { UserAction, userFetchRequest } from '../actions/user';
import { logout } from '../lib/auth';
import * as model from '../model';
import { PetalsStore } from '../store';

const headerStyles = (theme: Theme) => {
  return createStyles({
    grow: {
      flexGrow: 1,
    },
    sectionDesktop: {
      display: 'none',
      [theme.breakpoints.up('md')]: {
        display: 'flex',
      },
    },
    sectionMobile: {
      display: 'flex',
      [theme.breakpoints.up('md')]: {
        display: 'none',
      },
    },
    menuButton: {
      margin: '0 8px',
    },
  });
};

interface HeaderProps extends RouteComponentProps<any>, WithStyles<typeof headerStyles> {
  isLogin: boolean;
  setLoginState: (isLogin: boolean) => void;
  fetchUserInfo: () => void;
  user: model.User | null;
  isFetching: boolean;
  fetchError: Error | null;
}

const Header: React.FC<HeaderProps> = props => {
  const [showDialog, setShowDialog] = React.useState<boolean>(false);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  React.useEffect(() => {
    if (props.isLogin) {
      props.fetchUserInfo();
    }
  }, [props.isLogin]);

  const getCourses = (): model.Course[] => {
    if (!props.user) {
      return [];
    }

    return props.user.courses;
  };

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

  const handleOpenMenu = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const toLogin = () => {
    props.history.push('/login');
    setAnchorEl(null);
  };

  const toSignUp = () => {
    props.history.push('/signup');
    setAnchorEl(null);
  };

  const toSettings = () => {
    props.history.push('/settings');
    setAnchorEl(null);
  };

  const toCourse = (coursePk: number) => {
    props.history.push(`/courses/${coursePk}`);
    setAnchorEl(null);
  };

  const renderMobileMenu = () => (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={Boolean(anchorEl)}
      onClose={handleCloseMenu}
    >
      <MenuItem key={0} onClick={toLogin}>
        ログイン
      </MenuItem>
      <MenuItem key={1} onClick={toSignUp}>
        新規登録
      </MenuItem>
    </Menu>
  );

  const renderAuthedMobileMenu = () => (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={Boolean(anchorEl)}
      onClose={handleCloseMenu}
    >
      {getCourses().length !== 0 ? (
        getCourses().map((course: model.Course, idx: number) => (
          <MenuItem key={idx} onClick={() => toCourse(course.pk)}>
            {course.name}
          </MenuItem>
        ))
      ) : (
        <MenuItem onClick={() => props.history.push('/courses')}>設定</MenuItem>
      )}
      <MenuItem onClick={toSettings}>設定</MenuItem>
      <MenuItem onClick={handleLogout}>ログアウト</MenuItem>
    </Menu>
  );

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

        <div className={props.classes.grow} />
        <div className={props.classes.sectionDesktop}>
          {props.isLogin ? (
            <React.Fragment>
              {getCourses().length !== 0 ? (
                getCourses().map((course: model.Course, idx: number) => (
                  <Button
                    key={idx}
                    color="inherit"
                    className={props.classes.menuButton}
                    onClick={() => toCourse(course.pk)}
                  >
                    {course.name}
                  </Button>
                ))
              ) : (
                <Button
                  color="inherit"
                  className={props.classes.menuButton}
                  onClick={() => props.history.push('/courses')}
                >
                  課程一覧へ
                </Button>
              )}
              <Button color="inherit" className={props.classes.menuButton} onClick={toSettings}>
                設定
              </Button>
              <Button color="inherit" className={props.classes.menuButton} onClick={handleOpenDialog}>
                ログアウト
              </Button>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Button color="inherit" className={props.classes.menuButton} onClick={toLogin}>
                ログイン
              </Button>
              <Button color="inherit" className={props.classes.menuButton} onClick={toSignUp}>
                新規登録
              </Button>
            </React.Fragment>
          )}
        </div>
        <div className={props.classes.sectionMobile}>
          <IconButton aria-haspopup="true" onClick={handleOpenMenu} color="inherit">
            <MoreHoriz />
          </IconButton>
        </div>
        {props.isLogin ? renderAuthedMobileMenu() : renderMobileMenu()}

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
  user: model.User | null;
  isFetching: boolean;
  fetchError: Error | null;
}

interface DispatchFromProps {
  setLoginState: (isLogin: boolean) => void;
  fetchUserInfo: () => void;
}

function mapStateToProps(state: PetalsStore): StateFromProps {
  return {
    isLogin: state.auth.isLogin,
    user: state.user.user,
    isFetching: state.user.isFetching,
    fetchError: state.user.error,
  };
}

function mapDispatchToProps(dispatch: Dispatch<AuthAction | UserAction>): DispatchFromProps {
  return {
    setLoginState: (isLogin: boolean) => {
      dispatch(setLoginState(isLogin));
    },
    fetchUserInfo: () => {
      dispatch(userFetchRequest());
    },
  };
}

export default withStyles(headerStyles)(
  withRouter(
    connect<StateFromProps, DispatchFromProps, {}>(
      mapStateToProps,
      mapDispatchToProps
    )(Header)
  )
);
