import { Card, CardContent, Grid, Typography } from '@material-ui/core';
import * as React from 'react';

const Home: React.SFC = () => (
  <Grid container={true} justify="center">
    <Grid item={true} xs={10} sm={8} md={7} lg={6} xl={5}>
      <Card style={{ marginTop: 30, padding: 20 }}>
        <CardContent style={{ textAlign: 'center' }}>
          <Typography variant="h4">研究室配属支援サービス</Typography>
        </CardContent>
      </Card>
    </Grid>
  </Grid>
);

export default Home;
