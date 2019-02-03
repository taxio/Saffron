import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { joinCourse } from '../api/courses';
import { getMeInfo } from '../api/users';
import { getYearCouseList } from '../api/years';

interface ProfileProps extends RouteComponentProps {}

interface ProfileState {
  isLoading: boolean;
  username: string;
  email: string;
  screenName: string;
  isJoinedCourse: boolean;
  course: any;
  showSelectPopUp: boolean;
  selectedCourse: number;
  yearCourseList: any[];
  selectedYear: number;
  pinCode: string;
  joinErrMsg: string;
}

class Profile extends React.Component<ProfileProps, ProfileState> {
  constructor(props: ProfileProps) {
    super(props);

    this.state = {
      isLoading: true,
      username: '',
      email: '',
      screenName: '',
      isJoinedCourse: false,
      course: {},
      showSelectPopUp: false,
      selectedCourse: 0,
      yearCourseList: [],
      selectedYear: 0,
      pinCode: '',
      joinErrMsg: '',
    };

    this.handleClickEdit = this.handleClickEdit.bind(this);
    this.handleClickSelectCourse = this.handleClickSelectCourse.bind(this);
    this.handleCloseSelectCourse = this.handleCloseSelectCourse.bind(this);
    this.handleChangeCourseSelect = this.handleChangeCourseSelect.bind(this);
    this.handleChangeYearSelect = this.handleChangeYearSelect.bind(this);
    this.handleChangePinCode = this.handleChangePinCode.bind(this);
    this.handleJoinCourse = this.handleJoinCourse.bind(this);
  }

  public componentDidMount() {
    if (!this.state.isLoading) {
      return;
    }

    getMeInfo().then(res => {
      this.setState({
        isLoading: false,
        username: res.username,
        email: res.email,
        screenName: res.screen_name,
        isJoinedCourse: res.joined,
        course: res.joined ? res.courses[0] : [],
      });
    });

    getYearCouseList().then(res => {
      this.setState({ yearCourseList: res });
    });
  }

  public handleClickEdit() {
    this.props.history.push('/profile/edit');
  }

  public handleClickSelectCourse() {
    this.setState({ showSelectPopUp: true });
  }

  public handleCloseSelectCourse() {
    this.setState({ showSelectPopUp: false });
  }

  public handleChangeCourseSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    this.setState({ selectedCourse: parseInt(e.target.value, 10) });
  }

  public handleChangeYearSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const selectedYear = parseInt(e.target.value, 10);
    if (this.state.selectedYear !== selectedYear) {
      this.setState({ selectedYear, selectedCourse: 0 });
    }
  }

  public handleChangePinCode(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ pinCode: e.target.value });
  }

  public handleJoinCourse() {
    joinCourse(this.state.selectedCourse, this.state.pinCode)
      .then(res => {
        this.props.history.push('/');
      })
      .catch(errJson => {
        for (const key in errJson) {
          if (!errJson[key]) {
            continue;
          }
          this.setState({ joinErrMsg: errJson[key] });
        }
      });
  }

  public render(): React.ReactNode {
    const yearCourse: any = this.state.yearCourseList.filter(e => {
      return e.year === this.state.selectedYear;
    })[0];

    return (
      <Grid container={true} justify="center">
        <Grid item={true} xs={12} sm={8} md={7} lg={6} xl={5}>
          <Paper style={{ marginTop: 20, textAlign: 'center' }}>
            <Grid
              container={true}
              // spacing={24}
              justify="center"
              alignItems="center"
              direction="row"
              style={{ padding: '10px 0' }}
            >
              <Grid item={true} xs={7}>
                <Typography style={{ color: '#DDDDDD' }}>ユーザーID</Typography>
                <Typography variant="h6">{this.state.username}</Typography>
              </Grid>
              <Grid item={true} xs={5}>
                <Button variant="contained" color="primary" onClick={this.handleClickEdit}>
                  編集
                </Button>
              </Grid>
            </Grid>

            <Table style={{ minWidth: 300 }}>
              <TableBody>
                <TableRow>
                  <TableCell padding="dense">メール</TableCell>
                  <TableCell>{this.state.email}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell padding="dense">ユーザー名</TableCell>
                  <TableCell>{this.state.screenName}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            {this.state.isJoinedCourse ? (
              <div style={{ marginTop: 20 }}>
                <Grid
                  container={true}
                  spacing={24}
                  justify="center"
                  alignItems="center"
                  direction="row"
                  style={{ padding: '10px 0' }}
                >
                  <Grid item={true} xs={7}>
                    <Typography variant="h6">{this.state.course.name}</Typography>
                  </Grid>
                  <Grid item={true} xs={5}>
                    <Button variant="contained" color="primary" onClick={this.handleClickEdit}>
                      志望変更
                    </Button>
                  </Grid>
                </Grid>
                <Typography>TODO : 研究室志望状況</Typography>
              </div>
            ) : (
              <Button variant="contained" color="primary" style={{ margin: 20 }} onClick={this.handleClickSelectCourse}>
                課程を登録する
              </Button>
            )}
          </Paper>
          <Dialog
            fullWidth={true}
            maxWidth="xs"
            open={this.state.showSelectPopUp}
            onClose={this.handleCloseSelectCourse}
          >
            <DialogTitle>課程選択</DialogTitle>
            <DialogContent>
              <form>
                <FormControl fullWidth={true}>
                  <InputLabel htmlFor="year-select">年度</InputLabel>
                  <Select
                    value={this.state.selectedYear}
                    onChange={this.handleChangeYearSelect}
                    inputProps={{
                      name: 'year',
                      id: 'year-select',
                    }}
                  >
                    <MenuItem key={0} value={0}>
                      <em>-</em>
                    </MenuItem>
                    {this.state.yearCourseList.map((v: any) => (
                      <MenuItem key={v.pk} value={v.year}>
                        {v.year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth={true} style={{ marginTop: 20 }}>
                  <InputLabel htmlFor="course-select">課程</InputLabel>
                  <Select
                    value={this.state.selectedCourse}
                    onChange={this.handleChangeCourseSelect}
                    inputProps={{
                      name: 'course',
                      id: 'course-select',
                    }}
                  >
                    <MenuItem key={0} value={0}>
                      <em>-</em>
                    </MenuItem>
                    {yearCourse
                      ? yearCourse.courses.map((v: any) => (
                          <MenuItem key={v.pk} value={v.pk}>
                            {v.name}
                          </MenuItem>
                        ))
                      : null}
                  </Select>
                </FormControl>
                <Typography variant="caption">
                  新規作成は<Link to={`/course/admin`}>こちら</Link>
                </Typography>
                <FormControl fullWidth={true} style={{ marginTop: 20 }}>
                  <InputLabel htmlFor="pin-password">PINコード入力</InputLabel>
                  <Input
                    id="pin-password"
                    type="password"
                    autoComplete="off"
                    value={this.state.pinCode}
                    onChange={this.handleChangePinCode}
                  />
                </FormControl>
                {this.state.joinErrMsg ? (
                  <FormControl fullWidth={true} style={{ marginTop: 10 }} error={true}>
                    <FormHelperText>{this.state.joinErrMsg}</FormHelperText>
                  </FormControl>
                ) : null}
              </form>
            </DialogContent>
            <DialogActions>
              <Button color="secondary" onClick={this.handleJoinCourse}>
                登録
              </Button>
              <Button onClick={this.handleCloseSelectCourse}>閉じる</Button>
            </DialogActions>
          </Dialog>
        </Grid>
      </Grid>
    );
  }
}

export default withRouter(Profile);
