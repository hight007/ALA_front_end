import React, { Component } from "react";
import { Link, Redirect } from "react-router-dom";
import { key, OK, server, YES } from "../../../constants";
import { httpClient } from "../../../utils/HttpClient";
import Swal from "sweetalert2";
import { connect } from "react-redux";
import * as action from "../../../actions/app.action";
import * as moment from "moment";

class Login extends Component {
  constructor(props) {
    super(props)

    this.state = {
      username: '',
      password: '',
      isLoad: false,
    }
  }

  componentDidMount() {
    this.autoLogin()
  }

  linkToHome = () => {
    // this.props.history.push("/home")
    window.location.replace('/home');
    this.props.appReducer.app && this.props.appReducer.app.forceUpdate();
  }

  autoLogin = async () => {
    if (localStorage.getItem(key.LOGIN_PASSED) === YES) {
      this.linkToHome()
    }
  };


  doLogin = async () => {
    try {

      const response = await httpClient.post(server.LOGIN_URL, this.state)
      if (response.data.api_result === OK) {
        localStorage.setItem(key.LOGIN_PASSED, YES);
        localStorage.setItem(key.USER_NAME, response.data.result.username);
        localStorage.setItem(key.USER_LV, response.data.result.levelUser);
        localStorage.setItem(key.TOKEN, response.data.token)
        localStorage.setItem(key.TIME_LOGIN, moment());
        this.linkToHome()

      } else {
        Swal.fire('Login failed!', response.data.error, 'error')
      }
    } catch (error) {
      console.log(error);
    }
  }

  render() {
    return (
      <div className="login-page" style={{ height: '100vh' }}>
        <div className="login-box">
          {/* /.login-logo */}
          <div className="card card-outline card-default">

            <div className="card-header text-center">
              <img style={{ width: '100%', height: '100%' }} src="/img/ALA_logo.png" />
            </div>
            <div className="card-body">
              
              {/* <p className="login-box-msg">Sign in to start your session</p> */}
              <form>
                <div className="input-group mb-3">
                  <input onChange={(e) => {
                    this.setState({ username: e.target.value })
                  }} type="text" className="form-control" placeholder="User name" />
                  <div className="input-group-append">
                    <div className="input-group-text">
                      <span className="fas fa-envelope" />
                    </div>
                  </div>
                </div>
                <div className="input-group mb-3">
                  <input onChange={(e) => {
                    this.setState({ password: e.target.value })
                  }} type="password" className="form-control" placeholder="Password" />
                  <div className="input-group-append">
                    <div className="input-group-text">
                      <span className="fas fa-lock" />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-8">
                    <p className="mb-0">
                      <Link to="/register" className="text-center">สมัครสมาชิคใหม่ที่นี่</Link>
                    </p>
                  </div>
                  {/* /.col */}
                  <div className="col-4">
                    <button onClick={async (e) => {
                      e.preventDefault();
                      this.setState({ isLoad: true });
                      await this.doLogin()
                      this.setState({ isLoad: false });
                    }} type="submit" className="btn btn-primary btn-block">Sign In</button>
                  </div>
                  {/* /.col */}
                </div>
                <div className="overlay-wrapper" style={{ visibility: this.state.isLoad ? 'visible' : 'hidden' }}>
                  <div className="overlay">
                    <i className="fas fa-3x fa-sync-alt fa-spin">
                    </i>
                    <div className="text-bold pt-2">Loading...</div>
                  </div>
                </div>
              </form>
              {/* /.social-auth-links */}
            </div>
            {/* /.card-body */}
          </div>
          {/* /.card */}
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  appReducer: state.appReducer,
});

const mapDispatchToProps = {
  ...action,
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
