import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { key, OK, server } from '../../constants'
import { httpClient } from '../../utils/HttpClient'

import Calendar from 'react-calendar';
// import "react-calendar/dist/Calendar.css";
import './appointment.css';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import Swal from 'sweetalert2'

export default function Appointment(props) {
  const [patientData, setPatientData] = useState([])
  const [appointmentDate, setappointmentDate] = useState(null)
  const [appointmentDescription, setappointmentDescription] = useState('')
  const [appointmentData, setappointmentData] = useState([])

  //loading effect
  const [isLoad, setisLoad] = useState(false)

  useEffect(() => {
    setisLoad(true)
    doGetPatientData()
    getAppointment()
  }, [])

  const doGetPatientData = async () => {
    const { patient_id } = props.match.params
    const response = await httpClient.get(server.PATIENT_DATA_URL + '/' + patient_id)
    if (response.data.api_result === OK) {
      setPatientData(response.data.result)
    } else {
      setPatientData([])
    }
    setisLoad(false)
  }

  const renderPatientData = () => {
    return (
      <div className="card card-dark">
        <div className="card-body box-profile">
          <p className="text-muted text-center">{patientData.job}</p>
          <ul className="list-group list-group-unbordered mb-3">
            <div className="row">
              <div className="col-sm-6">
                <li class="list-group-item">
                  <b>ชื่อ - นามสกุล </b> <label className="float-right text-muted text-center">{patientData.first_name + ' ' + patientData.last_name}</label>
                </li>
                <li class="list-group-item">
                  <b>เพศ </b> <label className="float-right text-muted text-center">{patientData.sex}</label>
                </li>
                <li class="list-group-item">
                  <b>โทรศัพท์ </b> <label className="float-right text-muted text-center">{patientData.telephone_number}</label>
                </li>
                <li class="list-group-item">
                  <b>อายุ </b> <label className="float-right text-muted text-center">{moment().format('yyyy') - patientData.year_of_birth}</label>
                </li>
                <li class="list-group-item">
                  <b>สถานะ </b> <label style={{ color: 'red' }} className={patientData.status != 'operate' ? 'float-right text-center' : 'float-right text-center text-muted'}>{patientData.status}</label>
                </li>
                <li class="list-group-item">
                  <b>จ่ายเงิน </b> <label className={'float-right text-center text-muted'}><Link to={"/patient/payment/" + patientData.patient_id} className="btn btn-success btn-xs">จ่ายเงิน</Link></label>
                </li>

              </div>
              <div className="col-sm-6">
                <div className="card card-default">
                  {/* /.card-header */}
                  <div className="card-body">
                    <strong><i className="fas fa-skull-crossbones" /> ยาหรืออาหารที่แพ้</strong>
                    <p className="text-muted">
                      {patientData.drug_allergy == '' ? 'ไม่มี' : patientData.drug_allergy}
                    </p>
                    <hr />
                    <strong><i className="fas fa-pills" /> ยาที่ใช้ประจำ</strong>
                    <p className="text-muted">
                      {patientData.drug_allergy == '' ? 'ไม่มี' : patientData.regular_medication}
                    </p>
                    <hr />
                    <strong><i className="fas fa-disease" /> โรคประจำตัว</strong>
                    <p className="text-muted">
                      {patientData.drug_allergy == '' ? 'ไม่มี' : patientData.chronic_disease}
                    </p>
                  </div>
                  {/* /.card-body */}
                </div>
              </div>
            </div>
          </ul>
        </div>
        {/* /.card-body */}
      </div>
    )
  }

  const renderCreateAppointment = () => {
    return (
      <div className="card card-default">
        {/* <div className="card-header"></div> */}
        <div className="card-body">
          <div className="form-group">
            <label>วันที่นัดหมาย :</label>
            <DatePicker
              placeholderText="เลือกวันนัดหมาย"
              selected={appointmentDate}
              onChange={(date) => {
                setappointmentDate(date)
              }}
              showMonthDropdown
              minDate={moment().toDate()}
              dateFormat="dd-MMM-yyyy"
              className="form-control"
            />

            <br></br>
          </div>
          <div className="form-group">
            <label>คำอธิบายการนัดหมาย :</label>
            <input value={appointmentDescription} className="form-control" onChange={(e) => {
              setappointmentDescription(e.target.value)
            }} rows="3" />
          </div>
          <button className="btn btn-primary" onClick={() => {
            doAppointment()
          }} style={{ width: '100%' }}> ตกลง</button>

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
          const { patient_id } = props.match.params
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
      const { patient_id } = props.match.params
      const response = await httpClient.get(server.APPOINTMENT_PANTIENT_URL + `/${patient_id}`)
      // console.log(response.data.result);
      setappointmentData(response.data.result)
    } catch (error) {
      console.log(error);
    }
  }

  const renderAppointment = () => {
    // if (appointmentData.length > 0) {

    return (
      <div className="card card-dark">
        <div className="card-header">
          <h3 class="card-title">ตารางนัดของลูกค้า</h3>
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
                      <>
                        <label style={{ fontWeight: 'bold', marginLeft: 10 }}>
                          มีนัด
                        </label>
                        <p>
                          {item.appointment_description}
                        </p>
                      </>
                    )
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    )
    // }
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
        const { patient_id } = props.match.params
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
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">นัดหมายลูกค้า</h1>
            </div>{/* /.col */}
            <div className="col-sm-6">

            </div>{/* /.col */}
          </div>{/* /.row */}
        </div>{/* /.container-fluid */}
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
            <div className="col-12">
              {renderCreateAppointment()}
            </div>
            <div className="col-12">
              {renderAppointment()}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
