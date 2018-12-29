import { Button, Card, CardContent, FormControl, Grid, TextField } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { AuthAction, login } from '../actions/auth';
import { Auth } from '../store/AuthState';

import * as H from 'history';

interface LoginProps {
  login: (usernema: string, password: string) => void;
  history: H.History;
}

interface LoginState {
  username: string;
  password: string;
}

class Login extends React.Component<LoginProps, LoginState> {
  constructor(props: LoginProps) {
    super(props);
    this.state = {
      username: '',
      password: '',
    };

    this.handleLogin = this.handleLogin.bind(this);
  }

  public handleLogin() {
    this.props.login(this.state.username, this.state.password);
    this.props.history.goBack();
  }

  public render(): React.ReactNode {
    return (
      <Grid container={true} justify="center">
        <Grid item={true} xs={10} sm={8} md={7} lg={6} xl={5}>
          <Card style={{ marginTop: 30, padding: 20 }}>
            <CardContent style={{ textAlign: 'center' }}>
              <FormControl style={{ width: '100%' }}>
                <TextField
                  required={true}
                  label="Username"
                  margin="normal"
                  onChange={e => this.setState({ username: e.target.value })}
                />
                <TextField
                  required={true}
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  margin="normal"
                  onChange={e => this.setState({ password: e.target.value })}
                />
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }
}

interface StateFromProps {}

interface DispatchFromProps {
  login: (username: string, password: string) => void;
}

function mapStateToProps(state: Auth): StateFromProps {
  return {};
}

function mapDispatchToProps(dispatch: Dispatch<AuthAction>): DispatchFromProps {
  return {
    login: (username: string, password: string) => {
      dispatch(login(username, password));
    },
  };
}

export default connect<StateFromProps, DispatchFromProps, {}>(
  mapStateToProps,
  mapDispatchToProps
)(Login);
