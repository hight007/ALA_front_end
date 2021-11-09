import React, { useEffect, useState } from 'react'
import DatePicker from "react-datepicker";
import moment from 'moment';

import "react-datepicker/dist/react-datepicker.css";
import { httpClient } from '../../../utils/HttpClient';
import { OK, server } from '../../../constants';
import Swal from 'sweetalert2';
import CurrencyFormat from 'react-currency-format';

export default function DailyNewCustomer() {

  useEffect(() => {
    doGetDailyNewCustomer()
  }, [])

  //date
  const [startDate, setStartDate] = useState(moment().toDate());
  const [endDate, setEndDate] = useState(moment().toDate());

  //table
  const [tableHeader, settableHeader] = useState([])
  const [tableData, settableData] = useState([])
  const [servicesDetails, setservicesDetails] = useState([])

  const onChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  const renderOption = () => {
    return (
      <>
        <div className="input-group">
          <label>วันที่ใช้บริการ</label>
          <DatePicker
            className="form-control input-lg"
            dateFormat="dd-MMM-yyyy"
            selected={startDate}
            onChange={onChange}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            isClearable={true}
            onCalendarClose={() => {
              doGetDailyNewCustomer()
            }}
          />
        </div>
      </>
    )
  }

  const doGetDailyNewCustomer = async () => {
    const response = await httpClient.get(server.REPORT_NEW_CUSTOMER_URL + '/' + moment(startDate).format('DD-MMM-yyyy') + '&' + moment(endDate).format('DD-MMM-yyyy'))
    console.log(response.data);
    if (response.data.api_result === OK) {
      settableData(response.data.result)
      setservicesDetails(response.data.servicesDetails)
    }
  }

  const renderTableResult = () => {
    const renderTableHeader = () => {
      return (
        <tr role="row">
          <th>วันที่เป็นสมาชิค</th>
          <th>opd</th>
          <th>
            ชื่อ - นามสกุล ลูกค้า
          </th>
          <th>
            อายุ
          </th>
          <th>
            เบอร์โทรศัพท์
          </th>
          <th>
            รายละเอียดการให้บริการ
          </th>
        </tr>
      )
    }

    const renderServicesDetails = (index) => {
      if (servicesDetails.length > 0) {
        if (servicesDetails[index]) {
          if (servicesDetails[index].length > 0) {
            return servicesDetails[index].map((item) => (
              <div>
                {item.promotion_name + ' '}
                <CurrencyFormat
                  value={(item.promotion_price)}
                  displayType={'text'}
                  thousandSeparator={true}
                  suffix={'฿'}
                  renderText={value => <label>ราคา : <b style={{ color: 'blue' }}>{value}</b>
                    {item.discount > 0 ? <label style={{ color: 'red' }}> discount {
                      <CurrencyFormat
                        value={(item.discount)}
                        displayType={'text'}
                        thousandSeparator={true}
                        suffix={'฿'} />
                    }</label> : ''}
                  </label>} />
              </div >
            ))
          }
        }

      }
    }

    const renderTableRow = () => {
      return tableData.map((item, index) => (
        <tr>
          <td>{moment(item.createdAt).format('DD-MMM-YYYY')}</td>
          <td>{item.patient_id}</td>
          <td>
            {item.first_name + ' ' + item.last_name}
          </td>
          <td>
            {(moment().format('YYYY') - item.year_of_birth) + ' ปี'}
          </td>
          <td>{item.telephone_number}</td>
          <td>{renderServicesDetails(index)}</td>
        </tr>
      ))
    }

    return (
      <div className="card-body table-responsive p-0">
        <table className="table table-hover text-nowrap" role="grid">
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
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>รายงานลูกค้าใหม่</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">

              </ol>
            </div>
          </div>
        </div>
      </section>
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className='card card-default'>

                <div className="card-body">

                  {renderOption()}
                  {renderTableResult()}
                </div>
                <div className="card-footer">

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
