import React, { Component } from "react";
import { Link } from "react-router-dom";
import { key, OK, server, YES } from "../../../constants";
import { httpClient } from "../../../utils/HttpClient";
import Swal from "sweetalert2";
import { connect } from "react-redux";
import * as action from "../../../actions/app.action";
import * as moment from "moment";

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: "",
      showPassword: false,
      isLoad: false,
    };
  }

  componentDidMount() {
    this.autoLogin();
  }

  linkToHome = () => {
    window.location.replace("/home");
    this.props.appReducer.app && this.props.appReducer.app.forceUpdate();
  };

  autoLogin = async () => {
    if (localStorage.getItem(key.LOGIN_PASSED) === YES) {
      this.linkToHome();
    }
  };

  doLogin = async () => {
    try {
      const response = await httpClient.post(server.LOGIN_URL, this.state);
      if (response.data.api_result === OK) {
        localStorage.setItem(key.LOGIN_PASSED, YES);
        localStorage.setItem(key.USER_NAME, response.data.result.username);
        localStorage.setItem(key.USER_LV, response.data.result.levelUser);
        localStorage.setItem(key.TOKEN, response.data.token);
        localStorage.setItem(key.TIME_LOGIN, moment());
        this.linkToHome();
      } else {
        Swal.fire("เข้าสู่ระบบไม่สำเร็จ", response.data.error, "error");
      }
    } catch (error) {
      console.log(error);
    }
  };

  render() {
    return (
      <div className="ala-auth-wrapper">
        <div className="ala-auth-card">
          <div className="ala-auth-header">
            <img
              className="ala-auth-logo"
              src="/img/ALA_logo.png"
              alt="ALA Clinic"
            />
            <p className="ala-auth-subtitle">Aesthetic & Wellness Management</p>
          </div>
          <div className="ala-auth-body">
            <h5
              style={{
                fontWeight: 600,
                color: "#1E2430",
                marginBottom: "0.35rem",
                textAlign: "center",
              }}
            >
              เข้าสู่ระบบคลินิก
            </h5>
            <p
              style={{
                color: "#64748B",
                fontSize: "0.88rem",
                textAlign: "center",
                marginBottom: "1.5rem",
              }}
            >
              กรอกชื่อผู้ใช้และรหัสผ่านเพื่อเข้าใช้งานระบบ
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                this.setState({ isLoad: true });
                await this.doLogin();
                this.setState({ isLoad: false });
              }}
            >
              <div className="form-group mb-3">
                <label>ชื่อผู้ใช้งาน (Username)</label>
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">
                      <i className="fas fa-user" />
                    </span>
                  </div>
                  <input
                    onChange={(e) => {
                      this.setState({ username: e.target.value });
                    }}
                    type="text"
                    className="form-control"
                    placeholder="กรอก Username ของคุณ"
                    required
                  />
                </div>
              </div>

              <div className="form-group mb-4">
                <label>รหัสผ่าน (Password)</label>
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">
                      <i className="fas fa-lock" />
                    </span>
                  </div>
                  <input
                    onChange={(e) => {
                      this.setState({ password: e.target.value });
                    }}
                    type={this.state.showPassword ? "text" : "password"}
                    className="form-control"
                    placeholder="กรอกรหัสผ่าน"
                    required
                  />
                  <div className="input-group-append">
                    <button
                      type="button"
                      className="input-group-text"
                      onClick={() => this.setState({ showPassword: !this.state.showPassword })}
                      style={{ cursor: "pointer", borderLeft: "none" }}
                      title={this.state.showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                    >
                      <i className={`fas ${this.state.showPassword ? "fa-eye-slash" : "fa-eye"}`} />
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={this.state.isLoad}
                className="btn btn-primary btn-block py-2 mb-3"
                style={{ fontSize: "1rem" }}
              >
                {this.state.isLoad ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin" /> กำลังเข้าสู่ระบบ...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt" /> เข้าสู่ระบบ (Sign In)
                  </>
                )}
              </button>

              <div className="text-center mt-3">
                <span style={{ fontSize: "0.88rem", color: "#64748B" }}>
                  ยังไม่มีบัญชีผู้ใช้งาน?{" "}
                </span>
                <Link
                  to="/register"
                  style={{
                    color: "#C5953A",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  สมัครสมาชิกใหม่ที่นี่
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  appReducer: state.appReducer,
});

const mapDispatchToProps = {
  ...action,
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
