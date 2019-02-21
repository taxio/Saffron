import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableFooter from '@material-ui/core/TableFooter';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

import Add from '@material-ui/icons/Add';
import Delete from '@material-ui/icons/Delete';

import * as React from 'react';
import { FieldArray, InjectedFormProps, reduxForm, WrappedFieldArrayProps } from 'redux-form';

import { LabParams } from './CourseCreateManager';

const LabRow = (props: LabParams & { onDelete: () => void }) => {
  return (
    <TableRow>
      <TableCell padding="dense">{props.name}</TableCell>
      <TableCell style={{ padding: '4px 0' }}>{props.capacity}</TableCell>
      <TableCell padding="none" style={{ textAlign: 'center' }}>
        <IconButton>
          <Delete onClick={props.onDelete} />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

const renderAddLabsField = (props: WrappedFieldArrayProps<LabParams> & { setErrMsg: (errMsg: string) => void }) => {
  const [labName, setLabName] = React.useState<string>('');
  const [capacity, setCapacity] = React.useState<string>('');

  const labs: LabParams[] = props.fields.getAll();

  const onAddLab = () => {
    const capacityInt = parseInt(capacity, 10);
    if (isNaN(capacityInt)) {
      props.setErrMsg('募集人数は半角数字で入力してください');
      return;
    } else if (capacityInt < 0) {
      props.setErrMsg('募集人数は0人以上にしてください');
      return;
    }
    if (!labName) {
      props.setErrMsg('研究室名を入力してください');
      return;
    }
    if (
      labs &&
      labs.find((lab: LabParams) => {
        return lab.name === labName;
      })
    ) {
      props.setErrMsg('同名の研究室が既に存在しています');
      return;
    }
    props.fields.push({
      name: labName,
      capacity: capacityInt,
    });
    setLabName('');
    setCapacity('');
  };

  return (
    <React.Fragment>
      {labs
        ? labs.map((lab: LabParams, idx: number) => (
            <LabRow key={idx} name={lab.name} capacity={lab.capacity} onDelete={() => props.fields.remove(idx)} />
          ))
        : null}
      <TableRow>
        <TableCell padding="dense">
          <FormControl fullWidth={true}>
            <Input value={labName} onChange={e => setLabName(e.target.value)} />
          </FormControl>
        </TableCell>
        <TableCell style={{ padding: '4px 0' }}>
          <FormControl>
            <Input value={capacity} onChange={e => setCapacity(e.target.value)} />
          </FormControl>
        </TableCell>
        <TableCell padding="none" style={{ textAlign: 'center' }}>
          <IconButton onClick={onAddLab}>
            <Add />
          </IconButton>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

interface LabsStepProps extends InjectedFormProps {
  nextStep: () => void;
  prevStep: () => void;
}

const LabsStep: React.FC<LabsStepProps> = props => {
  const { handleSubmit } = props;
  const [errMsg, setErrMsg] = React.useState<string>('');

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h5">研究室入力</Typography>
      <Table style={{ minWidth: 280, tableLayout: 'auto' }}>
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
          <FieldArray name="labs" setErrMsg={setErrMsg} component={renderAddLabsField} />
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3} align="right">
              <FormLabel error={true}>{errMsg}</FormLabel>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <div style={{ textAlign: 'right', marginTop: '24px' }}>
        <Button style={{ marginRight: '20px' }} onClick={props.prevStep}>
          戻る
        </Button>
        <Button variant="contained" color="primary" onClick={props.nextStep}>
          次へ
        </Button>
      </div>
    </form>
  );
};

export default reduxForm({
  form: 'CourseCreateForm',
  destroyOnUnmount: false,
})(LabsStep);
