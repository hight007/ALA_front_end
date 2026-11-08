import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { key, OK, server } from '../../../constants'
import { httpClient } from '../../../utils/HttpClient'

import Calendar from 'react-calendar';
import './appointment.css';

export default function Appointment() {

  const [appointmentData, setappointmentData] = useState([])
  const [appointmentDetailData, setAppointmentDetailData] = useState([])

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
      <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div className="card-header d-flex align-items-center justify-content-between" style={{ backgroundColor: '#1E2430', color: '#E9C070', padding: '16px 24px', borderBottom: '3px solid #E9C070' }}>
          <h3 className="card-title m-0" style={{ fontWeight: 600, fontSize: '1.1rem', color: '#E9C070' }}>
            <i className="far fa-calendar-check mr-2" /> ปฏิทินตารางนัดหมาย (Appointment Calendar)
          </h3>
          <span className="small" style={{ color: '#55C5D9' }}>
            <i className="fas fa-info-circle mr-1" /> คลิกวันที่ที่มีกรอบสีทองเพื่อดูรายชื่อลูกค้านัดหมาย
          </span>
        </div>
        <div className="card-body" style={{ padding: '24px' }}>
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
                    <div className="mt-1">
                      <span className="badge px-2 py-1" style={{ backgroundColor: '#1E2430', color: '#E9C070', borderRadius: '10px', fontSize: '0.75rem' }}>
                        มีนัด {item.appointment_count} คน
                      </span>
                    </div>
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
        <tr role="row" style={{ backgroundColor: '#1E2430', color: '#E9C070' }}>
          <th style={{ padding: '14px 16px', borderBottom: '2px solid #C5953A' }}>วันที่นัดหมาย</th>
          <th style={{ padding: '14px 16px', borderBottom: '2px solid #C5953A' }}>ชื่อ - นามสกุล ลูกค้า</th>
          <th style={{ padding: '14px 16px', borderBottom: '2px solid #C5953A' }}>อายุ</th>
          <th style={{ padding: '14px 16px', borderBottom: '2px solid #C5953A' }}>เบอร์โทรศัพท์</th>
          <th style={{ padding: '14px 16px', borderBottom: '2px solid #C5953A' }}>รายละเอียดการนัดหมาย</th>
          <th style={{ padding: '14px 16px', borderBottom: '2px solid #C5953A' }}>ผู้นัดหมาย</th>
          <th style={{ padding: '14px 16px', borderBottom: '2px solid #C5953A' }}>วันที่เพิ่มการนัดหมาย</th>
        </tr>
      )
    }

    const renderTableRow = () => {
      if (appointmentDetailData.length === 0) {
        return (
          <tr>
            <td colSpan={7} className="text-center py-5 text-muted">
              <i className="far fa-calendar-times fa-2x mb-2 d-block" style={{ color: '#E9C070' }} />
              ไม่มีรายการนัดหมายในวันที่เลือก
            </td>
          </tr>
        )
      }
      return appointmentDetailData.map((item, index) => (
        <tr key={index}>
          <td className="align-middle" style={{ padding: '14px 16px' }}>
            <span className="badge px-2 py-1" style={{ backgroundColor: 'rgba(233, 192, 112, 0.25)', color: '#1E2430', borderRadius: '6px', fontSize: '0.9rem' }}>
              <i className="far fa-calendar-alt mr-1" style={{ color: '#C5953A' }} />
              {moment(item.appointment_date).format('DD-MMM-YYYY')}
            </span>
          </td>
          <td className="align-middle" style={{ padding: '14px 16px' }}>
            <Link
              to={`/patient/patient_history/${item.PatientDatum.patient_id}`}
              style={{ fontWeight: 600, color: '#1E2430', textDecoration: 'none' }}
            >
              <i className="fas fa-user-circle mr-1" style={{ color: '#55C5D9' }} />
              {item.PatientDatum.first_name + ' ' + item.PatientDatum.last_name}
            </Link>
          </td>
          <td className="align-middle" style={{ padding: '14px 16px' }}>
            {(moment().format('YYYY') - item.PatientDatum.year_of_birth) + ' ปี'}
          </td>
          <td className="align-middle" style={{ padding: '14px 16px' }}>
            <i className="fas fa-phone-alt mr-1 text-muted" /> {item.PatientDatum.telephone_number}
          </td>
          <td className="align-middle" style={{ padding: '14px 16px' }}>
            {item.appointment_description}
          </td>
          <td className="align-middle" style={{ padding: '14px 16px' }}>
            {item.updater}
          </td>
          <td className="align-middle" style={{ padding: '14px 16px' }}>
            {moment(item.updatedAt).format('DD-MMM-YYYY')}
          </td>
        </tr>
      ))
    }
    return (
      <div className="card shadow-sm border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div className="card-header d-flex align-items-center justify-content-between" style={{ backgroundColor: '#1E2430', color: '#E9C070', padding: '16px 24px', borderBottom: '3px solid #55C5D9' }}>
          <h3 className="card-title m-0" style={{ fontWeight: 600, fontSize: '1.1rem', color: '#E9C070' }}>
            <i className="fas fa-user-clock mr-2" style={{ color: '#55C5D9' }} /> รายชื่อลูกค้านัดหมาย ({appointmentDetailData.length} รายการ)
          </h3>
        </div>
        <div className="card-body" style={{ padding: '24px' }}>
          <div className="overlay-wrapper" style={{ visibility: isLoad ? 'visible' : 'hidden' }}>
            <div className="overlay">
              <i className="fas fa-3x fa-sync-alt fa-spin" />
              <div className="text-bold pt-2">Loading...</div>
            </div>
          </div>
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
      </div>
    )
  }

  return (
    <div className="content-wrapper" style={{ backgroundColor: '#F8F9FC', minHeight: '100vh', paddingBottom: '2rem' }}>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-3 align-items-center">
            <div className="col-sm-6">
              <h1 className="m-0" style={{ color: '#1E2430', fontWeight: 700, fontSize: '1.75rem' }}>
                <i className="fas fa-calendar-alt mr-2" style={{ color: '#C5953A' }} />
                รายงานการนัดหมายลูกค้า (Appointments)
              </h1>
            </div>
          </div>
        </div>
      </div>
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
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
