import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import * as usersApi from '../../api/users';

interface ActivationMatchParams {
  uid: string;
  token: string;
}

interface ActivationProps extends RouteComponentProps<ActivationMatchParams> {}

interface ActivationState {
  isLoading: boolean;
  isActivated: boolean;
  params: ActivationMatchParams;
}

class Activation extends React.Component<ActivationProps, ActivationState> {
  constructor(props: ActivationProps) {
    super(props);

    let params: ActivationMatchParams = { uid: '', token: '' };
    try {
      params = this.parseHashData(this.props.location.hash);
    } catch (e) {
      this.props.history.push('/');
    }

    this.state = {
      isLoading: true,
      isActivated: false,
      params,
    };
  }

  public parseHashData(hashStr: string): ActivationMatchParams {
    const splited = hashStr.split('/');
    if (splited.length !== 3) {
      throw new Error('not correct location.hash');
    }

    return {
      uid: splited[1],
      token: splited[2],
    };
  }

  public componentDidMount() {
    if (!this.state.isLoading) {
      return;
    }

    usersApi
      .activate(this.state.params.uid, this.state.params.token)
      .then(() => {
        this.setState({ isLoading: false, isActivated: true });
      })
      .catch(e => {
        this.setState({ isLoading: false, isActivated: false });
      });
  }

  public render(): React.ReactNode {
    if (this.state.isLoading) {
      return (
        <Grid container={true} justify="center">
          <Grid item={true} xs={10} sm={8} md={7} lg={6} xl={5}>
            <Paper style={{ textAlign: 'center', margin: 30, height: '300px' }}>
              <div>
                <Typography variant="h6" style={{ padding: '100px 0 10px 0' }}>
                  アカウント有効化中です
                </Typography>
                <CircularProgress color="secondary" />
              </div>
            </Paper>
          </Grid>
        </Grid>
      );
    }

    return (
      <Grid container={true} justify="center">
        <Grid item={true} xs={10} sm={8} md={7} lg={6} xl={5}>
          <Paper style={{ textAlign: 'center', margin: 30, height: '300px' }}>
            <Typography variant="h5" style={{ padding: '105px 0 10px 0' }}>
              {this.state.isActivated ? <p>アカウントを有効化しました</p> : <p>アカウントの有効化に失敗しました</p>}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

export default withRouter(Activation);
