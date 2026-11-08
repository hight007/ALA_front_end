import React, { Component } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { httpClient } from "../../../utils/HttpClient";
import { OK, server } from "../../../constants";

class Register extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      email: "",
      password: "",
      retypePassword: "",
    };
  }

  doRegister = () => {
    Swal.fire({
      title: "ยืนยันการสมัครสมาชิก",
      text: "ต้องการลงทะเบียนบัญชีผู้ใช้งานนี้ใช่หรือไม่?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#D4A24C",
      cancelButtonColor: "#64748B",
      confirmButtonText: "ยืนยันสมัครสมาชิก",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await httpClient.post(server.REGISTER_URL, this.state);
        if (response.data.api_result === OK) {
          Swal.fire("สำเร็จ!", "ลงทะเบียนผู้ใช้งานเรียบร้อยแล้ว", "success");
          window.location.replace("/login");
        } else {
          Swal.fire("เกิดข้อผิดพลาด!", "ไม่สามารถลงทะเบียนได้", "error");
        }
      }
    });
  };

  render() {
    return (
      <div className="ala-auth-wrapper">
        <div className="ala-auth-card" style={{ maxWidth: 460 }}>
          <div className="ala-auth-header">
            <img
              className="ala-auth-logo"
              src="/img/ALA_logo.png"
              alt="ALA Clinic"
            />
            <p className="ala-auth-subtitle">Staff Account Registration</p>
          </div>
          <div className="ala-auth-body">
            <h5
              style={{
                fontWeight: 600,
                color: "#1E2430",
                marginBottom: "0.3rem",
                textAlign: "center",
              }}
            >
              ลงทะเบียนผู้ใช้งานใหม่
            </h5>
            <p
              style={{
                color: "#64748B",
                fontSize: "0.86rem",
                textAlign: "center",
                marginBottom: "1.4rem",
              }}
            >
              กรอกข้อมูลด้านล่างเพื่อสร้างบัญชีเข้าใช้งานระบบคลินิก
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                this.doRegister();
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
                    onChange={(e) =>
                      this.setState({ username: e.target.value })
                    }
                    type="text"
                    className="form-control"
                    placeholder="User name"
                    required
                  />
                </div>
              </div>

              <div className="form-group mb-3">
                <label>อีเมล (Email)</label>
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">
                      <i className="fas fa-envelope" />
                    </span>
                  </div>
                  <input
                    onChange={(e) => this.setState({ email: e.target.value })}
                    type="email"
                    className="form-control"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group mb-3">
                <label>รหัสผ่าน (Password)</label>
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">
                      <i className="fas fa-lock" />
                    </span>
                  </div>
                  <input
                    onChange={(e) =>
                      this.setState({ password: e.target.value })
                    }
                    type="password"
                    className="form-control"
                    placeholder="กำหนดรหัสผ่าน"
                    required
                  />
                </div>
              </div>

              <div className="form-group mb-4">
                <label>ยืนยันรหัสผ่านอีกครั้ง (Retype Password)</label>
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">
                      <i className="fas fa-check-circle" />
                    </span>
                  </div>
                  <input
                    onChange={(e) =>
                      this.setState({ retypePassword: e.target.value })
                    }
                    type="password"
                    className="form-control"
                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block py-2 mb-3"
              >
                <i className="fas fa-user-plus" /> ยืนยันการสมัครสมาชิก
              </button>

              <div className="text-center mt-2">
                <Link
                  to="/login"
                  style={{
                    color: "#C5953A",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  <i className="fas fa-arrow-left mr-1" /> ฉันมีบัญชีผู้ใช้งานอยู่แล้ว
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default Register;
