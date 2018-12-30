import { Button, Card, CardContent, Checkbox, FormControl, FormControlLabel, Grid, TextField } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { AuthAction, signup } from '../actions/auth';
import { Auth } from '../store/AuthState';

import { PasswordValidationError, validatePassword } from '../lib/auth';

interface SignupProps {
  signup: (username: string, password: string) => void;
}

interface SignupState {
  username: string;
  password: string;
  passwordErrMsg: string;
  confirmPassword: string;
  confirmPasswordErrMsg: string;
  agreedWithTermsOfService: boolean;
}

class Signup extends React.Component<SignupProps, SignupState> {
  constructor(props: SignupProps) {
    super(props);
    this.state = {
      username: '',
      password: '',
      passwordErrMsg: '',
      confirmPassword: '',
      confirmPasswordErrMsg: '',
      agreedWithTermsOfService: false,
    };

    this.handleChangePassword = this.handleChangePassword.bind(this);
    this.handleChangeConfirmPassword = this.handleChangeConfirmPassword.bind(this);
    this.handleSignup = this.handleSignup.bind(this);
  }

  public handleChangePassword(e: React.ChangeEvent<HTMLInputElement>) {
    const password = e.target.value;
    this.setState({ password });

    const ret = validatePassword(password);
    switch (ret) {
      case PasswordValidationError.NONE:
        return;
      case PasswordValidationError.LENGTH:
        console.log('パスワードは8文字以上にしてください');
        return;
      case PasswordValidationError.UNAVAILABLE:
        console.log('使用不可能な文字が含まれています');
        return;
    }
  }

  public handleChangeConfirmPassword(e: React.ChangeEvent<HTMLInputElement>) {
    const confirmPassword = e.target.value;
    let confirmPasswordErrMsg = '';

    if (confirmPassword !== this.state.password) {
      confirmPasswordErrMsg = 'パスワードが一致しません';
    }

    this.setState({ confirmPassword, confirmPasswordErrMsg });
  }

  public handleSignup() {
    this.props.signup(this.state.username, this.state.password);
  }

  public render(): React.ReactNode {
    return (
      <Grid container={true} justify="center">
        <Grid item={true} xs={10} sm={8} md={7} lg={6} xl={5}>
          <Card style={{ marginTop: 30, padding: 20 }}>
            <CardContent style={{ textAlign: 'center' }}>
              <form>
                <FormControl style={{ width: '100%' }}>
                  <TextField
                    autoComplete="off"
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
                    onChange={this.handleChangePassword}
                  />
                  <TextField
                    required={true}
                    label="Confirm Password"
                    type="password"
                    autoComplete="current-password"
                    margin="normal"
                    onChange={this.handleChangeConfirmPassword}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={this.state.agreedWithTermsOfService}
                        onChange={e =>
                          this.setState({ agreedWithTermsOfService: !this.state.agreedWithTermsOfService })
                        }
                        value="AgreedWithTermsOfService"
                      />
                    }
                    label="利用規約に同意する"
                  />
                  <Button
                    style={{
                      marginTop: 16,
                      marginBottom: 8,
                      boxShadow: 'none',
                    }}
                    variant="contained"
                    color="primary"
                    onClick={this.handleSignup}
                  >
                    Sign up
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

interface StateFronProps {}

interface DispatchFromProps {
  signup: (username: string, password: string) => void;
}

function mapStateToProps(state: Auth): StateFronProps {
  return {};
}

function mapDispatchToProps(dispatch: Dispatch<AuthAction>): DispatchFromProps {
  return {
    signup: (username: string, password: string) => {
      dispatch(signup(username, password));
    },
  };
}

export default connect<StateFronProps, DispatchFromProps, {}>(
  mapStateToProps,
  mapDispatchToProps
)(Signup);
