import { Typography } from '@material-ui/core';

import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Field, InjectedFormProps, reduxForm, SubmissionError, WrappedFieldProps } from 'redux-form';

interface AdminsProps extends RouteComponentProps {
  coursePk: number;
}

const Admins: React.FC<AdminsProps> = props => {
  return (
    <form style={{ marginTop: 50 }}>
      <Typography variant="h5" style={{ marginBottom: 15 }}>
        管理者一覧
      </Typography>
    </form>
  );
};

export default withRouter(Admins);
