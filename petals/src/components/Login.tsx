import { Button, Card, CardContent, FormControl, FormHelperText, Grid, Input, InputLabel } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { AuthAction, setLoginState } from '../actions/auth';
import { Auth } from '../store/AuthState';

import * as H from 'history';

interface LoginProps {
  setLoginState: (isLogin: boolean) => void;
  isLogin: boolean;
  history: H.History;
}

interface LoginState {
  username: string;
  password: string;
  loginErr: boolean;
}

class Login extends React.Component<LoginProps, LoginState> {
  constructor(props: LoginProps) {
    super(props);
    this.state = {
      username: '',
      password: '',
      loginErr: false,
    };

    this.handleLogin = this.handleLogin.bind(this);
  }

  public handleLogin() {
    // TODO: Login API
    this.props.setLoginState(true);
    this.props.history.goBack();
  }

  public render(): React.ReactNode {
    const formControlStyle = { padding: '10px 0px' };

    return (
      <Grid container={true} justify="center">
        <Grid item={true} xs={10} sm={8} md={7} lg={6} xl={5}>
          <Card style={{ marginTop: 30, padding: 20 }}>
            <CardContent style={{ textAlign: 'center' }}>
              <form>
                <FormControl fullWidth={true} style={formControlStyle}>
                  <InputLabel htmlFor="login-username">ユーザー名</InputLabel>
                  <Input
                    id="login-username"
                    value={this.state.username}
                    onChange={e => this.setState({ username: e.target.value })}
                  />
                </FormControl>

                <FormControl fullWidth={true} style={formControlStyle}>
                  <InputLabel htmlFor="login-password">パスワード</InputLabel>
                  <Input
                    id="login-password"
                    type="password"
                    autoComplete="off"
                    value={this.state.password}
                    onChange={e => this.setState({ password: e.target.value })}
                  />
                </FormControl>

                <FormControl fullWidth={true} style={formControlStyle} error={this.state.loginErr}>
                  {this.state.loginErr ? (
                    <FormHelperText id="login-error-text">ユーザー名かパスワードが間違っています</FormHelperText>
                  ) : null}
                  <Button
                    style={{
                      marginTop: 16,
                      marginBottom: 8,
                      boxShadow: 'none',
                    }}
                    variant="contained"
                    color="primary"
                    onClick={this.handleLogin}
                  >
                    Login
                  </Button>
                </FormControl>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
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

export default connect<StateFromProps, DispatchFromProps, {}>(
  mapStateToProps,
  mapDispatchToProps
)(Login);
