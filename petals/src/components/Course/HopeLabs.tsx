import { InputLabel, Select } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import * as React from 'react';
// import { connect } from 'react-redux';
// import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Field, InjectedFormProps, reduxForm, WrappedFieldProps } from 'redux-form';
import { getLabs } from '../../api/courses';
import { Lab } from '../../model';
// import { Dispatch } from 'redux';
// import { AuthAction, setLoginState } from '../../actions/auth';
// import * as AppErr from '../../api/AppErrors';
// import * as auth from '../../lib/auth';
// import { PetalsStore } from '../../store';

// const selector = formValueSelector('CourseCreateForm');

export interface GpaParams {
  gpa: number;
}

// export interface HopeParams {
//   labName: string[];
// }

interface HopeLabsProps extends InjectedFormProps {}

interface HopeLabsState {
  labs: Lab[];
}

class HopeLabs extends React.Component<HopeLabsProps, HopeLabsState> {
  constructor(props: HopeLabsProps) {
    super(props);
    this.state = {
      labs: [],
    };
  }

  public componentDidMount(): void {
    getLabs(1).then((labs: Lab[]) => {
      this.setState({ labs });
    });
  }

  public renderField = (props: WrappedFieldProps & { label: string; type: string; style: any }) => (
    <FormControl fullWidth={true} error={Boolean(props.meta.error)} style={{ padding: '10px 0px', width: '150px' }}>
      <TextField label={props.label} margin="normal" autoComplete="off" type={props.type} {...props.input} />
      {props.meta.error ? <FormHelperText>{props.meta.error}</FormHelperText> : null}
    </FormControl>
  );

  public renderLabSelectField = (props: WrappedFieldProps & { label: string }) => (
    <FormControl style={{ padding: '10px 0px', width: '450px' }} error={Boolean(props.meta.error)}>
      <InputLabel htmlFor="course-year">{props.label}</InputLabel>
      <Select {...props.input}>
        <MenuItem key={0} value={0}>
          <em>-</em>
        </MenuItem>
        {this.state.labs.map((lab: Lab, idx: number) => (
          <MenuItem key={idx + 1} value={lab.name}>
            {lab.name}
          </MenuItem>
        ))}
      </Select>
      {props.meta.error ? <FormHelperText>{props.meta.error}</FormHelperText> : null}
    </FormControl>
  );

  public render(): React.ReactNode {
    const formControlStyle = { padding: '10px 0px' };

    return (
      <Grid container={true} justify="center">
        <Grid item={true} xs={10} sm={8} md={7} lg={6} xl={5}>
          <Card style={{ marginTop: 30, padding: 20 }}>
            <CardContent style={{ textAlign: 'center' }}>
              <Typography component="h1" variant="h5" align="center">
                研究室希望提出
              </Typography>
              <form autoComplete="off">
                <Field name="gpa" label="GPA" type="number" component={this.renderField} />

                <Field name="labsName1" label="第一希望" component={this.renderLabSelectField} />
                <Field name="labsName2" label="第二希望" component={this.renderLabSelectField} />
                <Field name="labsName3" label="第三希望" component={this.renderLabSelectField} />
                <FormControl fullWidth={true} style={formControlStyle}>
                  <Button
                    type="submit"
                    color="primary"
                    variant="contained"
                    style={{ marginTop: 16, marginBottom: 8, boxShadow: 'none' }}
                  >
                    Submit
                  </Button>
                </FormControl>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }
}

// interface StateFromProps {
//   isLogin: boolean;
// }
//
// interface DispatchFromProps {
//   setLoginState: (isLogin: boolean) => void;
// }
//
// function mapStateToProps(state: PetalsStore): StateFromProps {
//   return {
//     isLogin: ,
//   };
// }
//
// function mapDispatchToProps(dispatch: Dispatch<AuthAction>): DispatchFromProps {
//   return {
//     setLoginState: (isLogin: boolean) => {
//       dispatch(setLoginState(isLogin));
//     },
//   };
// }

export default reduxForm({
  form: 'gpaForm',
})(HopeLabs);
// connect( state => ({
//   labName: selector(state, 'labName'),
// }))(withRouter(HopeLabs))
// );
