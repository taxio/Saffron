import { Typography } from '@material-ui/core';

import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import GridPaper from '../../Common/GridPaper';
import BasicInformation from './BasicInformation';
import LabList from './LabList';

interface AdminProps extends RouteComponentProps<any> {}

const AdminManager: React.FC<AdminProps> = props => {
  React.useEffect(() => {
    // TODO: 権限判定して403に飛ばす
  }, []);

  return (
    <GridPaper>
      <Typography variant="h4" align="center" style={{ marginBottom: 30 }}>
        課程設定
      </Typography>
      {/*
      // @ts-ignore */}
      <BasicInformation coursePk={props.match.params.coursePk} />
      {/*
      // @ts-ignore */}
      <LabList coursePk={props.match.params.coursePk} />
      <Typography>Admin一覧</Typography>
      <Typography>課程削除</Typography>
    </GridPaper>
  );
};

export default withRouter(AdminManager);
