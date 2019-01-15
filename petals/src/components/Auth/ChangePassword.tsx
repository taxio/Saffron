import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogTitle,
  FormControl,
  FormHelperText,
  Grid,
  Input,
  InputLabel,
} from '@material-ui/core';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { PasswordValidationError, validatePassword } from '../../api/auth';
import { changePassword } from '../../api/password';

interface ChangePasswordProps extends RouteComponentProps {}

interface ChangePasswordState {
  currentPassword: string;
  newPassword: string;
  newPasswordErrMsg: string;
  confirmNewPassword: string;
  confirmNewPasswordErrMsg: string;
  sendErrMsg: string;
  showDialog: boolean;
}

class ChangePassword extends React.Component<ChangePasswordProps, ChangePasswordState> {
  constructor(props: ChangePasswordProps) {
    super(props);

    this.state = {
      currentPassword: '',
      newPassword: '',
      newPasswordErrMsg: '',
      confirmNewPassword: '',
      confirmNewPasswordErrMsg: '',
      sendErrMsg: '',
      showDialog: false,
    };

    this.handleChangeCurrentPassword = this.handleChangeCurrentPassword.bind(this);
    this.handleChangeNewPassword = this.handleChangeNewPassword.bind(this);
    this.handleChangeConfirmNewPassword = this.handleChangeConfirmNewPassword.bind(this);
    this.handleSend = this.handleSend.bind(this);
    this.handleCloseDialog = this.handleCloseDialog.bind(this);
  }

  public handleChangeCurrentPassword(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ currentPassword: e.target.value });
  }

  public handleChangeNewPassword(e: React.ChangeEvent<HTMLInputElement>) {
    const newPassword = e.target.value;
    let newPasswordErrMsg = '';

    switch (validatePassword(newPassword)) {
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
    const confirmNewPassword = e.target.value;
    let confirmNewPasswordErrMsg = '';

    if (confirmNewPassword !== this.state.newPassword) {
      confirmNewPasswordErrMsg = 'パスワードが一致しません';
    }

    this.setState({ confirmNewPassword, confirmNewPasswordErrMsg });
  }

  public handleSend() {
    changePassword(this.state.currentPassword, this.state.newPassword).then(success => {
      if (!success) {
        this.setState({ sendErrMsg: 'パスワードの変更に失敗しました' });
        return;
      }
      this.setState({ showDialog: true });
    });
  }

  public handleCloseDialog() {
    this.props.history.push('/profile');
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
                  <InputLabel htmlFor="new-password">現在のパスワード</InputLabel>
                  <Input
                    id="current-password"
                    type="password"
                    value={this.state.currentPassword}
                    onChange={this.handleChangeCurrentPassword}
                    autoComplete="off"
                  />
                </FormControl>

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
                  <InputLabel htmlFor="confirm-new-password">新しいパスワードを再入力</InputLabel>
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

                <FormControl fullWidth={true} style={formControlStyle} error={Boolean(this.state.sendErrMsg)}>
                  {this.state.sendErrMsg ? <FormHelperText>{this.state.sendErrMsg}</FormHelperText> : null}
                  <Button
                    style={{
                      marginTop: 16,
                      marginBottom: 8,
                      boxShadow: 'none',
                    }}
                    variant="contained"
                    color="primary"
                    onClick={this.handleSend}
                  >
                    パスワード変更
                  </Button>
                </FormControl>
              </form>
              <Dialog fullWidth={true} maxWidth="xs" open={this.state.showDialog} onClose={this.handleCloseDialog}>
                <DialogTitle>パスワードを変更しました</DialogTitle>
                <DialogActions>
                  <Button onClick={this.handleCloseDialog}>閉じる</Button>
                </DialogActions>
              </Dialog>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }
}

export default withRouter(ChangePassword);
