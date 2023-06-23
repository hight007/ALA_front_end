import React, { useState, useEffect, useRef } from 'react'
import moment from 'moment';
import Swal from 'sweetalert2';
import { key, OK, server } from "../../../constants";
import { httpClient } from '../../../utils/HttpClient';
import FlatList from 'flatlist-react';
import _ from "lodash";
import Modal from 'react-modal';
import './patient_historicalData.css'
import { useNavigate,} from "react-router-dom";

export default function Patient_historicalData(props) {
  const navigate = useNavigate();

  //State
  const [patientData, setPatientData] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  //find patient
  const renderFindPatientData = () => {
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
              <button className="btn btn-primary btn-block" onClick={(e) => {
                e.preventDefault();
                navigate('/patient/patient_history/' + item.patient_id)
              }}>
                <b>เพิ่มประวัติย้อนหลัง</b>
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

  //Historical Data
  const closeModal = () => {
    setIsModalOpen(false)
  }
  const openModal = (item) => {
    setIsModalOpen(true)
  }
  const renderAddHistoricalData = () => {
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
          <div className={'card card-dark'}>
            <div className="card-header">
              <h2 className="card-title">เพิ่มข้อมูลประวัติคนไข้ย้อนหลัง</h2>
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
            }}>
              <div className='card-body'>
                <div className='row'>
                  <div className='col-12 text-center'>

                  </div>
                  <div className='col-6'>

                  </div>
                  <div className='col-6'>

                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <div className='content-wrapper'>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">บันทึกข้อมูลคนไข้ / ลูกค้าย้อนหลัง</h1>
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
              {renderFindPatientData()}
            </div>
            <div className='col-12'>
              {renderAddHistoricalData()}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
