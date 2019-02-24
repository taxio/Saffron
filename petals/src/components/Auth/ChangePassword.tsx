import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Field, InjectedFormProps, reduxForm, SubmissionError, WrappedFieldProps } from 'redux-form';
import * as passwordApi from '../../api/password';
import { validatePasswordWithErrMsg } from '../../lib/validations';

interface FormParams {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

interface ChangePasswordProps extends RouteComponentProps, InjectedFormProps {}

interface ChangePasswordState {
  showDialog: boolean;
}

class ChangePassword extends React.Component<ChangePasswordProps, ChangePasswordState> {
  constructor(props: ChangePasswordProps) {
    super(props);

    this.state = {
      showDialog: false,
    };
  }

  public handleSubmit = (values: FormParams) => {
    const currentPasswordErrMsg = validatePasswordWithErrMsg(values.currentPassword);
    const newPasswordErrMsg = validatePasswordWithErrMsg(values.newPassword);
    const confirmNewPasswordErrMsg = values.newPassword === values.confirmNewPassword ? '' : 'パスワードが一致しません';
    if (currentPasswordErrMsg || newPasswordErrMsg || confirmNewPasswordErrMsg) {
      throw new SubmissionError({
        currentPassword: currentPasswordErrMsg,
        newPassword: newPasswordErrMsg,
        confirmNewPassword: confirmNewPasswordErrMsg,
        _error: '入力項目に誤りがあります',
      });
    }
    return passwordApi
      .change(values.currentPassword, values.newPassword)
      .then(() => {
        this.setState({ showDialog: true });
      })
      .catch(() => {
        throw new SubmissionError({ _error: 'パスワードの変更に失敗しました' });
      });
  };

  public handleCloseDialog = () => {
    this.props.history.push('/profile');
  };

  public renderField = (props: WrappedFieldProps & { label: string; type: string }) => (
    <FormControl fullWidth={true} error={Boolean(props.meta.error)} style={{ padding: '10px 0px' }}>
      <TextField label={props.label} margin="normal" type={props.type} {...props.input} />
      {props.meta.error ? <FormHelperText>{props.meta.error}</FormHelperText> : null}
    </FormControl>
  );

  public render(): React.ReactNode {
    const { error, handleSubmit } = this.props;

    return (
      <Grid container={true} justify="center">
        <Grid item={true} xs={10} sm={8} md={7} lg={6} xl={5}>
          <Card style={{ marginTop: 30, padding: 20 }}>
            <CardContent style={{ textAlign: 'center' }}>
              <form onSubmit={handleSubmit(this.handleSubmit)} autoComplete="off">
                <Field name="currentPassword" label="現在のパスワード" type="password" component={this.renderField} />

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
                    color="primary"
                    variant="contained"
                    style={{
                      marginTop: 16,
                      marginBottom: 8,
                      boxShadow: 'none',
                    }}
                  >
                    パスワード変更
                  </Button>
                  {error ? <FormHelperText>{error}</FormHelperText> : null}
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

export default reduxForm({
  form: 'changePasswordForm',
})(withRouter(ChangePassword));
