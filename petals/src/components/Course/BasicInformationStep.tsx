import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@material-ui/core';
import { Visibility, VisibilityOff } from '@material-ui/icons';
import * as React from 'react';
import { Field, InjectedFormProps, reduxForm, SubmissionError, WrappedFieldProps } from 'redux-form';

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
    <FormControl fullWidth={true} style={{ padding: '10px 0px' }}>
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

interface FormParams {
  courseYear: number;
  courseName: string;
  pinCode: string;
  useName: boolean;
  useGPA: boolean;
}

interface BasicInformationProps extends InjectedFormProps, FormParams {
  nextStep: () => void;
}

const BasicInformationStep: React.FC<BasicInformationProps> = props => {
  const { handleSubmit } = props;

  const validate = (values: FormParams) => {
    const errors: any = {};
    if (!values.courseName) {
      errors.courseName = '必須項目です';
    }
    if (!values.courseYear) {
      errors.courseYear = '必須項目です';
    }
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
