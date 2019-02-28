import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Checkbox from '@material-ui/core/Checkbox';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import * as React from 'react';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';

import { Field, InjectedFormProps, reduxForm, SubmissionError, WrappedFieldProps } from 'redux-form';
import * as AppErr from '../../api/AppErrors';
import * as usersApi from '../../api/users';
import { validatePasswordWithErrMsg, validateUsernameWithErrMsg } from '../../lib/validations';

interface FormParams {
  username: string;
  password: string;
  confirmPassword: string;
  agreeWithTermsOfService: any;
}

interface SignupProps extends RouteComponentProps, InjectedFormProps {}

interface SignupState {
  showDialog: boolean;
}

class Signup extends React.Component<SignupProps, SignupState> {
  constructor(props: SignupProps) {
    super(props);
    this.state = {
      showDialog: false,
    };
  }

  public renderTextField = (props: WrappedFieldProps & { label: string; type: string }) => (
    <FormControl fullWidth={true} error={Boolean(props.meta.error)} style={{ padding: '10px 0px' }}>
      <TextField label={props.label} margin="normal" autoComplete="off" type={props.type} {...props.input} />
      {props.meta.error ? <FormHelperText>{props.meta.error}</FormHelperText> : null}
    </FormControl>
  );

  public renderCheckboxField = (props: WrappedFieldProps & { label: string }) => (
    <FormControl fullWidth={true} error={Boolean(props.meta.error)} style={{ padding: '10px 0px' }}>
      <FormControlLabel
        control={<Checkbox value={props.label} checked={props.input.checked} onChange={props.input.onChange} />}
        label={
          <React.Fragment>
            <Link to="/termsofservice">利用規約</Link>に同意する
          </React.Fragment>
        }
      />
      {props.meta.error ? <FormHelperText id="signup-agreed-error-text">{props.meta.error}</FormHelperText> : null}
    </FormControl>
  );

  public handleSubmit = (values: FormParams) => {
    const usernameErrMsg = validateUsernameWithErrMsg(values.username);
    const passwordErrMsg = validatePasswordWithErrMsg(values.password);
    const confirmPasswordErrMsg = values.password === values.confirmPassword ? '' : 'パスワードが一致しません';
    const agreeWithTermsOfServiceErrMsg = values.agreeWithTermsOfService ? '' : '利用規約への同意は必須です';

    if (usernameErrMsg || passwordErrMsg || confirmPasswordErrMsg) {
      throw new SubmissionError({
        username: usernameErrMsg,
        password: passwordErrMsg,
        confirmPassword: confirmPasswordErrMsg,
        agreeWithTermsOfService: agreeWithTermsOfServiceErrMsg,
        _error: '入力項目に誤りがあります',
      });
    }

    return usersApi
      .create(values.username, values.password, '')
      .then(() => {
        this.setState({ showDialog: true });
      })
      .catch(e => {
        switch (e.constructor) {
          case AppErr.BadRequestError:
            throw new SubmissionError({ _error: 'アカウント作成に失敗しました' });
          default:
            throw new SubmissionError({ _error: '予期せぬエラーが発生しました' });
        }
      });
  };

  public handleCloseDialog = () => {
    this.props.history.push('/');
  };

  public render(): React.ReactNode {
    const { error, handleSubmit } = this.props;

    return (
      <Grid container={true} justify="center">
        <Grid item={true} xs={10} sm={8} md={7} lg={6} xl={5}>
          <Card style={{ marginTop: 30, padding: 20 }}>
            <CardContent style={{ textAlign: 'center' }}>
              <form onSubmit={handleSubmit(this.handleSubmit)} autoComplete="off">
                <Field name="username" label="大学ユーザー名" type="text" component={this.renderTextField} />
                <Field name="password" label="パスワード" type="password" component={this.renderTextField} />
                <Field
                  name="confirmPassword"
                  label="パスワード再入力"
                  type="password"
                  component={this.renderTextField}
                />
                <Field name="agreeWithTermsOfService" label="利用規約への同意" component={this.renderCheckboxField} />

                <FormControl fullWidth={true} style={{ padding: '10px 0px' }} error={Boolean(error)}>
                  <Button
                    style={{
                      marginTop: 16,
                      marginBottom: 8,
                      boxShadow: 'none',
                    }}
                    variant="contained"
                    color="primary"
                    type="submit"
                  >
                    Sign up
                  </Button>
                  {error ? <FormHelperText>{error}</FormHelperText> : null}
                </FormControl>
              </form>
              <Dialog fullWidth={true} maxWidth="xs" open={this.state.showDialog} onClose={this.handleCloseDialog}>
                <DialogTitle>メールを送信しました</DialogTitle>
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
  form: 'signupForm',
})(withRouter(Signup));
