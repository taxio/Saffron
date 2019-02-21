import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import Typography from '@material-ui/core/Typography';

import * as React from 'react';

import BasicInformationStep from './BasicInformationStep';
import LabsStep from './LabsStep';
import ReviewStep from './ReviewStep';

export interface LabParams {
  name: string;
  capacity: number;
}

export interface CourseCreateFormParams {
  courseYear: number;
  courseName: string;
  pinCode: string;
  useName: boolean;
  useGPA: boolean;
  labs: LabParams[];
}

interface CourseCreateProps {}

interface CourseCreateState {
  stepId: number;
}

class CourseCreateManager extends React.Component<CourseCreateProps, CourseCreateState> {
  constructor(props: CourseCreateProps) {
    super(props);
    this.state = {
      stepId: 0,
    };
  }

  public getRenderComponentFromStepId = (stepId: number) => {
    switch (stepId) {
      case 0:
        // @ts-ignore
        return <BasicInformationStep nextStep={this.nextStep} />;
      case 1:
        // @ts-ignore
        return <LabsStep nextStep={this.nextStep} prevStep={this.prevStep} />;
      case 2:
        // @ts-ignore
        return <ReviewStep prevStep={this.prevStep} />;
    }
    return null;
  };

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
    const stepLabels = ['基本情報', '研究室', '設定確認'];

    return (
      <Grid container={true} justify="center">
        <Grid item={true} xs={12} sm={8} md={7} lg={6} xl={5}>
          <Paper style={{ marginTop: 20, padding: 30, maxWidth: '720px' }}>
            <Typography component="h1" variant="h5" align="center">
              課程作成
            </Typography>
            <Stepper activeStep={stepId} alternativeLabel={true}>
              {stepLabels.map((label, key) => (
                <Step key={key}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            {this.getRenderComponentFromStepId(stepId)}
            {stepId === 3 ? <Typography align="center">課程を作成しました</Typography> : null}
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

export default CourseCreateManager;
