import {
  Button,
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
import { Add, Delete } from '@material-ui/icons';
import * as React from 'react';
import { FieldArray, InjectedFormProps, reduxForm, WrappedFieldArrayProps } from 'redux-form';

interface LabRowProps {
  labName: string;
  capacity: number;
}

const LabRow = (props: LabRowProps & { onDelete: () => void }) => {
  return (
    <TableRow>
      <TableCell padding="dense">{props.labName}</TableCell>
      <TableCell style={{ padding: '4px 0' }}>{props.capacity}</TableCell>
      <TableCell padding="none" style={{ textAlign: 'center' }}>
        <IconButton>
          <Delete onClick={props.onDelete} />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

const renderAddLabsField = (props: WrappedFieldArrayProps<LabRowProps> & { setErrMsg: (errMsg: string) => void }) => {
  const [labName, setLabName] = React.useState<string>('');
  const [capacity, setCapacity] = React.useState<string>('');

  const labs: LabRowProps[] = props.fields.getAll();

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
      labs.find((lab: LabRowProps) => {
        return lab.labName === labName;
      })
    ) {
      props.setErrMsg('同名の研究室が既に存在しています');
      return;
    }
    props.fields.push({
      labName,
      capacity: capacityInt,
    });
    setLabName('');
    setCapacity('');
  };

  return (
    <React.Fragment>
      {labs
        ? labs.map((lab: LabRowProps, idx: number) => (
            <LabRow key={idx} labName={lab.labName} capacity={lab.capacity} onDelete={() => props.fields.remove(idx)} />
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
