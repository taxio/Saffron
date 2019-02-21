import { Button, Divider, List, ListItem, ListItemText, Typography } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { formValueSelector, InjectedFormProps, reduxForm } from 'redux-form';

// import * as AppErr from '../../api/AppErrors';
import * as courseApi from '../../api/courses';
import { CourseCreateFormParams, Lab } from './CourseCreateManager';

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
  const { handleSubmit, courseName, courseYear, pinCode, useName, useGPA, labs } = props;

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
        // switch (e.constructor) {
        //   case AppErr.UnhandledError:
        //     console.log('unhandle fetch error');
        //   default:
        //     console.log('未知のエラーです');
        // }
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
        {labs.map((lab: Lab, idx: number) => (
          <ListItem key={idx}>
            <ListItemText primary={lab.name} />
            <Typography variant="body1">{lab.capacity} 人</Typography>
          </ListItem>
        ))}
      </List>

      <form onSubmit={handleSubmit(submitCourseData)}>
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
