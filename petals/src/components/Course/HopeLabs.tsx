import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
// import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import * as React from 'react';
// import { connect } from 'react-redux';
// import { RouteComponentProps, withRouter } from 'react-router-dom';
import {Field, InjectedFormProps, reduxForm, WrappedFieldProps} from 'redux-form';
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

interface HopeLabsState {}

class HopeLabs extends React.Component<HopeLabsProps, HopeLabsState> {
  constructor(props: HopeLabsProps) {
    super(props);
  }

  public renderField = (props: WrappedFieldProps & { label: string; type: string }) => (
    <FormControl fullWidth={true} error={Boolean(props.meta.error)} style={{ padding: '10px 0px' }}>
      <TextField label={props.label} margin="normal" autoComplete="off" type={props.type} {...props.input} />
      {props.meta.error ? <FormHelperText>{props.meta.error}</FormHelperText> : null}
    </FormControl>
  );

  public render(): React.ReactNode {
    const formControlStyle = { padding: '10px 0px' };
    // const labName = this.props;

    return (
      <Grid container={true} justify="center">
        <Grid item={true} xs={10} sm={8} md={7} lg={6} xl={5}>
          <Card style={{ marginTop: 30, padding: 20 }}>
            <CardContent style={{ textAlign: 'center' }}>
              <form autoComplete="off">
                <Field name="gpa" label="GPA" type="number" component={this.renderField} />

                {/*<List disablePadding={true}>*/}
                {/*<ListItem>*/}
                {/*<ListItemText primary="第一希望研究室" />*/}
                {/*<Typography variant="body1">{labName}</Typography>*/}
                {/*</ListItem>*/}
                {/*<ListItem>*/}
                {/*<ListItemText primary="第二希望研究室" />*/}
                {/*<Typography variant="body1">{labName}</Typography>*/}
                {/*</ListItem>*/}
                {/*<ListItem>*/}
                {/*<ListItemText primary="第三希望研究室" />*/}
                {/*<Typography variant="body1">{labName}</Typography>*/}
                {/*</ListItem>*/}
                {/*</List>*/}
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
