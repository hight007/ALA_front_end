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
              setisLoad(true)
              doGetDailySalesData()
            }}
          />
        </div>
      </>
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
        <tr role="row">
          <th>วันที่ให้บริการ</th>
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
          <td>{item.operate_date}</td>
          <td>
            <Link to={`/patient/patient_history/${item.patient_id}`}>{item.first_name + ' ' + item.last_name}</Link>
          </td>
          <td>
            {(moment().format('YYYY') - item.year_of_birth) + ' ปี'}
          </td>
          <td>{item.telephone_number}</td>
          <td>{renderServicesDetails(index)}</td>
        </tr>
      ))
    }

    const renderTotalSales = () => {
      if (servicesDetails.length > 0) {
        return (
          <tr>
            <td style={{ textAlign: 'center' }} colspan="6">
              <h3>รวมยอดขายทั้งหมด:
                <CurrencyFormat
                  value={totalPrices}
                  displayType={'text'}
                  thousandSeparator={true}
                  suffix={'฿'}
                  renderText={value => (
                    <b style={{ color: 'green' }} className='doubleUnderline'>{value}</b>
                  )} />
              </h3>
            </td>
          </tr>
        )
      }

    }
    return (
      <div className="card-body table-responsive p-0">
        <table className="table table-hover text-nowrap" role="grid">
          <thead>
            {renderTotalSales()}
            {renderTableHeader()}
          </thead>
          <tbody>
            {renderTableRow()}
          </tbody>
        </table>
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
      <button onClick={() => { doExportExcel() }} className="btn btn-primary" >
        <i className="fas fa-file-csv" style={{ marginRight: 5 }} />
        ส่งออกรายงาน
      </button>
    )
  }

  return (
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>รายงานรายละเอียดการใช้บริการ</h1>
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
                <div className="card-header">
                  <div className="card-tools">
                    <ul className="nav nav-pills ml-auto">
                      <li className="nav-item">
                        {exportExcel()}
                      </li>
                    </ul>
                  </div>
                  <div className="overlay-wrapper" style={{ visibility: isLoad ? 'visible' : 'hidden' }}>
                    <div className="overlay">
                      <i className="fas fa-3x fa-sync-alt fa-spin">
                      </i>
                      <div className="text-bold pt-2">Loading...</div>
                    </div>
                  </div>
                  {renderOption()}
                </div>
                <div className="card-body">


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
