import { Button, DialogActions, DialogTitle } from '@material-ui/core';
import * as React from 'react';
import GridDialog from './GridDialog';

interface GridInformationDialogProps {
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  open: boolean;
  handleCloseDialog: () => void;
  message: string;
}

const GridInformationDialog: React.FC<GridInformationDialogProps> = props => (
  <GridDialog maxWidth={props.maxWidth} open={props.open} onClose={props.handleCloseDialog}>
    <DialogTitle>{props.message}</DialogTitle>
    <DialogActions>
      <Button onClick={props.handleCloseDialog}>閉じる</Button>
    </DialogActions>
  </GridDialog>
);

export default GridInformationDialog;
