import { InputLabel, Select } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { Field, InjectedFormProps, reduxForm, SubmissionError, WrappedFieldProps } from 'redux-form';

import * as api from '../../api';
import * as AppErr from '../../api/AppErrors';
import { getConfig, getLabs, getRanks, postRanks } from '../../api/courses';
import { getMe } from '../../api/me';
import { Lab } from '../../model';
import GridPaper from '../Common/GridPaper';

interface FormParams {
  gpa: number;
  screenName: string;
  lab1: number;
  lab2: number;
  lab3: number;
}

interface HopeLabsProps extends RouteComponentProps<any>, InjectedFormProps {}

interface HopeLabsState {
  labs: Lab[];
  showGpaField: boolean;
  showScreenNameField: boolean;
  showDialog: boolean;
}

class HopeLabs extends React.Component<HopeLabsProps, HopeLabsState> {
  constructor(props: HopeLabsProps) {
    super(props);
    this.state = {
      labs: [],
      showGpaField: false,
      showScreenNameField: false,
      showDialog: false,
    };
  }

  public componentDidMount() {
    const coursePk = this.props.match.params.coursePk;

    return api.courses
      .getLabs(coursePk)
      .then((labs: Lab[]) => {
        this.setState({ labs });
      })
      .then(
        api.courses.getConfig(coursePk).then(res => {
          this.setState({ showGpaField: res.show_gpa, showScreenNameField: res.show_username });
        })
      )
      .then(
        api.courses.getRanks(coursePk).then(res => {
          this.props.initialize({ lab1: res[0].pk, lab2: res[1].pk, lab3: res[2].pk });
        })
      )
      .then(
        api.me.getMe().then(res => {
          if (res.gpa) {
            this.props.initialize({ gpa: res.gpa });
          }
          if (res.screen_name) {
            this.props.initialize({ screenName: res.screen_name });
          }
        })
      )
      .catch((e: Error) => {
        switch (e.constructor) {
          case AppErr.UnAuthorizedError:
            this.props.history.push('/login/');
            throw new SubmissionError({ _error: 'ログインセッションが切れました' });
          case AppErr.BadRequestError:
            // TODO: レスポンス中のエラーの表示
            throw new SubmissionError({ _error: '研究室希望提出に失敗しました' });
          case AppErr.UnhandledError:
            throw new SubmissionError({ _error: '研究室希望提出に失敗しました' });
          default:
            throw new SubmissionError({ _error: '未知のエラーです' });
        }
      });
  }

  public handleHopeLabs = (values: FormParams) => {
    let errMsg = '';
    let gpaErrMsg = '';
    let lab1ErrMsg = '';
    let lab2ErrMsg = '';
    let lab3ErrMsg = '';
    if (!values.gpa) {
      gpaErrMsg = 'GPAを入力してください';
      errMsg = '未入力または未選択項目があります';
    }
    if (values.gpa < 0 || values.gpa > 4) {
      gpaErrMsg = 'GPAは0以上4以下の実数です';
      errMsg = '入力に誤りがあります';
    }
    if (values.lab1 === values.lab2) {
      lab1ErrMsg = '第一希望研究室と第二希望研究室が同じです';
      lab2ErrMsg = '第一希望研究室と第二希望研究室が同じです';
      errMsg = '選択に誤りがあります';
    }
    if (values.lab1 === values.lab3) {
      lab1ErrMsg = '第一希望研究室と第三希望研究室が同じです';
      lab3ErrMsg = '第一希望研究室と第三希望研究室が同じです';
      errMsg = '選択に誤りがあります';
    }
    if (values.lab2 === values.lab3) {
      lab2ErrMsg = '第二希望研究室と第三希望研究室が同じです';
      lab3ErrMsg = '第二希望研究室と第三希望研究室が同じです';
      errMsg = '選択に誤りがあります';
    }
    if (values.lab1 === values.lab2 && values.lab2 === values.lab3) {
      lab1ErrMsg = '第一希望研究室と第二希望研究室と第三希望研究室が同じです';
      lab2ErrMsg = '第一希望研究室と第二希望研究室と第三希望研究室が同じです';
      lab3ErrMsg = '第一希望研究室と第二希望研究室と第三希望研究室が同じです';
      errMsg = '選択に誤りがあります';
    }
    if (!values.lab1) {
      lab1ErrMsg = '第一希望研究室を選択してください';
      errMsg = '未入力または未選択項目があります';
    }
    if (!values.lab2) {
      lab2ErrMsg = '第二希望研究室を選択してください';
      errMsg = '未入力または未選択項目があります';
    }
    if (!values.lab3) {
      lab3ErrMsg = '第三希望研究室を選択してください';
      errMsg = '未入力または未選択項目があります';
    }
    if (gpaErrMsg || lab1ErrMsg || lab2ErrMsg || lab3ErrMsg) {
      throw new SubmissionError({
        gpa: gpaErrMsg,
        lab1: lab1ErrMsg,
        lab2: lab2ErrMsg,
        lab3: lab3ErrMsg,
        _error: errMsg,
      });
    }

    // function proimisePostRanks(coursePk: number, labPks: number[]) {
    //   return new Promise(() => {
    //     postRanks(coursePk, labPks);
    //   });
    // }

    return api.me
      .patchMeNullIgnore(values.screenName, values.gpa)
      .then(() => api.courses.postRanks(this.props.match.params.coursePk, [values.lab1, values.lab2, values.lab3]))
      .then(() => {
        this.setState({ showDialog: true });
      })
      .catch((e: Error) => {
        switch (e.constructor) {
          case AppErr.UnAuthorizedError:
            this.props.history.push('/login/');
            throw new SubmissionError({ _error: 'ログインセッションが切れました' });
          case AppErr.BadRequestError:
            // TODO: レスポンス中のエラーの表示
            throw new SubmissionError({ _error: '研究室希望提出に失敗しました' });
          case AppErr.UnhandledError:
            throw new SubmissionError({ _error: '研究室希望提出に失敗しました' });
          default:
            throw new SubmissionError({ _error: '未知のエラーです' });
        }
      });

    // var promise = Promise.resolve();
    // return promise
    //   .then(() => proimisePostRanks(this.props.match.params.coursePk, [values.lab1, values.lab2, values.lab3]))
    //   .then(() => {
    //     this.setState({ showDialog: true });
    //   })
    //   .catch((e: Error) => {
    //     switch (e.constructor) {
    //       case AppErr.UnAuthorizedError:
    //         this.props.history.push('/login/');
    //         throw new SubmissionError({ _error: 'ログインセッションが切れました' });
    //       case AppErr.BadRequestError:
    //         // TODO: レスポンス中のエラーの表示
    //         throw new SubmissionError({ _error: '研究室希望提出に失敗しました' });
    //       case AppErr.UnhandledError:
    //         throw new SubmissionError({ _error: '研究室希望提出に失敗しました' });
    //       default:
    //         throw new SubmissionError({ _error: '未知のエラーです' });
    //     }
    //   });
  };

  public handleCloseDialog = () => {
    this.props.history.push(`/courses/${this.props.match.params.coursePk}`);
  };

  public renderGpaField = (props: WrappedFieldProps & { label: string; type: string; style: any }) => (
    <FormControl
      fullWidth={true}
      error={Boolean(props.meta.error)}
      style={{ display: this.state.showGpaField ? '' : 'none', margin: '5%', width: '160px' }}
    >
      <TextField
        label={props.label}
        margin="normal"
        inputProps={{ style: { textAlign: 'center' } }}
        autoComplete="off"
        type={props.type}
        {...props.input}
      />
      {props.meta.error ? <FormHelperText>{props.meta.error}</FormHelperText> : null}
    </FormControl>
  );

  public renderScreenNameField = (props: WrappedFieldProps & { label: string; type: string; style: any }) => (
    <FormControl
      fullWidth={true}
      error={Boolean(props.meta.error)}
      style={{ display: this.state.showScreenNameField ? '' : 'none', margin: '5%', width: '160px' }}
    >
      <TextField
        label={props.label}
        margin="normal"
        inputProps={{ style: { textAlign: 'center' } }}
        autoComplete="off"
        type={props.type}
        {...props.input}
      />
      {props.meta.error ? <FormHelperText>{props.meta.error}</FormHelperText> : null}
    </FormControl>
  );

  public renderLabSelectField = (props: WrappedFieldProps & { label: string }) => (
    <FormControl style={{ margin: '5%', width: '90%' }} error={Boolean(props.meta.error)}>
      <InputLabel htmlFor="course-year">{props.label}</InputLabel>
      <Select {...props.input}>
        <MenuItem key={0} value={0}>
          <em>-</em>
        </MenuItem>
        {this.state.labs.map((lab: Lab, idx: number) => (
          <MenuItem key={idx + 1} value={lab.pk}>
            {lab.name}
          </MenuItem>
        ))}
      </Select>
      {props.meta.error ? <FormHelperText>{props.meta.error}</FormHelperText> : null}
    </FormControl>
  );

  public render(): React.ReactNode {
    const { error, handleSubmit } = this.props;

    return (
      <GridPaper>
        <Typography component="h1" variant="h5" align="center">
          研究室希望提出
        </Typography>
        <form onSubmit={handleSubmit(this.handleHopeLabs)} autoComplete="off">
          {this.state.showGpaField ? (
            <Field name="gpa" label="GPA" type="number" component={this.renderGpaField} />
          ) : null}

          {this.state.showScreenNameField ? (
            <Field name="screenName" label="表示名" type="text" component={this.renderScreenNameField} />
          ) : null}

          <Field name="lab1" label="第一希望" component={this.renderLabSelectField} />
          <Field name="lab2" label="第二希望" component={this.renderLabSelectField} />
          <Field name="lab3" label="第三希望" component={this.renderLabSelectField} />
          <FormControl fullWidth={true} error={Boolean(error)}>
            <Button
              type="submit"
              color="primary"
              variant="contained"
              style={{ margin: '10%', marginLeft: '20%', marginRight: '20%', width: '60%', boxShadow: 'none' }}
            >
              Submit
            </Button>
            {error ? <FormHelperText>{error}</FormHelperText> : null}
          </FormControl>
        </form>
        <Dialog fullWidth={true} maxWidth="xs" open={this.state.showDialog} onClose={this.handleCloseDialog}>
          <DialogTitle>研究室希望を提出しました</DialogTitle>
          <DialogActions>
            <Button onClick={this.handleCloseDialog}>閉じる</Button>
          </DialogActions>
        </Dialog>
      </GridPaper>
    );
  }
}

export default reduxForm({
  form: 'hopeLabsForm',
})(HopeLabs);
