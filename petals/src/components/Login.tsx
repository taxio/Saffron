import { Button, Card, CardContent, FormControl, Grid, TextField } from '@material-ui/core';
import * as React from 'react';

interface LoginState {
  username: string;
  password: string;
}

export default class Login extends React.Component<{}, LoginState> {
  constructor(props: any) {
    super(props);
    this.state = {
      username: '',
      password: '',
    };

    this.handleLogin.bind(this);
  }

  public handleLogin() {
    console.log(`login ${this.state.username} ${this.state.password}`);
  }

  public render(): React.ReactNode {
    return (
      <Grid container={true} justify="center">
        <Grid item={true} xs={10} sm={8} md={7} lg={6} xl={5}>
          <Card style={{ marginTop: 30, padding: 20 }}>
            <CardContent style={{ textAlign: 'center' }}>
              <FormControl style={{ width: '100%' }}>
                <TextField
                  required={true}
                  label="Username"
                  margin="normal"
                  onChange={e => this.setState({ username: e.target.value })}
                />
                <TextField
                  required={true}
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  margin="normal"
                  onChange={e => this.setState({ password: e.target.value })}
                />
                <Button
                  style={{
                    marginTop: 16,
                    marginBottom: 8,
                    boxShadow: 'none',
                  }}
                  variant="contained"
                  color="primary"
                  onClick={this.handleLogin}
                >
                  Login
                </Button>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }
}
