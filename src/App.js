import React, { Component } from 'react';
import Home from './components/home/'
import Login from './components/authen/login/login'
import Register from './components/authen/register/register'
import ChangePassword from './components/authen/changePassword/changePassword'

//web structure
import Header from './components/structure/header'
import Footer from './components/structure/footer'
import SideMenu from './components/structure/sideMenu'

// //web master
import UserMaster from './components/master/user';
import PromotionsMaster from './components/master/promotions';
import MasterProduct from './components/master/Product';

// //patient
import Patient_data from './components/patient/patient_data';
import Patient_history from './components/patient/patient_history';
import Patient_status from './components/patient/patient_status';
import Patient_historicalData from './components/patient/patient_historicalData';
import Patient_payment from './components/patient/patient_payment';

// //report
import Daily_sales_report from './components/report/dailySalesReport';
import Sales_analysis from './components/report/salesAnalysis';
import Daily_new_customer from './components/report/dailyNewCustomer';
import Report_appointment from './components/report/appointment'
import Report_stock from './components/report/Stock';

// //appointment
import Appointment from './components/appointment'

import { BrowserRouter, useNavigate, Navigate, Route, Routes } from "react-router-dom";
import { setApp } from "./actions/app.action";
import { connect } from "react-redux";
import { key, YES } from './constants';
import Swal from "sweetalert2";
import * as moment from "moment";

//stock
import StockIssues from './components/stock/StockIssues';
import StockRecieve from './components/stock/StockRecieve';

class App extends Component {
  render() {
    const showElement = (element) => {
      const isLogined = localStorage.getItem(key.LOGIN_PASSED);
      if (isLogined == YES) {
        return element;
      }
    };

    function RequireAuth(props) {
      const navigate = useNavigate();
      // check permission
      if (localStorage.getItem(key.LOGIN_PASSED) != YES) {
        window.location.replace('/Login');
      }

      //check time to login
      const loginTime = moment(localStorage.getItem(key.TIME_LOGIN)).format(
        "DD-MMM-yyyy HH:mm:ss"
      );
      if (moment().diff(moment(loginTime), "h") > 4) {


        Swal.fire({
          icon: "warning",
          title: "Oops...",
          text: "เวลาการเข้าใช้งานหมดอายุ โปรดลงชื่อเข้าใช้ใหม่",
        }).then(() => {
          localStorage.removeItem(key.LOGIN_PASSED);
          localStorage.removeItem(key.USER_NAME);
          localStorage.removeItem(key.TIME_LOGIN);
          localStorage.removeItem(key.USER_LV);
          localStorage.removeItem(key.TOKEN);
          // navigate("/Login");
          window.location.replace('/Login')
          return <Navigate to="/Login" />;
        });
      }

      //check user level
      if (props.userLevel) {
        const userLevel = localStorage.getItem(key.USER_LV)
        if (!props.userLevel.includes(userLevel)) {
          navigate("/Home");
          Swal.fire({
            icon: "warning",
            title: "Oops...",
            text: "ระดับไม่เพียงพอต่อการเข้าถึง",
          }).then(() => {
            return <Navigate to="/Home" />;
          });
        }

      }

      return props.children;
    }

    return (
      <BrowserRouter>
        {/* <Header /> */}
        {showElement(<Header />)}
        {showElement(<SideMenu />)}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/Home" element={<RequireAuth><Home /></RequireAuth>} />
          <Route path="/changePassword" element={<RequireAuth><ChangePassword /></RequireAuth>} />

          {/* Master */}
          <Route path="/master/user" element={<RequireAuth userLevel={["admin", "power"]}><UserMaster /></RequireAuth>} />
          <Route path="/master/promotions" element={<RequireAuth userLevel={["admin", "power"]}><PromotionsMaster /></RequireAuth>} />
          <Route path="/master/product" element={<RequireAuth userLevel={["admin", "power"]}><MasterProduct /></RequireAuth>} />

          {/* patient*/}
          <Route path="/patient/patient_data" element={<RequireAuth><Patient_data /></RequireAuth>} />
          <Route path="/patient/patient_history/:patient_id" element={<RequireAuth><Patient_history /></RequireAuth>} />
          <Route path="/patient/patient_status" element={<RequireAuth><Patient_status /></RequireAuth>} />
          <Route path="/patient/patient_historicalData" element={<RequireAuth><Patient_historicalData /></RequireAuth>} />
          <Route path="/patient/payment/:patient_id" element={<RequireAuth><Patient_payment /></RequireAuth>} />

          {/* report */}
          <Route path="/report/daily_sales_report" element={<RequireAuth><Daily_sales_report/></RequireAuth>} />
          <Route path="/report/sales_analysis" element={<RequireAuth><Sales_analysis/></RequireAuth>} />
          <Route path="/report/daily_new_customer" element={<RequireAuth><Daily_new_customer/></RequireAuth>} />
          <Route path="/report/appointment" element={<RequireAuth><Report_appointment/></RequireAuth>} />
          <Route path="/report/stock" element={<RequireAuth><Report_stock /></RequireAuth>} />
          

          {/* Stock */}
          <Route path="/stock/recieve" element={<RequireAuth><StockRecieve /></RequireAuth>} />
          <Route path="/stock/issues" element={<RequireAuth><StockIssues /></RequireAuth>} />

          {/* appointment */}
          <Route path="/appointment/:patient_id" component={<RequireAuth><Appointment/></RequireAuth>} />

          <Route exact={true} path="/" element={<Navigate to="/Login" />} />
          <Route exact={true} path="*" element={<Navigate to="/Login" />} />
        </Routes>
        {showElement(<Footer />)}
      </BrowserRouter>
    );
  }
}

const mapStateToProps = (state) => ({});
const mapDispatchToProps = {
  setApp,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);