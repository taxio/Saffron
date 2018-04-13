import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class App extends Component {
  render() {
    return (
      <div>
        <header>
          <div className="navbar navbar-default navbar-fixed-top">
            <div className="container">
              <div className="navbar-header">
                {/*<Link to="#" className="navbar-brand">Saffron</Link>*/}
                <a href="#" className="navbar-brand">Saffron</a>
              </div>
              <div className="navbar-collapse collapse" id="navbar-main">
                <div className="nav navbar-form navbar-right">
                  <div className="form-group">
                    {/*<Link to="#" className="btn btn-primary">Sign up</Link>*/}
                    <a href="#" className="btn btn-primary">Sign up</a>
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

export default App;
