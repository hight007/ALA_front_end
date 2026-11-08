import React, { Component, useRef, useState } from "react";
import moment from 'moment';
import Modal from 'react-modal';
import Swal from 'sweetalert2';
import { Link } from "react-router-dom";

import './patient_data.css'
import _ from "lodash";
import FlatList from 'flatlist-react';

import { key, OK, server } from "../../../constants";
import { httpClient } from '../../../utils/HttpClient';

import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Patient_data(props) {
  //State
  const [patientData, setPatientData] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalStatus, setModalStatus] = useState(null)

  //add new patient state
  const [patient_id, setPatient_id] = useState('')
  const [first_name, setFirst_name] = useState('')
  const [last_name, setLast_name] = useState('')
  const [sex, setSex] = useState('')
  const [telephone_number, setTelephone_number] = useState('')
  const [year_of_birth, setYear_of_birth] = useState('')
  const [drug_allergy, setDrug_allergy] = useState('')
  const [regular_medication, setRegular_medication] = useState('')
  const [chronic_disease, setChronic_disease] = useState('')
  const [patientjob, setPatientJob] = useState('')


  //Ref
  const debounceSearch = useRef(_.debounce(e => findPatientData(e), 500)).current;

  //Find data
  const searchChanged = (e) => {
    e.persist();
    debounceSearch(e);
  };
  const findPatientData = async (e) => {
    if (e.target.value != '') {
      let response = await httpClient.get(server.FIND_PATIENT_DATA_URL + '/' + e.target.value)
      if (response.data.result.length > 0 && response.data.api_result === OK) {
        setPatientData(response.data.result)
        // console.log(response.data.result);
      } else {
        setPatientData([])
      }
    } else {
      setPatientData([])
    }
  }

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

  //add or edit  patient
  const closeModal = () => {
    setPatient_id('')
    setFirst_name('')
    setLast_name('')
    setSex('')
    setTelephone_number('')
    setYear_of_birth('')
    setDrug_allergy('')
    setRegular_medication('')
    setChronic_disease('')
    setPatientJob('')
    setModalStatus(null)
    setIsModalOpen(false)
  }
  const renderPatientForm = () => {
    return (
      <Modal
        isOpen={isModalOpen}
        style={{
          content: {
            transform: 'translate(0%, 0%)',
            overflow: 'auto',
            borderRadius: '20px',
            border: 'none',
            padding: 0,
            backgroundColor: 'transparent'
          },
        }}
        className="ReactModal__Content"
      >
        <div style={{ padding: '0.5rem', backgroundColor: 'transparent', overflow: 'auto' }}>
          <div className="card mb-0" style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid #E9C070', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <div className="card-header ala-card-header-dark d-flex align-items-center justify-content-between">
              <h3 className="card-title mb-0 font-weight-bold" style={{ fontSize: '1.2rem', color: '#E9C070' }}>
                <i className={modalStatus == 'add' ? "fas fa-user-plus mr-2" : "fas fa-user-edit mr-2"} />
                {modalStatus == 'add' ? 'ลงทะเบียนคนไข้ใหม่ (New Patient)' : 'แก้ไขข้อมูลคนไข้ (Edit Patient)'}
              </h3>
              <div className="card-tools ml-auto">
                <button type="button" className="btn btn-tool text-white" onClick={(e) => {
                  e.preventDefault()
                  closeModal();
                }}>
                  <i className="fas fa-times" style={{ fontSize: '1.1rem' }}></i>
                </button>
              </div>
            </div>
            <div className="card-body pb-0 pt-3" style={{ textAlign: 'center', background: 'linear-gradient(180deg, rgba(233,192,112,0.08) 0%, rgba(255,255,255,0) 100%)' }}>
              <img src="/img/ALA_logo.png" alt="ALA Clinic" style={{ maxHeight: '72px', objectFit: 'contain' }} />
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (modalStatus === 'add') {
                doAddPatient()
              } else {
                doUpdatePatient()
              }
            }}>
              <div className="card-body pt-3">
                <div className="row">
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label className="font-weight-bold text-dark">
                        <i className="fas fa-id-card mr-1" style={{ color: '#C5953A' }} /> เลขประจำตัวคนไข้/ลูกค้า (Patient ID)
                      </label>
                      <input type="text"
                        required
                        value={patient_id}
                        onChange={(e) => {
                          setPatient_id(e.target.value)
                        }}
                        className="form-control"
                        style={{ borderRadius: '10px' }}
                      />
                    </div>
                  </div>

                  <div className="col-sm-6">
                    <div className="form-group">
                      <label className="font-weight-bold text-dark">
                        <i className="fas fa-venus-mars mr-1" style={{ color: '#C5953A' }} /> เพศ (Sex)
                      </label>
                      <select type="text"
                        required
                        value={sex}
                        onChange={(e) => {
                          setSex(e.target.value)
                        }}
                        className="form-control"
                        style={{ borderRadius: '10px' }}
                        placeholder="เลือกเพศ (Select sex)"
                      >
                        <option value={null}></option>
                        <option value={'Male'}>ชาย (Male)</option>
                        <option value={'Female'}>หญิง (Female)</option>
                        <option value={'Lesbian'}>ผู้หญิงรักผู้หญิง (Lesbian)</option>
                        <option value={'Lesbian'}>ชายรักชาย (Gay)</option>
                        <option value={'Bisexual'}>ผู้ที่รักได้ทั้งผู้ชายและผู้หญิง (Bisexual)</option>
                        <option value={'Transgender'}>คนข้ามเพศ (Transgender)</option>
                        <option value={'Queer'}>ผู้ที่ยังไม่แน่ใจในเพศ แต่รู้ว่าไม่ตรงตามสังคม​กำหนด (Queer)</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label className="font-weight-bold text-dark">
                        <i className="fas fa-user mr-1" style={{ color: '#C5953A' }} /> ชื่อจริง (First name)
                      </label>
                      <input type="text"
                        required
                        value={first_name}
                        onChange={(e) => {
                          setFirst_name(e.target.value)
                        }}
                        className="form-control"
                        style={{ borderRadius: '10px' }}
                        placeholder="กรอกชื่อจริง (Enter first name)" />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label className="font-weight-bold text-dark">
                        <i className="fas fa-user-tag mr-1" style={{ color: '#C5953A' }} /> นามสกุล (Last name)
                      </label>
                      <input
                        required
                        value={last_name}
                        onChange={(e) => {
                          setLast_name(e.target.value);
                        }}
                        type="text"
                        className="form-control"
                        style={{ borderRadius: '10px' }}
                        placeholder="กรอกนามสกุล (Enter last name)" />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label className="font-weight-bold text-dark">
                        <i className="fas fa-mobile-alt mr-1" style={{ color: '#C5953A' }} /> เบอร์โทรศัพท์ (Telephone number)
                      </label>
                      <PhoneInput
                        className="form-control"
                        disableCountryCode={true}
                        inputProps={{
                          required: true,
                        }}
                        country={'th'}
                        value={telephone_number}
                        onChange={phone => setTelephone_number(phone)}
                        inputStyle={{ width: '100%', borderRadius: '10px' }}
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label className="font-weight-bold text-dark">
                        <i className="fas fa-calendar-week mr-1" style={{ color: '#C5953A' }} /> ปีเกิด คศ. (Year of birth)
                      </label>
                      <div>
                        <DatePicker
                          selected={year_of_birth}
                          onChange={(date) => {
                            setYear_of_birth(date)
                          }}
                          minDate={moment().add(-100, 'year').toDate()}
                          maxDate={moment().toDate()}
                          showYearPicker
                          dateFormat="yyyy"
                          className="form-control"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label className="font-weight-bold text-dark">
                        <i className="fas fa-allergies mr-1 text-danger" /> ยาหรืออาหารที่แพ้ (Drug allergy)
                      </label>
                      <textarea className="form-control"
                        rows="2"
                        style={{ borderRadius: '10px' }}
                        type="text"
                        placeholder="กรอกยาหรืออาหารที่แพ้ (Enter drug allergy)"
                        value={drug_allergy}
                        onChange={(e) => {
                          setDrug_allergy(e.target.value)
                        }} />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label className="font-weight-bold text-dark">
                        <i className="fas fa-pills mr-1" style={{ color: '#55C5D9' }} /> ยาที่ใช้ประจำ (Regular medication)
                      </label>
                      <textarea className="form-control"
                        rows="2"
                        style={{ borderRadius: '10px' }}
                        type="text"
                        placeholder="กรอกยาที่ใช้ประจำ (Enter regular medication)"
                        value={regular_medication}
                        onChange={(e) => {
                          setRegular_medication(e.target.value)
                        }} />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group mb-0">
                      <label className="font-weight-bold text-dark">
                        <i className="fas fa-heartbeat mr-1 text-warning" /> โรคประจำตัว (Chronic disease)
                      </label>
                      <textarea className="form-control"
                        rows="2"
                        style={{ borderRadius: '10px' }}
                        type="text"
                        placeholder="กรอกโรคประจำตัว (Enter chronic disease)"
                        value={chronic_disease}
                        onChange={(e) => {
                          setChronic_disease(e.target.value)
                        }} />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group mb-0">
                      <label className="font-weight-bold text-dark">
                        <i className="fas fa-briefcase mr-1" style={{ color: '#C5953A' }} /> อาชีพ (Job)
                      </label>
                      <textarea className="form-control"
                        rows="2"
                        style={{ borderRadius: '10px' }}
                        type="text"
                        placeholder="กรอกอาชีพ (Job)"
                        value={patientjob}
                        onChange={(e) => {
                          setPatientJob(e.target.value)
                        }} />
                    </div>
                  </div>
                </div>
              </div>
              {/* /.card-body */}
              <div className="card-footer bg-light px-4 py-3" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <div className="row align-items-center">
                  <div className="col-4">
                    <button type="submit" className="btn ala-btn-gold px-4">
                      <i className="fas fa-check-circle mr-1" /> ตกลง (Submit)
                    </button>
                  </div>
                  <div className="col-4" style={{ textAlign: 'center' }}>
                    {modalStatus == 'edit' ? (
                      <button onClick={(e) => {
                        e.preventDefault()
                        doDeletePatient()
                      }} className="btn btn-outline-danger" style={{ borderRadius: '10px' }}>
                        <i className="fas fa-trash-alt mr-1" /> ลบข้อมูลคนไข้
                      </button>
                    ) : <></>}
                  </div>
                  <div className="col-4">
                    <button type="reset" className="btn btn-secondary float-right px-4" style={{ borderRadius: '10px' }} onClick={(e) => {
                      e.preventDefault()
                      closeModal();
                    }}>
                      ยกเลิก (Cancel)
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    )
  }
  const doAddPatient = () => {
    Swal.fire({
      title: 'ต้องการบันทึกรายชื่อคนไข้ใหม่?',
      text: "กรุณาตรวจสอบให้แน่ใจก่อนกดตกลง",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ตกลง',
      cancelButtonText: 'ยกเลิก',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const data = {
          patient_id,
          first_name,
          last_name,
          sex,
          telephone_number,
          year_of_birth: parseInt(moment(year_of_birth).format('YYYY')),
          drug_allergy,
          regular_medication,
          chronic_disease,
          job: patientjob,
          updater: localStorage.getItem(key.USER_NAME)
        }
        const response = await httpClient.post(server.PATIENT_DATA_URL, data)
        if (response.data.api_result === OK) {
          Swal.fire({
            icon: 'success',
            title: 'Yeah...',
            text: 'บันทึกคนไข้ใหม่สำเร็จ',
          }).then(() => {
            closeModal()
          })
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'มีข้อผิดพลาดเกิดขึ้น โปรดลองอีกครั้ง',
          })
        }
      }
    })
  }
  const doUpdatePatient = () => {
    Swal.fire({
      title: 'ต้องการแก้ไขข้อมูลคนไข้?',
      text: "กรุณาตรวจสอบให้แน่ใจก่อนกดตกลง",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ตกลง',
      cancelButtonText: 'ยกเลิก',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const data = {
          patient_id,
          first_name,
          last_name,
          sex,
          telephone_number,
          year_of_birth: parseInt(moment(year_of_birth).format('YYYY')),
          drug_allergy,
          regular_medication,
          chronic_disease,
          job: patientjob,
          updater: localStorage.getItem(key.USER_NAME)
        }
        var e = { target: { value: telephone_number } }
        const response = await httpClient.put(server.PATIENT_DATA_URL, data)
        if (response.data.api_result === OK) {
          Swal.fire({
            icon: 'success',
            title: 'Yeah...',
            text: 'แก้ไขข้อมูลคนไข้สำเร็จ',
          }).then(() => {
            findPatientData(e)
            closeModal()
          })
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'มีข้อผิดพลาดเกิดขึ้น โปรดลองอีกครั้ง',
          })
        }
      }
    })
  }
  const doDeletePatient = () => {
    Swal.fire({
      title: 'ต้องการลบข้อมูลคนไข้?',
      text: "กรุณาตรวจสอบให้แน่ใจก่อนกดตกลง",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ตกลง',
      cancelButtonText: 'ยกเลิก',
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'ต้องการลบข้อมูลคนไข้จริงๆหรอ?',
          text: "ยืนยันอีกครั้งเพื่อความแน่ใจ",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'ยืนยันที่จะลบ',
          cancelButtonText: 'ยกเลิก',
        }).then(async (resultConfirm) => {
          if (resultConfirm.isConfirmed) {
            const data = {
              patient_id,
            }
            var e = { target: { value: telephone_number } }
            const response = await httpClient.delete(server.PATIENT_DATA_URL, { data })
            if (response.data.api_result === OK) {
              Swal.fire({
                icon: 'success',
                title: 'Yeah...',
                text: 'ลบข้อมูลคนไข้สำเร็จ',
              }).then(() => {
                findPatientData(e)
                closeModal()
              })
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'มีข้อผิดพลาดเกิดขึ้น โปรดลองอีกครั้ง',
              })
            }
          }
        })
      }
    })
  }

  //find patient
  const renderFindPatientData = () => {
    const resetPantientStatus = (patient_id) => {
      Swal.fire({
        title: 'ต้องการรีเซ็ตสถานะคนไข้?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'รีเซ็ต',
        cancelButtonText: 'ยกเลิก',
      }).then(async (result) => {
        if (result.isConfirmed) {

          await httpClient.put(server.PATIENT_DATA_URL, {
            patient_id,
            status: 'open',
          })

          const e = {
            target: {
              value: 'opd=' + patient_id
            }
          }
          console.log(e.target.value);
          findPatientData(e)
        }
      })
    }
    const renderPatientData = (item, idx) => {
      return (
        <div className="col-lg-4 col-md-6 mb-4" key={item.patient_id || idx}>
          <div className="card ala-patient-card h-100 mb-0">
            <div className="card-header ala-card-header-dark d-flex align-items-center justify-content-between">
              <h3 className="card-title mb-0 font-weight-bold" style={{ fontSize: '1rem' }}>
                <i className="fas fa-user-circle mr-2" style={{ color: '#E9C070' }} />
                ผลการค้นหาที่ {idx + 1}
              </h3>
              <div className="card-tools ml-auto">
                <button type="button" className="btn btn-tool text-white" data-card-widget="collapse">
                  <i className="fas fa-minus" />
                </button>
              </div>
            </div>
            <div className="card-body box-profile d-flex flex-column">
              <h3 className="profile-username text-center font-weight-bold mb-1" style={{ color: '#1E2430', fontSize: '1.3rem' }}>
                {item.first_name + ' ' + item.last_name}
              </h3>
              <p className="text-center mb-3">
                <span className="badge px-3 py-1" style={{ backgroundColor: 'rgba(233, 192, 112, 0.18)', color: '#8A6421', border: '1px solid #E9C070', borderRadius: '20px', fontSize: '0.85rem' }}>
                  <i className="fas fa-id-badge mr-1" /> HN: {item.patient_id}
                </span>
              </p>

              <ul className="list-group list-group-unbordered mb-3">
                <li className="list-group-item d-flex justify-content-between align-items-center py-2">
                  <span><i className="fas fa-venus-mars mr-2 text-muted" style={{ width: '18px' }} /><b>เพศ</b></span>
                  <span className="text-muted font-weight-bold">{item.sex || '-'}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center py-2">
                  <span><i className="fas fa-phone-alt mr-2 text-muted" style={{ width: '18px' }} /><b>โทรศัพท์</b></span>
                  <span className="text-dark font-weight-bold">{item.telephone_number || '-'}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center py-2">
                  <span><i className="fas fa-birthday-cake mr-2 text-muted" style={{ width: '18px' }} /><b>อายุ</b></span>
                  <span className="text-muted">{moment().format('yyyy') - item.year_of_birth} ปี</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center py-2">
                  <span><i className="fas fa-briefcase mr-2 text-muted" style={{ width: '18px' }} /><b>อาชีพ</b></span>
                  <span className="text-muted">{item.job || '-'}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center py-2">
                  <span><i className="fas fa-heartbeat mr-2 text-muted" style={{ width: '18px' }} /><b>สถานะ</b></span>
                  <div className="d-flex align-items-center">
                    <span className={getStatusBadgeClass(item.status)}>{item.status}</span>
                    <button
                      className="btn btn-outline-secondary btn-xs ml-2"
                      title="รีเซ็ตสถานะเป็น open"
                      style={{ borderRadius: '6px' }}
                      onClick={(e) => {
                        e.preventDefault()
                        resetPantientStatus(item.patient_id)
                      }}
                    >
                      <i className="fas fa-redo" />
                    </button>
                  </div>
                </li>
              </ul>

              <div className="mt-auto">
                <button className="btn ala-btn-gold btn-block py-2 mb-2" onClick={(e) => {
                  e.preventDefault();
                  preparingProcess(item)
                }}>
                  <i className="fas fa-stethoscope mr-2" /><b>ส่งตัวนัดตรวจ (Send to Queue)</b>
                </button>

                <div className="row mx-n1">
                  <div className="col-6 px-1 mb-2">
                    <Link to={'/appointment/' + item.patient_id} className="btn btn-outline-dark btn-block btn-sm py-2" style={{ borderRadius: '10px', fontWeight: 600 }}>
                      <i className="fas fa-calendar-check mr-1" style={{ color: '#C5953A' }} /> นัดหมาย
                    </Link>
                  </div>
                  <div className="col-6 px-1 mb-2">
                    <Link to={'/patient/patient_history/' + item.patient_id} className="btn btn-outline-dark btn-block btn-sm py-2" style={{ borderRadius: '10px', fontWeight: 600 }}>
                      <i className="fas fa-notes-medical mr-1" style={{ color: '#55C5D9' }} /> ประวัติบริการ
                    </Link>
                  </div>
                  <div className="col-6 px-1">
                    <Link to={'/patient/payment/' + item.patient_id} className="btn btn-outline-success btn-block btn-sm py-2" style={{ borderRadius: '10px', fontWeight: 600 }}>
                      <i className="fas fa-file-invoice-dollar mr-1" /> ประวัติชำระเงิน
                    </Link>
                  </div>
                  <div className="col-6 px-1">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        Swal.fire({
                          title: 'ต้องการแก้ไขข้อมูล?',
                          text: "ต้องการแก้ไขข้อมูลลูกค้า " + item.first_name + ' ' + item.last_name + ' หรือไม่',
                          icon: 'question',
                          showCancelButton: true,
                          confirmButtonColor: '#3085d6',
                          cancelButtonColor: '#d33',
                          confirmButtonText: 'ตกลง',
                          cancelButtonText: 'ยกเลิก',
                        }).then(async (result) => {
                          if (result.isConfirmed) {
                            setModalStatus('edit')
                            setPatient_id(item.patient_id)
                            setFirst_name(item.first_name)
                            setLast_name(item.last_name)
                            setSex(item.sex)
                            setTelephone_number(item.telephone_number)
                            setYear_of_birth(moment('01/01/' + item.year_of_birth).toDate())
                            setDrug_allergy(item.setDrug_allergy)
                            setRegular_medication(item.regular_medication)
                            setChronic_disease(item.chronic_disease)
                            setPatientJob(item.job)
                            setIsModalOpen(true)
                          }
                        })
                      }}
                      className="btn btn-outline-warning btn-block btn-sm py-2 text-dark"
                      style={{ borderRadius: '10px', fontWeight: 600, borderColor: '#E9C070' }}
                    >
                      <i className="fas fa-user-edit mr-1" style={{ color: '#C5953A' }} /> แก้ไขข้อมูล
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="card" style={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <div className="card-header ala-card-header-dark d-flex align-items-center justify-content-between" style={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
          <h3 className="card-title mb-0 font-weight-bold" style={{ fontSize: '1.05rem' }}>
            <i className="fas fa-search mr-2" style={{ color: '#E9C070' }} /> ค้นหาและจัดการข้อมูลคนไข้
          </h3>
          <button
            onClick={async (e) => {
              e.preventDefault();
              //get last patient id
              const response = await httpClient.get(server.LAST_PATIENT_ID_URL)
              if (response.data.api_result === OK) {
                setPatient_id(response.data.result)
                setModalStatus('add')
                setIsModalOpen(true)
              }
            }}
            className="btn ala-btn-gold btn-sm px-3 py-1 ml-auto"
          >
            <i className="fas fa-user-plus mr-1" /> เพิ่มข้อมูลคนไข้ใหม่
          </button>
        </div>
        <div className="card-body pb-2">
          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text bg-white border-right-0" style={{ borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px', borderColor: '#E9C070' }}>
                <i className="fas fa-search" style={{ color: '#C5953A' }} />
              </span>
            </div>
            <input
              onChange={(e) => searchChanged(e)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  searchChanged(e)
                }
              }}
              type="search"
              className="form-control form-control-lg border-left-0"
              placeholder="ค้นหาคนไข้ (ชื่อ, นามสกุล, เลขประจำตัว หรือ เบอร์โทรศัพท์)..."
              style={{ borderTopRightRadius: '12px', borderBottomRightRadius: '12px', borderColor: '#E9C070', fontSize: '1rem' }}
            />
          </div>
        </div>
        <div className="card-body pt-3">
          <div className="row">
            <FlatList
              list={patientData}
              renderItem={renderPatientData}
              renderWhenEmpty={() => {
                return (
                  <div className="col-12 text-center py-5 text-muted">
                    <i className="fas fa-users fa-3x mb-3" style={{ color: '#E9C070', opacity: 0.6 }} />
                    <p className="mb-0" style={{ fontSize: '1rem' }}>พิมพ์ชื่อ นามสกุล หรือเบอร์โทรศัพท์ด้านบนเพื่อค้นหาข้อมูลคนไข้</p>
                  </div>
                )
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  //preparingProcess
  const preparingProcess = async (item) => {
    try {
      if (item.status == 'open') {
        Swal.fire({
          title: 'ต้องการนัดตรวจลูกค้า ' + item.first_name + ' ' + item.last_name,
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
              status: 'waiting',
              updater: localStorage.getItem(key.USER_NAME)
            }
            let transactionResponse = await httpClient.post(server.PROCESS_TRANSACTION_URL, transactionData)
            let response = await httpClient.put(server.PATIENT_DATA_URL, transactionData)
            console.log(response.data);
            if (transactionResponse.data.api_result === OK && response.data.api_result === OK) {
              var e = { target: { value: item.telephone_number } }
              findPatientData(e)
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'การเปลี่ยนสถานะของลูกค้าล้มเหลว โปรดลองอีกครั้ง',
              })
            }
          }
        })
      }
      else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'สถานะลูกค้าปัจจุบันไม่ได้ว่างพร้อมรอตรวจ, สถานะลูกค้าปัจุบันคือ ' + item.status,
        })
      }

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'มีข้อผิดพลาดเกิดขึ้น โปรดลองอีกครั้ง',
        footer: error.toString(),
      })
    }

  }

  return (
    <div className="content-wrapper">
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2 align-items-center">
            <div className="col-sm-8">
              <h1 className="m-0 font-weight-bold" style={{ color: '#1E2430', fontSize: '1.6rem' }}>
                <i className="fas fa-id-card-alt mr-2" style={{ color: '#C5953A' }} />
                ข้อมูลคนไข้ / ลูกค้า
              </h1>
              <p className="text-muted mb-0 mt-1" style={{ fontSize: '0.9rem' }}>
                ระบบสืบค้นเวชระเบียน ลงทะเบียนคนไข้ใหม่ และส่งตัวเข้าคิวตรวจ
              </p>
            </div>
            <div className="col-sm-4">
            </div>
          </div>
        </div>
      </div>
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              {renderPatientForm()}
            </div>
            <div className="col-12">
              {renderFindPatientData()}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
