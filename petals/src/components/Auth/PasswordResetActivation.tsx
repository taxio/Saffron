import { Button, Card, CardContent, FormControl, FormHelperText, Grid, Input, InputLabel } from '@material-ui/core';
import * as React from 'react';

interface PasswordResetProps {}

interface PasswordResetState {
  newPassword: string;
  newPasswordErrMsg: string;
  confirmNewPassword: string;
  confirmNewPasswordErrMsg: string;
  passwordResetErrMsg: string;
}

class PasswordResetActivation extends React.Component<PasswordResetProps, PasswordResetState> {
  constructor(props: PasswordResetProps) {
    super(props);
    this.state = {
      newPassword: '',
      newPasswordErrMsg: '',
      confirmNewPassword: '',
      confirmNewPasswordErrMsg: '',
      passwordResetErrMsg: '',
    };

    this.handleChangeNewPassword = this.handleChangeNewPassword.bind(this);
    this.handleChangeConfirmNewPassword = this.handleChangeConfirmNewPassword.bind(this);
    this.handleSendPasswordReset = this.handleSendPasswordReset.bind(this);
  }

  public handleChangeNewPassword(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ newPassword: e.target.value });
  }

  public handleChangeConfirmNewPassword(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ confirmNewPassword: e.target.value });
  }

  public handleSendPasswordReset() {
    console.log('password reset');
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
