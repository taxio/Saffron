import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Add from '@material-ui/icons/Add';
import Delete from '@material-ui/icons/Delete';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Field, InjectedFormProps, reduxForm, SubmissionError, WrappedFieldProps } from 'redux-form';
import { addLab, createCourse } from '../api/courses';
import { isIntStr } from '../lib/util';

interface FormParams {
  courseYear: number;
  courseName: string;
  pinCode: string;
  useName: boolean;
  useGPA: boolean;
}

interface LabRowProps {
  key: number;
  labName: string;
  capacity: number;
  onDelete: (key: number) => void;
}

const LabRow: React.SFC<LabRowProps> = props => (
  <TableRow key={props.key}>
    <TableCell padding="dense">{props.labName}</TableCell>
    <TableCell style={{ padding: '4px 0' }}>{props.capacity}</TableCell>
    <TableCell padding="none" style={{ textAlign: 'center' }}>
      <IconButton>
        <Delete onClick={() => props.onDelete(props.key)} />
      </IconButton>
    </TableCell>
  </TableRow>
);

interface CourseAdminProps extends RouteComponentProps, InjectedFormProps {}

interface Lab {
  labName: string;
  capacity: number;
}

interface CourseAdminState {
  pinCode: string;
  showPinCode: boolean;
  labName: string;
  labCapacity: string;
  labCapacityErr: boolean;
  labs: Lab[];
  saveErr: boolean;
  showDialog: boolean;
}

class CourseAdmin extends React.Component<CourseAdminProps, CourseAdminState> {
  constructor(props: CourseAdminProps) {
    super(props);

    this.state = {
      pinCode: '',
      showPinCode: false,
      labName: '',
      labCapacity: '0',
      labCapacityErr: false,
      labs: [],
      saveErr: false,
      showDialog: false,
    };

    this.handleAppendLab = this.handleAppendLab.bind(this);
    this.handleDeleteLab = this.handleDeleteLab.bind(this);
    this.handleChangeLabCapacity = this.handleChangeLabCapacity.bind(this);
  }

  public getCourseYearConds = (): number[] => {
    const currentYear = new Date().getFullYear();
    const conds: number[] = [];
    for (let i = currentYear - 2; i < currentYear + 2; i++) {
      conds.push(i);
    }
    return conds;
  };

  public handleChangeLabCapacity(e: React.ChangeEvent<HTMLInputElement>) {
    const labCapacity = e.target.value;
    let labCapacityErr = false;
    if (!isIntStr(labCapacity)) {
      labCapacityErr = true;
    }
    this.setState({ labCapacity, labCapacityErr });
  }

  public handleAppendLab() {
    if (!this.state.labCapacity || this.state.labCapacityErr || !this.state.labName) {
      return;
    }

    const labs = this.state.labs;
    labs.push({ labName: this.state.labName, capacity: parseInt(this.state.labCapacity, 10) });
    this.setState({ labs, labName: '', labCapacity: '0' });
  }

  public handleDeleteLab(key: number) {
    const labs = this.state.labs;
    labs.splice(key, 1);
    this.setState({ labs });
  }

  public renderTextField = (props: WrappedFieldProps & { label: string; type: string }) => (
    <FormControl fullWidth={true} error={Boolean(props.meta.error)} style={{ padding: '10px 0px' }}>
      <TextField label={props.label} margin="normal" type={props.type} {...props.input} />
      {props.meta.error ? <FormHelperText>{props.meta.error}</FormHelperText> : null}
    </FormControl>
  );

  public renderSelectField = (props: WrappedFieldProps & { label: string }) => (
    <FormControl fullWidth={true} style={{ padding: '10px 0px' }}>
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

  public handleChangePinCodeVisible = () => {
    const showPinCode = this.state.showPinCode;
    this.setState({ showPinCode: !showPinCode });
  };

  public handleSubmit = (values: FormParams) => {
    const courseNameErrMsg = values.courseName ? '' : '未入力です';
    if (courseNameErrMsg) {
      throw new SubmissionError({ courseName: courseNameErrMsg, _error: '入力項目に間違いがあります' });
    }
    return createCourse(values.courseName, this.state.pinCode, values.courseYear, values.useGPA, values.useName)
      .then(res => {
        const promises: Array<Promise<{}>> = [];
        this.state.labs.forEach(lab => {
          promises.push(
            addLab(res.pk, lab.labName, lab.capacity).catch(errJson => {
              throw errJson;
            })
          );
        });
        Promise.all(promises)
          .then(() => {
            this.setState({ showDialog: true });
          })
          .catch(e => {
            this.setState({ saveErr: true });
          });
      })
      .catch(errJson => {
        this.setState({ saveErr: true });
      });
  };

  public renderCheckBoxField = (props: WrappedFieldProps & { label: string; helperText: string }) => (
    <FormControl fullWidth={true}>
      <FormControlLabel
        control={<Checkbox value={props.label} checked={props.input.checked} onChange={props.input.onChange} />}
        label={<React.Fragment>{props.label}</React.Fragment>}
      />
      <FormHelperText style={{ margin: 0 }}>{props.helperText}</FormHelperText>
    </FormControl>
  );

  public render(): React.ReactNode {
    const formControlStyle = { padding: '10px 0px' };
    const { error, handleSubmit } = this.props;

    return (
      <Grid container={true} justify="center">
        <Grid item={true} xs={12} sm={8} md={7} lg={6} xl={5}>
          <Paper style={{ marginTop: 20, padding: 20 }}>
            <form onSubmit={handleSubmit(this.handleSubmit)}>
              <Typography variant="h4" style={{ margin: '10px 0 20px 0' }}>
                課程設定
              </Typography>

              <Field name="courseYear" label="年度" component={this.renderSelectField} />

              <Field name="courseName" label="課程名" type="text" component={this.renderTextField} />

              <FormControl fullWidth={true} style={formControlStyle}>
                <InputLabel htmlFor="pin-code">PINコード</InputLabel>
                <Input
                  id="pin-code"
                  type={this.state.showPinCode ? 'text' : 'password'}
                  value={this.state.pinCode}
                  autoComplete="off"
                  onChange={e => this.setState({ pinCode: e.target.value })}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton aria-label="Toggle password visibility" onClick={this.handleChangePinCodeVisible}>
                        {this.state.showPinCode ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
                <FormHelperText>他のユーザーがこの課程に登録するために必要な簡単なパスワードです</FormHelperText>
              </FormControl>

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

              <Typography variant="h5" style={{ margin: '40px 0 10px 0' }}>
                研究室入力
              </Typography>
              <Paper style={{ width: '100%', overflowX: 'auto', boxShadow: 'none' }}>
                <Table style={{ minWidth: 280, tableLayout: 'auto' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="dense" style={{ width: '60%' }}>
                        研究室名
                      </TableCell>
                      <TableCell style={{ width: '20%', padding: '4px 0' }}>募集人数</TableCell>
                      <TableCell padding="none" style={{ width: '20%' }} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {this.state.labs.map((v, k) => (
                      <LabRow key={k} labName={v.labName} capacity={v.capacity} onDelete={this.handleDeleteLab} />
                    ))}
                    <TableRow>
                      <TableCell padding="dense">
                        <FormControl fullWidth={true}>
                          <Input
                            value={this.state.labName}
                            onChange={e => this.setState({ labName: e.target.value })}
                          />
                        </FormControl>
                      </TableCell>
                      <TableCell style={{ padding: '4px 0' }}>
                        <FormControl error={this.state.labCapacityErr}>
                          <Input value={this.state.labCapacity} onChange={this.handleChangeLabCapacity} />
                          {this.state.labCapacityErr ? <FormHelperText>半角数字のみ</FormHelperText> : null}
                        </FormControl>
                      </TableCell>
                      <TableCell padding="none" style={{ textAlign: 'center' }}>
                        <IconButton>
                          <Add onClick={this.handleAppendLab} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Paper>

              <FormControl fullWidth={true} style={{ margin: '30px 0 10px 0' }} error={Boolean(error)}>
                {this.state.saveErr ? (
                  <FormHelperText style={{ marginBottom: 10 }}>作成に失敗しました</FormHelperText>
                ) : null}
                <Button type="submit" variant="contained" color="primary">
                  保存する
                </Button>
              </FormControl>
            </form>

            <Dialog
              fullWidth={true}
              maxWidth="xs"
              open={this.state.showDialog}
              onClose={() => this.setState({ showDialog: false })}
            >
              <DialogTitle>課程を作成しました</DialogTitle>
              <DialogActions>
                <Button color="secondary">志望登録へ</Button>
                <Button>閉じる</Button>
              </DialogActions>
            </Dialog>
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

export default reduxForm({
  form: 'CourseAdminForm',
})(withRouter(CourseAdmin));
