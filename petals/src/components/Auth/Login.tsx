import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link, RouteComponentProps, withRouter } from 'react-router-dom';
import { Dispatch } from 'redux';
import { Field, InjectedFormProps, reduxForm, SubmissionError, WrappedFieldProps } from 'redux-form';
import { AuthAction, setLoginState } from '../../actions/auth';
import * as AppErr from '../../api/AppErrors';
import * as auth from '../../lib/auth';
import { PetalsStore } from '../../store';

interface FormParams {
  username: string;
  password: string;
}

interface LoginProps extends RouteComponentProps<any>, InjectedFormProps {
  setLoginState: (isLogin: boolean) => void;
  isLogin: boolean;
}

interface LoginState {}

class Login extends React.Component<LoginProps, LoginState> {
  constructor(props: LoginProps) {
    super(props);
  }

  public componentWillMount() {
    if (this.props.isLogin) {
      this.props.history.push('/');
    }
  }

  public handleLogin = (values: FormParams) => {
    let errMsg = '';
    let usernameErrMsg = '';
    let passwordErrMsg = '';
    if (!values.username) {
      usernameErrMsg = 'ユーザー名を入力してください';
      errMsg = '未入力項目があります';
    }
    if (!values.password) {
      passwordErrMsg = 'パスワードを入力してください';
      errMsg = '未入力項目があります';
    }
    if (usernameErrMsg || passwordErrMsg) {
      throw new SubmissionError({ username: usernameErrMsg, password: passwordErrMsg, _error: errMsg });
    }

    return auth
      .login(values.username, values.password)
      .then(() => {
        this.props.setLoginState(true);
        this.props.history.push('/profile');
      })
      .catch(e => {
        switch (e.constructor) {
          case AppErr.BadRequestError:
            throw new SubmissionError({ _error: 'パスワードかユーザー名が間違っています' });
          default:
            throw new SubmissionError({ _error: '予期せぬエラーが発生しました' });
        }
      });
  };

  public renderField = (props: WrappedFieldProps & { label: string; type: string }) => (
    <FormControl fullWidth={true} error={Boolean(props.meta.error)} style={{ padding: '10px 0px' }}>
      <TextField label={props.label} margin="normal" autoComplete="off" type={props.type} {...props.input} />
      {props.meta.error ? <FormHelperText>{props.meta.error}</FormHelperText> : null}
    </FormControl>
  );

  public render(): React.ReactNode {
    const formControlStyle = { padding: '10px 0px' };
    const { error, handleSubmit } = this.props;

    return (
      <Grid container={true} justify="center">
        <Grid item={true} xs={10} sm={8} md={7} lg={6} xl={5}>
          <Card style={{ marginTop: 30, padding: 20 }}>
            <CardContent style={{ textAlign: 'center' }}>
              <form onSubmit={handleSubmit(this.handleLogin)} autoComplete="off">
                <Field name="username" label="ユーザー名" type="text" component={this.renderField} />

                <Field name="password" label="パスワード" type="password" component={this.renderField} />

                <FormControl fullWidth={true} error={Boolean(error)} style={formControlStyle}>
                  <Button
                    type="submit"
                    color="primary"
                    variant="contained"
                    style={{ marginTop: 16, marginBotton: 8, boxShadow: 'none' }}
                  >
                    Login
                  </Button>
                  {error ? <FormHelperText>{error}</FormHelperText> : null}
                </FormControl>
              </form>
              <Typography align="left">
                パスワードをお忘れの方は<Link to={'/auth/password/reset'}>こちら</Link>
              </Typography>
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

function mapStateToProps(state: PetalsStore): StateFromProps {
  return {
    isLogin: state.auth.isLogin,
  };
}

function mapDispatchToProps(dispatch: Dispatch<AuthAction>): DispatchFromProps {
  return {
    setLoginState: (isLogin: boolean) => {
      dispatch(setLoginState(isLogin));
    },
  };
}

export default reduxForm({
  form: 'loginForm',
})(
  connect<StateFromProps, DispatchFromProps, {}>(
    mapStateToProps,
    mapDispatchToProps
  )(withRouter(Login))
);
