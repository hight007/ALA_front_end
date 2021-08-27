import moment from 'moment';
import React, { useEffect, useState } from 'react'
import Chart from "react-apexcharts";
import { OK, server } from '../../constants';
import { httpClient } from '../../utils/HttpClient';
import CurrencyFormat from 'react-currency-format';
import { Icon } from '@iconify/react';

export default function Home() {
  const [generalData, setgeneralData] = useState(null)
  const [dataLabels, setdataLabels] = useState(true)
  const [chartType, setchartType] = useState('area')

  useEffect(() => {
    getGeneralData()
  }, [])


  const getGeneralData = async () => {
    const response = await httpClient.get(server.REPORT_GENERAL_URL)
    if (response.data.api_result === OK) {
      setgeneralData(response.data)
      console.log(response.data);
    }
  }

  const renderSalesChart = () => {
    if (generalData) {
      return (
        <div className='row'>
          <div style={{ margin: 10 }}>
            <button style={{ marginRight: 10 }} className="btn btn-primary btn-xs" onClick={() => { setdataLabels(!dataLabels) }}> {dataLabels ? 'ปิด' : 'เปิด'}การแสดงข้อมูลในกราฟ</button>
            <button className="btn btn-warning btn-xs" onClick={() => { setchartType('bar') }}>Bar</button>
            <button className="btn btn-warning btn-xs" onClick={() => { setchartType('line') }}>Line</button>
            <button className="btn btn-warning btn-xs" onClick={() => { setchartType('area') }}>Area</button>
          </div>
          <div className="mixed-chart" style={{ width: '100%' }}>
            <Chart
              options={{
                title: {
                  text: 'Daily sales report (รายงานยอดขายรายวัน)',
                },
                xaxis: {
                  categories: generalData.salesChartData.categories
                },
                stroke: {
                  curve: 'smooth',
                },
                dataLabels: {
                  enabled: dataLabels
                },
              }}
              series={generalData.salesChartData.series}
              type={chartType}
              height="300vw"
            />
          </div>
        </div>
      )
    }
  }

  const renderGeneralData = () => {
    if (generalData) {
      return (
        <div className="row">
          <div className="col-12 text-left" style={{ marginBottom: 10 }}>ข้อมูลล่าสุดเมื่อวันที่ : {moment(generalData.dailySales[generalData.dailySales.length - 1].createdAt).format('DD MMM YYYY')}</div>
          <div className="col-12 col-sm-6 col-md-3">
            <div className="info-box">
              <span className="info-box-icon bg-dark elevation-1" ><i className="fas fa-users" /></span>
              <div className="info-box-content">
                <span className="info-box-text">ลูกค้าทั้งหมด</span>
                <span className="info-box-number">
                  {generalData.totalPatient}
                </span>
              </div>
              {/* /.info-box-content */}
            </div>
            {/* /.info-box */}
          </div>

          {/* /.col */}
          {/* fix for small devices only */}
          <div className="clearfix hidden-md-up" />
          <div className="col-12 col-sm-6 col-md-3">
            <div className="info-box mb-3">
              <span className="info-box-icon bg-warning elevation-1"><Icon icon="fa-solid:user-tie" /></span>
              <div className="info-box-content">
                <span className="info-box-text">ลูกค้าวันนี้</span>
                <span className="info-box-number">{generalData.dailySales[generalData.dailySales.length - 1].customer}</span>
              </div>
              {/* /.info-box-content */}
            </div>
            {/* /.info-box */}
          </div>
          {/* /.col */}
          <div className="col-12 col-sm-6 col-md-3">
            <div className="info-box mb-3">
              <span className="info-box-icon bg-success elevation-1"><Icon icon="fa-solid:user-plus" /></span>
              <div className="info-box-content">
                <span className="info-box-text">ลูกค้าใหม่วันนี้</span>
                <span className="info-box-number">{generalData.dailySales[generalData.dailySales.length - 1].new_customer}</span>
              </div>
              {/* /.info-box-content */}
            </div>
            {/* /.info-box */}
          </div>
          {/* /.col */}
          {/* /.col */}
          <div className="col-12 col-sm-6 col-md-3">
            <div className="info-box mb-3">
              <span className="info-box-icon elevation-1" style={{ backgroundColor: '#53C3D7' }}>
                <Icon icon="bi:cash-coin" />
              </span>
              <div className="info-box-content">
                <span className="info-box-text">ยอดขายวันนี้</span>
                <span className="info-box-number">
                  <CurrencyFormat value={generalData.dailySales[generalData.dailySales.length - 1].sales} displayType={'text'} thousandSeparator={true} suffix={' บาท'} renderText={value => <b>{value}</b>} />
                  { }</span>
              </div>
              {/* /.info-box-content */}
            </div>
            {/* /.info-box */}
          </div>
        </div>

      )
    }
  }

  return (
    <div className='content-wrapper'>
      <section className='content'>
        <div style={{ textAlign: 'center' }}>
          <img style={{ height: '22vh' }} src="/img/ALA_logo.png" />
        </div>

        {renderGeneralData()}
        {renderSalesChart()}
        <div className='row'>

        </div>
      </section>
    </div>
  )
}

