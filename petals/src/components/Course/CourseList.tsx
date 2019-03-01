import { Button, Divider, List, ListItem, ListItemIcon, ListItemText, Typography } from '@material-ui/core';
import BarChart from '@material-ui/icons/BarChart';
import Person from '@material-ui/icons/Person';

import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { Dispatch } from 'redux';
// import { Field, InjectedFormProps, reduxForm, SubmissionError, WrappedFieldProps } from 'redux-form';

import { UserAction, userFetchRequest } from '../../actions/user';
import * as model from '../../model';
import { PetalsStore } from '../../store';
import GridPaper from '../Common/GridPaper';

import * as yearApi from '../../api/years';

interface CourseListProps extends RouteComponentProps {
  fetchUserInfo: () => void;
}

const CourseList: React.FC<CourseListProps> = props => {
  const [years, setYears] = React.useState<model.Year[]>([]);

  React.useEffect(() => {
    yearApi
      .getYears()
      .then((res: model.Year[]) => {
        setYears(res);
      })
      .catch((e: Error) => {
        console.log(e);
      });
  }, []);

  return (
    <GridPaper>
      <Typography variant="h4" align="center">
        課程一覧
      </Typography>

      {/* TODO: 検索機能 */}

      {years.map((year: model.Year, yearIdx: number) => (
        <div key={yearIdx} style={{ marginTop: 20 }}>
          <Typography variant="h5">{year.year}年度</Typography>
          <List>
            {year.courses.map((course: model.Course, idx: number) => (
              <ListItem key={idx} button={true} onClick={() => props.history.push(`/courses/${course.pk}`)}>
                <ListItemIcon>
                  <Person color={course.config.show_username ? 'primary' : 'disabled'} />
                </ListItemIcon>
                <ListItemIcon>
                  <BarChart color={course.config.show_gpa ? 'primary' : 'disabled'} />
                </ListItemIcon>
                <ListItemText primary={course.name} />
              </ListItem>
            ))}
          </List>
          <Divider />
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
}

const mapStateToProps = (state: PetalsStore): StateFromProps => {
  return {
    user: state.user.user,
    isFetching: state.user.isFetching,
    fetchError: state.user.error,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<UserAction>): DispatchFromProps => {
  return {
    fetchUserInfo: () => {
      dispatch(userFetchRequest());
    },
  };
};

export default connect<StateFromProps, DispatchFromProps, {}>(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(CourseList));
