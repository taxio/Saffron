import React, {Component} from 'react';
import {Link} from 'react-router-dom';

export default class NavBar extends Component {
  constructor(props){
    super(props);

    this.state = {
      isLogin: false,
    };
  }

  render() {
    return (
      <header>
        <nav className='navbar navbar-expand-lg navbar-dark bg-primary'>
          <Link to='#' className='navbar-brand'>Saffron</Link>
          <button
            className='navbar-toggler collapsed'
            type='button'
            data-toggle="collapse"
            data-target="#headerNavbar"
            aria-controls="headerNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className='navbar-toggler-icon'/>
          </button>

          <div className='collapse navbar-collapse' id='headerNavbar'>
            <ul className='navbar-nav mr-auto'>
              <li className='nav-item active'><Link to="#" className='nav-link'>Saffronとは</Link></li>
              <li className='nav-item'><Link to="#" className='nav-link'>お問い合わせ</Link></li>
            </ul>
            {this.state.isLogin ? null :
              <form className='form-inline'>
                <button className='btn btn-info'>Log out</button>
              </form>
            }
          </div>
        </nav>
      </header>
    );
  }
}
