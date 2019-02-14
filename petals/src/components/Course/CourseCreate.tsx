import { Button, Grid, Paper, Step, StepLabel, Stepper, Typography } from '@material-ui/core';
import * as React from 'react';

interface CourseCreateProps {}

interface CourseCreateState {
  stepId: number;
}

class CourseCreate extends React.Component<CourseCreateProps, CourseCreateState> {
  constructor(props: CourseCreateProps) {
    super(props);
    this.state = {
      stepId: 0,
    };
  }

  public normalizeStepId = (stepId: number): number => {
    if (stepId < 0) {
      return 0;
    } else if (stepId > 3) {
      return 3;
    }
    return stepId;
  };

  public nextStep = () => {
    const stepId = this.normalizeStepId(this.state.stepId + 1);
    this.setState({ stepId });
  };

  public prevStep = () => {
    const stepId = this.normalizeStepId(this.state.stepId - 1);
    this.setState({ stepId });
  };

  public render() {
    const { stepId } = this.state;
    const steps = ['基本情報', '研究室', '設定確認'];

    return (
      <Grid container={true} justify="center">
        <Grid item={true} xs={12} sm={8} md={7} lg={6} xl={5}>
          <Paper style={{ marginTop: 20, padding: 30 }}>
            <Typography component="h1" variant="h5" align="center">
              課程作成
            </Typography>
            <Stepper activeStep={stepId} alternativeLabel={true}>
              {steps.map((label, key) => (
                <Step key={key}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            {stepId === 3 ? <Typography align="center">課程を作成しました</Typography> : null}
            <Button onClick={this.prevStep}>Prev</Button>
            <Button onClick={this.nextStep}>Next</Button>
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

export default CourseCreate;
