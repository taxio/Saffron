import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import Input from '@material-ui/core/Input';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Field, InjectedFormProps, reduxForm, SubmissionError, WrappedFieldProps } from 'redux-form';

import * as AppErr from '../api/AppErrors';
import * as meApi from '../api/me';

interface FormParams {
  screenName: string;
}

interface ProfileProps extends RouteComponentProps, InjectedFormProps {}

interface ProfileState {
  username: string;
  email: string;
  screenName: string;
  gpa: number | null;
}

class ProfileEdit extends React.Component<ProfileProps, ProfileState> {
  constructor(props: ProfileProps) {
    super(props);

    this.state = {
      username: '',
      email: '',
      screenName: '',
      gpa: null,
    };
  }

  public componentDidMount() {
    meApi.getMe().then(res => {
      this.setState({
        username: res.username,
        email: res.email,
        screenName: res.screen_name,
        gpa: res.gpa,
      });

      this.props.initialize({ screenName: res.screen_name });
    });
  }

  public handleToChangePassword = () => {
    this.props.history.push('/profile/password/change');
  };

  public handleSubmit = (values: FormParams) => {
    if (!values.screenName) {
      throw new SubmissionError({ screenName: '未入力です', _error: '入力内容に誤りがあります' });
    }

    return meApi
      .patchMe(values.screenName)
      .then(() => {
        this.props.history.push('/profile');
      })
      .catch(e => {
        switch (e.constructor) {
          case AppErr.BadRequestError:
            throw new SubmissionError({ _error: 'ユーザー情報の更新に失敗しました' });
        }
      });
  };

  public renderTextField = (props: WrappedFieldProps & { label: string; type: string }) => (
    <FormControl fullWidth={true} error={Boolean(props.meta.error)}>
      <Input
        {...props.input}
        disableUnderline={true}
        style={{
          border: `1px #${props.meta.error ? 'F44336' : 'DDDDDD'} solid`,
          borderRadius: '4px',
          padding: '5px 10px',
        }}
      />
    </FormControl>
  );

  public render(): React.ReactNode {
    const { handleSubmit } = this.props;

    return (
      <Grid container={true} justify="center">
        <Grid item={true} xs={12} sm={8} md={7} lg={6} xl={5}>
          <Paper style={{ marginTop: 20, textAlign: 'center' }}>
            <form onSubmit={handleSubmit(this.handleSubmit)}>
              <Grid
                container={true}
                spacing={24}
                justify="center"
                alignItems="center"
                direction="row"
                style={{ padding: '10px 0' }}
              >
                <Grid item={true} xs={7}>
                  <Typography style={{ color: '#DDDDDD' }}>ユーザー名</Typography>
                  <Typography variant="h6">{this.state.username}</Typography>
                </Grid>
                <Grid item={true} xs={5}>
                  <Button type="submit" variant="contained" color="primary">
                    変更を保存
                  </Button>
                </Grid>
              </Grid>

              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell padding="dense">メール</TableCell>
                    <TableCell>{this.state.email}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell padding="dense">表示名</TableCell>
                    <TableCell>
                      <Field name="screenName" label="表示名" type="text" component={this.renderTextField} />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </form>
            <Button variant="contained" color="primary" style={{ margin: 20 }} onClick={this.handleToChangePassword}>
              パスワードを変更する
            </Button>
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

export default reduxForm({
  form: 'profileEditForm',
})(withRouter(ProfileEdit));
