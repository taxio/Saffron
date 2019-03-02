import {
  Button,
  DialogActions,
  DialogTitle,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import Add from '@material-ui/icons/Add';
import Delete from '@material-ui/icons/Delete';

import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Field, FormAction, InjectedFormProps, reduxForm, reset, SubmissionError, WrappedFieldProps } from 'redux-form';

import * as api from '../../../api';
import * as model from '../../../model';
import { PetalsStore } from '../../../store';
import GridDialog from '../../Common/GridDialog';

const LabRow: React.FC<{ lab: model.Lab; onDelete: () => void }> = props => (
  <TableRow>
    <TableCell padding="dense">{props.lab.name}</TableCell>
    <TableCell style={{ padding: '4px 0' }}>{props.lab.capacity}</TableCell>
    <TableCell padding="none" style={{ textAlign: 'center' }}>
      <IconButton>
        <Delete onClick={props.onDelete} />
      </IconButton>
    </TableCell>
  </TableRow>
);

const renderLabNameField = (props: WrappedFieldProps) => (
  <FormControl fullWidth={true} error={Boolean(props.meta.error)}>
    <Input {...props.input} />
  </FormControl>
);

const renderLabCapacityField = (props: WrappedFieldProps) => (
  <FormControl error={Boolean(props.meta.error)}>
    <Input {...props.input} />
  </FormControl>
);

interface FormParams {
  name: string;
  capacity: string;
}

interface LabListProps extends InjectedFormProps {
  coursePk: number;
  resetForm: () => void;
}

const LabList: React.FC<LabListProps> = props => {
  const [labs, setLabs] = React.useState<model.Lab[]>([]);
  const [deleteLab, setDeleteLab] = React.useState<model.Lab | null>(null);
  const [errMsgs, setErrMsgs] = React.useState<any>({});

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
  }, [labs.length]);

  const displayDeleteDialog = (lab: model.Lab) => () => {
    setDeleteLab(lab);
  };

  const handleDeleteLab = () => {
    if (!deleteLab) {
      return;
    }
    api.courses.deleteLab(props.coursePk, deleteLab.pk).then(() => {
      setLabs(prevState => prevState.filter(lab => lab.pk !== deleteLab.pk));
      setDeleteLab(null);
    });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteLab(null);
  };

  const addLab = (values: FormParams) => {
    const errors: any = {};
    if (!values.name) {
      errors.name = '研究室名を入力してください';
    }
    if (
      labs.find((lab: model.Lab) => {
        return lab.name === values.name;
      })
    ) {
      errors.name = '同名の研究室が既に存在しています';
    }
    if (!values.capacity) {
      errors.capacity = '募集人数を入力してください';
    }
    const capacityInt = parseInt(values.capacity, 10);
    if (isNaN(capacityInt)) {
      errors.capacity = '募集人数は半角数字で入力してください';
    } else if (capacityInt < 0) {
      errors.capacity = '募集人数は0人以上にしてください';
    }
    if (Object.keys(errors).length) {
      setErrMsgs(errors);
      throw new SubmissionError(errors);
    }

    return api.courses
      .postLab(props.coursePk, values.name, capacityInt)
      .then(() => {
        setLabs(prevState => [...prevState, { name: values.name, capacity: capacityInt, pk: -1, rank_set: [] }]);
        props.resetForm();
      })
      .catch((err: Error) => {
        console.log(err);
      });
  };

  return (
    <form onSubmit={props.handleSubmit(addLab)} style={{ marginTop: 50 }}>
      <Typography variant="h5">研究室一覧</Typography>
      <Table style={{ minWidth: 260, tableLayout: 'auto' }}>
        <TableHead>
          <TableRow>
            <TableCell padding="dense" style={{ width: '60%' }}>
              研究室名
            </TableCell>
            <TableCell style={{ width: '20%', padding: '4px 0' }}>募集人数</TableCell>
            <TableCell padding="none" style={{ width: '20%' }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {/*
          // @ts-ignore */}
          {labs.map((lab: model.Lab, idx: number) => (
            <LabRow key={idx} lab={lab} onDelete={displayDeleteDialog(lab)} />
          ))}
          <TableRow>
            <TableCell padding="dense">
              <Field name="name" component={renderLabNameField} />
            </TableCell>
            <TableCell style={{ padding: '4px 0' }}>
              <Field name="capacity" component={renderLabCapacityField} />
            </TableCell>
            <TableCell padding="none" style={{ textAlign: 'center' }}>
              <IconButton type="submit">
                <Add />
              </IconButton>
            </TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          {Object.keys(errMsgs).map((objKey: string, idx: number) => (
            <TableRow style={{ height: 35 }}>
              <TableCell colSpan={3} align="right" style={{ paddingBottom: 0 }}>
                <FormLabel error={true} key={idx}>
                  {errMsgs[objKey]}
                </FormLabel>
              </TableCell>
            </TableRow>
          ))}
        </TableFooter>
      </Table>

      <GridDialog open={Boolean(deleteLab)} onClose={handleCloseDeleteDialog}>
        <DialogTitle>{deleteLab ? deleteLab.name : null}を削除しますか？</DialogTitle>
        <DialogActions>
          <Button onClick={handleDeleteLab}>はい</Button>
          <Button onClick={handleCloseDeleteDialog}>いいえ</Button>
        </DialogActions>
      </GridDialog>
    </form>
  );
};

interface StateFromProps {}

interface DispatchFromProps {
  resetForm: () => void;
}

const mapStateToProps = (state: PetalsStore): StateFromProps => ({});

const mapDispatchToProps = (dispatch: Dispatch<FormAction>): DispatchFromProps => ({
  resetForm: () => {
    dispatch(reset('adminLabListForm'));
  },
});

export default reduxForm({ form: 'adminLabListForm' })(
  connect<StateFromProps, DispatchFromProps, {}>(
    mapStateToProps,
    mapDispatchToProps
  )(LabList)
);
