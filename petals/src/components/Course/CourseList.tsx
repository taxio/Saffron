import { List, ListItem, Typography } from '@material-ui/core';

import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { Dispatch } from 'redux';
// import { Field, InjectedFormProps, reduxForm, SubmissionError, WrappedFieldProps } from 'redux-form';

import { UserAction, userFetchRequest } from '../../actions/user';
import * as model from '../../model';
import { PetalsStore } from '../../store';
import GridPaper from '../Common/GridPaper';

import * as courseApi from '../../api/courses';

interface CourseListProps extends RouteComponentProps {
  fetchUserInfo: () => void;
}

const CourseList: React.FC<CourseListProps> = props => {
  const [courses, setCourses] = React.useState<model.Course[]>([]);

  React.useEffect(() => {
    courseApi
      .getCourses()
      .then((res: model.Course[]) => {
        setCourses(res);
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

      <List>
        {courses.map((course: model.Course, idx: number) => (
          <ListItem key={idx} button={true} onClick={() => props.history.push(`/courses/${course.pk}`)}>
            {`${course.year}年度　 ${course.name}`}
          </ListItem>
        ))}
      </List>
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
