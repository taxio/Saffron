import {
  Button,
  FormControl,
  Grid,
  Input,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from '@material-ui/core';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { editMeInfo, getMeInfo } from '../api/users';

interface ProfileProps extends RouteComponentProps {}

interface ProfileState {
  username: string;
  email: string;
  screenName: string;
  gpa: number | null;
}

class ProfileEdit extends React.Component<ProfileProps, ProfileState> {
  constructor(props: ProfileProps) {
    super(props);

    this.state = {
      username: '',
      email: '',
      screenName: '',
      gpa: null,
    };

    this.handleChangeScreenName = this.handleChangeScreenName.bind(this);
    this.handleClickSave = this.handleClickSave.bind(this);
  }

  public componentDidMount() {
    getMeInfo().then(res => {
      this.setState({
        username: res.username,
        email: res.email,
        screenName: res.screen_name,
        gpa: res.gpa,
      });
    });
  }

  public handleChangeScreenName(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ screenName: e.target.value });
  }

  public handleClickSave() {
    editMeInfo(this.state.screenName, this.state.gpa).then(success => {
      if (!success) {
        return;
      }
      this.props.history.push('/profile');
    });
  }

  public handleKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.which === 13) {
      e.preventDefault();
    }
  }

  public render(): React.ReactNode {
    return (
      <Grid container={true} justify="center">
        <Grid item={true} xs={12} sm={8} md={7} lg={6} xl={5}>
          <Paper style={{ marginTop: 20, textAlign: 'center' }}>
            <form>
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
                  <Button variant="contained" color="primary" onClick={this.handleClickSave}>
                    保存
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
                    <TableCell>
                      <FormControl>
                        <Input
                          value={this.state.screenName}
                          disableUnderline={true}
                          style={{ border: '1px #DDDDDD solid', borderRadius: '4px', padding: '5px 10px' }}
                          onChange={this.handleChangeScreenName}
                          onKeyPress={this.handleKeyPress}
                        />
                      </FormControl>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <Button variant="contained" color="primary" style={{ margin: 20 }}>
                パスワードを変更する
              </Button>
            </form>
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

export default withRouter(ProfileEdit);
