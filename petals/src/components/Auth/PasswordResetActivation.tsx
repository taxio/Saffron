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
  TextField,
} from '@material-ui/core';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { Field, InjectedFormProps, reduxForm, SubmissionError, WrappedFieldProps } from 'redux-form';

import { confirmNewPassword } from '../../api/password';
import { validatePasswordWithErrMsg } from '../../lib/validations';

interface FormParams {
  newPassword: string;
  confirmNewPassword: string;
}

interface PasswordResetMatchParams {
  uid: string;
  token: string;
}

interface PasswordResetProps extends RouteComponentProps<PasswordResetMatchParams>, InjectedFormProps {}

interface PasswordResetState {
  params: PasswordResetMatchParams;
  showDialog: boolean;
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
      params,
      showDialog: false,
    };
  }

  public parseHashData = (hashStr: string): PasswordResetMatchParams => {
    const splited = hashStr.split('/');
    if (splited.length !== 3) {
      throw new Error('not correct location.hash');
    }

    return {
      uid: splited[1],
      token: splited[2],
    };
  };

  public handleCloseDialog = () => {
    this.props.history.push('/');
  };

  public renderField = (props: WrappedFieldProps & { label: string; type: string }) => (
    <FormControl fullWidth={true} error={Boolean(props.meta.error)} style={{ padding: '10px 0px' }}>
      <TextField label={props.label} margin="normal" type={props.type} {...props.input} />
      {props.meta.error ? <FormHelperText>{props.meta.error}</FormHelperText> : null}
    </FormControl>
  );

  public handleSubmit = (values: FormParams) => {
    const newPasswordErrMsg = validatePasswordWithErrMsg(values.newPassword);
    const confirmNewPasswordErrMsg = values.newPassword === values.confirmNewPassword ? '' : 'パスワードが一致しません';
    if (newPasswordErrMsg || confirmNewPasswordErrMsg) {
      throw new SubmissionError({
        newPassword: newPasswordErrMsg,
        confirmNewPassword: confirmNewPasswordErrMsg,
        _error: '入力項目に誤りがあります',
      });
    }
    return confirmNewPassword(this.state.params.uid, this.state.params.token, values.newPassword).then(success => {
      if (!success) {
        throw new SubmissionError({ _error: 'パスワードの再設定に失敗しました' });
      }
      this.setState({ showDialog: true });
    });
  };

  public render(): React.ReactNode {
    const { error, handleSubmit } = this.props;

    return (
      <Grid container={true} justify="center">
        <Grid item={true} xs={10} sm={8} md={7} lg={6} xl={5}>
          <Card style={{ marginTop: 30, padding: 20 }}>
            <CardContent style={{ textAlign: 'center' }}>
              <form onSubmit={handleSubmit(this.handleSubmit)}>
                <Field name="newPassword" label="新しいパスワード" type="password" component={this.renderField} />
                <Field
                  name="confirmNewPassword"
                  label="新しいパスワードを再入力"
                  type="password"
                  component={this.renderField}
                />

                <FormControl fullWidth={true} style={{ padding: '10px 0px' }} error={Boolean(error)}>
                  <Button
                    type="submit"
                    style={{
                      marginTop: 16,
                      marginBottom: 8,
                      boxShadow: 'none',
                    }}
                    variant="contained"
                    color="primary"
                  >
                    送信
                  </Button>
                  {error ? <FormHelperText>{error}</FormHelperText> : null}
                </FormControl>
              </form>
              <Dialog fullWidth={true} maxWidth="xs" open={this.state.showDialog} onClose={this.handleCloseDialog}>
                <DialogTitle>パスワードを再設定しました</DialogTitle>
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

export default reduxForm({
  form: 'passwordResetActivationForm',
})(PasswordResetActivation);
