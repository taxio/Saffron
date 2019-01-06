import {
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  Input,
  InputLabel,
} from '@material-ui/core';
import * as React from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';

import { PasswordValidationError, validatePassword, validateUsername } from '../api/auth';
import { createUser } from '../api/users';
import PopUp from './PopUp';

interface SignupProps extends RouteComponentProps {}

interface SignupState {
  username: string;
  usernameErr: boolean;
  password: string;
  passwordErrMsg: string;
  confirmPassword: string;
  confirmPasswordErrMsg: string;
  agreedWithTermsOfService: boolean;
  agreedWithTermsOfServiceErr: boolean;
  signupErrMsg: string;
  showPopUp: boolean;
}

class Signup extends React.Component<SignupProps, SignupState> {
  constructor(props: SignupProps) {
    super(props);
    this.state = {
      username: '',
      usernameErr: false,
      password: '',
      passwordErrMsg: '',
      confirmPassword: '',
      confirmPasswordErrMsg: '',
      agreedWithTermsOfService: false,
      agreedWithTermsOfServiceErr: false,
      signupErrMsg: '',
      showPopUp: false,
    };

    this.handleChangeUsername = this.handleChangeUsername.bind(this);
    this.handleChangePassword = this.handleChangePassword.bind(this);
    this.handleChangeConfirmPassword = this.handleChangeConfirmPassword.bind(this);
    this.handleSignup = this.handleSignup.bind(this);
    this.handleClosePopUp = this.handleClosePopUp.bind(this);
  }

  public handleChangeUsername(e: React.ChangeEvent<HTMLInputElement>) {
    const username = e.target.value;
    const usernameErr = !validateUsername(username);
    this.setState({ username, usernameErr });
  }

  public handleChangePassword(e: React.ChangeEvent<HTMLInputElement>) {
    const password = e.target.value;
    let passwordErrMsg = '';

    const ret = validatePassword(password);
    switch (ret) {
      case PasswordValidationError.NONE:
        break;
      case PasswordValidationError.LENGTH:
        passwordErrMsg = 'パスワードは8文字以上にしてください';
        break;
      case PasswordValidationError.UNAVAILABLE:
        passwordErrMsg = '使用不可能な文字が含まれています';
        break;
    }

    this.setState({ password, passwordErrMsg });
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
    if (
      this.state.usernameErr ||
      this.state.confirmPasswordErrMsg ||
      !this.state.username ||
      !this.state.password ||
      !this.state.confirmPassword
    ) {
      this.setState({ signupErrMsg: '入力情報に誤りがあります' });
      return;
    }
    if (!this.state.agreedWithTermsOfService) {
      this.setState({ agreedWithTermsOfServiceErr: true });
      return;
    }

    createUser(this.state.username, this.state.password).then(success => {
      if (!success) {
        this.setState({ signupErrMsg: 'アカウント作成に失敗しました' });
        return;
      }
      this.setState({ showPopUp: true });
    });
  }

  public handleClosePopUp() {
    this.props.history.push('/');
  }

  public render(): React.ReactNode {
    const formControlStyle = { padding: '10px 0px' };
    const rootEl = document.getElementById('root');

    return (
      <Grid container={true} justify="center">
        <Grid item={true} xs={10} sm={8} md={7} lg={6} xl={5}>
          <Card style={{ marginTop: 30, padding: 20 }}>
            <CardContent style={{ textAlign: 'center' }}>
              <form>
                <FormControl fullWidth={true} style={formControlStyle} error={this.state.usernameErr}>
                  <InputLabel htmlFor="signup-email">ユーザー名</InputLabel>
                  <Input id="signup-email" value={this.state.username} onChange={this.handleChangeUsername} />
                  <FormHelperText id="signup-email-text">
                    bまたはm,dで始まる8文字の大学ユーザー名を入力してください
                  </FormHelperText>
                </FormControl>

                <FormControl fullWidth={true} error={Boolean(this.state.passwordErrMsg)} style={formControlStyle}>
                  <InputLabel htmlFor="signup-password">パスワード</InputLabel>
                  <Input
                    id="signup-password"
                    type="password"
                    value={this.state.password}
                    onChange={this.handleChangePassword}
                    autoComplete="off"
                  />
                  {this.state.passwordErrMsg ? (
                    <FormHelperText id="signup-confirm-password-error-text">{this.state.passwordErrMsg}</FormHelperText>
                  ) : null}
                </FormControl>

                <FormControl
                  fullWidth={true}
                  error={Boolean(this.state.confirmPasswordErrMsg)}
                  style={formControlStyle}
                >
                  <InputLabel htmlFor="signup-confirm-password">パスワード再入力</InputLabel>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    value={this.state.confirmPassword}
                    onChange={this.handleChangeConfirmPassword}
                    autoComplete="off"
                  />
                  {this.state.confirmPasswordErrMsg ? (
                    <FormHelperText id="signup-confirm-password-error-text">
                      {this.state.confirmPasswordErrMsg}
                    </FormHelperText>
                  ) : null}
                </FormControl>

                <FormControl fullWidth={true} error={this.state.agreedWithTermsOfServiceErr} style={formControlStyle}>
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
                    label={
                      <React.Fragment>
                        <Link to="/auth/termsofservice">利用規約</Link>に同意する
                      </React.Fragment>
                    }
                  />
                  {this.state.agreedWithTermsOfServiceErr ? (
                    <FormHelperText id="signup-agreed-error-text">利用規約に同意してください</FormHelperText>
                  ) : null}
                </FormControl>

                <FormControl fullWidth={true} style={formControlStyle} error={Boolean(this.state.signupErrMsg)}>
                  {this.state.signupErrMsg ? <FormHelperText>{this.state.signupErrMsg}</FormHelperText> : null}
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
              {this.state.showPopUp && rootEl ? (
                <PopUp onClose={this.handleClosePopUp} msg={'メールを送信しました'} rootEl={rootEl} />
              ) : null}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }
}

export default withRouter(Signup);
