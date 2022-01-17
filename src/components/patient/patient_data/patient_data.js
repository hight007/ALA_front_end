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
            overlfow: 'scroll' // <-- This tells the modal to scrol
          },
        }}
        className="content-wrapper"
      >
        <div style={{ margin: '5%', marginTop: '10%', padding: '0%', backgroundColor: 'rgba(0,0,0,0)', overflow: 'auto' }}>
          <div className={modalStatus == 'add' ? "card card-success" : 'card card-warning'}>
            <div className="card-header">
              <h2 className="card-title">{modalStatus == 'add' ? 'ข้อมูลคนไข้ใหม่' : 'แก้ไขข้อมูลคนไข้'}</h2>
              <div class="card-tools">
                <button type="button" class="btn btn-tool" onClick={(e) => {
                  e.preventDefault()
                  closeModal();
                }}><i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <div className='card-body' style={{ textAlign: 'center' }}><img src="/img/ALA_logo.png" /></div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (modalStatus === 'add') {
                doAddPatient()
              } else {
                doUpdatePatient()
              }


            }}>
              <div className="card-body">
                <div className="row">
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>เลขประจำตัวคนไข้/ลูกค้า (patient id)</label>
                      <input type="text"
                        required
                        value={patient_id}
                        onChange={(e) => {
                          setPatient_id(e.target.value)
                        }}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>เพศ (Sex) <i className="fas fa-venus" /><i className="fas fa-mars" /></label>
                      <select type="text"
                        required
                        value={sex}
                        onChange={(e) => {
                          setSex(e.target.value)
                        }}
                        className="form-control"
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
                      <label>ชื่อจริง (First name)</label>
                      <input type="text"
                        required
                        value={first_name}
                        onChange={(e) => {
                          setFirst_name(e.target.value)
                        }}
                        className="form-control"
                        placeholder="กรอกชื่อจริง (Enter first name)" />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>นามสกุล (Last name)</label>
                      <input
                        required
                        value={last_name}
                        onChange={(e) => {
                          setLast_name(e.target.value);
                        }}
                        type="text"
                        className="form-control"
                        placeholder="กรอกนามสกุล (Enter last name)" />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>เบอร์โทรศัพท์ (Telephone number)</label><i style={{ marginLeft: 5 }} className="fas fa-mobile-alt" />
                      <PhoneInput
                        className="form-control"
                        disableCountryCode={true}
                        inputProps={{
                          required: true,
                        }}
                        country={'th'}
                        value={telephone_number}
                        onChange={phone => setTelephone_number(phone)}
                        inputStyle={{ width: '100%' }}
                      />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>ปีเกิด คศ. (Year of birth)</label><i style={{ marginLeft: 5 }} className="fas fa-calendar-week" />
                      <br></br>
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
                      <label>ยาหรืออาหารที่แพ้ (Drug allergy)</label>
                      <i style={{ marginLeft: 5 }} className="fas fa-skull-crossbones" />
                      <br></br>
                      <textarea className="form-control"
                        type="text"
                        className="form-control"
                        placeholder="กรอกยาหรืออาหารที่แพ้ (Enter drug allergy)"
                        value={drug_allergy}
                        onChange={(e) => {
                          setDrug_allergy(e.target.value)
                        }} />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>ยาที่ใช้ประจำ (Regular medication)</label><i style={{ marginLeft: 5 }} className="fas fa-pills" />
                      <br></br>
                      <textarea className="form-control"
                        type="text"
                        className="form-control"
                        placeholder="กรอกยาที่ใช้ประจำ (Enter regular medication)"
                        value={regular_medication}
                        onChange={(e) => {
                          setRegular_medication(e.target.value)
                        }} />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>โรคประจำตัว (Chronic disease)</label><i style={{ marginLeft: 5 }} className="fas fa-disease" />
                      <br></br>
                      <textarea className="form-control"
                        type="text"
                        className="form-control"
                        placeholder="กรอกโรคประจำตัว (Enter chronic disease)"
                        value={chronic_disease}
                        onChange={(e) => {
                          setChronic_disease(e.target.value)
                        }} />
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>อาชีพ (Job)</label><i style={{ marginLeft: 5 }} className="fas fa-briefcase" />
                      <br></br>
                      <textarea className="form-control"
                        type="text"
                        className="form-control"
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
              <div className="card-footer">
                <div className="row">
                  <div className="col-4">
                    <button type="submit" className="btn btn-primary">ตกลง (Submit)</button>
                  </div>
                  <div className="col-4" style={{ textAlign: 'center' }}>
                    {modalStatus == 'edit' ? <button onClick={(e) => {
                      e.preventDefault()
                      doDeletePatient()
                    }} className="btn btn-danger">ลบข้อมูลคนไข้ (delete)</button> : <></>}
                  </div>
                  <div className="col-4">
                    <button type="reset" class="btn btn-default float-right" onClick={(e) => {
                      e.preventDefault()
                      closeModal();
                    }}>ยกเลิก (Cancel)</button>
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
        <div className="col-md-4">
          <div className='card card-dark'>
            <div className="card-header" style={{}}>
              <h3 นอำพ className="card-title">ผลการค้นหาที่ {idx + 1}</h3>
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
                <b>สถานะ </b> <label style={{ color: 'red' }} className={item.status != 'open' ? 'float-right text-center' : 'float-right text-center text-muted'}>{item.status}</label>
                <button className="btn btn-primary btn-xs" onClick={(e) => {
                  e.preventDefault()
                  resetPantientStatus(item.patient_id)
                }
                }
                ><i className="fas fa-redo" /></button>
              </li>
              <button className="btn btn-primary btn-block" onClick={(e) => {
                e.preventDefault();
                preparingProcess(item)
              }}>
                <b>นัดตรวจ</b>
              </button>
              <Link to={'/patient/patient_history/' + item.patient_id} className="btn btn-dark btn-block">ประวัติการใช้บริการ</Link>
              <Link to={'/patient/payment/' + item.patient_id} className="btn btn-success btn-block">ประวัติการจ่ายเงิน</Link>
              <button onClick={(e) => {
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
                className="btn btn-warning btn-block">
                แก้ไขข้อมูล
              </button>

            </div>
            {/* /.card-body */}
          </div>
        </div>
      );
    }
    return (
      <div className="card card-default">
        <div className="card-body">
          <div className="input-group input-group-sm">
            <input
              onChange={(e) => searchChanged(e)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  searchChanged(e)
                }
              }
              }
              type="search"
              className="form-control input-lg"
              placeholder="ค้นหาคนไข้ (ชื่อ หรือ นามสกุล หรือ เบอร์โทรศัพท์)"
              style={{ borderRadius: 10, marginRight: 10 }}
            />
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
              }} className="btn btn-success btn-sm">
              เพิ่มข้อมูลคนไข้ใหม่
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="row">
            <FlatList
              list={patientData}
              renderItem={renderPatientData}
              renderWhenEmpty={() => { return <></> }}
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
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">ข้อมูลคนไข้ / ลูกค้า</h1>
            </div>{/* /.col */}
            <div className="col-sm-6">

            </div>{/* /.col */}
          </div>{/* /.row */}
        </div>{/* /.container-fluid */}
      </div>
      <section className="content">
        <div className="container-fluid">
          <div className='rows'>
            <div className='col-12'>
              {renderPatientForm()}
            </div>
            <div className='col-12'>
              {renderFindPatientData()}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}