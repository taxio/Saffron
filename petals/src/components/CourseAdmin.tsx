import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import { Add, Delete, Visibility, VisibilityOff } from '@material-ui/icons';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { addLab, createCourse } from '../api/courses';
import { isIntStr } from '../lib/util';

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

interface CourseAdminProps extends RouteComponentProps {}

interface Lab {
  labName: string;
  capacity: number;
}

interface CourseAdminState {
  courseYear: number;
  courseName: string;
  pinCode: string;
  showPinCode: boolean;
  useGpa: boolean;
  useName: boolean;
  labName: string;
  labCapacity: string;
  labCapacityErr: boolean;
  labs: Lab[];
}

class CourseAdmin extends React.Component<CourseAdminProps, CourseAdminState> {
  constructor(props: CourseAdminProps) {
    super(props);

    this.state = {
      courseYear: 0,
      courseName: '',
      pinCode: '',
      showPinCode: false,
      useGpa: false,
      useName: false,
      labName: '',
      labCapacity: '0',
      labCapacityErr: false,
      labs: [],
    };

    this.handleChangeCourseName = this.handleChangeCourseName.bind(this);
    this.handleAppendLab = this.handleAppendLab.bind(this);
    this.handleDeleteLab = this.handleDeleteLab.bind(this);
    this.handleChangeLabCapacity = this.handleChangeLabCapacity.bind(this);
    this.handleSave = this.handleSave.bind(this);
  }

  public handleChangeCourseName(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ courseName: e.target.value });
  }

  public getCourseYearConds(): number[] {
    const currentYear = new Date().getFullYear();
    const conds: number[] = [];
    for (let i = currentYear - 2; i < currentYear + 2; i++) {
      conds.push(i);
    }
    return conds;
  }

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

  public handleSave() {
    createCourse(
      this.state.courseName,
      this.state.pinCode,
      this.state.courseYear,
      this.state.useGpa,
      this.state.useName
    )
      .then(res => {
        console.log(res);
        this.state.labs.forEach(lab => {
          addLab(res.pk, lab.labName, lab.capacity).catch(errJson => {
            console.log(errJson);
          });
        });
      })
      .catch(errJson => {
        console.log(errJson);
      });
  }

  public render(): React.ReactNode {
    const formControlStyle = { padding: '10px 0px' };
    const courseYearConds = this.getCourseYearConds();

    return (
      <Grid container={true} justify="center">
        <Grid item={true} xs={12} sm={8} md={7} lg={6} xl={5}>
          <Paper style={{ marginTop: 20, padding: 20 }}>
            <form>
              <Typography variant="h4" style={{ margin: '10px 0 20px 0' }}>
                課程設定
              </Typography>

              <FormControl fullWidth={true} style={formControlStyle}>
                <InputLabel htmlFor="course-year">年度</InputLabel>
                <Select
                  value={this.state.courseYear}
                  onChange={e => this.setState({ courseYear: parseInt(e.target.value, 10) })}
                >
                  <MenuItem key={0} value={0}>
                    <em>-</em>
                  </MenuItem>
                  {courseYearConds.map((v: number) => (
                    <MenuItem key={v} value={v}>
                      {v}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth={true} style={formControlStyle}>
                <InputLabel htmlFor="course-name">課程名</InputLabel>
                <Input id="course-name" value={this.state.courseName} onChange={this.handleChangeCourseName} />
              </FormControl>

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
                      <IconButton
                        aria-label="Toggle password visibility"
                        onClick={e => this.setState({ showPinCode: !this.state.showPinCode })}
                      >
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

              <FormControl fullWidth={true}>
                <FormControlLabel
                  control={
                    <Checkbox checked={this.state.useGpa} onChange={e => this.setState({ useGpa: e.target.checked })} />
                  }
                  label={<React.Fragment>GPAの使用</React.Fragment>}
                />
                <FormHelperText style={{ margin: 0 }}>ボーダーラインや平均値などを表示します</FormHelperText>
              </FormControl>

              <FormControl fullWidth={true}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={this.state.useName}
                      onChange={e => this.setState({ useName: e.target.checked })}
                    />
                  }
                  label={<React.Fragment>ユーザー名の表示</React.Fragment>}
                />
                <FormHelperText style={{ margin: 0 }}>志望状況にユーザー名が含まれるようになります</FormHelperText>
              </FormControl>

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

              <FormControl fullWidth={true} style={{ margin: '30px 0 10px 0' }}>
                <Button variant="contained" color="primary" onClick={this.handleSave}>
                  保存する
                </Button>
              </FormControl>
            </form>
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

export default withRouter(CourseAdmin);
