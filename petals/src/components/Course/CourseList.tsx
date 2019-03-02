import {
  Button,
  DialogActions,
  DialogTitle,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  FormControl,
  FormHelperText,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
} from '@material-ui/core';
import BarChart from '@material-ui/icons/BarChart';
import Person from '@material-ui/icons/Person';

import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { Dispatch } from 'redux';

import { UserAction, userFetchRequest } from '../../actions/user';
import * as model from '../../model';
import { PetalsStore } from '../../store';
import GridPaper from '../Common/GridPaper';

import { NotificationAction, setMessage } from '../../actions/notification';
import * as api from '../../api';
import GridDialog from '../Common/GridDialog';

const getCourseDescription = (config: model.CourseConfig): string => {
  if (config.show_gpa && config.show_username) {
    return 'この課程では表示名とGPAが使用されます';
  }
  if (config.show_username) {
    return 'この課程では表示名が使用されます';
  }
  if (config.show_gpa) {
    return 'この課程ではGPAが使用されます';
  }
  return 'この課程では表示名もGPAも使用されません';
};

interface CourseListProps extends RouteComponentProps {
  fetchUserInfo: () => void;
  setNotificationMessage: (message: string) => void;
}

const CourseList: React.FC<CourseListProps> = props => {
  const [years, setYears] = React.useState<model.Year[]>([]);
  const [joinCoursePk, setJoinCoursePk] = React.useState<number>(0);
  const [pinCode, setPinCode] = React.useState<string>('');
  const [errMsg, setErrMsg] = React.useState<{ pinCode: string; _error: string }>({ pinCode: '', _error: '' });
  const [showDialog, setShowDialog] = React.useState<boolean>(false);

  React.useEffect(() => {
    api.years
      .getYears()
      .then((res: model.Year[]) => {
        // sort by bigger
        setYears(
          res.sort((a: model.Year, b: model.Year) => {
            if (a.year > b.year) {
              return -1;
            }
            return 1;
          })
        );
      })
      .catch((err: Error) => {
        switch (err.constructor) {
          case api.errors.UnAuthorizedError:
            props.setNotificationMessage('ログインしてください');
            props.history.push('/login');
            return;
          default:
            return;
        }
      });
  }, []);

  const joinCourse = (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();
    if (!pinCode) {
      setErrMsg({ pinCode: '入力してください', _error: '' });
      return;
    }
    return api.courses
      .join(joinCoursePk, pinCode)
      .then(() => {
        setShowDialog(true);
      })
      .catch((err: Error) => {
        switch (err.constructor) {
          case api.errors.BadRequestError:
            setErrMsg({ pinCode: '', _error: 'PINコードが間違っています' });
            return;
          case api.errors.UnAuthorizedError:
            props.setNotificationMessage('ログインしてください');
            props.history.push('/login');
            return;
          default:
            setErrMsg({ pinCode: '', _error: '未知のエラーです' });
        }
      });
  };

  const onChangeExpansion = (coursePk: number) => () => {
    setErrMsg({ pinCode: '', _error: '' });
    setPinCode('');
    setJoinCoursePk(prevState => (prevState === coursePk ? 0 : coursePk));
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    props.fetchUserInfo();
    props.history.push(`/courses/${joinCoursePk}/hopes`);
  };

  return (
    <GridPaper>
      <Typography variant="h4" align="center">
        課程一覧
      </Typography>

      {years.map((year: model.Year, yearIdx: number) => (
        <div key={yearIdx} style={{ marginTop: 30 }}>
          <Typography variant="h5" style={{ marginBottom: 10 }}>
            {year.year}年度
          </Typography>
          {year.courses.map((course: model.Course, courseIdx: number) => (
            <ExpansionPanel
              key={courseIdx}
              expanded={joinCoursePk === course.pk}
              onChange={onChangeExpansion(course.pk)}
              style={{
                boxShadow: 'none',
                border: '1px solid rgba(0,0,0,.125)',
                marginBottom: joinCoursePk === course.pk ? 16 : -1,
              }}
            >
              <ExpansionPanelSummary style={{ paddingRight: 10, paddingLeft: 10 }}>
                <ListItem style={{ padding: 0 }}>
                  <ListItemIcon>
                    <Person color={course.config.show_username ? 'primary' : 'disabled'} />
                  </ListItemIcon>
                  <ListItemIcon>
                    <BarChart color={course.config.show_gpa ? 'primary' : 'disabled'} />
                  </ListItemIcon>
                  <ListItemText primary={course.name} />
                </ListItem>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <form onSubmit={joinCourse} style={{ width: '100%' }}>
                  <Typography>{getCourseDescription(course.config)}</Typography>
                  <FormControl fullWidth={true} error={Boolean(errMsg.pinCode)} style={{ padding: '10px 0px' }}>
                    <TextField
                      label="PINコード"
                      margin="normal"
                      autoComplete="off"
                      type="password"
                      value={pinCode}
                      onChange={e => setPinCode(e.target.value)}
                    />
                    {errMsg.pinCode ? <FormHelperText>{errMsg.pinCode}</FormHelperText> : null}
                  </FormControl>
                  <FormControl fullWidth={true} error={Boolean(errMsg._error)}>
                    <Button variant="contained" color="primary" type="submit">
                      参加
                    </Button>
                    {errMsg._error ? <FormHelperText>{errMsg._error}</FormHelperText> : null}
                  </FormControl>
                </form>
              </ExpansionPanelDetails>
            </ExpansionPanel>
          ))}
        </div>
      ))}

      <Button
        variant="contained"
        color="primary"
        style={{ width: '100%', marginTop: 30 }}
        onClick={() => props.history.push('/courses/create')}
      >
        課程新規作成
      </Button>

      <GridDialog maxWidth="xs" open={showDialog} onClose={handleCloseDialog}>
        <DialogTitle>参加しました</DialogTitle>
        <DialogActions>
          <Button onClick={handleCloseDialog}>希望提出へ</Button>
        </DialogActions>
      </GridDialog>
    </GridPaper>
  );
};

interface StateFromProps {
  user: model.User | null;
  isFetching: boolean;
  fetchError: Error | null;
}

interface DispatchFromProps {
  fetchUserInfo: () => void;
  setNotificationMessage: (message: string) => void;
}

const mapStateToProps = (state: PetalsStore): StateFromProps => {
  return {
    user: state.user.user,
    isFetching: state.user.isFetching,
    fetchError: state.user.error,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<UserAction | NotificationAction>): DispatchFromProps => {
  return {
    fetchUserInfo: () => {
      dispatch(userFetchRequest());
    },
    setNotificationMessage: (message: string) => {
      dispatch(setMessage(message));
    },
  };
};

export default connect<StateFromProps, DispatchFromProps, {}>(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(CourseList));
