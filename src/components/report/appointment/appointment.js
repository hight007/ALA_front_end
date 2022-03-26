import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { key, OK, server } from '../../../constants'
import { httpClient } from '../../../utils/HttpClient'

import Calendar from 'react-calendar';
// import "react-calendar/dist/Calendar.css";
import './appointment.css';

export default function Appointment() {

  const [appointmentData, setappointmentData] = useState([])
  const [appointmentDetailData, setAppointmentDetailData] = useState([])
  // const [appointmentDate, setappointmentDate] = useState(moment().toDate())

  //loading effect
  const [isLoad, setisLoad] = useState(false)

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    setisLoad(true)
    await doGetAppointData()
    await doGetAppointmentDetail(moment().format('YYYY-MM-DD'))
    setisLoad(false)
  }

  const doActionCalendar = (date) => {
    if (appointmentData.find(x => moment(x.appointment_date).format("DD-MM-YYYY") === moment(date).format("DD-MM-YYYY"))) {
      doGetAppointmentDetail(moment(date).format('YYYY-MM-DD'))
    }
  }

  const doGetAppointData = async () => {
    const response = await httpClient.get(server.APPOINTMENT_URL)
    if (response.data.api_result === OK) {
      // console.log(response.data.result);
      setappointmentData(response.data.result)
    }
  }

  const doGetAppointmentDetail = async (date) => {
    setisLoad(true)
    const response = await httpClient.get(`${server.APPOINTMENT_DATE_URL}/${date}`)
    console.log(response.data.result);
    setAppointmentDetailData(response.data.result)
    setisLoad(false)
  }

  const renderCalendar = () => {
    return (
      <div className='card card-default'>
        {/* <div className='card-header'>
                </div> */}
        <div className='card-body'>
          <Calendar
            onChange={doActionCalendar}
            minDate={new Date()}
            className="react-calendar"
            tileClassName={({ date, view }) => {
              if (appointmentData.find(x => moment(x.appointment_date).format("DD-MM-YYYY") === moment(date).format("DD-MM-YYYY"))) {
                if (moment(date).format("DD-MM-YYYY") >= moment().format("DD-MM-YYYY")) {
                  return 'highlight'
                }
              }
            }}
            tileContent={({ date, view }) => {
              for (let index = 0; index < appointmentData.length; index++) {
                const item = appointmentData[index];
                if (moment(item.appointment_date).format("DD-MM-YYYY") === moment(date).format("DD-MM-YYYY")) {
                  return (
                    <>
                      <p>
                        <label style={{ fontWeight: 'bold', marginLeft: 10 }}>
                          มีนัด {item.appointment_count} คน
                        </label>
                      </p>
                    </>
                  )
                }
              }
            }}
          />
        </div>
      </div>
    )
  }

  const renderAppointmentDetail = () => {
    const renderTableHeader = () => {
      return (
        <tr role="row">
          <th>วันที่นัดหมาย</th>
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
            รายละเอียดการนัดหมาย
          </th>
          <th>ผู้นัดหมาย</th>
          <th>วันที่เพิ่มการนัดหมาย</th>
        </tr>
      )
    }

    const renderTableRow = () => {
      return appointmentDetailData.map((item, index) => (
        <tr>
          <td>{moment(item.appointment_date).format('DD-MMM-YYYY')}</td>
          <td>
            <Link to={`/patient/patient_history/${item.PatientDatum.patient_id}`}>{item.PatientDatum.first_name + ' ' + item.PatientDatum.last_name}</Link>
          </td>
          <td>
            {(moment().format('YYYY') - item.PatientDatum.year_of_birth) + ' ปี'}
          </td>
          <td>{item.PatientDatum.telephone_number}</td>
          <td>{item.appointment_description}</td>
          <td>{item.updater}</td>
          <td>{moment(item.updatedAt).format('DD-MMM-YYYY')}</td>
        </tr>
      ))
    }
    return (
      <div className='card card-default'>
        <div className='card-body'>
          <div className="overlay-wrapper" style={{ visibility: isLoad ? 'visible' : 'hidden' }}>
            <div className="overlay">
              <i className="fas fa-3x fa-sync-alt fa-spin">
              </i>
              <div className="text-bold pt-2">Loading...</div>
            </div>
          </div>
          <table className="table table-hover text-nowrap" role="grid">
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

  return (
    <div className="content-wrapper">
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">รายงานการนัดหมายลูกค้า</h1>
            </div>{/* /.col */}
            <div className="col-sm-6">

            </div>{/* /.col */}
          </div>{/* /.row */}
        </div>{/* /.container-fluid */}
      </div>
      <section className='content'>
        <div className="container-fluid">
          <div className='row'>
            <div className='col-12'>
              {renderCalendar()}
            </div>
            <div className="col-12">
              {renderAppointmentDetail()}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
