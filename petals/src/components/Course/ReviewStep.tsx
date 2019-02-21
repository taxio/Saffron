import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { formValueSelector, InjectedFormProps, reduxForm, SubmissionError } from 'redux-form';

import * as AppErr from '../../api/AppErrors';
import * as courseApi from '../../api/courses';
import { CourseCreateFormParams, LabParams } from './CourseCreateManager';

const selector = formValueSelector('CourseCreateForm');

const getUseParamStr = (useGPA: boolean, useName: boolean): string => {
  if (!useGPA && !useName) {
    return '無し';
  }
  if (useGPA && useName) {
    return 'GPAとユーザー名を使用';
  }
  if (useGPA) {
    return 'GPAのみ使用';
  }
  if (useName) {
    return 'ユーザー名のみ使用';
  }
  return '';
};

interface CreateReviewProps extends InjectedFormProps, CourseCreateFormParams, RouteComponentProps {
  prevStep: () => void;
}

const ReviewStep: React.FC<CreateReviewProps> = props => {
  const { error, handleSubmit, courseName, courseYear, pinCode, useName, useGPA, labs } = props;

  const submitCourseData = async (values: CourseCreateFormParams) => {
    return courseApi
      .postCourse(values.courseName, values.pinCode, values.courseYear, values.useName, values.useGPA)
      .then(courseRes => {
        const promises: Array<Promise<any>> = [];
        values.labs.map(lab => {
          promises.push(courseApi.postLab(courseRes.pk, lab.name, lab.capacity));
        });
        Promise.all(promises).then(() => {
          props.history.push('/');
        });
      })
      .catch((e: Error) => {
        switch (e.constructor) {
          case AppErr.UnAuthorizedError:
            props.history.push('/login/');
            throw new SubmissionError({ _error: 'ログインセッションが切れました' });
          case AppErr.BadRequestError:
            // TODO: レスポンス中のエラーの表示
            throw new SubmissionError({ _error: '課程作成に失敗しました' });
          case AppErr.UnhandledError:
            throw new SubmissionError({ _error: '課程作成に失敗しました' });
          default:
            throw new SubmissionError({ _error: '未知のエラーです' });
        }
        console.log(e);
      });
  };

  return (
    <React.Fragment>
      <Typography variant="h5">基本情報</Typography>
      <Divider />
      <List disablePadding={true}>
        <ListItem>
          <ListItemText primary="年度" />
          <Typography variant="body1">{courseYear}</Typography>
        </ListItem>
        <ListItem>
          <ListItemText primary="課程名" />
          <Typography variant="body1">{courseName}</Typography>
        </ListItem>
        <ListItem>
          <ListItemText primary="PINコード" />
          <Typography variant="body1">{'*'.repeat(pinCode.length)}</Typography>
        </ListItem>
        <ListItem>
          <ListItemText primary="使用情報設定" />
          <Typography variant="body1">{getUseParamStr(useGPA, useName)}</Typography>
        </ListItem>
      </List>

      <Typography variant="h5" style={{ marginTop: '20px' }}>
        研究室
      </Typography>
      <Divider />
      <List disablePadding={true}>
        {labs.map((lab: LabParams, idx: number) => (
          <ListItem key={idx}>
            <ListItemText primary={lab.name} />
            <Typography variant="body1">{lab.capacity} 人</Typography>
          </ListItem>
        ))}
      </List>

      <form onSubmit={handleSubmit(submitCourseData)}>
        {error ? (
          <FormControl error={true}>
            <FormHelperText>{error}</FormHelperText>
          </FormControl>
        ) : null}
        <div style={{ textAlign: 'right', marginTop: '24px' }}>
          <Button style={{ marginRight: '20px' }} onClick={props.prevStep}>
            戻る
          </Button>
          <Button variant="contained" color="primary" type="submit">
            作成
          </Button>
        </div>
      </form>
    </React.Fragment>
  );
};

export default reduxForm({
  form: 'CourseCreateForm',
})(
  connect(state => ({
    courseYear: selector(state, 'courseYear'),
    courseName: selector(state, 'courseName'),
    pinCode: selector(state, 'pinCode'),
    useName: selector(state, 'useName'),
    useGPA: selector(state, 'useGPA'),
    labs: selector(state, 'labs'),
  }))(withRouter(ReviewStep))
);
