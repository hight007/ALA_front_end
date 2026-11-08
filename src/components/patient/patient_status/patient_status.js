import React, { useState, useEffect, useRef } from 'react'
import { key, OK, server } from "../../../constants";
import { httpClient } from '../../../utils/HttpClient';
import FlatList from 'flatlist-react';
import moment from 'moment';
import Swal from 'sweetalert2';
import { useNavigate, } from "react-router-dom";

export default function Patient_status(props) {
  const [patientWaitingData, setPatientWaitingData] = useState([])
  const [patientDiagnoseData, setPatientDiagnoseData] = useState([])
  const [patientOperateData, setPatientOperateData] = useState([])
  const [lastUpdated, setLastUpdated] = useState(moment().format('HH:mm:ss'))
  const [isRefreshing, setIsRefreshing] = useState(false)

  const navigate = useNavigate();

  useEffect(() => {
    doGetPatientData()

    // Auto-refresh queue status every 30 seconds
    const interval = setInterval(() => {
      doGetPatientData(true)
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const doGetPatientData = async (isAuto = false) => {
    try {
      if (!isAuto) setIsRefreshing(true)
      let responsePatientWaitingData = await httpClient.get(server.STATUS_PATIENT_DATA_URL + '/waiting')
      let responsePatientDiagnoseData = await httpClient.get(server.STATUS_PATIENT_DATA_URL + '/diagnose')
      let responsePatientOperateData = await httpClient.get(server.STATUS_PATIENT_DATA_URL + '/operate')

      if (responsePatientWaitingData.data.result.length > 0) {
        setPatientWaitingData(responsePatientWaitingData.data.result)
      } else {
        setPatientWaitingData([])
      }

      if (responsePatientDiagnoseData.data.result.length > 0) {
        setPatientDiagnoseData(responsePatientDiagnoseData.data.result)
      } else {
        setPatientDiagnoseData([])
      }

      if (responsePatientOperateData.data.result.length > 0) {
        setPatientOperateData(responsePatientOperateData.data.result)
      } else {
        setPatientOperateData([])
      }
      setLastUpdated(moment().format('HH:mm:ss'))
    } catch (error) {
      console.log(error);
    } finally {
      if (!isAuto) {
        setTimeout(() => setIsRefreshing(false), 300)
      }
    }
  }

  //cancel functions
  const doCancelDiagnose = async (item) => {
    try {
      Swal.fire({
        title: 'ต้องการให้ลูกค้า ' + item.first_name + ' ' + item.last_name + ' ยกเลิกเข้าพบแพทย์',
        text: "กรุณาตรวจสอบให้แน่ใจก่อนกดตกลง",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ตกลง',
        cancelButtonText: 'ยกเลิก',
      }).then(async (result) => {
        if (result.isConfirmed) {

          const transactionData = {
            patient_id: item.patient_id,
            status: 'open',
            updater: localStorage.getItem(key.USER_NAME)
          }
          let transactionResponse = await httpClient.post(server.PROCESS_TRANSACTION_URL, transactionData)
          let response = await httpClient.put(server.PATIENT_DATA_URL, transactionData)

          if (transactionResponse.data.api_result === OK && response.data.api_result === OK) {
            doGetPatientData()
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'การเปลี่ยนสถานะของลูกค้าล้มเหลว โปรดลองอีกครั้ง',
            })
          }
        }
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'มีข้อผิดพลาดเกิดขึ้น โปรดลองอีกครั้ง',
        footer: error.toString(),
      })
    }
  }
  const doCancelOperate = async (item) => {
    try {
      Swal.fire({
        title: 'ต้องการให้ลูกค้า ' + item.first_name + ' ' + item.last_name + ' ยกเลิกการทำหัตถการ',
        text: "กรุณาตรวจสอบให้แน่ใจก่อนกดตกลง",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ตกลง',
        cancelButtonText: 'ยกเลิก',
      }).then(async (result) => {
        if (result.isConfirmed) {

          const transactionData = {
            patient_id: item.patient_id,
            status: 'open',
            updater: localStorage.getItem(key.USER_NAME)
          }
          let transactionResponse = await httpClient.post(server.PROCESS_TRANSACTION_URL, transactionData)
          let response = await httpClient.put(server.PATIENT_DATA_URL, transactionData)

          if (transactionResponse.data.api_result === OK && response.data.api_result === OK) {
            doGetPatientData()
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'การเปลี่ยนสถานะของลูกค้าล้มเหลว โปรดลองอีกครั้ง',
            })
          }
        }
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'มีข้อผิดพลาดเกิดขึ้น โปรดลองอีกครั้ง',
        footer: error.toString(),
      })
    }
  }


  //action functions
  const doDiagnose = async (item) => {
    try {
      Swal.fire({
        title: 'ต้องการให้ลูกค้า ' + item.first_name + ' ' + item.last_name + ' เข้าพบแพทย์',
        text: "กรุณาตรวจสอบให้แน่ใจก่อนกดตกลง",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ตกลง',
        cancelButtonText: 'ยกเลิก',
      }).then(async (result) => {
        if (result.isConfirmed) {

          const transactionData = {
            patient_id: item.patient_id,
            status: 'diagnose',
            updater: localStorage.getItem(key.USER_NAME)
          }
          let transactionResponse = await httpClient.post(server.PROCESS_TRANSACTION_URL, transactionData)
          let response = await httpClient.put(server.PATIENT_DATA_URL, transactionData)

          if (transactionResponse.data.api_result === OK && response.data.api_result === OK) {
            navigate('/patient/patient_history/' + item.patient_id)
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'การเปลี่ยนสถานะของลูกค้าล้มเหลว โปรดลองอีกครั้ง',
            })
          }
        }
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'มีข้อผิดพลาดเกิดขึ้น โปรดลองอีกครั้ง',
        footer: error.toString(),
      })
    }
  }

  const renderPatientStatusWaiting = () => {
    const renderPatientData = (item, idx) => {
      return (
        <div className="col-lg-4 col-md-6 mb-3" key={item.patient_id || idx}>
          <div className="card h-100 mb-0" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(233, 192, 112, 0.35)', boxShadow: '0 6px 18px rgba(30, 36, 48, 0.06)' }}>
            <div className="card-header d-flex align-items-center justify-content-between" style={{ background: 'linear-gradient(135deg, #1E2430 0%, #2A3242 100%)', color: '#E9C070', borderBottom: '2px solid #E9C070' }}>
              <h3 className="card-title mb-0 font-weight-bold" style={{ fontSize: '1rem' }}>
                <i className="fas fa-hourglass-half mr-2" /> ลูกค้าคิวที่ {idx + 1}
              </h3>
              <div className="card-tools ml-auto d-flex align-items-center">
                <span className="ala-status-badge ala-status-wait mr-2" style={{ backgroundColor: 'rgba(233,192,112,0.2)', color: '#E9C070', border: '1px solid #E9C070', padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem' }}>Waiting</span>
                <button type="button" className="btn btn-tool text-white" data-card-widget="collapse">
                  <i className="fas fa-minus" />
                </button>
              </div>
            </div>
            <div className="card-body box-profile d-flex flex-column">
              <h3 className="profile-username text-center font-weight-bold mb-1" style={{ color: '#1E2430', fontSize: '1.25rem' }}>
                {item.first_name + ' ' + item.last_name}
              </h3>
              <p className="text-center mb-3">
                <span className="badge px-3 py-1" style={{ backgroundColor: 'rgba(233, 192, 112, 0.16)', color: '#8A6421', border: '1px solid #E9C070', borderRadius: '20px' }}>
                  หมายเลขประจำตัวลูกค้า : {item.patient_id}
                </span>
              </p>
              <ul className="list-group list-group-unbordered mb-3">
                <li className="list-group-item d-flex justify-content-between align-items-center py-2">
                  <span><i className="fas fa-venus-mars mr-2 text-muted" /><b>เพศ</b></span>
                  <span className="text-muted">{item.sex}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center py-2">
                  <span><i className="fas fa-phone-alt mr-2 text-muted" /><b>โทรศัพท์</b></span>
                  <span className="text-dark font-weight-bold">{item.telephone_number}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center py-2">
                  <span><i className="fas fa-birthday-cake mr-2 text-muted" /><b>อายุ</b></span>
                  <span className="text-muted">{moment().format('yyyy') - item.year_of_birth} ปี</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center py-2">
                  <span><i className="fas fa-briefcase mr-2 text-muted" /><b>อาชีพ</b></span>
                  <span className="text-muted">{item.job || '-'}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center py-2">
                  <span><i className="fas fa-clock mr-2 text-warning" /><b>เวลาที่เริ่มรอคิว</b></span>
                  <span className="font-weight-bold text-dark">{moment(item.updatedAt).format('HH:mm')} น.</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center py-2">
                  <span><i className="fas fa-stopwatch mr-2 text-danger" /><b>รอคิวมาแล้ว</b></span>
                  <span className="badge badge-warning px-2 py-1" style={{ fontSize: '0.85rem', borderRadius: '8px' }}>
                    {moment().diff(moment(item.updatedAt), 'm')} นาที
                  </span>
                </li>
              </ul>
              <div className="mt-auto">
                <button className="btn btn-block py-2 mb-2" style={{ background: 'linear-gradient(135deg, #E9C070 0%, #C5953A 100%)', color: '#1E2430', fontWeight: 700, borderRadius: '10px', border: 'none' }} onClick={(e) => {
                  e.preventDefault();
                  doDiagnose(item)
                }}>
                  <i className="fas fa-user-md mr-2" /><b>เข้าพบแพทย์</b>
                </button>
                <button className="btn btn-outline-danger btn-block btn-sm py-2" style={{ borderRadius: '10px', fontWeight: 600 }} onClick={(e) => {
                  e.preventDefault();
                  doCancelDiagnose(item)
                }}>
                  <i className="fas fa-times-circle mr-1" /> ยกเลิกการเข้าพบแพทย์
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className="card-body">
        <div className="row">
          <FlatList
            list={patientWaitingData}
            renderItem={renderPatientData}
            renderWhenEmpty={() => {
              return (
                <div className="col-12 text-center py-4 text-muted">
                  <i className="fas fa-couch fa-2x mb-2" style={{ color: '#E9C070', opacity: 0.6 }} />
                  <p className="mb-0">ไม่มีคนไข้ที่กำลังรอคิวในขณะนี้</p>
                </div>
              )
            }}
          />
        </div>
      </div>
    )
  }
  const renderPatientStatusDiagnose = () => {
    const renderPatientData = (item, idx) => {
      return (
        <div className="col-lg-4 col-md-6 mb-3" key={item.patient_id || idx}>
          <div className="card h-100 mb-0" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(85, 197, 217, 0.45)', boxShadow: '0 6px 18px rgba(30, 36, 48, 0.06)' }}>
            <div className="card-header d-flex align-items-center justify-content-between" style={{ background: 'linear-gradient(135deg, #1E2430 0%, #2A3242 100%)', color: '#55C5D9', borderBottom: '2px solid #55C5D9' }}>
              <h3 className="card-title mb-0 font-weight-bold" style={{ fontSize: '1rem' }}>
                <i className="fas fa-stethoscope mr-2" /> ลูกค้าคิวที่ {idx + 1}
              </h3>
              <div className="card-tools ml-auto d-flex align-items-center">
                <span className="ala-status-badge ala-status-diagnose mr-2" style={{ backgroundColor: 'rgba(85,197,217,0.2)', color: '#55C5D9', border: '1px solid #55C5D9', padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem' }}>Diagnose</span>
                <button type="button" className="btn btn-tool text-white" data-card-widget="collapse">
                  <i className="fas fa-minus" />
                </button>
              </div>
            </div>
            <div className="card-body box-profile d-flex flex-column">
              <h3 className="profile-username text-center font-weight-bold mb-1" style={{ color: '#1E2430', fontSize: '1.25rem' }}>
                {item.first_name + ' ' + item.last_name}
              </h3>
              <p className="text-center mb-3">
                <span className="badge px-3 py-1" style={{ backgroundColor: 'rgba(85, 197, 217, 0.14)', color: '#1b7f91', border: '1px solid #55C5D9', borderRadius: '20px' }}>
                  หมายเลขประจำตัวลูกค้า : {item.patient_id}
                </span>
              </p>
              <ul className="list-group list-group-unbordered mb-3">
                <li className="list-group-item d-flex justify-content-between align-items-center py-2">
                  <span><i className="fas fa-venus-mars mr-2 text-muted" /><b>เพศ</b></span>
                  <span className="text-muted">{item.sex}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center py-2">
                  <span><i className="fas fa-phone-alt mr-2 text-muted" /><b>โทรศัพท์</b></span>
                  <span className="text-dark font-weight-bold">{item.telephone_number}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center py-2">
                  <span><i className="fas fa-birthday-cake mr-2 text-muted" /><b>อายุ</b></span>
                  <span className="text-muted">{moment().format('yyyy') - item.year_of_birth} ปี</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center py-2">
                  <span><i className="fas fa-briefcase mr-2 text-muted" /><b>อาชีพ</b></span>
                  <span className="text-muted">{item.job || '-'}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center py-2">
                  <span><i className="fas fa-clock mr-2" style={{ color: '#55C5D9' }} /><b>เวลาที่เริ่มพบแพทย์</b></span>
                  <span className="font-weight-bold text-dark">{moment(item.updatedAt).format('HH:mm')} น.</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center py-2">
                  <span><i className="fas fa-stopwatch mr-2" style={{ color: '#55C5D9' }} /><b>พบแพทย์มาแล้ว</b></span>
                  <span className="badge px-2 py-1" style={{ backgroundColor: '#55C5D9', color: '#fff', fontSize: '0.85rem', borderRadius: '8px' }}>
                    {moment().diff(moment(item.updatedAt), 'm')} นาที
                  </span>
                </li>
              </ul>
              <div className="mt-auto">
                <button className="btn btn-block py-2 mb-2" style={{ background: 'linear-gradient(135deg, #55C5D9 0%, #3aa8bc 100%)', color: '#ffffff', fontWeight: 700, borderRadius: '10px', border: 'none' }} onClick={(e) => {
                  e.preventDefault();
                  navigate('/patient/patient_history/' + item.patient_id)
                }}>
                  <i className="fas fa-notes-medical mr-2" /><b>เข้าพบแพทย์ต่อ...</b>
                </button>
                <button className="btn btn-outline-danger btn-block btn-sm py-2" style={{ borderRadius: '10px', fontWeight: 600 }} onClick={(e) => {
                  e.preventDefault();
                  doCancelOperate(item)
                }}>
                  <i className="fas fa-times-circle mr-1" /> ยกเลิกหัตถการ
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className="card-body">
        <div className="row">
          <FlatList
            list={patientDiagnoseData}
            renderItem={renderPatientData}
            renderWhenEmpty={() => {
              return (
                <div className="col-12 text-center py-4 text-muted">
                  <i className="fas fa-user-md fa-2x mb-2" style={{ color: '#55C5D9', opacity: 0.6 }} />
                  <p className="mb-0">ไม่มีคนไข้ในห้องตรวจแพทย์ขณะนี้</p>
                </div>
              )
            }}
          />
        </div>
      </div>
    )
  }
  const renderPatientStatusOperate = () => {
    const renderPatientData = (item, idx) => {
      return (
        <div className="col-lg-4 col-md-6 mb-3" key={item.patient_id || idx}>
          <div className="card h-100 mb-0" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(197, 149, 58, 0.4)', boxShadow: '0 6px 18px rgba(30, 36, 48, 0.06)' }}>
            <div className="card-header d-flex align-items-center justify-content-between" style={{ background: 'linear-gradient(135deg, #1E2430 0%, #2A3242 100%)', color: '#E9C070', borderBottom: '2px solid #28a745' }}>
              <h3 className="card-title mb-0 font-weight-bold" style={{ fontSize: '1rem' }}>
                <i className="fas fa-spa mr-2 text-success" /> ลูกค้าคิวที่ {idx + 1}
              </h3>
              <div className="card-tools ml-auto d-flex align-items-center">
                <span className="ala-status-badge ala-status-operate mr-2" style={{ backgroundColor: 'rgba(40,167,69,0.2)', color: '#5cd879', border: '1px solid #28a745', padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem' }}>Operate</span>
                <button type="button" className="btn btn-tool text-white" data-card-widget="collapse">
                  <i className="fas fa-minus" />
                </button>
              </div>
            </div>
            <div className="card-body box-profile d-flex flex-column">
              <h3 className="profile-username text-center font-weight-bold mb-1" style={{ color: '#1E2430', fontSize: '1.25rem' }}>
                {item.first_name + ' ' + item.last_name}
              </h3>
              <p className="text-center mb-3">
                <span className="badge px-3 py-1" style={{ backgroundColor: 'rgba(40, 167, 69, 0.12)', color: '#1e7e34', border: '1px solid rgba(40, 167, 69, 0.35)', borderRadius: '20px' }}>
                  หมายเลขประจำตัวลูกค้า : {item.patient_id}
                </span>
              </p>
              <ul className="list-group list-group-unbordered mb-3">
                <li className="list-group-item d-flex justify-content-between align-items-center py-2">
                  <span><i className="fas fa-venus-mars mr-2 text-muted" /><b>เพศ</b></span>
                  <span className="text-muted">{item.sex}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center py-2">
                  <span><i className="fas fa-phone-alt mr-2 text-muted" /><b>โทรศัพท์</b></span>
                  <span className="text-dark font-weight-bold">{item.telephone_number}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center py-2">
                  <span><i className="fas fa-birthday-cake mr-2 text-muted" /><b>อายุ</b></span>
                  <span className="text-muted">{moment().format('yyyy') - item.year_of_birth} ปี</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center py-2">
                  <span><i className="fas fa-briefcase mr-2 text-muted" /><b>อาชีพ</b></span>
                  <span className="text-muted">{item.job || '-'}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center py-2">
                  <span><i className="fas fa-clock mr-2 text-success" /><b>เวลาที่เริ่มทำหัตถการ</b></span>
                  <span className="font-weight-bold text-dark">{moment(item.updatedAt).format('HH:mm')} น.</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center py-2">
                  <span><i className="fas fa-stopwatch mr-2 text-success" /><b>ทำหัตถการมาแล้ว</b></span>
                  <span className="badge badge-success px-2 py-1" style={{ fontSize: '0.85rem', borderRadius: '8px' }}>
                    {moment().diff(moment(item.updatedAt), 'm')} นาที
                  </span>
                </li>
              </ul>
              <div className="mt-auto">
                <button className="btn btn-success btn-block py-2" style={{ borderRadius: '10px', fontWeight: 700 }} onClick={(e) => {
                  e.preventDefault();
                  navigate('/patient/payment/' + item.patient_id)
                }}>
                  <i className="fas fa-cash-register mr-2" /><b>จ่ายเงิน (Proceed to Payment)</b>
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className="card-body">
        <div className="row">
          <FlatList
            list={patientOperateData}
            renderItem={renderPatientData}
            renderWhenEmpty={() => {
              return (
                <div className="col-12 text-center py-4 text-muted">
                  <i className="fas fa-spa fa-2x mb-2 text-success" style={{ opacity: 0.5 }} />
                  <p className="mb-0">ไม่มีคนไข้ที่กำลังทำหัตถการในขณะนี้</p>
                </div>
              )
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className='content-wrapper'>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2 align-items-center">
            <div className="col-sm-8">
              <h1 className="m-0 font-weight-bold" style={{ color: '#1E2430', fontSize: '1.6rem' }}>
                <i className="fas fa-procedures mr-2" style={{ color: '#C5953A' }} />
                สถานะคนไข้ / ลูกค้า
              </h1>
              <p className="text-muted mb-0 mt-1" style={{ fontSize: '0.9rem' }}>
                ติดตามคิวคนไข้รอตรวจ พบแพทย์ และกำลังทำหัตถการแบบเรียลไทม์
              </p>
            </div>
            <div className="col-sm-6 text-sm-right mt-2 mt-sm-0 d-flex align-items-center justify-content-sm-end" style={{ gap: '0.75rem' }}>
              <span className="text-muted d-none d-md-inline" style={{ fontSize: '0.82rem' }}>
                <i className="far fa-clock mr-1" /> อัปเดตล่าสุด: <b>{lastUpdated} น.</b>
              </span>
              <button
                className="btn px-3 py-2"
                style={{
                  background: 'linear-gradient(135deg, #E9C070 0%, #C5953A 100%)',
                  color: '#1E2430',
                  fontWeight: 600,
                  borderRadius: '10px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(197, 149, 58, 0.25)',
                  cursor: 'pointer',
                  minHeight: '40px',
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
                disabled={isRefreshing}
                onClick={(e) => {
                  e.preventDefault()
                  doGetPatientData()
                }}
              >
                <i className={`fas fa-sync-alt mr-2 ${isRefreshing ? 'fa-spin' : ''}`} />
                {isRefreshing ? 'กำลังดึงคิวล่าสุด...' : 'Refresh คิวล่าสุด'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <section className="content">
        <div className="container-fluid">
          <div className='row'>
            <div className='col-12 mb-3'>
              <div className='card mb-0' style={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div className='card-header d-flex align-items-center justify-content-between' style={{ backgroundColor: '#1E2430', color: '#fff', borderBottom: '3px solid #E9C070', padding: '0.9rem 1.25rem' }}>
                  <h3 className="m-0" style={{ fontSize: '1.15rem' }}>
                    <i className="fas fa-hourglass-half mr-2" style={{ color: '#E9C070' }} />
                    สถานะคนไข้ / ลูกค้า <b>ที่กำลัง <span className="ala-status-badge ala-status-wait ml-1" style={{ backgroundColor: '#E9C070', color: '#1E2430', padding: '3px 12px', borderRadius: '20px' }}>รอคิว (Waiting)</span></b>
                  </h3>
                  <span className="badge badge-pill ml-auto px-3 py-2" style={{ backgroundColor: 'rgba(233,192,112,0.2)', color: '#E9C070', fontSize: '0.9rem' }}>
                    {patientWaitingData.length} คิว
                  </span>
                </div>
                {renderPatientStatusWaiting()}
              </div>
            </div>

            <div className='col-12 mb-3'>
              <div className='card mb-0' style={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div className='card-header d-flex align-items-center justify-content-between' style={{ backgroundColor: '#1E2430', color: '#fff', borderBottom: '3px solid #55C5D9', padding: '0.9rem 1.25rem' }}>
                  <h3 className="m-0" style={{ fontSize: '1.15rem' }}>
                    <i className="fas fa-user-md mr-2" style={{ color: '#55C5D9' }} />
                    สถานะคนไข้ / ลูกค้า <b>ที่กำลังเข้า <span className="ala-status-badge ala-status-diagnose ml-1" style={{ backgroundColor: '#55C5D9', color: '#1E2430', padding: '3px 12px', borderRadius: '20px' }}>พบแพทย์ (Diagnose)</span></b>
                  </h3>
                  <span className="badge badge-pill ml-auto px-3 py-2" style={{ backgroundColor: 'rgba(85,197,217,0.2)', color: '#55C5D9', fontSize: '0.9rem' }}>
                    {patientDiagnoseData.length} คิว
                  </span>
                </div>
                {renderPatientStatusDiagnose()}
              </div>
            </div>

            <div className='col-12 mb-3'>
              <div className='card mb-0' style={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <div className='card-header d-flex align-items-center justify-content-between' style={{ backgroundColor: '#1E2430', color: '#fff', borderBottom: '3px solid #28a745', padding: '0.9rem 1.25rem' }}>
                  <h3 className="m-0" style={{ fontSize: '1.15rem' }}>
                    <i className="fas fa-spa mr-2 text-success" />
                    สถานะคนไข้ / ลูกค้า <b>ที่กำลัง <span className="ala-status-badge ala-status-operate ml-1" style={{ backgroundColor: '#28a745', color: '#fff', padding: '3px 12px', borderRadius: '20px' }}>เข้าทำหัตถการ (Operate)</span></b>
                  </h3>
                  <span className="badge badge-pill ml-auto px-3 py-2" style={{ backgroundColor: 'rgba(40,167,69,0.2)', color: '#5cd879', fontSize: '0.9rem' }}>
                    {patientOperateData.length} คิว
                  </span>
                </div>
                {renderPatientStatusOperate()}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
