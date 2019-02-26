import * as React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = props => (
  <footer
    style={{
      marginTop: 40,
      padding: '30px 0',
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
  </footer>
);

export default Footer;
