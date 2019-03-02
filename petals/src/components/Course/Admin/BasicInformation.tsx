import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  TextField,
  Typography,
} from '@material-ui/core';

import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Field, InjectedFormProps, reduxForm, SubmissionError, WrappedFieldProps } from 'redux-form';

import * as api from '../../../api';
import * as model from '../../../model';
import GridInformationDialog from '../../Common/GridInformationDialog';

interface FormParams {
  name: string;
  useGPA: boolean;
  useScreenName: boolean;
}

const renderCourseNameField = (props: WrappedFieldProps & { label: string; type: string }) => (
  <FormControl fullWidth={true} error={Boolean(props.meta.error)} style={{ padding: '10px 0px' }}>
    <TextField label={props.label} type={props.type} {...props.input} />
    {props.meta.error ? <FormHelperText>{props.meta.error}</FormHelperText> : null}
  </FormControl>
);

const renderCheckBoxField = (props: WrappedFieldProps & { label: string; helperText: string }) => (
  <FormControl fullWidth={true}>
    <FormControlLabel
      control={<Checkbox value={props.label} checked={props.input.value} onChange={props.input.onChange} />}
      label={<React.Fragment>{props.label}</React.Fragment>}
    />
    <FormHelperText style={{ margin: 0 }}>{props.helperText}</FormHelperText>
  </FormControl>
);

interface BasicInformationProps extends InjectedFormProps, RouteComponentProps {
  coursePk: number;
}

const BasicInformation: React.FC<BasicInformationProps> = props => {
  const [showDialog, setShowDialog] = React.useState<boolean>(false);
  const [course, setCourse] = React.useState<model.Course | null>(null);

  React.useEffect(() => {
    api.courses
      .getCourse(props.coursePk)
      .then(res => {
        setCourse(res);
        props.initialize({
          year: res.year,
          name: res.name,
          useGPA: res.config.show_gpa,
          useScreenName: res.config.show_username,
        });
      })
      .catch((err: Error) => {
        switch (err.constructor) {
          case api.errors.UnAuthorizedError:
            props.history.push('/login');
            return;
          default:
            props.history.push(`/courses/${props.coursePk}`);
            return;
        }
      });
  }, []);

  const update = (values: FormParams) => {
    const errors: any = {};
    if (!values.name) {
      errors.name = '必須項目です';
    }
    if (Object.keys(errors).length) {
      throw new SubmissionError(errors);
    }

    api.courses
      .patchCourse(props.coursePk, values.name, null, null, values.useScreenName, values.useGPA)
      .then(() => {
        setShowDialog(true);
      })
      .catch((err: Error) => {
        throw new SubmissionError({ _error: '更新に失敗しました' });
      });
  };

  if (!course) {
    return (
      <>
        <Typography variant="h4">基本情報</Typography>
      </>
    );
  }

  return (
    <form onSubmit={props.handleSubmit(update)}>
      <Typography variant="h5" style={{ marginBottom: 15 }}>
        基本情報
      </Typography>

      <Typography variant="body1">{course.year}年度</Typography>
      <Field name="name" label="課程名" type="text" component={renderCourseNameField} />
      <Field name="useGPA" label="GPAの使用・表示" helperText="志望者のGPA状況" component={renderCheckBoxField} />
      <Field
        name="useScreenName"
        label="ユーザー名の表示"
        helperText="志望状況にユーザー名が含まれるようになります"
        component={renderCheckBoxField}
      />

      <FormControl fullWidth={true} error={Boolean(props.error)} style={{ marginTop: 20 }}>
        <Button type="submit" variant="contained" color="primary">
          基本情報を更新
        </Button>
      </FormControl>

      <GridInformationDialog
        open={showDialog}
        handleCloseDialog={() => setShowDialog(false)}
        message="課程情報を更新しました"
      />
    </form>
  );
};

export default reduxForm({
  form: 'adminBasicInformationForm',
})(withRouter(BasicInformation));
