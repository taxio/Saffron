import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {login, logout} from '../actions/index';

class NavBar extends Component {
  constructor(props){
    super(props);

    this.state = {
      isLogin: false,
    };

    console.log(this.props.isLogin, this.props.token);
  }

  _login(){
    console.log('login');
    this.props.login('hogehoge');
  }

  _logout(){
    console.log('logout');
    this.props.logout();
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
            {this.props.isLogin ?
              <form className='form-inline'>
                <button className='btn btn-info' onClick={() => this._logout()}>Log out</button>
              </form>
              :
              <form className='form-inline'>
                <button className='btn btn-info' onClick={() => this._login()}>Log in</button>
              </form>
            }
          </div>
        </nav>
      </header>
    );
  }
}

const mapStateToProps = state => {
  return {
    isLogin: state.account.isLogin,
    token: state.account.token,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    login: token => {
      dispatch(login(token))
    },
    logout: () => {
      dispatch(logout())
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NavBar);
