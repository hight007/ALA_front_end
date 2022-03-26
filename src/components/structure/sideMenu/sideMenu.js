import React, { Component } from "react";
import { key } from "../../../constants";
import { Link, withRouter } from "react-router-dom";

class SideMenu extends Component {

  renderManageMaster = (pathname) => {
    if (
      localStorage.getItem(key.USER_LV) === "power" ||
      localStorage.getItem(key.USER_LV) === "admin"
    ) {
      return (
        <li className="nav-item has-treeview">
          <a
            className={
              pathname.includes('/master')
                ? "nav-link active"
                : "nav-link"
            }
          >
            <i className="fab fa-elementor" />{" "}
            <p>
              ข้อมูลสำคัญ (Master)
              <i className="fas fa-angle-left right" />
            </p>
          </a>
          <ul className="nav nav-treeview" style={{ display: "none" }}>
            <li className="nav-item">
              <Link
                to="/master/promotions"
                className={
                  pathname === "/master/promotions"
                    ? "nav-link active"
                    : "nav-link"
                }
              >
                <i className="far fa-circle nav-icon" />
                <p>จัดการโปรโมชั่น</p>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/master/user"
                className={
                  pathname === "/master/user"
                    ? "nav-link active"
                    : "nav-link"
                }
              >
                <i className="far fa-circle nav-icon" />
                <p>จัดการผู้ใช้งาน</p>
              </Link>
            </li>
          </ul>
        </li>
      )
    }
  }

  renderPatient = (pathname) => {
    return (
      <li className="nav-item has-treeview">
        <a
          className={
            pathname.includes('/patient')
              ? "nav-link active"
              : "nav-link"
          }
        >
          <i className="fas fa-hospital-user" />
          {" "}
          <p>
            ข้อมูลคนไข้ / ลูกค้า
            <i className="fas fa-angle-left right" />
          </p>
        </a>
        <ul className="nav nav-treeview" style={{ display: "none" }}>
          <li className="nav-item">
            <Link
              to="/patient/patient_data"
              className={
                pathname === "/patient/patient_data"
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              <i className="far fa-circle nav-icon" />
              <p>ข้อมูลคนไข้ / ลูกค้า</p>
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/patient/patient_status"
              className={
                pathname === "/patient/patient_status"
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              <i className="far fa-circle nav-icon" />
              <p>สถานะคนไข้ / ลูกค้า</p>
            </Link>
          </li>
          {/* <li className="nav-item">
            <Link
              to="/patient/patient_historicalData"
              className={
                pathname === "/patient/patient_historicalData"
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              <i className="far fa-circle nav-icon" />
              <p>บันทึกข้อมูลย้อนหลัง</p>
            </Link>
          </li> */}

        </ul>
      </li>
    )
  }

  renderReport = (pathname) => {
    return (
      <li className="nav-item has-treeview">
        <a
          className={
            pathname.includes('/report')
              ? "nav-link active"
              : "nav-link"
          }
        >
          <i className="fas fa-poll-h" />

          {" "}
          <p>
            รายงาน
            <i className="fas fa-angle-left right" />
          </p>
        </a>
        <ul className="nav nav-treeview" style={{ display: "none" }}>
          <li className="nav-item">
            <Link
              to="/report/daily_sales_report"
              className={
                pathname === "/report/daily_sales_report"
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              <i className="far fa-circle nav-icon" />
              <p>รายงานรายการใช้บริการ</p>
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/report/daily_new_customer"
              className={
                pathname === "/report/daily_new_customer"
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              <i className="far fa-circle nav-icon" />
              <p>รายงานลูกค้าใหม่</p>
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/report/sales_analysis"
              className={
                pathname === "/report/sales_analysis"
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              <i className="far fa-circle nav-icon" />
              <p>วิเคราะห์ข้อมูลยอดขาย</p>
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/report/appointment"
              className={
                pathname === "/report/appointment"
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              <i className="far fa-circle nav-icon" />
              <p>การนัดหมายของลูกค้า</p>
            </Link>
          </li>
        </ul>
      </li>
    )
  }

  render() {
    const { pathname } = this.props.location;
    return (
      <aside className="main-sidebar sidebar-dark-primary elevation-4">
        {/* Brand Logo */}
        <Link to="/home" className="brand-link">
          <img
            src="/img/ALA_Clinic_icon.ico"
            alt="Logo"
            className="brand-image img-circle elevation-3"
            style={{ opacity: '.8', }} />
          <span className="brand-text font-weight-light">ALA Clinic</span>
        </Link>
        {/* Sidebar */}
        <div className="sidebar os-host os-theme-light os-host-overflow os-host-overflow-y os-host-resize-disabled os-host-scrollbar-horizontal-hidden os-host-transition">
          <div className="os-resize-observer-host observed">
            <div className="os-resize-observer" style={{ left: 0, right: 'auto' }} />
          </div>
          <div className="os-size-auto-observer observed" style={{ height: 'calc(100% + 1px)', float: 'left' }}>
            <div className="os-resize-observer" /></div><div className="os-content-glue" style={{ margin: '0px -8px', width: 249, height: 520 }} />
          <div className="os-padding">
            <div className="os-viewport os-viewport-native-scrollbars-invisible" style={{ overflowY: 'scroll' }}>
              <div className="os-content" style={{ padding: '0px 8px', height: '100%', width: '100%' }}>
                {/* Sidebar Menu */}
                <nav className="mt-2">
                  <ul className="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu" data-accordion="false">
                    {this.renderPatient(pathname)}
                    {this.renderManageMaster(pathname)}
                    {this.renderReport(pathname)}
                  </ul>
                </nav>
                {/* /.sidebar-menu */}
              </div>
            </div>
          </div>
          <div className="os-scrollbar os-scrollbar-horizontal os-scrollbar-unusable os-scrollbar-auto-hidden"><div className="os-scrollbar-track"><div className="os-scrollbar-handle" style={{ width: '100%', transform: 'translate(0px, 0px)' }} /></div></div><div className="os-scrollbar os-scrollbar-vertical os-scrollbar-auto-hidden"><div className="os-scrollbar-track"><div className="os-scrollbar-handle" style={{ height: '38.3652%', transform: 'translate(0px, 0px)' }} /></div></div><div className="os-scrollbar-corner" /></div>
        {/* /.sidebar */}
      </aside>

    )
  }
}

export default withRouter(SideMenu);
