import axios from "axios";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { httpClient } from "../../../utils/HttpClient";
import { OK, server } from "../../../constants";

class Register extends Component {
  constructor(props) {
    super(props)

    this.state = {
      username: '',
      email:'',
      password: '',
      retypePassword: '',
    };
  };

  doRegister = () => {
    Swal.fire({
      title: 'Register',
      text: "Are you sure?",
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await httpClient.post(server.REGISTER_URL, this.state)
        if (response.data.api_result === OK) {
          Swal.fire('Yeah!', 'Register completed', 'success')
          window.location.replace('/login')
        } else {
          Swal.fire('Error!', 'Register failed', 'error')
        }
      }
    })
  }

  render() {
    return (
      <div className="register-page" style={{ height: '130vh' }}>
        <div className="register-box">
          <div className="card card-outline card-default">
            <div className="card-header text-center">
              <img style={{ width: '100%', height: '100%' }} src="/img/ALA_logo.png" />
            </div>
            <div className="card-body">
              <p className="login-box-msg">กรอกข้อมูลเพือสมัครสมาชิค</p>
              <form>
                <div className="input-group mb-3">
                  <input onChange={(e) => {
                    this.setState({ username: e.target.value })
                  }}
                    type="text"
                    className="form-control"
                    placeholder="User name" />
                  <div className="input-group-append">
                    <div className="input-group-text">
                      <span className="fas fa-user" />
                    </div>
                  </div>
                </div>
                <div className="input-group mb-3">
                  <input
                    onChange={(e) => {
                      this.setState({ email: e.target.value })
                    }}
                    type="email"
                    className="form-control"
                    placeholder="Email" />
                  <div className="input-group-append">
                    <div className="input-group-text">
                      <span className="fas fa-envelope" />
                    </div>
                  </div>
                </div>
                <div className="input-group mb-3">
                  <input
                    onChange={(e) => {
                      this.setState({ password: e.target.value })
                    }} type="password" className="form-control" placeholder="Password" />
                  <div className="input-group-append">
                    <div className="input-group-text">
                      <span className="fas fa-lock" />
                    </div>
                  </div>
                </div>
                <div className="input-group mb-3">
                  <input onChange={(e) => {
                    this.setState({ retypePassword: e.target.value })
                  }} type="password" className="form-control" placeholder="Retype password" />
                  <div className="input-group-append">
                    <div className="input-group-text">
                      <span className="fas fa-lock" />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-8">
                    <div className="icheck-primary">
                      <Link to="/login" className="text-center">ฉันเป็นสมาชิคอยู่แล้ว</Link>
                    </div>
                  </div>
                  {/* /.col */}
                  <div className="col-4">
                    <button onClick={(e) => {
                      e.preventDefault()
                      console.log(this.state);
                      this.doRegister()
                    }} type="submit" className="btn btn-primary btn-block">Register</button>
                  </div>
                  {/* /.col */}
                </div>
              </form>
              
            </div>
            {/* /.form-box */}
          </div>{/* /.card */}
        </div>
      </div>
    );
  }
}

export default Register;
