import { Button, Card, CardContent, Checkbox, FormControl, FormControlLabel, Grid, TextField } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { AuthAction, signup } from '../actions';
import { Auth } from '../store/AuthState';

interface SignupProps {
  signup: (username: string, password: string) => void;
}

interface SignupState {
  username: string;
  password: string;
  confirmPassword: string;
  agreedWithTermsOfService: boolean;
}

class Signup extends React.Component<SignupProps, SignupState> {
  constructor(props: SignupProps) {
    super(props);
    this.state = {
      username: '',
      password: '',
      confirmPassword: '',
      agreedWithTermsOfService: false,
    };

    this.handleSignup = this.handleSignup.bind(this);
  }

  public handleSignup() {
    if (this.state.password !== this.state.confirmPassword) {
      alert('パスワードが一致しません');
      return;
    }
    this.props.signup(this.state.username, this.state.password);
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
                <TextField
                  required={true}
                  label="Confirm Password"
                  type="password"
                  autoComplete="current-password"
                  margin="normal"
                  onChange={e => this.setState({ confirmPassword: e.target.value })}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={this.state.agreedWithTermsOfService}
                      onChange={e => this.setState({ agreedWithTermsOfService: !this.state.agreedWithTermsOfService })}
                      value="AgreedWithTermsOfService"
                    />
                  }
                  label="利用規約に同意する"
                />
                <Button
                  style={{
                    marginTop: 16,
                    marginBottom: 8,
                    boxShadow: 'none',
                  }}
                  variant="contained"
                  color="primary"
                  onClick={this.handleSignup}
                >
                  Sign up
                </Button>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }
}

interface StateFronProps {}

interface DispatchFromProps {
  signup: (username: string, password: string) => void;
}

function mapStateToProps(state: Auth): StateFronProps {
  return {};
}

function mapDispatchToProps(dispatch: Dispatch<AuthAction>): DispatchFromProps {
  return {
    signup: (username: string, password: string) => {
      dispatch(signup(username, password));
    },
  };
}

export default connect<StateFronProps, DispatchFromProps, {}>(
  mapStateToProps,
  mapDispatchToProps
)(Signup);
