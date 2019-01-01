import { CircularProgress, Grid, Paper, Typography } from '@material-ui/core';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { activateUser } from '../../api/users';

interface ActivationMatchParams {
  uid: string;
  token: string;
}

interface ActivationProps extends RouteComponentProps<ActivationMatchParams> {}

interface ActivationState {
  isLoading: boolean;
  isActivated: boolean;
}

class Activation extends React.Component<ActivationProps, ActivationState> {
  constructor(props: ActivationProps) {
    super(props);
    this.state = {
      isLoading: true,
      isActivated: false,
    };
  }

  public componentDidMount() {
    const params = this.props.match.params;
    activateUser(params.uid, params.token).then(success => {
      this.setState({ isLoading: false, isActivated: success });
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
