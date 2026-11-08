import React, { useEffect, useState } from 'react'
import DatePicker from "react-datepicker";
import moment from 'moment';

import "react-datepicker/dist/react-datepicker.css";
import { httpClient } from '../../../utils/HttpClient';
import { OK, server, apiUrl } from '../../../constants';
import Swal from 'sweetalert2';
import CurrencyFormat from 'react-currency-format';

import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import { Link } from 'react-router-dom';

export default function DailySalesReport() {
  //date
  const [startDate, setStartDate] = useState(moment().toDate());
  const [endDate, setEndDate] = useState(moment().toDate());

  //table
  const [tableHeader, settableHeader] = useState([])
  const [tableData, settableData] = useState([])
  const [servicesDetails, setservicesDetails] = useState([])

  //total prices
  const [totalPrices, settotalPrices] = useState(0)

  //loading effect
  const [isLoad, setisLoad] = useState(false)

  //useEffects
  useEffect(() => {
    setisLoad(true)
    doGetDailySalesData()
  }, [])

  const onChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  const renderOption = () => {
    return (
      <div className="d-flex flex-wrap align-items-center">
        <label className="mr-3 mb-0" style={{ fontWeight: 600, color: '#E9C070' }}>
          <i className="far fa-calendar-check mr-2" /> เลือกช่วงวันที่ใช้บริการ:
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
              doGetDailySalesData()
            }}
          />
        </div>
      </div>
    )
  }

  const doGetDailySalesData = async () => {
    let result = await httpClient.get(server.REPORT_DAILY_SALES_URL + '/' + moment(startDate).format('DD-MMM-yyyy') + '&' + moment(endDate).format('DD-MMM-yyyy'))
    if (result.data.api_result === OK) {
      if (result.data.result.length > 0) {
        let tableHeader = Object.keys(result.data.result[0])
        tableHeader.push('Action')
        settableHeader(tableHeader)
        settableData(result.data.result)
        setservicesDetails(result.data.servicesDetails)

        var i = 0
        var promotion_price = 0
        result.data.servicesDetails.forEach(async serviceItems => {
          var j = 0
          i++
          serviceItems.forEach(async item => {
            promotion_price += item.promotion_price
            j++
            if (i === result.data.servicesDetails.length && j === serviceItems.length) {
              settotalPrices(promotion_price)
            }
          });
        });
      } else {
        settableHeader([])
        settableData([])
        setservicesDetails([])
      }
    } else {
      settableHeader([])
      settableData([])
      setservicesDetails([])
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Something went wrong! Please try again',
      })
    }
    setisLoad(false)
  }

  const renderTableResult = () => {
    const renderTableHeader = () => {
      return (
        <tr role="row" style={{ backgroundColor: '#1E2430', color: '#E9C070' }}>
          <th style={{ padding: '14px 16px', borderBottom: '2px solid #C5953A' }}>วันที่ให้บริการ</th>
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
              <div key={idx} className="mb-1 p-2" style={{ backgroundColor: '#F8F9FC', borderRadius: '8px', borderLeft: '3px solid #E9C070' }}>
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
              <i className="fas fa-file-invoice-dollar fa-2x mb-2 d-block" style={{ color: '#E9C070' }} />
              ไม่มีข้อมูลการใช้บริการในช่วงวันที่เลือก
            </td>
          </tr>
        )
      }
      return tableData.map((item, index) => (
        <tr key={index}>
          <td className="align-middle" style={{ padding: '14px 16px' }}>
            <i className="far fa-calendar-alt mr-1" style={{ color: '#C5953A' }} /> {item.operate_date}
          </td>
          <td className="align-middle" style={{ padding: '14px 16px' }}>
            <Link
              to={`/patient/patient_history/${item.patient_id}`}
              style={{ fontWeight: 600, color: '#1E2430', textDecoration: 'none' }}
            >
              <i className="fas fa-user-circle mr-1" style={{ color: '#55C5D9' }} />
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

    const renderTotalSales = () => {
      if (servicesDetails.length > 0) {
        return (
          <div className="mb-4 p-4 d-flex align-items-center justify-content-between" style={{ background: 'linear-gradient(135deg, #1E2430 0%, #2D3748 100%)', borderRadius: '14px', borderLeft: '6px solid #E9C070', color: '#FFFFFF' }}>
            <div>
              <div className="text-uppercase small" style={{ color: '#E9C070', letterSpacing: '1px', fontWeight: 600 }}>
                Total Revenue Summary
              </div>
              <h4 className="m-0 mt-1" style={{ fontWeight: 600 }}>รวมยอดขายทั้งหมดในช่วงเวลาที่เลือก</h4>
            </div>
            <div className="text-right">
              <CurrencyFormat
                value={totalPrices}
                displayType={'text'}
                thousandSeparator={true}
                suffix={' ฿'}
                renderText={value => (
                  <span style={{ color: '#E9C070', fontSize: '2rem', fontWeight: 700 }}>{value}</span>
                )}
              />
            </div>
          </div>
        )
      }
    }

    return (
      <div>
        {renderTotalSales()}
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
      </div>
    )
  }

  //export excel
  const exportExcel = () => {
    const doExportExcel = async () => {
      const response = await httpClient.get(server.REPORT_DAILY_SALES_URL + '_csv/' + moment(startDate).format('DD-MMM-yyyy') + '&' + moment(endDate).format('DD-MMM-yyyy'))
      if (response.data.api_result === OK) {
        if (response.data.result.length > 0) {
          const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
          const fileExtension = ".xlsx";
          const filename = 'รายงานรายละเอียดการใช้บริการ ตั้งแต่วันที่ ' + moment(startDate).format('DD-MMM-yyyy') + ' ถึง ' + moment(endDate).format('DD-MMM-yyyy')
          const JSONdata = response.data.result

          const ws = XLSX.utils.json_to_sheet(JSONdata);
          const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
          const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
          const data = new Blob([excelBuffer], { type: fileType });
          FileSaver.saveAs(data, filename + fileExtension);
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'warning',
            text: 'ไม่มีข้อมูลในวันที่นี',
          })
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'ไม่สามารถส่งออกรายงานได้ โปรดติดต่อเว็บแอดมิน',
        })
      }
    }

    return (
      <button
        onClick={() => { doExportExcel() }}
        className="btn px-4"
        style={{ backgroundColor: '#C5953A', color: '#FFFFFF', borderRadius: '10px', fontWeight: 600 }}
      >
        <i className="fas fa-file-excel mr-2" />
        ส่งออกรายงาน (Export Excel)
      </button>
    )
  }

  return (
    <div className="content-wrapper" style={{ backgroundColor: '#F8F9FC', minHeight: '100vh', paddingBottom: '2rem' }}>
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-3 align-items-center">
            <div className="col-sm-6">
              <h1 className="m-0" style={{ color: '#1E2430', fontWeight: 700, fontSize: '1.75rem' }}>
                <i className="fas fa-chart-line mr-2" style={{ color: '#C5953A' }} />
                รายงานรายละเอียดการใช้บริการ
              </h1>
            </div>
            <div className="col-sm-6 text-sm-right">
              <span className="badge px-3 py-2" style={{ backgroundColor: '#1E2430', color: '#E9C070', borderRadius: '20px', fontSize: '0.9rem' }}>
                <i className="fas fa-receipt mr-1" /> จำนวน {tableData.length} รายการ
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
                  className="card-header d-flex flex-wrap align-items-center justify-content-between"
                  style={{ backgroundColor: '#1E2430', color: '#E9C070', padding: '16px 24px', borderBottom: '3px solid #E9C070' }}
                >
                  <div className="overlay-wrapper" style={{ visibility: isLoad ? 'visible' : 'hidden' }}>
                    <div className="overlay">
                      <i className="fas fa-3x fa-sync-alt fa-spin" />
                      <div className="text-bold pt-2">Loading...</div>
                    </div>
                  </div>
                  {renderOption()}
                  <div className="mt-2 mt-md-0">
                    {exportExcel()}
                  </div>
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
