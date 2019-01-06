import { Button, Card, CardContent, Grid, Typography } from '@material-ui/core';
import * as React from 'react';
import { createPortal } from 'react-dom';

interface PopUpProps {
  onClose: () => void;
  msg: string;
  rootEl: Element;
}

const PopUp: React.SFC<PopUpProps> = props => (
  <React.Fragment>
    {createPortal(
      <div
        style={{
          position: 'fixed',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          top: 0,
          left: 0,
        }}
        onClick={props.onClose}
      >
        <Grid container={true} justify="center" onClick={e => e.stopPropagation()}>
          <Grid item={true} xs={10} sm={8} md={7} lg={6} xl={5}>
            <Card style={{ marginTop: 30, padding: 20, textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h6" style={{ marginBottom: '5px' }}>
                  {props.msg}
                </Typography>
                <Button variant="contained" color="secondary" onClick={props.onClose}>
                  Close
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div>,
      props.rootEl
    )}
  </React.Fragment>
);

export default PopUp;
