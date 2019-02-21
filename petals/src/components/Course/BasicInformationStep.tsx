import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

import * as React from 'react';
import { Field, InjectedFormProps, reduxForm, SubmissionError, WrappedFieldProps } from 'redux-form';

import { CourseCreateFormParams } from './CourseCreateManager';

const getCourseYearConds = (): number[] => {
  const currentYear = new Date().getFullYear();
  const conds: number[] = [];
  for (let i = currentYear - 2; i < currentYear + 2; i++) {
    conds.push(i);
  }
  return conds;
};

const renderCourseNameField = (props: WrappedFieldProps & { label: string; type: string }) => (
  <FormControl fullWidth={true} error={Boolean(props.meta.error)} style={{ padding: '10px 0px' }}>
    <TextField label={props.label} type={props.type} {...props.input} />
    {props.meta.error ? <FormHelperText>{props.meta.error}</FormHelperText> : null}
  </FormControl>
);

const renderYearSelectField = (props: WrappedFieldProps & { label: string }) => (
  <FormControl style={{ padding: '10px 0px', width: '80px' }} error={Boolean(props.meta.error)}>
    <InputLabel htmlFor="course-year">{props.label}</InputLabel>
    <Select {...props.input}>
      <MenuItem key={0} value={0}>
        <em>-</em>
      </MenuItem>
      {getCourseYearConds().map((v: number) => (
        <MenuItem key={v} value={v}>
          {v}
        </MenuItem>
      ))}
    </Select>
    {props.meta.error ? <FormHelperText>{props.meta.error}</FormHelperText> : null}
  </FormControl>
);

const renderPinCodeField = (props: WrappedFieldProps & { label: string }) => {
  const [showPinCode, setShowPinCode] = React.useState<boolean>(false);

  return (
    <FormControl error={Boolean(props.meta.error)} fullWidth={true} style={{ padding: '10px 0px' }}>
      <InputLabel htmlFor="pin-code">PINコード</InputLabel>
      <Input
        type={showPinCode ? 'text' : 'password'}
        autoComplete="off"
        {...props.input}
        endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label="Toggle password visibility"
              onClick={() => {
                setShowPinCode(!showPinCode);
              }}
            >
              {showPinCode ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          </InputAdornment>
        }
      />
      <FormHelperText>他のユーザーがこの課程に登録するために必要な簡単なパスワードです</FormHelperText>
      {props.meta.error ? <FormHelperText>{props.meta.error}</FormHelperText> : null}
    </FormControl>
  );
};

const renderCheckBoxField = (props: WrappedFieldProps & { label: string; helperText: string }) => (
  <FormControl fullWidth={true}>
    <FormControlLabel
      control={<Checkbox value={props.label} checked={props.input.checked} onChange={props.input.onChange} />}
      label={<React.Fragment>{props.label}</React.Fragment>}
    />
    <FormHelperText style={{ margin: 0 }}>{props.helperText}</FormHelperText>
  </FormControl>
);

interface BasicInformationProps extends InjectedFormProps, CourseCreateFormParams {
  nextStep: () => void;
}

const BasicInformationStep: React.FC<BasicInformationProps> = props => {
  const { handleSubmit } = props;

  const validate = (values: CourseCreateFormParams) => {
    const errors: any = {};
    if (!values.courseName) {
      errors.courseName = '必須項目です';
    }
    if (!values.courseYear) {
      errors.courseYear = '必須項目です';
    }
    if (!values.pinCode) {
      errors.pinCode = '必須項目です';
    }
    // TODO: Common password check
    if (Object.keys(errors).length) {
      throw new SubmissionError(errors);
    }
    props.nextStep();
  };

  return (
    <form onSubmit={handleSubmit(validate)}>
      <Field name="courseYear" label="年度" component={renderYearSelectField} />
      <Field name="courseName" label="課程名" type="text" component={renderCourseNameField} />
      <Field name="pinCode" label="PINコード" component={renderPinCodeField} />

      <Typography variant="h5" style={{ marginTop: '40px' }}>
        使用情報設定
      </Typography>

      <Typography variant="body2" style={{ marginBottom: '10px' }}>
        志望状況表示の際に活用する情報を設定します
      </Typography>

      <Field name="useGPA" label="GPAの使用・表示" helperText="志望者のGPA状況" component={renderCheckBoxField} />

      <Field
        name="useName"
        label="ユーザー名の表示"
        helperText="志望状況にユーザー名が含まれるようになります"
        component={renderCheckBoxField}
      />

      <div style={{ textAlign: 'right', marginTop: '24px' }}>
        <Button type="submit" variant="contained" color="primary">
          次へ
        </Button>
      </div>
    </form>
  );
};

export default reduxForm({
  form: 'CourseCreateForm',
  destroyOnUnmount: false,
})(BasicInformationStep);
