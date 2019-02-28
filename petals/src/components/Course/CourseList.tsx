import { Typography } from '@material-ui/core';

import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { Dispatch } from 'redux';
// import { Field, InjectedFormProps, reduxForm, SubmissionError, WrappedFieldProps } from 'redux-form';

import { UserAction, userFetchRequest } from '../../actions/user';
import * as model from '../../model';
import { PetalsStore } from '../../store';
import GridPaper from '../Common/GridPaper';

interface CourseListProps extends RouteComponentProps {
  fetchUserInfo: () => void;
}

const CourseList: React.FC<CourseListProps> = props => {
  return (
    <GridPaper>
      <Typography variant="h4" align="center">
        課程一覧
      </Typography>
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
