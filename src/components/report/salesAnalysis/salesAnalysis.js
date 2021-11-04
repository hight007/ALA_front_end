import React, { useEffect, useState } from 'react'
import { OK, server } from '../../../constants';
import { httpClient } from '../../../utils/HttpClient';
import CurrencyFormat from 'react-currency-format';
import DatePicker from "react-datepicker";
import moment from 'moment';


export default function SalesAnalysis() {
  const [analysisData, setAnalysisData] = useState([])

  const [startDate, setStartDate] = useState(moment().add(-30, 'day').toDate());
  const [endDate, setEndDate] = useState(moment().toDate());

  useEffect(() => {
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
        setAnalysisData(response.data)
      }
    } catch (error) {
      console.log(error);
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
                <div className="card-header"></div>
                <div className="card-body">
                  {renderOption()}
                  <h2>if you need full version please contact developer <a target="_blank" href='https://www.facebook.com/TheHight'> Highto Kung Nuttee</a></h2>
                  <div>
                    <h3>promotion analysis</h3>
                    {JSON.stringify(analysisData.promotionPareto)}
                  </div>
                  <div>
                    <h3>payment analysis</h3>
                    {JSON.stringify(analysisData.paymentPareto)}
                  </div>
                  <div>
                    <h3>sex analysis</h3>
                    {JSON.stringify(analysisData.sexPareto)}
                  </div>
                  <div>
                    <h3>age analysis</h3>
                    {JSON.stringify(analysisData.agePareto)}
                  </div>
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
