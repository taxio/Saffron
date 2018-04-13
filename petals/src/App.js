import React, { Component } from 'react';

class App extends Component {
  render() {
    return (
      <div>
        <header>
          <div className="navbar navbar-default navbar-fixed-top">
            <div className="container">
              <div className="navbar-header">
                <a href="/" className="navbar-brand">Saffron</a>
              </div>
              <div className="navbar-collapse collapse" id="navbar-main">
                <div className="nav navbar-form navbar-right">
                  <div className="form-group">
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
