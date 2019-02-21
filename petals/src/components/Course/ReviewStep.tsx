import { Button, Divider, List, ListItem, ListItemText, Typography } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';
import { formValueSelector, InjectedFormProps, reduxForm } from 'redux-form';

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

const submitCourseData = async (values: CourseCreateFormParams) => {
  console.log(values);
  return courseApi
    .postCourse(values.courseName, values.pinCode, values.courseYear, values.useName, values.useGPA)
    .then(() => {
      console.log('course created');
    })
    .catch((e: Error) => {
      console.log(e);
    });
};

interface CreateReviewProps extends InjectedFormProps, CourseCreateFormParams {
  prevStep: () => void;
}

const ReviewStep: React.FC<CreateReviewProps> = props => {
  const { handleSubmit, courseName, courseYear, pinCode, useName, useGPA, labs } = props;
  // courseName = 'course1';
  // courseYear = 2017;
  // pinCode = 'hogehoge';
  // useGPA = false;
  // useName = true;
  // labs = [{ name: 'lab1', capacity: 4 }, { name: 'lab2', capacity: 3 }];

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
  }))(ReviewStep)
);
