import React, { Component } from "react";
import packagejson from "../../../../package.json";

class Footer extends Component {
  render() {
    return (
      <footer className="main-footer d-flex align-items-center justify-content-between flex-wrap">
        <div>
          <strong style={{ color: "#1E293B" }}>ALA Clinic Aesthetic Management</strong>{" "}
          <span>— Copyright © 2021 Hightokung. All rights reserved.</span>
        </div>
        <div className="d-none d-sm-inline-block">
          <span className="ala-page-badge">
            Version{" "}
            <a
              target="_blank"
              rel="noreferrer"
              href="https://www.facebook.com/TheHight"
              style={{ color: "#C5953A", fontWeight: 600 }}
            >
              {packagejson.version}
            </a>
          </span>
        </div>
      </footer>
    );
  }
}

export default Footer;
