import React, {Component} from 'react';
import {Link} from 'react-router-dom';

export default class TopPage extends Component{
  constructor(props){
    super(props);
  }

  render(){
    return(
      <div>
        <header>
          <div className="navbar navbar-default navbar-fixed-top">
            <div className="container">
              <div className="navbar-header">
                <Link to="#" className="navbar-brand">Saffron</Link>
              </div>
              <div className="navbar-collapse collapse" id="navbar-main">
                <div className="nav navbar-form navbar-right">
                  <div className="form-group">
                    <Link to="#" className="btn btn-primary">Sign up</Link>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </header>
      </div>
    );
  }
}