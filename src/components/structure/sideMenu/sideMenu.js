import React from "react";
import { key } from "../../../constants";
import { Link, useLocation } from "react-router-dom";

export default function SideMenu() {
  const location = useLocation();
  const isAdminOrPower =
    localStorage.getItem(key.USER_LV) === "power" ||
    localStorage.getItem(key.USER_LV) === "admin";

  const renderDashboard = () => (
    <li className="nav-item">
      <Link
        to="/Home"
        className={
          location.pathname.toLowerCase() === "/home"
            ? "nav-link active"
            : "nav-link"
        }
      >
        <i className="nav-icon fas fa-chart-pie" />
        <p>ภาพรวมคลินิก (Dashboard)</p>
      </Link>
    </li>
  );

  const renderPatient = () => {
    const isActive = location.pathname.includes("/patient");
    return (
      <li className={`nav-item has-treeview ${isActive ? "menu-open" : ""}`}>
        <a href="#patient" className={isActive ? "nav-link active" : "nav-link"}>
          <i className="nav-icon fas fa-user-injured" />
          <p>
            ข้อมูลคนไข้ / ลูกค้า
            <i className="fas fa-angle-left right" />
          </p>
        </a>
        <ul
          className="nav nav-treeview"
          style={{ display: isActive ? "block" : "none" }}
        >
          <li className="nav-item">
            <Link
              to="/patient/patient_data"
              className={
                location.pathname === "/patient/patient_data"
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              <i className="fas fa-address-card nav-icon" />
              <p>ทะเบียนคนไข้ (OPD)</p>
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/patient/patient_status"
              className={
                location.pathname === "/patient/patient_status"
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              <i className="fas fa-columns nav-icon" />
              <p>สถานะคิวคนไข้</p>
            </Link>
          </li>
        </ul>
      </li>
    );
  };

  const renderMarketing = () => {
    const isMarketingActive =
      location.pathname.includes("/marketing") ||
      location.pathname.includes("/report/marketing");
    const currentTab = new URLSearchParams(location.search).get("tab") || "churn";

    return (
      <li
        className={`nav-item has-treeview ${
          isMarketingActive ? "menu-open" : ""
        }`}
      >
        <a
          href="#marketing"
          className={isMarketingActive ? "nav-link active" : "nav-link"}
        >
          <i className="nav-icon fas fa-bullhorn" style={{ color: "#E9C070" }} />
          <p>
            การตลาด (Marketing CRM)
            <i className="fas fa-angle-left right" />
          </p>
        </a>
        <ul
          className="nav nav-treeview"
          style={{ display: isMarketingActive ? "block" : "none" }}
        >
          <li className="nav-item">
            <Link
              to="/report/marketing?tab=churn"
              className={
                isMarketingActive && currentTab === "churn"
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              <i className="fas fa-user-clock nav-icon" />
              <p>ลูกค้าขาดการติดต่อ</p>
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/report/marketing?tab=birthday"
              className={
                isMarketingActive && currentTab === "birthday"
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              <i className="fas fa-birthday-cake nav-icon" />
              <p>วันเกิด / สมัครสมาชิก</p>
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/report/marketing?tab=vip"
              className={
                isMarketingActive && currentTab === "vip"
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              <i className="fas fa-crown nav-icon" />
              <p>จัดเกรดลูกค้า VIP</p>
            </Link>
          </li>
        </ul>
      </li>
    );
  };

  const renderReport = () => {
    const isActive =
      location.pathname.includes("/report") &&
      !location.pathname.includes("/report/marketing");

    return (
      <li className={`nav-item has-treeview ${isActive ? "menu-open" : ""}`}>
        <a href="#report" className={isActive ? "nav-link active" : "nav-link"}>
          <i className="nav-icon fas fa-chart-line" />
          <p>
            รายงานและสถิติ
            <i className="fas fa-angle-left right" />
          </p>
        </a>
        <ul
          className="nav nav-treeview"
          style={{ display: isActive ? "block" : "none" }}
        >
          <li className="nav-item">
            <Link
              to="/report/daily_sales_report"
              className={
                location.pathname === "/report/daily_sales_report"
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              <i className="fas fa-receipt nav-icon" />
              <p>รายงานการใช้บริการ</p>
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/report/daily_new_customer"
              className={
                location.pathname === "/report/daily_new_customer"
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              <i className="fas fa-user-plus nav-icon" />
              <p>รายงานลูกค้าใหม่</p>
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/report/sales_analysis"
              className={
                location.pathname === "/report/sales_analysis"
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              <i className="fas fa-chart-bar nav-icon" />
              <p>วิเคราะห์ยอดขาย</p>
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/report/appointment"
              className={
                location.pathname === "/report/appointment"
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              <i className="fas fa-calendar-check nav-icon" />
              <p>การนัดหมายลูกค้า</p>
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/report/stock"
              className={
                location.pathname === "/report/stock"
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              <i className="fas fa-clipboard-list nav-icon" />
              <p>รายงานสต๊อก</p>
            </Link>
          </li>
        </ul>
      </li>
    );
  };

  const renderManageMaster = () => {
    if (!isAdminOrPower) return null;
    const isActive = location.pathname.includes("/master");
    return (
      <li className={`nav-item has-treeview ${isActive ? "menu-open" : ""}`}>
        <a href="#master" className={isActive ? "nav-link active" : "nav-link"}>
          <i className="nav-icon fas fa-sliders-h" />
          <p>
            ข้อมูลหลัก (Master)
            <i className="fas fa-angle-left right" />
          </p>
        </a>
        <ul
          className="nav nav-treeview"
          style={{ display: isActive ? "block" : "none" }}
        >
          <li className="nav-item">
            <Link
              to="/master/promotions"
              className={
                location.pathname === "/master/promotions"
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              <i className="fas fa-tags nav-icon" />
              <p>จัดการโปรโมชั่น</p>
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/master/user"
              className={
                location.pathname === "/master/user"
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              <i className="fas fa-users-cog nav-icon" />
              <p>จัดการผู้ใช้งาน</p>
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/master/product"
              className={
                location.pathname === "/master/product"
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              <i className="fas fa-box-open nav-icon" />
              <p>จัดการสินค้า</p>
            </Link>
          </li>
        </ul>
      </li>
    );
  };

  const renderStock = () => {
    if (!isAdminOrPower) return null;
    const isActive = location.pathname.includes("/stock/");
    return (
      <li className={`nav-item has-treeview ${isActive ? "menu-open" : ""}`}>
        <a href="#stock" className={isActive ? "nav-link active" : "nav-link"}>
          <i className="nav-icon fas fa-warehouse" />
          <p>
            คลังสินค้า (Stock)
            <i className="fas fa-angle-left right" />
          </p>
        </a>
        <ul
          className="nav nav-treeview"
          style={{ display: isActive ? "block" : "none" }}
        >
          <li className="nav-item">
            <Link
              to="/stock/recieve"
              className={
                location.pathname === "/stock/recieve"
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              <i className="fas fa-dolly-flatbed nav-icon" />
              <p>รับสต๊อกเข้า</p>
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/stock/issues"
              className={
                location.pathname === "/stock/issues"
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              <i className="fas fa-hand-holding-medical nav-icon" />
              <p>เบิก/จ่ายสต๊อก</p>
            </Link>
          </li>
        </ul>
      </li>
    );
  };

  return (
    <aside className="main-sidebar sidebar-dark-primary elevation-4">
      {/* Brand Logo */}
      <Link to="/Home" className="brand-link">
        <img
          src="/img/ALA_Clinic_icon.ico"
          alt="ALA Clinic Logo"
          className="brand-image img-circle elevation-3"
          style={{ border: "2px solid #E9C070" }}
        />
        <div>
          <span className="brand-text d-block" style={{ lineHeight: 1.1 }}>
            ALA CLINIC
          </span>
          <small
            style={{
              color: "#E9C070",
              fontSize: "0.68rem",
              letterSpacing: "1px",
              display: "block",
            }}
          >
            AESTHETIC & WELLNESS
          </small>
        </div>
      </Link>

      {/* Sidebar */}
      <div className="sidebar">
        <nav className="mt-3">
          <ul
            className="nav nav-pills nav-sidebar flex-column"
            data-widget="treeview"
            role="menu"
            data-accordion="false"
          >
            {renderDashboard()}
            {renderPatient()}
            {renderMarketing()}
            {renderReport()}
            {renderManageMaster()}
            {renderStock()}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
