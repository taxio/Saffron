import { Typography } from '@material-ui/core';
import * as React from 'react';

import * as api from '../../../api';
import * as model from '../../../model';

interface LabListProps {
  coursePk: number;
}

const LabList: React.FC<LabListProps> = props => {
  const [labs, setLabs] = React.useState<model.Lab[]>([]);

  React.useEffect(() => {
    api.courses
      .getLabs(props.coursePk)
      .then(res => {
        console.log(res);
        setLabs(res);
      })
      .catch((err: Error) => {
        console.log(err);
      });
  }, []);

  return (
    <>
      <Typography variant="h4">研究室一覧</Typography>
      {labs.map((lab: model.Lab, idx: number) => {
        if (idx > 10) {
          return null;
        }
        return (
          <p key={idx}>
            {lab.name} {lab.capacity}
          </p>
        );
      })}
    </>
  );
};

export default LabList;
