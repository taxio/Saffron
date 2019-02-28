import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { Dispatch } from 'redux';
import { Field, InjectedFormProps, reduxForm, SubmissionError, WrappedFieldProps } from 'redux-form';

import { AuthAction, setLoginState } from '../../actions/auth';
import * as meApi from '../../api/me';
import { logout } from '../../lib/auth';
import { PetalsStore } from '../../store';
import GridPaper from '../Common/GridPaper';

interface FormParams {
  password: string;
}

interface DeleteAccountProps extends RouteComponentProps, InjectedFormProps {
  setLoginState: (isLogin: boolean) => void;
}

const renderPasswordField = (props: WrappedFieldProps) => (
  <FormControl fullWidth={true} error={Boolean(props.meta.error)} style={{ padding: '10px 0px' }}>
    <TextField label="パスワード" margin="normal" type="password" {...props.input} />
    {props.meta.error ? <FormHelperText>{props.meta.error}</FormHelperText> : null}
  </FormControl>
);

const DeleteAccount: React.FC<DeleteAccountProps> = props => {
  const [showDialog, setShowDialog] = React.useState<boolean>(false);

  const deleteAccount = async (values: FormParams) => {
    if (values.password.length === 0) {
      throw new SubmissionError({ password: '入力してください' });
    }
    return meApi
      .deleteMe(values.password)
      .then(() => {
        logout();
        props.setLoginState(false);
        setShowDialog(true);
      })
      .catch((e: Error) => {
        throw new SubmissionError({ _error: 'アカウント削除に失敗しました' });
      });
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    props.history.push('/');
  };

  return (
    <GridPaper>
      <form onSubmit={props.handleSubmit(deleteAccount)}>
        <Typography variant="body1">完全にアカウントを削除します．</Typography>
        <Typography variant="body1">削除後にアカウントを復活させることはできません．</Typography>
        <Field name="password" component={renderPasswordField} />
        <FormControl fullWidth={true} style={{ padding: '10px 0px' }} error={Boolean(props.error)}>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            style={{
              marginTop: 16,
              marginBottom: 8,
              boxShadow: 'none',
            }}
          >
            アカウントを削除
          </Button>
          {props.error ? <FormHelperText>{props.error}</FormHelperText> : null}
        </FormControl>
      </form>

      <Dialog fullWidth={true} maxWidth="xs" open={showDialog} onClose={handleCloseDialog}>
        <DialogTitle>アカウントを削除しました</DialogTitle>
        <DialogActions>
          <Button onClick={handleCloseDialog}>閉じる</Button>
        </DialogActions>
      </Dialog>
    </GridPaper>
  );
};

interface StateFromProps {}

interface DispatchFromProps {
  setLoginState: (isLogin: boolean) => void;
}

const mapStateToProps = (state: PetalsStore): StateFromProps => ({});

const mapDispatchToProps = (dispatch: Dispatch<AuthAction>): DispatchFromProps => ({
  setLoginState: (isLogin: boolean) => {
    dispatch(setLoginState(isLogin));
  },
});

export default reduxForm({
  form: 'deleteAccountForm',
})(
  connect<StateFromProps, DispatchFromProps, {}>(
    mapStateToProps,
    mapDispatchToProps
  )(withRouter(DeleteAccount))
);
