import {
  Button,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  Input,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@material-ui/core';

import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { Dispatch } from 'redux';
import { Field, InjectedFormProps, reduxForm, SubmissionError, WrappedFieldProps } from 'redux-form';

import { UserAction, userFetchRequest } from '../actions/user';
import * as AppErr from '../api/AppErrors';
import * as meApi from '../api/me';
import * as model from '../model';
import { PetalsStore } from '../store';

import { GpaValidationError, validateGpaString } from '../lib/validations';
import GridPaper from './Common/GridPaper';

interface SettingsProps extends RouteComponentProps, InjectedFormProps {
  fetchUserInfo: () => void;
  user: model.User | null;
  isFetching: boolean;
  fetchError: Error | null;
}

interface SettingsState {}

interface FormParams {
  screenName: string;
  gpa: string;
}

class Settings extends React.Component<SettingsProps, SettingsState> {
  constructor(props: SettingsProps) {
    super(props);
  }

  public componentDidMount() {
    this.props.fetchUserInfo();
    meApi
      .getMe()
      .then(res => {
        this.props.initialize({ screenName: res.screen_name, gpa: res.gpa });
      })
      .catch((e: Error) => {
        switch (e.constructor) {
          case AppErr.UnAuthorizedError:
            this.props.history.push('/login');
        }
      });
  }

  public renderGpaField = (props: WrappedFieldProps) => (
    <FormControl error={Boolean(props.meta.error)} style={{ width: '70px' }}>
      <Input
        {...props.input}
        onChange={e => {
          props.input.onChange(e.target.value.length >= 4 ? e.target.value.slice(0, 4) : e.target.value);
        }}
        disableUnderline={true}
        style={{
          border: `1px #${props.meta.error ? 'F44336' : 'DDDDDD'} solid`,
          borderRadius: '4px',
          padding: '0 14px',
        }}
      />
    </FormControl>
  );

  public renderScreenNameField = (props: WrappedFieldProps & { width?: string }) => (
    <FormControl error={Boolean(props.meta.error)} style={{ width: '150px' }}>
      <Input
        {...props.input}
        disableUnderline={true}
        style={{
          border: `1px #${props.meta.error ? 'F44336' : 'DDDDDD'} solid`,
          borderRadius: '4px',
          padding: '0 14px',
        }}
      />
    </FormControl>
  );

  public updateUserInfo = (values: FormParams) => {
    let gpaNum: number | null = parseFloat(values.gpa);
    switch (validateGpaString(values.gpa)) {
      case GpaValidationError.NOT_NUMBER:
        throw new SubmissionError({ gpa: '数字を入力してください' });
      case GpaValidationError.OUT_OF_RANGE:
        throw new SubmissionError({ gpa: '正しい値を入力してください' });
      case GpaValidationError.NO_INPUT:
        gpaNum = null;
    }

    return meApi.patchMe(values.screenName, gpaNum).catch((e: Error) => {
      switch (e.constructor) {
        case AppErr.BadRequestError:
          throw new SubmissionError({ _error: 'ユーザー情報の更新に失敗しました' });
      }
    });
  };

  public render() {
    const { user, fetchError, handleSubmit, error } = this.props;

    if (!user) {
      return (
        <GridPaper style={{ textAlign: 'center' }}>
          <Typography variant="h4" align="center">
            設定
          </Typography>
          {fetchError ? (
            <Typography variant="h6" align="center">
              情報の取得に失敗しました
            </Typography>
          ) : (
            <CircularProgress style={{ margin: 20 }} />
          )}
        </GridPaper>
      );
    }

    return (
      <GridPaper>
        <Typography variant="h4" align="center">
          設定
        </Typography>
        <form onSubmit={handleSubmit(this.updateUserInfo)}>
          <List>
            <ListItem style={{ height: '56px' }}>
              <ListItemText primary="ユーザー名" />
              <Typography>{user.username}</Typography>
            </ListItem>
            <ListItem style={{ height: '56px' }}>
              <ListItemText primary="メール" />
              <Typography>{user.email}</Typography>
            </ListItem>
            <ListItem>
              <ListItemText primary="表示名" />
              <Field name="screenName" component={this.renderScreenNameField} />
            </ListItem>
            <ListItem>
              <ListItemText primary="GPA" />
              <Field name="gpa" component={this.renderGpaField} />
            </ListItem>
          </List>

          <FormControl fullWidth={true} style={{ marginTop: '10px' }}>
            <Button variant="contained" color="primary" type="submit">
              更新
            </Button>
          </FormControl>
          <FormControl error={Boolean(error)} fullWidth={true} style={{ marginTop: '20px' }}>
            <Button variant="outlined" color="primary" onClick={() => this.props.history.push('/settings/password')}>
              パスワード変更
            </Button>
            {error ? <FormHelperText>{error}</FormHelperText> : null}
          </FormControl>

          <Divider style={{ margin: '20px 0' }} />

          <Typography variant="h6">所属課程</Typography>
          {user.courses.length === 0 ? (
            <Typography variant="h6" align="center">
              所属課程無し
            </Typography>
          ) : (
            user.courses.map((course, idx) => (
              <div style={{ textAlign: 'center', margin: '5px 0' }}>
                <Button
                  key={idx}
                  variant="outlined"
                  size="large"
                  onClick={() => this.props.history.push(`/courses/${course.pk}`)}
                  style={{ textTransform: 'none', fontSize: 16, margin: 'auto' }}
                >{`${course.year}年度　${course.name}`}</Button>
              </div>
            ))
          )}
          <div style={{ textAlign: 'center', margin: '5px 0' }}>
            <Button
              variant="outlined"
              size="large"
              style={{ textTransform: 'none', fontSize: 16 }}
              onClick={() => this.props.history.push('/courses')}
            >
              課程に新しく参加する
            </Button>
          </div>

          <Divider style={{ margin: '30px 0' }} />

          <FormControl fullWidth={true}>
            <Button variant="contained" color="secondary" onClick={() => this.props.history.push('/settings/delete')}>
              アカウント削除
            </Button>
          </FormControl>
        </form>
      </GridPaper>
    );
  }
}

interface StateFromProps {
  user: model.User | null;
  isFetching: boolean;
  fetchError: Error | null;
}

interface DispatchFromProps {
  fetchUserInfo: () => void;
}

const mapStateToProps = (state: PetalsStore): StateFromProps => {
  return {
    user: state.user.user,
    isFetching: state.user.isFetching,
    fetchError: state.user.error,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<UserAction>): DispatchFromProps => {
  return {
    fetchUserInfo: () => {
      dispatch(userFetchRequest());
    },
  };
};

export default reduxForm({
  form: 'settingsForm',
})(
  connect<StateFromProps, DispatchFromProps, {}>(
    mapStateToProps,
    mapDispatchToProps
  )(withRouter(Settings))
);
