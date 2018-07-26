import React, {Component} from 'react';
import {Link} from 'react-router-dom';

const NavBar = () => (
  <header>
    <nav className="navbar navbar-default">
      <div className="container-fluid">
        <div className="navbar-header">
          <button className="navbar-toggle collapsed" type="button" data-toggle="collapse"
                  data-target="#navbar-collapse" aria-expanded="false">
            <span className="sr-only">Toggle navifation</span>
            <span className="icon-bar"/>
            <span className="icon-bar"/>
            <span className="icon-bar"/>
          </button>
          <Link to="#" className="navbar-brand">Saffron</Link>
        </div>
        <div className="collapse navbar-collapse" id="navbar-collapse">
          <ul className="nav navbar-nav navbar-right">
            {/*{this.props.isLogin ?*/}
              {/*<li className="active"><Link to="#" onClick={this.logout.bind(this)}>Log out</Link></li> :*/}
              {/*null*/}
            {/*}*/}
            <li><Link to="#">Saffronとは</Link></li>
            <li><Link to="#">お問い合わせ</Link></li>
          </ul>
        </div>
      </div>
    </nav>
  </header>
);

export default NavBar;