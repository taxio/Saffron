import Typography from '@material-ui/core/Typography';
import * as React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = props => (
  <React.Fragment>
    <footer
      style={{
        marginTop: 'auto',
        padding: '40px 0px 20px 0px',
        width: '100%',
        textAlign: 'center',
      }}
    >
      <Link to="/about" style={{ margin: '5px' }}>
        Saffronについて
      </Link>
      <Link to="/termsofservice" style={{ margin: '5px' }}>
        利用規約
      </Link>
      <Link to="/faq" style={{ margin: '5px' }}>
        お問い合わせ
      </Link>
      <br />
      <Typography variant="caption">© 2019 Studio Aquatan</Typography>
    </footer>
  </React.Fragment>
);

export default Footer;
