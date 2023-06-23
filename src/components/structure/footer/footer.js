import React, { Component } from "react";
import packagejson from "../../../../package.json"

class Footer extends Component {
  render() {
    return (
      <footer className="main-footer">
        <strong>Copyright © 2021 Hightokung, </strong>  All rights reserved.
        <div className="float-right d-none d-sm-inline-block">
          <b>Version</b><a target="_blank" href='https://www.facebook.com/TheHight'> {packagejson.version}</a>
        </div>
      </footer>
    )
  }
}

export default Footer;
