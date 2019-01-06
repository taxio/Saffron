import { Button, Grid, Paper, Table, TableBody, TableCell, TableRow, Typography } from '@material-ui/core';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { getMeInfo } from '../api/users';
import CourseSelectPopUp from './CourseSelectPopUp';

interface ProfileProps extends RouteComponentProps {}

interface ProfileState {
  username: string;
  email: string;
  screenName: string;
  isJoinedCourse: boolean;
  cource: any;
  showSelectPopUp: boolean;
}

class Profile extends React.Component<ProfileProps, ProfileState> {
  constructor(props: ProfileProps) {
    super(props);

    this.state = {
      username: '',
      email: '',
      screenName: '',
      isJoinedCourse: false,
      cource: {},
      showSelectPopUp: false,
    };

    this.handleClickEdit = this.handleClickEdit.bind(this);
    this.handleClickSelectCourse = this.handleClickSelectCourse.bind(this);
    this.handleCloseSelectCourse = this.handleCloseSelectCourse.bind(this);
  }

  public componentDidMount() {
    getMeInfo().then(res => {
      this.setState({
        username: res.username,
        email: res.email,
        screenName: res.screen_name,
        isJoinedCourse: res.joined,
        cource: res.courses[0],
      });
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

  public render(): React.ReactNode {
    return (
      <Grid container={true} justify="center">
        <Grid item={true} xs={12} sm={8} md={7} lg={6} xl={5}>
          <Paper style={{ marginTop: 20, textAlign: 'center' }}>
            <Grid
              container={true}
              spacing={24}
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
                  プロフィール変更
                </Button>
              </Grid>
            </Grid>

            <Table>
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
                    <Typography variant="h6">{this.state.cource.name}</Typography>
                  </Grid>
                  <Grid item={true} xs={5}>
                    <Button variant="contained" color="primary" onClick={this.handleClickEdit}>
                      志望状況変更
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
          {this.state.showSelectPopUp ? <CourseSelectPopUp onClose={this.handleCloseSelectCourse} /> : null}
        </Grid>
      </Grid>
    );
  }
}

export default withRouter(Profile);
