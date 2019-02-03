import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import * as React from 'react';
import { createPortal } from 'react-dom';

interface CourseSelectPopUpProps {
  onClose: () => void;
}

interface CourseSelectPopUpState {}

class CourseSelectPopUp extends React.Component<CourseSelectPopUpProps, CourseSelectPopUpState> {
  constructor(props: CourseSelectPopUpProps) {
    super(props);
  }

  public render(): React.ReactNode {
    const rootEl = document.getElementById('root');
    if (!rootEl) {
      return null;
    }

    return (
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
            onClick={this.props.onClose}
          >
            <Grid container={true} justify="center" onClick={e => e.stopPropagation()}>
              <Grid item={true} xs={10} sm={8} md={7} lg={6} xl={5}>
                <Card style={{ marginTop: 30, padding: 20, textAlign: 'center' }}>
                  <CardContent>
                    <Typography variant="h6" style={{ marginBottom: '5px' }}>
                      課程選択
                    </Typography>
                    {/* TODO: 課程選択プルダウン */}
                    {/* TODO: PINコード入力 */}
                    {/* TODO: 決定ボタン */}
                    {/* TODO: Closeボタンをいい感じに */}
                    {/* TODO: 課程作成ボタン */}
                    <Button variant="contained" color="secondary" onClick={this.props.onClose}>
                      Close
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </div>,
          rootEl
        )}
      </React.Fragment>
    );
  }
}

export default CourseSelectPopUp;
