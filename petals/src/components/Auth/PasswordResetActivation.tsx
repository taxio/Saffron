import { Button, Card, CardContent, FormControl, FormHelperText, Grid, Input, InputLabel } from '@material-ui/core';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';

import { PasswordValidationError, validatePassword } from '../../api/auth';
import { confirmNewPassword } from '../../api/password';

interface PasswordResetMatchParams {
  uid: string;
  token: string;
}

interface PasswordResetProps extends RouteComponentProps<PasswordResetMatchParams> {}

interface PasswordResetState {
  newPassword: string;
  newPasswordErrMsg: string;
  confirmNewPassword: string;
  confirmNewPasswordErrMsg: string;
  passwordResetErrMsg: string;
  params: PasswordResetMatchParams;
}

class PasswordResetActivation extends React.Component<PasswordResetProps, PasswordResetState> {
  constructor(props: PasswordResetProps) {
    super(props);

    let params: PasswordResetMatchParams = { uid: '', token: '' };
    try {
      params = this.parseHashData(this.props.location.hash);
    } catch (e) {
      this.props.history.push('/');
    }

    this.state = {
      newPassword: '',
      newPasswordErrMsg: '',
      confirmNewPassword: '',
      confirmNewPasswordErrMsg: '',
      passwordResetErrMsg: '',
      params,
    };

    this.handleChangeNewPassword = this.handleChangeNewPassword.bind(this);
    this.handleChangeConfirmNewPassword = this.handleChangeConfirmNewPassword.bind(this);
    this.handleSendPasswordReset = this.handleSendPasswordReset.bind(this);
  }

  public parseHashData(hashStr: string): PasswordResetMatchParams {
    const splited = hashStr.split('/');
    if (splited.length !== 3) {
      throw new Error('not correct location.hash');
    }

    return {
      uid: splited[1],
      token: splited[2],
    };
  }

  public handleChangeNewPassword(e: React.ChangeEvent<HTMLInputElement>) {
    const newPassword = e.target.value;
    let newPasswordErrMsg = '';

    const ret = validatePassword(newPassword);
    switch (ret) {
      case PasswordValidationError.NONE:
        break;
      case PasswordValidationError.LENGTH:
        newPasswordErrMsg = 'パスワードは8文字以上にしてください';
        break;
      case PasswordValidationError.UNAVAILABLE:
        newPasswordErrMsg = '使用不可能な文字が含まれています';
        break;
    }

    this.setState({ newPassword, newPasswordErrMsg });
  }

  public handleChangeConfirmNewPassword(e: React.ChangeEvent<HTMLInputElement>) {
    const _confirmNewPassword = e.target.value;
    let confirmNewPasswordErrMsg = '';

    if (_confirmNewPassword !== this.state.newPassword) {
      confirmNewPasswordErrMsg = 'パスワードが一致しません';
    }

    this.setState({ confirmNewPassword: _confirmNewPassword, confirmNewPasswordErrMsg });
  }

  public handleSendPasswordReset() {
    if (
      this.state.newPasswordErrMsg ||
      this.state.confirmNewPasswordErrMsg ||
      !this.state.newPassword ||
      !this.state.confirmNewPassword
    ) {
      return;
    }

    confirmNewPassword(this.state.params.uid, this.state.params.token, this.state.newPassword).then(success => {
      if (!success) {
        this.setState({ passwordResetErrMsg: 'パスワード再設定に失敗しました' });
        return;
      }
      alert('パスワードを再設定しました');
      this.props.history.push('/');
    });
  }

  public render(): React.ReactNode {
    const formControlStyle = { padding: '10px 0px' };
    return (
      <Grid container={true} justify="center">
        <Grid item={true} xs={10} sm={8} md={7} lg={6} xl={5}>
          <Card style={{ marginTop: 30, padding: 20 }}>
            <CardContent style={{ textAlign: 'center' }}>
              <form>
                <FormControl fullWidth={true} error={Boolean(this.state.newPasswordErrMsg)} style={formControlStyle}>
                  <InputLabel htmlFor="new-password">新しいパスワード</InputLabel>
                  <Input
                    id="new-password"
                    type="password"
                    value={this.state.newPassword}
                    onChange={this.handleChangeNewPassword}
                    autoComplete="off"
                  />
                  {this.state.newPasswordErrMsg ? (
                    <FormHelperText id="new-password-error-text">{this.state.newPasswordErrMsg}</FormHelperText>
                  ) : null}
                </FormControl>

                <FormControl
                  fullWidth={true}
                  error={Boolean(this.state.confirmNewPasswordErrMsg)}
                  style={formControlStyle}
                >
                  <InputLabel htmlFor="confirm-new-password">新しいパスワード再入力</InputLabel>
                  <Input
                    id="confirm-new-password"
                    type="password"
                    value={this.state.confirmNewPassword}
                    onChange={this.handleChangeConfirmNewPassword}
                    autoComplete="off"
                  />
                  {this.state.confirmNewPasswordErrMsg ? (
                    <FormHelperText id="confirm-new-password-error-text">
                      {this.state.confirmNewPasswordErrMsg}
                    </FormHelperText>
                  ) : null}
                </FormControl>

                <FormControl fullWidth={true} style={formControlStyle} error={Boolean(this.state.passwordResetErrMsg)}>
                  {this.state.passwordResetErrMsg ? (
                    <FormHelperText>{this.state.passwordResetErrMsg}</FormHelperText>
                  ) : null}
                  <Button
                    style={{
                      marginTop: 16,
                      marginBottom: 8,
                      boxShadow: 'none',
                    }}
                    variant="contained"
                    color="primary"
                    onClick={this.handleSendPasswordReset}
                  >
                    送信
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

export default PasswordResetActivation;
