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

  //find patient
  const renderFindPatientData = () => {
    const renderPatientData = (item, idx) => {
      return (
        <div className="col-lg-4 col-md-6 mb-4" key={item.patient_id || idx}>
          <div className="card h-100 mb-0" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(233, 192, 112, 0.35)', boxShadow: '0 6px 20px rgba(30, 36, 48, 0.06)' }}>
            <div className="card-header d-flex align-items-center justify-content-between" style={{ background: 'linear-gradient(135deg, #1E2430 0%, #2A3242 100%)', color: '#E9C070', borderBottom: '2px solid #C5953A', padding: '0.85rem 1.25rem' }}>
              <h3 className="card-title mb-0 font-weight-bold" style={{ fontSize: '1rem' }}>
                <i className="fas fa-user-clock mr-2" /> ผลการค้นหาที่ {idx + 1}
              </h3>
              <div className="card-tools ml-auto d-flex align-items-center">
                {item.status && <span className={`${getStatusBadgeClass(item.status)} mr-2`}>{item.status}</span>}
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
              </ul>
              <div className="mt-auto">
                <button
                  className="btn btn-block py-2"
                  style={{ background: 'linear-gradient(135deg, #E9C070 0%, #C5953A 100%)', color: '#1E2430', fontWeight: 700, borderRadius: '10px', border: 'none' }}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/patient/patient_history/' + item.patient_id)
                  }}
                >
                  <i className="fas fa-history mr-2" /><b>เพิ่มประวัติย้อนหลัง</b>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="card" style={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div className="card-header d-flex align-items-center" style={{ background: 'linear-gradient(135deg, #1E2430 0%, #2A3242 100%)', color: '#E9C070', borderBottom: '2px solid #C5953A', padding: '0.9rem 1.25rem' }}>
          <h3 className="card-title mb-0 font-weight-bold" style={{ fontSize: '1.05rem' }}>
            <i className="fas fa-search mr-2" /> ค้นหาคนไข้เพื่อบันทึกประวัติย้อนหลัง
          </h3>
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
              placeholder="ค้นหาคนไข้ (ชื่อ หรือ นามสกุล หรือ เบอร์โทรศัพท์)..."
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
                    <i className="fas fa-folder-open fa-3x mb-3" style={{ color: '#E9C070', opacity: 0.6 }} />
                    <p className="mb-0">ค้นหารายชื่อลูกค้าด้านบนเพื่อเข้าสู่หน้าบันทึกข้อมูลประวัติย้อนหลัง</p>
                  </div>
                )
              }}
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
          <div className="card mb-0" style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid #E9C070' }}>
            <div className="card-header d-flex align-items-center justify-content-between" style={{ background: 'linear-gradient(135deg, #1E2430 0%, #2A3242 100%)', color: '#E9C070', borderBottom: '2px solid #C5953A' }}>
              <h2 className="card-title mb-0 font-weight-bold" style={{ fontSize: '1.15rem' }}>เพิ่มข้อมูลประวัติคนไข้ย้อนหลัง</h2>
              <div className="card-tools ml-auto">
                <button type="button" className="btn btn-tool text-white" onClick={(e) => {
                  e.preventDefault()
                  closeModal();
                }}><i className="fas fa-times"></i>
                </button>
              </div>
            </div>
            <div className='card-body' style={{ textAlign: 'center' }}><img src="/img/ALA_logo.png" alt="ALA Logo" style={{ maxHeight: '64px' }} /></div>
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
          <div className="row mb-2 align-items-center">
            <div className="col-sm-8">
              <h1 className="m-0 font-weight-bold" style={{ color: '#1E2430', fontSize: '1.6rem' }}>
                <i className="fas fa-history mr-2" style={{ color: '#C5953A' }} />
                บันทึกข้อมูลคนไข้ / ลูกค้าย้อนหลัง
              </h1>
              <p className="text-muted mb-0 mt-1" style={{ fontSize: '0.9rem' }}>
                ค้นหารายชื่อคนไข้เพื่อเพิ่มหรือแก้ไขประวัติการรับบริการย้อนหลัง
              </p>
            </div>
            <div className="col-sm-4">
            </div>
          </div>
        </div>
      </div>
      <section className="content">
        <div className="container-fluid">
          <div className='row'>
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
