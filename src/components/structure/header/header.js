import React, { useState, useEffect } from "react";
import { key } from "../../../constants";
import { Link } from "react-router-dom";
import QuickSearchModal from "./QuickSearchModal";

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const userName = localStorage.getItem(key.USER_NAME) || "Staff";
  const userLv = localStorage.getItem(key.USER_LV) || "user";

  // Hotkey listener for Ctrl + K or Cmd + K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <nav
        className="main-header navbar navbar-expand navbar-light"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "nowrap",
          padding: "0.4rem 1rem",
          gap: "0.75rem",
        }}
      >
        {/* Left Side: Hamburger & Brand Name */}
        <div className="d-flex align-items-center" style={{ flexShrink: 0 }}>
          <a
            className="nav-link px-2 mr-2"
            data-widget="pushmenu"
            role="button"
            title="ย่อ/ขยายเมนู"
            style={{ cursor: "pointer", color: "#1E2430" }}
          >
            <i className="fas fa-bars" style={{ fontSize: "1.15rem" }} />
          </a>
          <Link
            to="/Home"
            className="d-none d-xl-flex align-items-center text-nowrap"
            style={{ textDecoration: "none", color: "#1E2430", fontWeight: 600, fontSize: "0.95rem" }}
          >
            <i className="fas fa-gem mr-2" style={{ color: "#C5953A" }} />
            <span>ALA Aesthetic Clinic</span>
          </Link>
        </div>

        {/* Center: Quick Search Bar (Flexibly sized & Clean) */}
        <div
          style={{
            flex: "1 1 auto",
            maxWidth: "420px",
            minWidth: "160px",
          }}
        >
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#FAF7F0",
              border: "1.5px solid #E5D5B5",
              borderRadius: "999px",
              padding: "0.38rem 0.9rem",
              color: "#64748B",
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#C5953A";
              e.currentTarget.style.backgroundColor = "#FFFDF9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#E5D5B5";
              e.currentTarget.style.backgroundColor = "#FAF7F0";
            }}
          >
            <span className="d-flex align-items-center text-truncate" style={{ gap: "0.5rem" }}>
              <i className="fas fa-search" style={{ color: "#C5953A", fontSize: "0.85rem" }} />
              <span className="d-none d-sm-inline">ค้นหาคนไข้ด่วน...</span>
              <span className="d-inline d-sm-none">ค้นหา...</span>
            </span>
            <span
              className="d-none d-lg-inline-block"
              style={{
                background: "#EAE4D7",
                color: "#475569",
                borderRadius: "6px",
                padding: "0.1rem 0.45rem",
                fontSize: "0.7rem",
                fontWeight: 600,
              }}
            >
              Ctrl + K
            </span>
          </button>
        </div>

        {/* Right Side: Quick Action & User Dropdown */}
        <div className="d-flex align-items-center" style={{ flexShrink: 0, gap: "0.5rem" }}>
          <Link
            to="/patient/patient_status"
            className="btn btn-sm btn-info text-nowrap d-none d-md-inline-flex align-items-center"
            style={{ borderRadius: "20px", padding: "0.35rem 0.85rem", fontSize: "0.82rem" }}
          >
            <i className="fas fa-procedures mr-1" /> คิวคนไข้วันนี้
          </Link>

          {/* User Account Menu */}
          <div className="dropdown">
            <a
              className="d-flex align-items-center text-nowrap"
              data-toggle="dropdown"
              href="#user-menu"
              aria-expanded="false"
              style={{
                background: "#FAF7F0",
                border: "1px solid #EAE4D7",
                borderRadius: "999px",
                padding: "0.32rem 0.75rem",
                textDecoration: "none",
                cursor: "pointer",
                gap: "0.45rem",
                color: "#1E2430",
              }}
            >
              <i className="fas fa-user-circle" style={{ fontSize: "1.2rem", color: "#C5953A" }} />
              <span style={{ fontWeight: 600, fontSize: "0.85rem" }}>{userName}</span>
              <span
                className="ala-page-badge"
                style={{
                  padding: "0.1rem 0.45rem",
                  fontSize: "0.68rem",
                  textTransform: "uppercase",
                }}
              >
                {userLv}
              </span>
              <i className="fas fa-chevron-down" style={{ fontSize: "0.65rem", opacity: 0.6 }} />
            </a>
            <div
              className="dropdown-menu dropdown-menu-lg dropdown-menu-right"
              style={{
                left: "inherit",
                right: 0,
                borderRadius: "16px",
                border: "1px solid #EAE4D7",
                boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
                overflow: "hidden",
              }}
            >
              <span
                className="dropdown-item dropdown-header"
                style={{
                  background: "linear-gradient(135deg, #1E2430 0%, #141821 100%)",
                  color: "#E9C070",
                  fontWeight: 600,
                  padding: "0.85rem 1rem",
                }}
              >
                <i className="fas fa-id-badge mr-2" /> บัญชีผู้ใช้งาน ({userName})
              </span>
              <div className="dropdown-divider m-0" />
              <Link to="/changePassword" className="dropdown-item py-2">
                <i className="fas fa-key mr-2" style={{ color: "#C5953A" }} />
                เปลี่ยนรหัสผ่าน (Change password)
              </Link>
              <div className="dropdown-divider m-0" />
              <button
                className="dropdown-item py-2 text-danger"
                onClick={(e) => {
                  e.preventDefault();
                  localStorage.removeItem(key.LOGIN_PASSED);
                  localStorage.removeItem(key.USER_NAME);
                  localStorage.removeItem(key.USER_LV);
                  localStorage.removeItem(key.TOKEN);
                  window.location.replace("/login");
                }}
              >
                <i className="fas fa-sign-out-alt mr-2" />
                ออกจากระบบ (Sign out)
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Global Quick Search Modal */}
      <QuickSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
