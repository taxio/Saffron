import { IconButton, List, ListItem, ListItemSecondaryAction, ListItemText } from '@material-ui/core';
import Close from '@material-ui/icons/Close';

import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { NotificationAction, setMessage } from '../actions/notification';
import { bodyTheme, muiTheme } from '../lib/theme';
import { PetalsStore } from '../store';
import GridPaper from './Common/GridPaper';

interface NotificationBarProps {
  message: string;
  setMessage: (message: string) => void;
}

const NotificationBar: React.FC<NotificationBarProps> = props => {
  const clearMessage = () => {
    props.setMessage('');
  };

  if (!props.message) {
    return null;
  }

  return (
    <GridPaper
      style={{
        marginRight: 10,
        marginLeft: 10,
        padding: 5,
        backgroundColor: `${bodyTheme.backgroundColor}`,
        border: `solid 1px ${muiTheme.palette.primary.dark}`,
      }}
    >
      <List>
        <ListItem style={{ paddingTop: 0, paddingBottom: 0 }}>
          <ListItemText primary={props.message} />
          <ListItemSecondaryAction>
            <IconButton onClick={clearMessage}>
              <Close fontSize="small" />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      </List>
    </GridPaper>
  );
};

interface StateFromProps {
  message: string;
}

interface DispatchFromProps {
  setMessage: (message: string) => void;
}

const mapStateToProps = (state: PetalsStore): StateFromProps => ({
  message: state.notification.message,
});

const mapDispatchToProps = (dispatch: Dispatch<NotificationAction>): DispatchFromProps => ({
  setMessage: (message: string) => {
    dispatch(setMessage(message));
  },
});

export default connect<StateFromProps, DispatchFromProps, {}>(
  mapStateToProps,
  mapDispatchToProps
)(NotificationBar);
