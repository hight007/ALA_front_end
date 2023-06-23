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

  const navigate = useNavigate();

  useEffect(() => {
    doGetPatientData()
  }, [])

  const doGetPatientData = async () => {
    try {
      let responsePatientWaitingData = await httpClient.get(server.STATUS_PATIENT_DATA_URL + '/waiting')
      let responsePatientDiagnoseData = await httpClient.get(server.STATUS_PATIENT_DATA_URL + '/diagnose')
      let responsePatientOperateData = await httpClient.get(server.STATUS_PATIENT_DATA_URL + '/operate')

      if (responsePatientWaitingData.data.result.length > 0) {
        // console.log(responsePatientWaitingData.data.result);
        setPatientWaitingData(responsePatientWaitingData.data.result)
      } else {
        setPatientWaitingData([])
      }

      if (responsePatientDiagnoseData.data.result.length > 0) {
        // console.log(responsePatientDiagnoseData.data.result);
        setPatientDiagnoseData(responsePatientDiagnoseData.data.result)
      } else {
        setPatientDiagnoseData([])
      }

      if (responsePatientOperateData.data.result.length > 0) {
        console.log(responsePatientOperateData.data.result);
        setPatientOperateData(responsePatientOperateData.data.result)
      } else {
        setPatientOperateData([])
      }
    } catch (error) {
      console.log(error);
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
        <div className="col-md-4">
          <div className='card card-dark'>
            <div className="card-header" style={{}}>
              <h3 นอำพ className="card-title">ลูกค้าคิวที่ {idx + 1}</h3>
              <div className="card-tools">
                <button type="button" className="btn btn-tool" data-card-widget="collapse">
                  <i className="fas fa-minus" />
                </button>
              </div>
              {/* /.card-tools */}
            </div>
            {/* /.card-header */}
            <div className="card-body box-profile">
              <h3 class="profile-username text-center">{item.first_name + ' ' + item.last_name}</h3>
              <p class="text-muted text-center">{'หมายเลขประจำตัวลูกค้า : ' + item.patient_id}</p>
              <li class="list-group-item">
                <b>เพศ </b> <label className="float-right text-muted text-center">{item.sex}</label>
              </li>
              <li class="list-group-item">
                <b>โทรศัพท์ </b> <label className="float-right text-muted text-center">{item.telephone_number}</label>
              </li>
              <li class="list-group-item">
                <b>อายุ </b> <label className="float-right text-muted text-center">{moment().format('yyyy') - item.year_of_birth}</label>
              </li>
              <li class="list-group-item">
                <b>อาชีพ </b> <label className="float-right text-muted text-center">{item.job}</label>
              </li>
              <li class="list-group-item">
                <b>เวลาที่เริ่มรอคิว</b> <label className="float-right text-muted text-center">{moment(item.updatedAt).format('HH:mm')}</label>
              </li>
              <li class="list-group-item">
                <b>รอคิวมาแล้ว</b> <label className="float-right text-muted text-center">{moment().diff(moment(item.updatedAt), 'm')} นาที</label>
              </li>
              <button className="btn btn-primary btn-block" onClick={(e) => {
                e.preventDefault();
                doDiagnose(item)
              }}>
                <b>เข้าพบแพทย์</b>
              </button>
              <button className="btn btn-danger btn-block" onClick={(e) => {
                e.preventDefault();
                doCancelDiagnose(item)
              }}>
                <>ยกเลิกการเข้าพบแพทย์</>
              </button>
            </div>
            {/* /.card-body */}
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
            renderWhenEmpty={() => { return <></> }}
          />
        </div>
      </div>
    )
  }
  const renderPatientStatusDiagnose = () => {
    const renderPatientData = (item, idx) => {
      return (
        <div className="col-md-4">
          <div className='card card-dark'>
            <div className="card-header" style={{}}>
              <h3 นอำพ className="card-title">ลูกค้าคิวที่ {idx + 1}</h3>
              <div className="card-tools">
                <button type="button" className="btn btn-tool" data-card-widget="collapse">
                  <i className="fas fa-minus" />
                </button>
              </div>
              {/* /.card-tools */}
            </div>
            {/* /.card-header */}
            <div className="card-body box-profile">
              <h3 class="profile-username text-center">{item.first_name + ' ' + item.last_name}</h3>
              <p class="text-muted text-center">{'หมายเลขประจำตัวลูกค้า : ' + item.patient_id}</p>
              <li class="list-group-item">
                <b>เพศ </b> <label className="float-right text-muted text-center">{item.sex}</label>
              </li>
              <li class="list-group-item">
                <b>โทรศัพท์ </b> <label className="float-right text-muted text-center">{item.telephone_number}</label>
              </li>
              <li class="list-group-item">
                <b>อายุ </b> <label className="float-right text-muted text-center">{moment().format('yyyy') - item.year_of_birth}</label>
              </li>
              <li class="list-group-item">
                <b>อาชีพ </b> <label className="float-right text-muted text-center">{item.job}</label>
              </li>
              <li class="list-group-item">
                <b>เวลาที่เริ่มพบแพทย์</b> <label className="float-right text-muted text-center">{moment(item.updatedAt).format('HH:mm')}</label>
              </li>
              <li class="list-group-item">
                <b>พบแพทย์มาแล้ว</b> <label className="float-right text-muted text-center">{moment().diff(moment(item.updatedAt), 'm')} นาที</label>
              </li>
              <button className="btn btn-success btn-block" onClick={(e) => {
                e.preventDefault();
                navigate('/patient/patient_history/' + item.patient_id)
              }}>
                <b>เข้าพบแพทย์ต่อ...</b>
              </button>
              <button className="btn btn-danger btn-block" onClick={(e) => {
                e.preventDefault();
                doCancelOperate(item)
              }}>
                <>ยกเลิกหัตถการ</>
              </button>
            </div>
            {/* /.card-body */}
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
            renderWhenEmpty={() => { return <></> }}
          />
        </div>
      </div>
    )
  }
  const renderPatientStatusOperate = () => {
    const renderPatientData = (item, idx) => {
      return (
        <div className="col-md-4">
          <div className='card card-dark'>
            <div className="card-header" style={{}}>
              <h3 นอำพ className="card-title">ลูกค้าคิวที่ {idx + 1}</h3>
              <div className="card-tools">
                <button type="button" className="btn btn-tool" data-card-widget="collapse">
                  <i className="fas fa-minus" />
                </button>
              </div>
              {/* /.card-tools */}
            </div>
            {/* /.card-header */}
            <div className="card-body box-profile">
              <h3 class="profile-username text-center">{item.first_name + ' ' + item.last_name}</h3>
              <p class="text-muted text-center">{'หมายเลขประจำตัวลูกค้า : ' + item.patient_id}</p>
              <li class="list-group-item">
                <b>เพศ </b> <label className="float-right text-muted text-center">{item.sex}</label>
              </li>
              <li class="list-group-item">
                <b>โทรศัพท์ </b> <label className="float-right text-muted text-center">{item.telephone_number}</label>
              </li>
              <li class="list-group-item">
                <b>อายุ </b> <label className="float-right text-muted text-center">{moment().format('yyyy') - item.year_of_birth}</label>
              </li>
              <li class="list-group-item">
                <b>อาชีพ </b> <label className="float-right text-muted text-center">{item.job}</label>
              </li>
              <li class="list-group-item">
                <b>เวลาที่เริ่มทำหัตถการ</b> <label className="float-right text-muted text-center">{moment(item.updatedAt).format('HH:mm')}</label>
              </li>
              <li class="list-group-item">
                <b>ทำหัตถการมาแล้ว</b> <label className="float-right text-muted text-center">{moment().diff(moment(item.updatedAt), 'm')} นาที</label>
              </li>
              <button className="btn btn-success btn-block" onClick={(e) => {
                e.preventDefault();
                navigate('/patient/payment/' + item.patient_id)
              }}>
                <b>จ่ายเงิน</b>
              </button>
              {/* <button className="btn btn-danger btn-block" onClick={(e) => {
                e.preventDefault();
                doCancelPayment(item)
              }}>
                <>ยกเลิกการจ่ายเงิน</>
              </button> */}
            </div>
            {/* /.card-body */}
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
            renderWhenEmpty={() => { return <></> }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className='content-wrapper'>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-8">
              <h1 className="m-0">สถานะคนไข้ / ลูกค้า</h1>
            </div>{/* /.col */}
            <div className="col-sm-4">
              <ol class="breadcrumb float-sm-right">
                <li class="breadcrumb-item"><button class="btn btn-default" onClick={(e) => {
                  e.preventDefault()
                  doGetPatientData()
                }}>Refresh
                </button></li>
              </ol>
            </div>{/* /.col */}
          </div>{/* /.row */}
        </div>{/* /.container-fluid */}
      </div>
      <section className="content">
        <div className="container-fluid">
          <div className='rows'>
            <div className='col-12'>
              <div className='card card-default'>
                <div className='card-header'>
                  <h3 className="m-0">สถานะคนไข้ / ลูกค้า <b>ที่กำลัง<strong style={{ color: 'red' }}>รอคิว</strong></b></h3>
                </div>
                <div className='card-body'>
                  {renderPatientStatusWaiting()}
                </div>
              </div>
            </div>
            <div className='col-12'>
              <div className='card card-default'>
                <div className='card-header'>
                  <h3 className="m-0">สถานะคนไข้ / ลูกค้า <b>ที่กำลังเข้า<strong style={{ color: 'blue' }}>พบแพทย์</strong></b></h3>
                </div>
                <div className='card-body'>
                  {renderPatientStatusDiagnose()}
                </div>
              </div>
            </div>
            <div className='col-12'>
              <div className='card card-default'>
                <div className='card-header'>
                  <h3 className="m-0">สถานะคนไข้ / ลูกค้า <b>ที่กำลังเข้า<strong style={{ color: 'green' }}>เข้าทำหัตถการ</strong></b></h3>
                </div>
                <div className='card-body'>
                  {renderPatientStatusOperate()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

