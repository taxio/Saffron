import Dialog from '@material-ui/core/Dialog';
import * as React from 'react';

interface GridDialogProps {
  open: boolean;
  onClose: () => void;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
}

const GridDialog: React.FC<GridDialogProps> = props => (
  <Dialog fullWidth={true} maxWidth={props.maxWidth ? props.maxWidth : 'sm'} open={props.open} onClose={props.onClose}>
    {props.children}
  </Dialog>
);

export default GridDialog;
