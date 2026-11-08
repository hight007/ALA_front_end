import { connect } from "react-redux";
import React, { Component } from "react";
import Swal from "sweetalert2";
import { key, server, OK } from "../../../constants";
import { httpClient } from "../../../utils/HttpClient";
import * as action from "../../../actions/app.action";
import ContentHeader from "../../../utils/ContentHeader";

class ChangePassword extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: localStorage.getItem(key.USER_NAME),
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    };
  }

  doChangePassword = async () => {
    if (this.state.confirmPassword === this.state.newPassword) {
      let result = await httpClient.patch(server.USER_URL, this.state);
      if (result.data.api_result === OK) {
        Swal.fire({
          icon: "success",
          title: "เปลี่ยนรหัสผ่านสำเร็จ",
          text: "กรุณาเข้าสู่ระบบใหม่อีกครั้งด้วยรหัสผ่านใหม่",
        }).then(() => {
          window.location.replace("/Login");
          localStorage.removeItem(key.LOGIN_PASSED);
          localStorage.removeItem(key.API_KEY);
          localStorage.removeItem(key.USER_NAME);
          localStorage.removeItem(key.USER_LV);
          localStorage.removeItem(key.USER_EMP);
          localStorage.removeItem(key.TOKEN);
          this.props.appReducer.app && this.props.appReducer.app.forceUpdate();
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "ไม่สามารถเปลี่ยนรหัสผ่านได้",
          text: result.data.error,
        });
      }
    } else {
      Swal.fire({
        icon: "error",
        title: "รหัสผ่านไม่ตรงกัน",
        text: "กรุณาตรวจสอบรหัสผ่านใหม่และการยืนยันรหัสผ่านให้ตรงกัน",
      });
    }
  };

  render() {
    return (
      <div className="content-wrapper">
        <ContentHeader header="เปลี่ยนรหัสผ่าน (Change Password)" />
        <section className="content">
          <div className="container-fluid">
            <div className="row justify-content-center">
              <div className="col-12 col-md-7 col-lg-5">
                <div className="card card-dark">
                  <div className="card-header">
                    <h3 className="card-title">
                      <i className="fas fa-shield-alt text-warning" /> ตั้งค่ารหัสผ่านใหม่สำหรับ{" "}
                      <b>{this.state.username}</b>
                    </h3>
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      this.doChangePassword();
                    }}
                  >
                    <div className="card-body">
                      <div className="form-group">
                        <label>รหัสผ่านเดิม (Old Password)</label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="กรอกรหัสผ่านเดิม"
                          onChange={(e) => {
                            this.setState({ oldPassword: e.target.value });
                          }}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>รหัสผ่านใหม่ (New Password)</label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="กรอกรหัสผ่านใหม่"
                          onChange={(e) => {
                            this.setState({ newPassword: e.target.value });
                          }}
                          required
                        />
                      </div>
                      <div className="form-group mb-0">
                        <label>ยืนยันรหัสผ่านใหม่ (Confirm Password)</label>
                        <input
                          type="password"
                          className="form-control"
                          placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                          onChange={(e) => {
                            this.setState({ confirmPassword: e.target.value });
                          }}
                          required
                        />
                      </div>
                    </div>
                    <div className="card-footer d-flex justify-content-between">
                      <button
                        type="button"
                        onClick={() => window.history.go(-1)}
                        className="btn btn-default"
                      >
                        <i className="fas fa-arrow-left" /> ย้อนกลับ
                      </button>
                      <button type="submit" className="btn btn-primary">
                        <i className="fas fa-save" /> บันทึกรหัสผ่านใหม่
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
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

export default connect(mapStateToProps, mapDispatchToProps)(ChangePassword);
