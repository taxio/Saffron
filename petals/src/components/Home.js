import React, {Component} from 'react';
import {Link} from 'react-router-dom';

import NavBar from './NavBar';
import Footer from './Footer';

const Home = () => (
  <div className="container">
    <div className="row">
      <div className="col-lg-6 col-md-7 col-sm-6">
        <div className="jumbotron">
          <h1>研究室配属支援</h1>
          <p>
            <Link to="#" className="btn btn-primary">Saffronについて</Link>
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default Home;