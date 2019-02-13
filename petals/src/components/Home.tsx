import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

interface HomeProps extends RouteComponentProps {}

const Home: React.FC<HomeProps> = props => (
  <Grid container={true} justify="center">
    <Grid item={true} xs={10} sm={8} md={7} lg={6} xl={5}>
      <Card style={{ marginTop: 30, padding: 20 }}>
        <CardContent style={{ textAlign: 'center' }}>
          <Typography variant="h4">研究室配属支援サービス</Typography>
          <p>
            Saffronは研究室配属希望調査の収集プラットフォームを提供することで，皆さんの割り振りに関する議論を円滑に進めるサービスです
          </p>
        </CardContent>
        <Grid container={true} spacing={8} justify="center">
          <Grid item={true}>
            <Button variant="contained" color="primary" onClick={() => props.history.push('/termsofservice')}>
              利用規約
            </Button>
          </Grid>
          <Grid item={true}>
            <Button variant="contained" color="primary" onClick={() => props.history.push('/about')}>
              Saffronについて
            </Button>
          </Grid>
        </Grid>
      </Card>
    </Grid>
  </Grid>
);

export default withRouter(Home);
