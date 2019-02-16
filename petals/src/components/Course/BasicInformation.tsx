import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@material-ui/core';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Field, InjectedFormProps, reduxForm, SubmissionError, WrappedFieldProps } from 'redux-form';

interface BasicInformationProps extends RouteComponentProps, InjectedFormProps {}
interface BasicInformationState {}

class BasicInformation extends React.Component<BasicInformationProps, BasicInformationState> {
  constructor(props: BasicInformationProps) {
    super(props);
  }

  public getCourseYearConds = (): number[] => {
    const currentYear = new Date().getFullYear();
    const conds: number[] = [];
    for (let i = currentYear - 2; i < currentYear + 2; i++) {
      conds.push(i);
    }
    return conds;
  };

  public renderTextField = (props: WrappedFieldProps & { label: string; type: string }) => (
    <FormControl fullWidth={true} error={Boolean(props.meta.error)} style={{ padding: '10px 0px' }}>
      <TextField label={props.label} margin="normal" type={props.type} {...props.input} />
      {props.meta.error ? <FormHelperText>{props.meta.error}</FormHelperText> : null}
    </FormControl>
  );

  public renderSelectField = (props: WrappedFieldProps & { label: string }) => (
    <FormControl style={{ padding: '10px 0px', width: '80px' }}>
      <InputLabel htmlFor="course-year">{props.label}</InputLabel>
      <Select {...props.input}>
        <MenuItem key={0} value={0}>
          <em>-</em>
        </MenuItem>
        {this.getCourseYearConds().map((v: number) => (
          <MenuItem key={v} value={v}>
            {v}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  public renderCheckBoxField = (props: WrappedFieldProps & { label: string; helperText: string }) => (
    <FormControl fullWidth={true}>
      <FormControlLabel
        control={<Checkbox value={props.label} checked={props.input.checked} onChange={props.input.onChange} />}
        label={<React.Fragment>{props.label}</React.Fragment>}
      />
      <FormHelperText style={{ margin: 0 }}>{props.helperText}</FormHelperText>
    </FormControl>
  );

  public render() {
    return (
      <form>
        <Field name="courseYear" label="年度" component={this.renderSelectField} />
        <Field name="courseName" label="課程名" type="text" component={this.renderTextField} />

        <Typography variant="h5" style={{ marginTop: '40px' }}>
          使用情報設定
        </Typography>

        <Typography variant="body2" style={{ marginBottom: '10px' }}>
          志望状況表示の際に活用する情報を設定します
        </Typography>

        <Field
          name="useGPA"
          label="GPAの使用・表示"
          helperText="志望者のGPA状況"
          component={this.renderCheckBoxField}
        />

        <Field
          name="useName"
          label="ユーザー名の表示"
          helperText="志望状況にユーザー名が含まれるようになります"
          component={this.renderCheckBoxField}
        />
      </form>
    );
  }
}

export default reduxForm({
  form: 'CourseCreateBasicInformationForm',
})(withRouter(BasicInformation));
