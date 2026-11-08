import React, { useEffect, useState } from 'react'
import DatePicker from "react-datepicker";
import moment from 'moment';

import "react-datepicker/dist/react-datepicker.css";
import { httpClient } from '../../../utils/HttpClient';
import { OK, server } from '../../../constants';
import Swal from 'sweetalert2';
import CurrencyFormat from 'react-currency-format';
import { Link } from 'react-router-dom';

export default function DailyNewCustomer() {

  useEffect(() => {
    setisLoad(true)
    doGetDailyNewCustomer()
  }, [])

  //date
  const [startDate, setStartDate] = useState(moment().toDate());
  const [endDate, setEndDate] = useState(moment().toDate());

  //table
  const [tableHeader, settableHeader] = useState([])
  const [tableData, settableData] = useState([])
  const [servicesDetails, setservicesDetails] = useState([])

  //loading effect
  const [isLoad, setisLoad] = useState(false)


  const onChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  const renderOption = () => {
    return (
      <div className="d-flex flex-wrap align-items-center">
        <label className="mr-3 mb-0" style={{ fontWeight: 600, color: '#E9C070' }}>
          <i className="far fa-calendar-plus mr-2" /> วันที่ใช้บริการ / สมัครสมาชิก:
        </label>
        <div style={{ minWidth: '260px' }}>
          <DatePicker
            className="form-control"
            dateFormat="dd-MMM-yyyy"
            selected={startDate}
            onChange={onChange}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            isClearable={true}
            onCalendarClose={() => {
              setisLoad(true)
              doGetDailyNewCustomer()
            }}
          />
        </div>
      </div>
    )
  }

  const doGetDailyNewCustomer = async () => {
    const response = await httpClient.get(server.REPORT_NEW_CUSTOMER_URL + '/' + moment(startDate).format('DD-MMM-yyyy') + '&' + moment(endDate).format('DD-MMM-yyyy'))
    console.log(response.data);
    if (response.data.api_result === OK) {
      settableData(response.data.result)
      setservicesDetails(response.data.servicesDetails)
    }
    setisLoad(false)
  }

  const renderTableResult = () => {
    const renderTableHeader = () => {
      return (
        <tr role="row" style={{ backgroundColor: '#1E2430', color: '#E9C070' }}>
          <th style={{ padding: '14px 16px', borderBottom: '2px solid #C5953A' }}>วันที่เป็นสมาชิก</th>
          <th style={{ padding: '14px 16px', borderBottom: '2px solid #C5953A' }}>ชื่อ - นามสกุล ลูกค้า</th>
          <th style={{ padding: '14px 16px', borderBottom: '2px solid #C5953A' }}>อายุ</th>
          <th style={{ padding: '14px 16px', borderBottom: '2px solid #C5953A' }}>เบอร์โทรศัพท์</th>
          <th style={{ padding: '14px 16px', borderBottom: '2px solid #C5953A' }}>รายละเอียดการให้บริการ</th>
        </tr>
      )
    }

    const renderServicesDetails = (index) => {
      if (servicesDetails.length > 0) {
        if (servicesDetails[index]) {
          if (servicesDetails[index].length > 0) {
            return servicesDetails[index].map((item, idx) => (
              <div key={idx} className="mb-1 p-2" style={{ backgroundColor: '#F8F9FC', borderRadius: '8px', borderLeft: '3px solid #55C5D9' }}>
                <span style={{ fontWeight: 600, color: '#1E2430' }}>{item.promotion_name}</span>{' '}
                <CurrencyFormat
                  value={(item.promotion_price)}
                  displayType={'text'}
                  thousandSeparator={true}
                  suffix={' ฿'}
                  renderText={value => (
                    <span className="ml-2">
                      ราคา: <b style={{ color: '#C5953A' }}>{value}</b>
                      {item.discount > 0 ? (
                        <span className="badge badge-danger ml-2">
                          ส่วนลด{' '}
                          <CurrencyFormat
                            value={(item.discount)}
                            displayType={'text'}
                            thousandSeparator={true}
                            suffix={' ฿'}
                          />
                        </span>
                      ) : ''}
                    </span>
                  )}
                />
              </div>
            ))
          }
        }
      }
    }

    const renderTableRow = () => {
      if (tableData.length === 0) {
        return (
          <tr>
            <td colSpan={5} className="text-center py-5 text-muted">
              <i className="fas fa-user-plus fa-2x mb-2 d-block" style={{ color: '#E9C070' }} />
              ไม่มีข้อมูลลูกค้าใหม่ในช่วงวันที่เลือก
            </td>
          </tr>
        )
      }
      return tableData.map((item, index) => (
        <tr key={index}>
          <td className="align-middle" style={{ padding: '14px 16px' }}>
            <i className="far fa-calendar-alt mr-1" style={{ color: '#C5953A' }} />
            {moment(item.createdAt).format('DD-MMM-YYYY')}
          </td>
          <td className="align-middle" style={{ padding: '14px 16px' }}>
            <Link
              to={`/patient/patient_history/${item.patient_id}`}
              style={{ fontWeight: 600, color: '#1E2430', textDecoration: 'none' }}
            >
              <i className="fas fa-user-check mr-1" style={{ color: '#55C5D9' }} />
              {item.first_name + ' ' + item.last_name}
            </Link>
          </td>
          <td className="align-middle" style={{ padding: '14px 16px' }}>
            {(moment().format('YYYY') - item.year_of_birth) + ' ปี'}
          </td>
          <td className="align-middle" style={{ padding: '14px 16px' }}>
            <i className="fas fa-phone-alt mr-1 text-muted" /> {item.telephone_number}
          </td>
          <td className="align-middle" style={{ padding: '14px 16px' }}>
            {renderServicesDetails(index)}
          </td>
        </tr>
      ))
    }

    return (
      <div className="table-responsive" style={{ borderRadius: '12px', border: '1px solid #EDF2F7' }}>
        <table className="table table-hover text-nowrap mb-0" role="grid">
          <thead>
            {renderTableHeader()}
          </thead>
          <tbody>
            {renderTableRow()}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="content-wrapper" style={{ backgroundColor: '#F8F9FC', minHeight: '100vh', paddingBottom: '2rem' }}>
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-3 align-items-center">
            <div className="col-sm-6">
              <h1 className="m-0" style={{ color: '#1E2430', fontWeight: 700, fontSize: '1.75rem' }}>
                <i className="fas fa-user-plus mr-2" style={{ color: '#C5953A' }} />
                รายงานลูกค้าใหม่ (Daily New Customers)
              </h1>
            </div>
            <div className="col-sm-6 text-sm-right">
              <span className="badge px-3 py-2" style={{ backgroundColor: '#1E2430', color: '#E9C070', borderRadius: '20px', fontSize: '0.9rem' }}>
                <i className="fas fa-users mr-1" /> ลูกค้าใหม่ {tableData.length} ท่าน
              </span>
            </div>
          </div>
        </div>
      </section>
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <div
                  className="card-header d-flex align-items-center justify-content-between"
                  style={{ backgroundColor: '#1E2430', color: '#E9C070', padding: '16px 24px', borderBottom: '3px solid #E9C070' }}
                >
                  <div className="overlay-wrapper" style={{ visibility: isLoad ? 'visible' : 'hidden' }}>
                    <div className="overlay">
                      <i className="fas fa-3x fa-sync-alt fa-spin" />
                      <div className="text-bold pt-2">Loading...</div>
                    </div>
                  </div>
                  {renderOption()}
                </div>
                <div className="card-body" style={{ padding: '24px' }}>
                  {renderTableResult()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
