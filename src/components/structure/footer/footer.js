import React, { Component } from "react";

class Footer extends Component {
  render() {
    return (
      <footer className="main-footer">
        <strong>Copyright © 2021 Hightokung, </strong>  All rights reserved.
        <div className="float-right d-none d-sm-inline-block">
          <b>This website is powered by</b><a target="_blank" href='https://www.facebook.com/TheHight'> Highto Kung Nuttee</a>
        </div>
      </footer>
    )
  }
}

export default Footer;
