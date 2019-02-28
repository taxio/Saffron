import { Typography } from '@material-ui/core';
import * as React from 'react';

import GridPaper from './Common/GridPaper';

const Settings: React.FC = props => {
  return (
    <GridPaper>
      <Typography variant="h4" align="center">
        設定
      </Typography>
    </GridPaper>
  );
};

export default Settings;
