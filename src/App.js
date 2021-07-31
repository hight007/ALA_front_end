import React, { Component } from 'react';
import Home from './components/home/'
import Login from './components/authen/login/login'
import Register from './components/authen/register/register'
import ChangePassword from './components/authen/changePassword/changePassword'

//web structure
import Header from './components/structure/header'
import Footer from './components/structure/footer'
import SideMenu from './components/structure/sideMenu'

//web master
import userMaster from './components/master/user';
import promotionsMaster from './components/master/promotions';

//patient
import patient_data from './components/patient/patient_data';
import patient_history from './components/patient/patient_history';
import patient_status from './components/patient/patient_status';
import patient_historicalData from './components/patient/patient_historicalData';
import patient_payment from './components/patient/patient_payment';

import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from "react-router-dom";
import { setApp } from "./actions/app.action";
import { connect } from "react-redux";
import { key, YES } from './constants';
import Swal from "sweetalert2";
import * as moment from "moment";

const isLoggedIn = () => {
  return localStorage.getItem(key.LOGIN_PASSED) === YES;
};

const isPowerUser = () => {
  if (
    localStorage.getItem(key.USER_LV) === "power" ||
    localStorage.getItem(key.USER_LV) === "admin"
  ) {
    return true;
  } else {
    return false;
  }
};

const isLoginTimeOut = (value, unit) => {
  const loginTime = moment(localStorage.getItem(key.TIME_LOGIN))
    .add(value, unit)
    .toDate();
  if (loginTime < moment()) {
    localStorage.removeItem(key.LOGIN_PASSED);
    localStorage.removeItem(key.USER_NAME);
    localStorage.removeItem(key.USER_LV);
    localStorage.removeItem(key.TOKEN)
    localStorage.removeItem(key.TIME_LOGIN);

    Swal.fire({
      icon: "info",
      title: "Login timeout",
      text: "Please re login again...",
      showCancelButton: false,
    }).then(() => {
      window.location.replace("../login");
    });
    return true;
  } else {
    return false;
  }
};

// Protected Route
const SecuredRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      isLoggedIn() === true && isLoginTimeOut(8, "h") === false ? (
        <Component {...props} />
      ) : (
        <Redirect to="/login" />
      )
    }
  />
);

const SecuredLVRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={(props) =>
      isLoggedIn() === true && isLoginTimeOut(1, "h") === false ? (
        isPowerUser() === true ? (
          <Component {...props} />
        ) : (
          <Redirect to="/home" />
        )
      ) : (
        <Redirect to="/login" />
      )
    }
  />
);

class App extends Component {

  componentDidMount() {
    this.props.setApp(this);
  }

  redirectToLogin = () => {
    return <Redirect to="/login" />;
  };

  render() {
    return (
      <Router>
        {isLoggedIn() && <Header />}
        {isLoggedIn() && <SideMenu />}
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <SecuredRoute path="/changePassword" component={ChangePassword} />
          <SecuredRoute path="/home" component={Home} />

          {/* Master */}
          <SecuredLVRoute path="/master/user" component={userMaster} />promotionsMaster
          <SecuredLVRoute path="/master/promotions" component={promotionsMaster} />

          {/* patient*/}
          <SecuredRoute path="/patient/patient_data" component={patient_data} />
          <SecuredRoute path="/patient/patient_history/:patient_id" component={patient_history} />
          <SecuredRoute path="/patient/patient_status" component={patient_status} />
          <SecuredRoute path="/patient/patient_historicalData" component={patient_historicalData} />
          <SecuredRoute path="/patient/payment/:patient_id" component={patient_payment} />

          <Route exact={true} path="/" component={this.redirectToLogin} />
          <Route exact={true} path="*" component={this.redirectToLogin} />
        </Switch>
        {isLoggedIn() && <Footer />}
      </Router>
    );
  }
}

const mapStateToProps = (state) => ({});
const mapDispatchToProps = {
  setApp,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);