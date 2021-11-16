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
              doGetAnalysisData()
            }}
          />
        </div>
      </>
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
        colors: ['#FF8811', '#392F5A'],
        plotOptions: {
          bar: {
            // horizontal: true,
            // barHeight: '80%',
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
          text: 'promotion analysis chart'
        },
        xaxis: {
          categories: promotionsNameList,
          labels: {
            rotate: -30,
            offsetX: 0,
            // offsetY: -100,
            maxHeight: 200,
          }
        },
      }

      return (
        <ReactApexChart options={options} series={series} type="bar" height={500} />
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
        colors: ['#DE6B48', '#7DBBC3'],
        plotOptions: {
          bar: {
            // horizontal: true,
            // barHeight: '80%',
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
          text: 'Customer payment analysis chart'
        },
        xaxis: {
          categories: customerNameList,
          labels: {
            rotate: -30,
            offsetX: 0,
            // offsetY: -100,
            maxHeight: 200,
          }
        },
      }

      return (
        <ReactApexChart options={options} series={series} type="bar" height={500} />
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
        colors: ['#F092DD', '#392F5A'],
        plotOptions: {
          bar: {
            // horizontal: true,
            // barHeight: '80%',
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
          text: 'Customer payment analysis chart'
        },
        xaxis: {
          categories: customerNameList,
          labels: {
            rotate: -30,
            offsetX: 0,
            // offsetY: -100,
            maxHeight: 200,
          }
        },
      }

      return (
        <ReactApexChart options={options} series={series} type="bar" height={500} />
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
        name: 'ยอดขายรวมจากลูกค้าที่มาใช้บริการ	',
        data: totalPaymentList,
        type: 'column',
      },
      {
        name: 'จำนวนครั้งที่ลูกค้ามาใช้บริการ	',
        data: countCustomerList,
        type: 'column',
      },
      {
        name: 'ยอดขายเฉลี่ยต่อคน',
        data: averageSpendPerCustomerList,
        type: 'line',
        color: '#402E2A',
      }
      ]

      //options
      const options = {
        chart: {
          type: 'bar',
          stacked: true,
        },
        colors: ['#CEA0AE', '#9CD08F', '#402E2A'],
        plotOptions: {
          bar: {
            // horizontal: true,
            // barHeight: '80%',
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
          // opposite: true,
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
          text: 'Customer payment analysis chart'
        },
        xaxis: {
          categories: range_ageList,
          labels: {
            rotate: -30,
            offsetX: 0,
            // offsetY: -100,
            maxHeight: 200,
          }
        },
      }

      return (
        <ReactApexChart options={options} series={series} type="bar" height={500} />
      )
    }
  }

  //Table
  const renderTableHeader = (header) => {
    return header.map((item) => (
      <th>
        {item}
      </th>
    )
    )
  }
  const renderTableRow = (header, data) => {
    const renderTableRowData = (data) => {
      return header.map((item) => (
        <td>
          {data[item]}
        </td>
      )
      )
    }
    return data.map((item) => (
      <tr>
        {renderTableRowData(item)}
      </tr>
    ))
  }

  const renderPromotionTable = () => {
    if (analysisData.promotionPareto) {
      //tableData
      var header = Object.keys(analysisData.promotionPareto[0])

      return (
        <div className="card-body table-responsive p-0">
          <table className="table table-hover text-nowrap" role="grid">
            <thead>
              <tr role="row">
                {/* {renderTableHeader(header)} */}
                <th>ชื่อโปรโมชั่น</th>
                <th>ราคาโปรโมชั่น</th>
                <th>จำนวนการใช้บริการ</th>
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
      //tableData
      var header = Object.keys(analysisData.paymentPareto[0])

      return (
        <div className="card-body table-responsive p-0">
          <table className="table table-hover text-nowrap" role="grid">
            <thead>
              <tr role="row">
                {/* {renderTableHeader(header)} */}
                <th>ยอดขายจากลูกค้าที่มาใช้บริการ</th>
                <th>จำนวนโปรโมชั่นที่ลูกค้าใช้บริการ</th>
                <th>ชื่อลูกค้า</th>
                <th>นามสกุลลูกค้า</th>
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
      //tableData
      var header = Object.keys(analysisData.sexPareto[0])

      return (
        <div className="card-body table-responsive p-0">
          <table className="table table-hover text-nowrap" role="grid">
            <thead>
              <tr role="row">
                {/* {renderTableHeader(header)} */}
                <th>ยอดขายจากลูกค้าที่มาใช้บริการ</th>
                <th>จำนวนครั้งที่ลูกค้ามาใช้บริการ</th>
                <th>เพศของลูกค้า</th>
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
      //tableData
      var header = Object.keys(analysisData.agePareto[0])

      return (
        <div className="card-body table-responsive p-0">
          <table className="table table-hover text-nowrap" role="grid">
            <thead>
              <tr role="row">
                {/* {renderTableHeader(header)} */}
                <th>ยอดขายรวมจากลูกค้าที่มาใช้บริการ</th>
                <th>ยอดขายเฉลี่ยต่อคน</th>
                <th>จำนวนครั้งที่ลูกค้ามาใช้บริการ</th>
                <th>ช่วงอายุของลูกค้า</th>
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
    <div className="content-wrapper">
      <section className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1>รายงานวิเคราะห์ข้อมูลจากยอดขาย</h1>
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
                  <div>
                    <h3 style={{ textAlign: 'center' }}>รายงานวิเคราะห์การใช้บริการ</h3>
                    {renderPromotionChart()}
                    <div style={{ textAlign: 'center' }}>
                      <button onClick={() => {
                        doExportExcel(analysisData.promotionPareto, 'รายงานวิเคราะห์การใช้บริการ ' + moment(startDate).format('DD-MMM-yyyy') + ' ถึง ' + moment(endDate).format('DD-MMM-yyyy'))
                      }} className="btn btn-primary" >
                        <i className="fas fa-file-excel" style={{ marginRight: 5 }} />
                        ส่งออกรายงาน
                      </button>
                    </div>
                    {renderPromotionTable()}
                  </div>
                  <hr style={{ border: '2px solid ' }} />
                  <div>
                    <h3 style={{ textAlign: 'center' }}>รายงานวิเคราะห์ยอดขายลูกค้า</h3>
                    {renderCustomerPaymentChart()}
                    <div style={{ textAlign: 'center' }}>
                      <button onClick={() => {
                        doExportExcel(analysisData.paymentPareto, 'รายงานวิเคราะห์ยอดขายลูกค้า ' + moment(startDate).format('DD-MMM-yyyy') + ' ถึง ' + moment(endDate).format('DD-MMM-yyyy'))
                      }} className="btn btn-primary" >
                        <i className="fas fa-file-excel" style={{ marginRight: 5 }} />
                        ส่งออกรายงาน
                      </button>
                    </div>
                    {renderCustomerPaymentTable()}
                  </div>
                  <hr style={{ border: '2px solid ' }} />
                  <div>
                    <h3 style={{ textAlign: 'center' }}>รายงานเพศของลูกค้าที่มาใช้บริการ</h3>
                    {renderCustomerSexChart()}
                    <div style={{ textAlign: 'center' }}>
                      <button onClick={() => {
                        doExportExcel(analysisData.sexPareto, 'รายงานเพศของลูกค้าที่มาใช้บริการ ' + moment(startDate).format('DD-MMM-yyyy') + ' ถึง ' + moment(endDate).format('DD-MMM-yyyy'))
                      }} className="btn btn-primary" >
                        <i className="fas fa-file-excel" style={{ marginRight: 5 }} />
                        ส่งออกรายงาน
                      </button>
                    </div>
                    {renderCustomerSexTable()}
                  </div>
                  <hr style={{ border: '2px solid ' }} />
                  <div>
                    <h3 style={{ textAlign: 'center' }}>รายงานช่วงอายุของลูกค้าที่มาใช้บริการ</h3>
                    {renderCustomerAgeChart()}
                    <div style={{ textAlign: 'center' }}>
                      <button onClick={() => {
                        doExportExcel(analysisData.agePareto, 'รายงานช่วงอายุของลูกค้าที่มาใช้บริการ ' + moment(startDate).format('DD-MMM-yyyy') + ' ถึง ' + moment(endDate).format('DD-MMM-yyyy'))
                      }} className="btn btn-primary" >
                        <i className="fas fa-file-excel" style={{ marginRight: 5 }} />
                        ส่งออกรายงาน
                      </button>
                    </div>
                    {renderCustomerAgeTable()}
                  </div>
                  <hr style={{ border: '2px solid ' }} />
                </div>
                <div className="card-footer"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
