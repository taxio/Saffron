import { Button, Card, CardContent, FormControl, FormHelperText, Grid, Input, InputLabel } from '@material-ui/core';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';

interface PasswordResetProps extends RouteComponentProps<any> {}

interface PasswordResetState {
  username: string;
  passwordResetErrMsg: string;
}

class PasswordReset extends React.Component<PasswordResetProps, PasswordResetState> {
  constructor(props: PasswordResetProps) {
    super(props);
    this.state = {
      username: '',
      passwordResetErrMsg: '',
    };

    this.handleChangeUsername = this.handleChangeUsername.bind(this);
    this.handleClickPasswordReset = this.handleClickPasswordReset.bind(this);
  }

  public handleChangeUsername(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ username: e.target.value });
  }

  public handleClickPasswordReset() {
    this.props.history.push('/auth/sentmail');
  }

  public render(): React.ReactNode {
    const formControlStyle = { padding: '10px 0px' };

    return (
      <Grid container={true} justify="center">
        <Grid item={true} xs={10} sm={8} md={7} lg={6} xl={5}>
          <Card style={{ marginTop: 30, padding: 20 }}>
            <CardContent style={{ textAlign: 'center' }}>
              <form>
                <FormControl fullWidth={true} error={Boolean(this.state.passwordResetErrMsg)}>
                  <InputLabel htmlFor="username">ユーザー名</InputLabel>
                  <Input id="username" value={this.state.username} onChange={this.handleChangeUsername} />
                  {this.state.passwordResetErrMsg ? (
                    <FormHelperText>bまたはm,dで始まる8文字の大学ユーザー名を入力してください</FormHelperText>
                  ) : null}
                </FormControl>

                <FormControl fullWidth={true} style={formControlStyle} error={Boolean(this.state.passwordResetErrMsg)}>
                  {this.state.passwordResetErrMsg ? (
                    <FormHelperText>{this.state.passwordResetErrMsg}</FormHelperText>
                  ) : null}
                  <Button
                    style={{
                      marginTop: 16,
                      marginBottom: 8,
                      boxShadow: 'none',
                    }}
                    variant="contained"
                    color="primary"
                    onClick={this.handleClickPasswordReset}
                  >
                    パスワードリセットのメールを送る
                  </Button>
                </FormControl>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }
}

export default PasswordReset;
