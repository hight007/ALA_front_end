import React, { useEffect, useState } from 'react'
import { OK, server } from '../../../constants';
import { httpClient } from '../../../utils/HttpClient';
import CurrencyFormat from 'react-currency-format';
import DatePicker from "react-datepicker";
import moment from 'moment';
import ReactApexChart from "react-apexcharts";

import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import Swal from 'sweetalert2';

export default function SalesAnalysis() {
  const [analysisData, setAnalysisData] = useState([])

  const [startDate, setStartDate] = useState(moment().add(-31, 'day').toDate());
  const [endDate, setEndDate] = useState(moment().toDate());

  //loading effect
  const [isLoad, setisLoad] = useState(false)

  useEffect(() => {
    setisLoad(true)
    doGetAnalysisData()
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
          <i className="far fa-calendar-alt mr-2" /> ช่วงวันที่ต้องการวิเคราะห์:
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
              doGetAnalysisData()
            }}
          />
        </div>
      </div>
    )
  }

  const doGetAnalysisData = async () => {
    try {
      const response = await httpClient.get(server.REPORT_SALES_ANALYSIS_URL + '/' + moment(startDate).format('DD-MMM-yyyy') + '&' + moment(endDate).format('DD-MMM-yyyy'))
      if (response.data.api_result === OK) {
        //modifyAgeAnalysis
        var modifyAgeAnalysis = []
        for (let index = 0; index < response.data.agePareto.length; index++) {
          const item = response.data.agePareto[index];
          const newItem = {
            totalPayment: item.totalPayment,
            averageSpendPerCustomer: (item.totalPayment / item.Customer).toFixed(2),
            Customer: item.Customer,
            range_age: item.range_age,
          }
          modifyAgeAnalysis.push(newItem)
        }

        response.data.agePareto = modifyAgeAnalysis
        setAnalysisData(response.data)
      }
    } catch (error) {
      console.log(error);
    }
    setisLoad(false)
  }

  //chart
  const renderPromotionChart = () => {
    if (analysisData.promotionPareto) {
      var servicesCountList = []
      var promotionsPricesList = []
      var promotionsNameList = []
      for (let index = 0; index < analysisData.promotionPareto.length; index++) {
        const item = analysisData.promotionPareto[index];
        servicesCountList.push(parseFloat(item.countPromotion))
        promotionsPricesList.push(-parseFloat(item.promotion_price))
        promotionsNameList.push(item.promotion_name)
      }
      //series
      const series = [{
        name: 'จำนวนการใช้บริการ',
        data: servicesCountList
      },
      {
        name: 'ราคาโปรโมชั่น',
        data: promotionsPricesList
      }
      ]

      //options
      const options = {
        chart: {
          type: 'bar',
          stacked: true,
        },
        colors: ['#C5953A', '#1E2430'],
        plotOptions: {
          bar: {
            borderRadius: 4,
          },
        },
        dataLabels: {
          enabled: true,
        },
        stroke: {
          show: true,
          width: 1,
          colors: ["#fff"]
        },
        grid: {
          xaxis: {
            lines: {
              show: false
            }
          }
        },
        yaxis: [{
          min: -Math.max(...servicesCountList) - parseInt(Math.max(...servicesCountList) / 10) - 1,
          max: Math.max(...servicesCountList) + parseInt(Math.max(...servicesCountList) / 10) + 1,
          title: {
            text: 'จำนวนการใช้บริการ',
          },
          labels: {
            formatter: (value) => {
              if (value > 0) {
                return Math.abs(value.toFixed(0))
              }
            },
          },
        }, {
          min: Math.min(...promotionsPricesList) + parseInt(Math.min(...promotionsPricesList) / 10),
          max: -(Math.min(...promotionsPricesList) + parseInt(Math.min(...promotionsPricesList) / 10)),

          opposite: true,
          title: {
            text: 'ราคาโปรโมชั่น'
          },
          labels: {
            formatter: (value) => {
              if (value < 0) {
                return Math.abs(value.toFixed(0)) + ' ฿'
              }
            },
          },
        }],
        tooltip: {
          shared: true,
          intersect: false,
          x: {
            formatter: function (val) {
              return val
            }
          },
          y: [{
            formatter: function (val) {
              return Math.abs(val)
            }
          },
          {
            formatter: function (val) {
              return Math.abs(val) + ' ฿'
            }
          }]
        },
        title: {
          text: 'Promotion Performance Analysis'
        },
        xaxis: {
          categories: promotionsNameList,
          labels: {
            rotate: -30,
            offsetX: 0,
            maxHeight: 200,
          }
        },
      }

      return (
        <ReactApexChart options={options} series={series} type="bar" height={450} />
      )
    }
  }
  const renderCustomerPaymentChart = () => {
    if (analysisData.paymentPareto) {
      var totalPaymentList = []
      var countPromotionsList = []
      var customerNameList = []
      for (let index = 0; index < analysisData.paymentPareto.length; index++) {
        const item = analysisData.paymentPareto[index];
        totalPaymentList.push(parseFloat(item.totalPayment))
        countPromotionsList.push(-parseFloat(item.countPromotions))
        customerNameList.push(item.first_name + ' ' + item.last_name)
      }
      //series
      const series = [{
        name: 'ยอดขายจากลูกค้าที่มาใช้บริการ',
        data: totalPaymentList
      },
      {
        name: 'จำนวนโปรโมชั่นที่ลูกค้าใช้บริการ',
        data: countPromotionsList
      }
      ]

      //options
      const options = {
        chart: {
          type: 'bar',
          stacked: true,
        },
        colors: ['#E9C070', '#55C5D9'],
        plotOptions: {
          bar: {
            borderRadius: 4,
          },
        },
        dataLabels: {
          enabled: true,
        },
        stroke: {
          show: true,
          width: 1,
          colors: ["#fff"]
        },
        grid: {
          xaxis: {
            lines: {
              show: false
            }
          }
        },
        yaxis: [{
          min: -Math.max(...totalPaymentList) - parseInt(Math.max(...totalPaymentList) / 10),
          max: Math.max(...totalPaymentList) + parseInt(Math.max(...totalPaymentList) / 10),
          title: {
            text: 'ยอดขายจากลูกค้าที่มาใช้บริการ',
          },
          labels: {
            formatter: (value) => {
              if (value > 0) {
                return Math.abs(value.toFixed(0)) + ' ฿'
              }
            },
          },
        }, {
          min: Math.min(...countPromotionsList) + parseInt(Math.min(...countPromotionsList) / 10) - 1,
          max: -(Math.min(...countPromotionsList) + parseInt(Math.min(...countPromotionsList) / 10)) + 1,

          opposite: true,
          title: {
            text: 'จำนวนโปรโมชั่นที่ลูกค้าใช้บริการ'
          },
          labels: {
            formatter: (value) => {
              if (value < 0) {
                return Math.abs(value.toFixed(0))
              }
            },
          },
        }],
        tooltip: {
          shared: true,
          intersect: false,
          x: {
            formatter: function (val) {
              return val
            }
          },
          y: {
            shared: true,
            intersect: false,
            x: {
              formatter: function (val) {
                return val
              }
            },
            y: [{
              formatter: function (val) {
                return Math.abs(val)
              }
            },
            {
              formatter: function (val) {
                return Math.abs(val)
              }
            }]
          }
        },
        title: {
          text: 'Top Customer Spend Analysis'
        },
        xaxis: {
          categories: customerNameList,
          labels: {
            rotate: -30,
            offsetX: 0,
            maxHeight: 200,
          }
        },
      }

      return (
        <ReactApexChart options={options} series={series} type="bar" height={450} />
      )
    }
  }
  const renderCustomerSexChart = () => {
    if (analysisData.sexPareto) {
      var totalPaymentList = []
      var countPromotionsList = []
      var customerNameList = []
      for (let index = 0; index < analysisData.sexPareto.length; index++) {
        const item = analysisData.sexPareto[index];
        totalPaymentList.push(parseFloat(item.totalPayment))
        countPromotionsList.push(-parseFloat(item.countPromotions))
        customerNameList.push(item.sex)
      }
      //series
      const series = [{
        name: 'ยอดขายจากลูกค้าที่มาใช้บริการ',
        data: totalPaymentList
      },
      {
        name: 'จำนวนโปรโมชั่นที่ลูกค้าใช้บริการ',
        data: countPromotionsList
      }
      ]

      //options
      const options = {
        chart: {
          type: 'bar',
          stacked: true,
        },
        colors: ['#55C5D9', '#1E2430'],
        plotOptions: {
          bar: {
            borderRadius: 4,
          },
        },
        dataLabels: {
          enabled: true,
        },
        stroke: {
          show: true,
          width: 1,
          colors: ["#fff"]
        },
        grid: {
          xaxis: {
            lines: {
              show: false
            }
          }
        },
        yaxis: [{
          min: -Math.max(...totalPaymentList) - parseInt(Math.max(...totalPaymentList) / 10),
          max: Math.max(...totalPaymentList) + parseInt(Math.max(...totalPaymentList) / 10),
          title: {
            text: 'ยอดขายจากลูกค้าที่มาใช้บริการ',
          },
          labels: {
            formatter: (value) => {
              if (value > 0) {
                return Math.abs(value.toFixed(0)) + ' ฿'
              }
            },
          },
        }, {
          min: Math.min(...countPromotionsList) + parseInt(Math.min(...countPromotionsList) / 10) - 1,
          max: -(Math.min(...countPromotionsList) + parseInt(Math.min(...countPromotionsList) / 10)) + 1,

          opposite: true,
          title: {
            text: 'จำนวนโปรโมชั่นที่ลูกค้าใช้บริการ'
          },
          labels: {
            formatter: (value) => {
              if (value < 0) {
                return Math.abs(value.toFixed(0))
              }
            },
          },
        }],
        tooltip: {
          shared: true,
          intersect: false,
          x: {
            formatter: function (val) {
              return val
            }
          },
          y: {
            shared: true,
            intersect: false,
            x: {
              formatter: function (val) {
                return val
              }
            },
            y: [{
              formatter: function (val) {
                return Math.abs(val)
              }
            },
            {
              formatter: function (val) {
                return Math.abs(val)
              }
            }]
          }
        },
        title: {
          text: 'Demographics by Gender'
        },
        xaxis: {
          categories: customerNameList,
          labels: {
            rotate: -30,
            offsetX: 0,
            maxHeight: 200,
          }
        },
      }

      return (
        <ReactApexChart options={options} series={series} type="bar" height={450} />
      )
    }
  }
  const renderCustomerAgeChart = () => {
    if (analysisData.agePareto) {
      var totalPaymentList = []
      var averageSpendPerCustomerList = []
      var countCustomerList = []
      var range_ageList = []
      for (let index = 0; index < analysisData.agePareto.length; index++) {
        const item = analysisData.agePareto[index];
        totalPaymentList.push(parseFloat(item.totalPayment))
        averageSpendPerCustomerList.push(parseFloat(item.averageSpendPerCustomer))
        countCustomerList.push(-parseFloat(item.Customer))
        range_ageList.push(item.range_age)
      }
      //series
      const series = [{
        name: 'ยอดขายรวมจากลูกค้าที่มาใช้บริการ',
        data: totalPaymentList,
        type: 'column',
      },
      {
        name: 'จำนวนครั้งที่ลูกค้ามาใช้บริการ',
        data: countCustomerList,
        type: 'column',
      },
      {
        name: 'ยอดขายเฉลี่ยต่อคน',
        data: averageSpendPerCustomerList,
        type: 'line',
        color: '#1E2430',
      }
      ]

      //options
      const options = {
        chart: {
          type: 'bar',
          stacked: true,
        },
        colors: ['#C5953A', '#55C5D9', '#1E2430'],
        plotOptions: {
          bar: {
            borderRadius: 4,
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          show: true,
          width: 1,
          colors: ["#fff"]
        },
        grid: {
          xaxis: {
            lines: {
              show: false
            }
          }
        },
        yaxis: [{
          min: -Math.max(...totalPaymentList) - parseInt(Math.max(...totalPaymentList) / 10),
          max: Math.max(...totalPaymentList) + parseInt(Math.max(...totalPaymentList) / 10),
          title: {
            text: 'ยอดขายจากลูกค้าที่มาใช้บริการ',
          },
          labels: {
            formatter: (value) => {
              if (value > 0) {
                return Math.abs(value.toFixed(0)) + ' ฿'
              }
            },
          },
        }, {
          min: Math.min(...countCustomerList) + parseInt(Math.min(...countCustomerList) / 10) - 1,
          max: -(Math.min(...countCustomerList) + parseInt(Math.min(...countCustomerList) / 10)) + 1,

          opposite: true,
          title: {
            text: 'จำนวนโปรโมชั่นที่ลูกค้าใช้บริการ'
          },
          labels: {
            formatter: (value) => {
              if (value < 0) {
                return Math.abs(value.toFixed(0))
              }
            },
          },
        },
        {
          title: {
            text: 'ยอดขายเฉลี่ยต่อคน',
          },
          labels: {
            formatter: (value) => {
              if (value > 0) {
                return Math.abs(value.toFixed(0)) + ' ฿'
              }
            },
          },
        }],
        tooltip: {
          shared: true,
          intersect: false,
          x: {
            formatter: function (val) {
              return val
            }
          },
          y: {
            shared: true,
            intersect: false,
            x: {
              formatter: function (val) {
                return val
              }
            },
            y: [{
              formatter: function (val) {
                return Math.abs(val)
              }
            },
            {
              formatter: function (val) {
                return Math.abs(val)
              }
            }]
          }
        },
        title: {
          text: 'Demographics by Age Group'
        },
        xaxis: {
          categories: range_ageList,
          labels: {
            rotate: -30,
            offsetX: 0,
            maxHeight: 200,
          }
        },
      }

      return (
        <ReactApexChart options={options} series={series} type="bar" height={450} />
      )
    }
  }

  //Table
  const renderTableHeader = (header) => {
    return header.map((item, idx) => (
      <th key={idx}>
        {item}
      </th>
    ))
  }
  const renderTableRow = (header, data) => {
    const renderTableRowData = (data) => {
      return header.map((item, idx) => (
        <td key={idx} style={{ padding: '12px 16px' }}>
          {data[item]}
        </td>
      ))
    }
    return data.map((item, idx) => (
      <tr key={idx}>
        {renderTableRowData(item)}
      </tr>
    ))
  }

  const renderPromotionTable = () => {
    if (analysisData.promotionPareto) {
      var header = Object.keys(analysisData.promotionPareto[0])

      return (
        <div className="table-responsive mt-3" style={{ borderRadius: '12px', border: '1px solid #EDF2F7' }}>
          <table className="table table-hover text-nowrap mb-0" role="grid">
            <thead>
              <tr role="row" style={{ backgroundColor: '#1E2430', color: '#E9C070' }}>
                <th style={{ padding: '14px 16px', borderBottom: '2px solid #C5953A' }}>ชื่อโปรโมชั่น</th>
                <th style={{ padding: '14px 16px', borderBottom: '2px solid #C5953A' }}>ราคาโปรโมชั่น</th>
                <th style={{ padding: '14px 16px', borderBottom: '2px solid #C5953A' }}>จำนวนการใช้บริการ</th>
              </tr>
            </thead>
            <tbody>
              {renderTableRow(header, analysisData.promotionPareto)}
            </tbody>
          </table>
        </div>
      )
    }
  }
  const renderCustomerPaymentTable = () => {
    if (analysisData.paymentPareto) {
      var header = Object.keys(analysisData.paymentPareto[0])

      return (
        <div className="table-responsive mt-3" style={{ borderRadius: '12px', border: '1px solid #EDF2F7' }}>
          <table className="table table-hover text-nowrap mb-0" role="grid">
            <thead>
              <tr role="row" style={{ backgroundColor: '#1E2430', color: '#E9C070' }}>
                <th style={{ padding: '14px 16px', borderBottom: '2px solid #C5953A' }}>ยอดขายจากลูกค้าที่มาใช้บริการ</th>
                <th style={{ padding: '14px 16px', borderBottom: '2px solid #C5953A' }}>จำนวนโปรโมชั่นที่ลูกค้าใช้บริการ</th>
                <th style={{ padding: '14px 16px', borderBottom: '2px solid #C5953A' }}>ชื่อลูกค้า</th>
                <th style={{ padding: '14px 16px', borderBottom: '2px solid #C5953A' }}>นามสกุลลูกค้า</th>
              </tr>
            </thead>
            <tbody>
              {renderTableRow(header, analysisData.paymentPareto)}
            </tbody>
          </table>
        </div>
      )
    }
  }
  const renderCustomerSexTable = () => {
    if (analysisData.sexPareto) {
      var header = Object.keys(analysisData.sexPareto[0])

      return (
        <div className="table-responsive mt-3" style={{ borderRadius: '12px', border: '1px solid #EDF2F7' }}>
          <table className="table table-hover text-nowrap mb-0" role="grid">
            <thead>
              <tr role="row" style={{ backgroundColor: '#1E2430', color: '#E9C070' }}>
                <th style={{ padding: '14px 16px', borderBottom: '2px solid #C5953A' }}>ยอดขายจากลูกค้าที่มาใช้บริการ</th>
                <th style={{ padding: '14px 16px', borderBottom: '2px solid #C5953A' }}>จำนวนครั้งที่ลูกค้ามาใช้บริการ</th>
                <th style={{ padding: '14px 16px', borderBottom: '2px solid #C5953A' }}>เพศของลูกค้า</th>
              </tr>
            </thead>
            <tbody>
              {renderTableRow(header, analysisData.sexPareto)}
            </tbody>
          </table>
        </div>
      )
    }
  }
  const renderCustomerAgeTable = () => {
    if (analysisData.agePareto) {
      var header = Object.keys(analysisData.agePareto[0])

      return (
        <div className="table-responsive mt-3" style={{ borderRadius: '12px', border: '1px solid #EDF2F7' }}>
          <table className="table table-hover text-nowrap mb-0" role="grid">
            <thead>
              <tr role="row" style={{ backgroundColor: '#1E2430', color: '#E9C070' }}>
                <th style={{ padding: '14px 16px', borderBottom: '2px solid #C5953A' }}>ยอดขายรวมจากลูกค้าที่มาใช้บริการ</th>
                <th style={{ padding: '14px 16px', borderBottom: '2px solid #C5953A' }}>ยอดขายเฉลี่ยต่อคน</th>
                <th style={{ padding: '14px 16px', borderBottom: '2px solid #C5953A' }}>จำนวนครั้งที่ลูกค้ามาใช้บริการ</th>
                <th style={{ padding: '14px 16px', borderBottom: '2px solid #C5953A' }}>ช่วงอายุของลูกค้า</th>
              </tr>
            </thead>
            <tbody>
              {renderTableRow(header, analysisData.agePareto)}
            </tbody>
          </table>
        </div>
      )
    }
  }

  //export excel
  const doExportExcel = async (fileData, fileName) => {
    if (fileData.length > 0) {
      const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
      const fileExtension = ".xlsx";
      const JSONdata = fileData

      const ws = XLSX.utils.json_to_sheet(JSONdata);
      const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const data = new Blob([excelBuffer], { type: fileType });
      FileSaver.saveAs(data, fileName + fileExtension);
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'warning',
        text: 'ไม่มีข้อมูลในวันที่นี',
      })
    }
  }


  return (
    <div className="content-wrapper" style={{ backgroundColor: '#F8F9FC', minHeight: '100vh', paddingBottom: '2rem' }}>
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-3 align-items-center">
            <div className="col-sm-6">
              <h1 className="m-0" style={{ color: '#1E2430', fontWeight: 700, fontSize: '1.75rem' }}>
                <i className="fas fa-chart-pie mr-2" style={{ color: '#C5953A' }} />
                รายงานวิเคราะห์ข้อมูลจากยอดขาย (Sales Analytics)
              </h1>
            </div>
          </div>
        </div>
      </section>
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12 mb-4">
              <div className="card shadow-sm border-0 m-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
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
              </div>
            </div>

            {/* Section 1: Promotion Analysis */}
            <div className="col-12 mb-4">
              <div className="card shadow-sm border-0 m-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <div className="card-header d-flex align-items-center justify-content-between" style={{ backgroundColor: '#1E2430', color: '#E9C070', padding: '16px 24px', borderBottom: '3px solid #C5953A' }}>
                  <h3 className="card-title m-0" style={{ fontWeight: 600, fontSize: '1.15rem', color: '#E9C070' }}>
                    <i className="fas fa-award mr-2" /> รายงานวิเคราะห์การใช้บริการ (Promotion Analysis)
                  </h3>
                  <button
                    onClick={() => {
                      doExportExcel(analysisData.promotionPareto, 'รายงานวิเคราะห์การใช้บริการ ' + moment(startDate).format('DD-MMM-yyyy') + ' ถึง ' + moment(endDate).format('DD-MMM-yyyy'))
                    }}
                    className="btn btn-sm px-3"
                    style={{ backgroundColor: '#C5953A', color: '#FFFFFF', borderRadius: '8px', fontWeight: 600 }}
                  >
                    <i className="fas fa-file-excel mr-1" /> ส่งออกรายงาน
                  </button>
                </div>
                <div className="card-body" style={{ padding: '24px' }}>
                  {renderPromotionChart()}
                  {renderPromotionTable()}
                </div>
              </div>
            </div>

            {/* Section 2: Customer Spend Analysis */}
            <div className="col-12 mb-4">
              <div className="card shadow-sm border-0 m-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <div className="card-header d-flex align-items-center justify-content-between" style={{ backgroundColor: '#1E2430', color: '#E9C070', padding: '16px 24px', borderBottom: '3px solid #55C5D9' }}>
                  <h3 className="card-title m-0" style={{ fontWeight: 600, fontSize: '1.15rem', color: '#E9C070' }}>
                    <i className="fas fa-crown mr-2" style={{ color: '#55C5D9' }} /> รายงานวิเคราะห์ยอดขายลูกค้า (Customer Spend Pareto)
                  </h3>
                  <button
                    onClick={() => {
                      doExportExcel(analysisData.paymentPareto, 'รายงานวิเคราะห์ยอดขายลูกค้า ' + moment(startDate).format('DD-MMM-yyyy') + ' ถึง ' + moment(endDate).format('DD-MMM-yyyy'))
                    }}
                    className="btn btn-sm px-3"
                    style={{ backgroundColor: '#C5953A', color: '#FFFFFF', borderRadius: '8px', fontWeight: 600 }}
                  >
                    <i className="fas fa-file-excel mr-1" /> ส่งออกรายงาน
                  </button>
                </div>
                <div className="card-body" style={{ padding: '24px' }}>
                  {renderCustomerPaymentChart()}
                  {renderCustomerPaymentTable()}
                </div>
              </div>
            </div>

            {/* Section 3: Customer Sex Analysis */}
            <div className="col-12 mb-4">
              <div className="card shadow-sm border-0 m-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <div className="card-header d-flex align-items-center justify-content-between" style={{ backgroundColor: '#1E2430', color: '#E9C070', padding: '16px 24px', borderBottom: '3px solid #E9C070' }}>
                  <h3 className="card-title m-0" style={{ fontWeight: 600, fontSize: '1.15rem', color: '#E9C070' }}>
                    <i className="fas fa-venus-mars mr-2" /> รายงานเพศของลูกค้าที่มาใช้บริการ (Gender Analysis)
                  </h3>
                  <button
                    onClick={() => {
                      doExportExcel(analysisData.sexPareto, 'รายงานเพศของลูกค้าที่มาใช้บริการ ' + moment(startDate).format('DD-MMM-yyyy') + ' ถึง ' + moment(endDate).format('DD-MMM-yyyy'))
                    }}
                    className="btn btn-sm px-3"
                    style={{ backgroundColor: '#C5953A', color: '#FFFFFF', borderRadius: '8px', fontWeight: 600 }}
                  >
                    <i className="fas fa-file-excel mr-1" /> ส่งออกรายงาน
                  </button>
                </div>
                <div className="card-body" style={{ padding: '24px' }}>
                  {renderCustomerSexChart()}
                  {renderCustomerSexTable()}
                </div>
              </div>
            </div>

            {/* Section 4: Customer Age Analysis */}
            <div className="col-12 mb-4">
              <div className="card shadow-sm border-0 m-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <div className="card-header d-flex align-items-center justify-content-between" style={{ backgroundColor: '#1E2430', color: '#E9C070', padding: '16px 24px', borderBottom: '3px solid #55C5D9' }}>
                  <h3 className="card-title m-0" style={{ fontWeight: 600, fontSize: '1.15rem', color: '#E9C070' }}>
                    <i className="fas fa-users mr-2" style={{ color: '#55C5D9' }} /> รายงานช่วงอายุของลูกค้าที่มาใช้บริการ (Age Group Analysis)
                  </h3>
                  <button
                    onClick={() => {
                      doExportExcel(analysisData.agePareto, 'รายงานช่วงอายุของลูกค้าที่มาใช้บริการ ' + moment(startDate).format('DD-MMM-yyyy') + ' ถึง ' + moment(endDate).format('DD-MMM-yyyy'))
                    }}
                    className="btn btn-sm px-3"
                    style={{ backgroundColor: '#C5953A', color: '#FFFFFF', borderRadius: '8px', fontWeight: 600 }}
                  >
                    <i className="fas fa-file-excel mr-1" /> ส่งออกรายงาน
                  </button>
                </div>
                <div className="card-body" style={{ padding: '24px' }}>
                  {renderCustomerAgeChart()}
                  {renderCustomerAgeTable()}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}
