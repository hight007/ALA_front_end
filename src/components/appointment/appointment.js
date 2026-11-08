import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { key, OK, server } from '../../constants'
import { httpClient } from '../../utils/HttpClient'
import { useParams } from "react-router-dom";

import Calendar from 'react-calendar';
// import "react-calendar/dist/Calendar.css";
import './appointment.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import Swal from 'sweetalert2'

export default function Appointment() {
  const params = useParams();

  const [patientData, setPatientData] = useState([])
  const [appointmentDate, setappointmentDate] = useState(null)
  const [appointmentDescription, setappointmentDescription] = useState('')
  const [appointmentData, setappointmentData] = useState([])

  //loading effect
  const [isLoad, setisLoad] = useState(false)

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'open':
        return 'ala-status-badge ala-status-open';
      case 'waiting':
        return 'ala-status-badge ala-status-wait';
      case 'diagnose':
        return 'ala-status-badge ala-status-diagnose';
      case 'operate':
        return 'ala-status-badge ala-status-operate';
      case 'payment':
        return 'ala-status-badge ala-status-payment';
      default:
        return 'ala-status-badge ala-status-open';
    }
  }

  useEffect(() => {
    
    setisLoad(true)
    doGetPatientData()
    getAppointment()
  }, [])

  const doGetPatientData = async () => {  
    const { patient_id } = params
    const response = await httpClient.get(server.PATIENT_DATA_URL + '/' + patient_id)
    console.log(response.data);
    
    if (response.data.api_result === OK) {
      setPatientData(response.data.result)
    } else {
      setPatientData([])
    }
    setisLoad(false)
  }

  const renderPatientData = () => {
    return (
      <div className="card" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(233, 192, 112, 0.35)', boxShadow: '0 6px 20px rgba(30, 36, 48, 0.06)' }}>
        <div className="card-header d-flex align-items-center justify-content-between" style={{ background: 'linear-gradient(135deg, #1E2430 0%, #2A3242 100%)', color: '#E9C070', borderBottom: '2px solid #C5953A', padding: '0.9rem 1.25rem' }}>
          <h3 className="card-title mb-0 font-weight-bold" style={{ fontSize: '1.05rem' }}>
            <i className="fas fa-id-card mr-2" /> ข้อมูลลูกค้า (Patient Information)
          </h3>
          <span className={getStatusBadgeClass(patientData.status)}>{patientData.status}</span>
        </div>
        <div className="card-body box-profile">
          <div className="row">
            <div className="col-sm-6">
              <ul className="list-group list-group-unbordered mb-3 mb-sm-0">
                <li className="list-group-item d-flex justify-content-between align-items-center py-2">
                  <span><i className="fas fa-user mr-2 text-muted" /><b>ชื่อ - นามสกุล</b></span>
                  <span className="font-weight-bold text-dark">{patientData.first_name + ' ' + patientData.last_name}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center py-2">
                  <span><i className="fas fa-venus-mars mr-2 text-muted" /><b>เพศ</b></span>
                  <span className="text-muted">{patientData.sex}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center py-2">
                  <span><i className="fas fa-phone-alt mr-2 text-muted" /><b>โทรศัพท์</b></span>
                  <span className="text-dark font-weight-bold">{patientData.telephone_number}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center py-2">
                  <span><i className="fas fa-birthday-cake mr-2 text-muted" /><b>อายุ</b></span>
                  <span className="text-muted">{moment().format('yyyy') - patientData.year_of_birth} ปี</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center py-2">
                  <span><i className="fas fa-heartbeat mr-2 text-muted" /><b>สถานะ</b></span>
                  <span className={getStatusBadgeClass(patientData.status)}>{patientData.status}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center py-2">
                  <span><i className="fas fa-file-invoice-dollar mr-2 text-muted" /><b>จ่ายเงิน</b></span>
                  <Link to={"/patient/payment/" + patientData.patient_id} className="btn btn-success btn-sm px-3" style={{ borderRadius: '8px', fontWeight: 600 }}>
                    <i className="fas fa-cash-register mr-1" /> ไปหน้าจ่ายเงิน
                  </Link>
                </li>
              </ul>
            </div>
            <div className="col-sm-6">
              <div className="card h-100 mb-0" style={{ borderRadius: '12px', backgroundColor: '#FAF8F5', border: '1px solid rgba(233, 192, 112, 0.4)' }}>
                <div className="card-body">
                  <strong className="d-block mb-1" style={{ color: '#bd2130' }}>
                    <i className="fas fa-skull-crossbones mr-1" /> ยาหรืออาหารที่แพ้
                  </strong>
                  <p className="text-muted mb-2">
                    {patientData.drug_allergy == '' ? 'ไม่มี' : patientData.drug_allergy}
                  </p>
                  <hr className="my-2" />
                  <strong className="d-block mb-1" style={{ color: '#1b7f91' }}>
                    <i className="fas fa-pills mr-1" /> ยาที่ใช้ประจำ
                  </strong>
                  <p className="text-muted mb-2">
                    {patientData.drug_allergy == '' ? 'ไม่มี' : patientData.regular_medication}
                  </p>
                  <hr className="my-2" />
                  <strong className="d-block mb-1" style={{ color: '#966919' }}>
                    <i className="fas fa-disease mr-1" /> โรคประจำตัว
                  </strong>
                  <p className="text-muted mb-0">
                    {patientData.drug_allergy == '' ? 'ไม่มี' : patientData.chronic_disease}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderCreateAppointment = () => {
    return (
      <div className="card h-100" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(233, 192, 112, 0.35)', boxShadow: '0 6px 20px rgba(30, 36, 48, 0.06)' }}>
        <div className="card-header d-flex align-items-center" style={{ background: 'linear-gradient(135deg, #1E2430 0%, #2A3242 100%)', color: '#E9C070', borderBottom: '2px solid #C5953A', padding: '0.9rem 1.25rem' }}>
          <h3 className="card-title mb-0 font-weight-bold" style={{ fontSize: '1.05rem' }}>
            <i className="fas fa-calendar-plus mr-2" /> เพิ่มข้อมูลการนัดหมายใหม่
          </h3>
        </div>
        <div className="card-body d-flex flex-column">
          <div className="form-group">
            <label className="font-weight-bold text-dark">
              <i className="far fa-calendar-alt mr-1" style={{ color: '#C5953A' }} /> วันที่นัดหมาย :
            </label>
            <DatePicker
              placeholderText="เลือกวันนัดหมาย..."
              selected={appointmentDate}
              onChange={(date) => {
                setappointmentDate(date)
              }}
              showMonthDropdown
              minDate={moment().toDate()}
              dateFormat="dd-MMM-yyyy"
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label className="font-weight-bold text-dark">
              <i className="fas fa-comment-medical mr-1" style={{ color: '#55C5D9' }} /> คำอธิบายการนัดหมาย :
            </label>
            <input
              value={appointmentDescription}
              className="form-control"
              placeholder="ระบุรายละเอียด เช่น ติดตามผลหัตถการ, เติมโบท็อกซ์..."
              style={{ borderRadius: '10px' }}
              onChange={(e) => {
                setappointmentDescription(e.target.value)
              }}
              rows="3"
            />
          </div>
          <div className="mt-auto pt-2">
            <button
              className="btn py-2"
              onClick={() => {
                doAppointment()
              }}
              style={{ width: '100%', background: 'linear-gradient(135deg, #E9C070 0%, #C5953A 100%)', color: '#1E2430', fontWeight: 700, borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(197, 149, 58, 0.25)' }}
            >
              <i className="fas fa-check-circle mr-2" /> บันทึกวันนัดหมาย (ตกลง)
            </button>
          </div>
        </div>
      </div>
    )
  }

  const doAppointment = async () => {
    try {
      if (appointmentDate == null) {
        Swal.fire(
          'ข้อมูลไม่ครบถ้วน!',
          'กรุณาเลือกวันที่นัดหมาย',
          'warning'
        )
        return
      }

      Swal.fire({
        title: 'ต้องการเพิ่มข้อมูลการนัดหมาย?',
        // text: "You won't be able to revert this!",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ตกลง'
      }).then(async (result) => {
        if (result.isConfirmed) {
          const { patient_id } = params
          const appointmentData = {
            patient_id,
            appointment_date: moment(appointmentDate).format('YYYY-MM-DD'),
            appointment_description: appointmentDescription,
            updater: localStorage.getItem(key.USER_NAME)
          }
          const response = await httpClient.post(server.APPOINTMENT_URL, appointmentData)
          if (response.data.api_result === OK) {
            Swal.fire(
              'สำเร็จ!',
              'เพิ่มการนัดหมายสำเร็จ',
              'success'
            ).then(() => {
              setappointmentDate(null)
              setappointmentDescription('')
              getAppointment()
            })
          } else {
            Swal.fire(
              'ไม่สำเร็จ!',
              'เพิ่มการนัดหมายไม่สำเร็จ',
              'error'
            )
          }

        }
      })


    } catch (error) {
      console.log(error);
    }
  }

  const getAppointment = async () => {
    try {
      const { patient_id } = params
      const response = await httpClient.get(server.APPOINTMENT_PANTIENT_URL + `/${patient_id}`)
      // console.log(response.data.result);
      setappointmentData(response.data.result)
    } catch (error) {
      console.log(error);
    }
  }

  const renderAppointment = () => {
    return (
      <div className="card h-100" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(233, 192, 112, 0.35)', boxShadow: '0 6px 20px rgba(30, 36, 48, 0.06)' }}>
        <div className="card-header d-flex align-items-center justify-content-between" style={{ background: 'linear-gradient(135deg, #1E2430 0%, #2A3242 100%)', color: '#E9C070', borderBottom: '2px solid #C5953A', padding: '0.9rem 1.25rem' }}>
          <h3 className="card-title mb-0 font-weight-bold" style={{ fontSize: '1.05rem' }}>
            <i className="fas fa-calendar-alt mr-2" /> ตารางนัดของลูกค้า (Appointment Calendar)
          </h3>
          <span className="badge px-3 py-1 ml-auto" style={{ backgroundColor: 'rgba(233,192,112,0.2)', color: '#E9C070', borderRadius: '20px' }}>
            คลิกวันที่ที่มีนัดเพื่อยกเลิกนัดหมาย
          </span>
        </div>
        <div className="card-body">
          <div className='calendar-container'>
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
                        <span className="badge px-2 py-1" style={{ backgroundColor: '#1E2430', color: '#E9C070', borderRadius: '6px', fontSize: '0.7rem' }}>
                          <i className="fas fa-bell mr-1" /> มีนัด
                        </span>
                        <p className="mb-0 mt-1 text-dark" style={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
                          {item.appointment_description}
                        </p>
                      </div>
                    )
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  const doDeleteDate = async (date) => {

    Swal.fire({
      title: 'ต้องการลบ?',
      text: `ต้องการลบการนัดหมายในวันที่ ${moment(date).format("DD-MMM-YYYY")} ของ ${patientData.first_name + ' ' + patientData.last_name}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { patient_id } = params
        const response = await httpClient.delete(server.APPOINTMENT_URL, {
          data: {
            patient_id,
            appointment_date: moment(date).format('YYYY-MM-DD')
          }
        })
        if (response.data.api_result === OK) {
          getAppointment()

          Swal.fire(
            'ลบสำเร็จ!',
            `ลบการนัดหมายในวันที่ ${moment(date).format("DD-MMM-YYYY")} ของ ${patientData.first_name + ' ' + patientData.last_name} สำเร็จ`,
            'success'
          )

        } else {
          Swal.fire(
            'ลบไม่สำเร็จ!',
            `ลบการนัดหมายในวันที่ ${moment(date).format("DD-MMM-YYYY")} ของ ${patientData.first_name + ' ' + patientData.last_name} ไม่สำเร็จ`,
            'error'
          )
        }
      }
    })

  }

  const doActionCalendar = (date) => {
    setappointmentDate(date)
    setappointmentDescription('')
    if (appointmentData.find(x => moment(x.appointment_date).format("DD-MM-YYYY") === moment(date).format("DD-MM-YYYY"))) {
      doDeleteDate(date)
    }
  }
  return (
    <div className="content-wrapper">
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2 align-items-center">
            <div className="col-sm-8">
              <h1 className="m-0 font-weight-bold" style={{ color: '#1E2430', fontSize: '1.6rem' }}>
                <i className="fas fa-calendar-check mr-2" style={{ color: '#C5953A' }} />
                นัดหมายลูกค้า
              </h1>
              <p className="text-muted mb-0 mt-1" style={{ fontSize: '0.9rem' }}>
                กำหนดวันนัดหมายติดตามผลการรักษาและตรวจสอบตารางนัดของลูกค้า
              </p>
            </div>
            <div className="col-sm-4">
            </div>
          </div>
        </div>
      </div>
      <section className='content'>
        <div className='container-fluid'>
          <div className='row'>
            <div className='col-12'>
              <div className="overlay-wrapper" style={{ visibility: isLoad ? 'visible' : 'hidden' }}>
                <div className="overlay">
                  <i className="fas fa-3x fa-sync-alt fa-spin">
                  </i>
                  <div className="text-bold pt-2">Loading...</div>
                </div>
              </div>
              {renderPatientData()}
            </div>
            <div className="col-lg-4 col-12 mb-3">
              {renderCreateAppointment()}
            </div>
            <div className="col-lg-8 col-12 mb-3">
              {renderAppointment()}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
