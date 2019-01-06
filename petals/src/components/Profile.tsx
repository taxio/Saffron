import { Grid, Paper, Typography } from '@material-ui/core';
import * as React from 'react';
import { getMeInfo } from '../api/users';

interface ProfileProps {}

interface ProfileState {}

class Profile extends React.Component<ProfileProps, ProfileState> {
  constructor(props: ProfileProps) {
    super(props);
  }

  public componentDidMount() {
    getMeInfo()
      .then(res => {
        console.log(res);
      })
      .catch(err => {
        console.log(err);
      });
  }

  public render(): React.ReactNode {
    return (
      <Grid container={true} justify="center">
        <Grid item={true} xs={12} sm={8} md={7} lg={6} xl={5}>
          <Paper style={{ textAlign: 'center', marginTop: 20 }}>
            <Typography variant="h5" style={{ padding: '105px 0 10px 0' }}>
              Profile Page
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

export default Profile;
