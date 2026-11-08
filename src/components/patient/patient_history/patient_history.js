import moment from 'moment';
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { key, OK, server, apiUrl } from "../../../constants";
import { httpClient } from '../../../utils/HttpClient';
import Modal from 'react-modal';
import './patient_history.css'
import { useParams } from "react-router-dom";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import DropZone from "../../../utils/DropZone"
import ProgressBar from "@ramonak/react-progress-bar";

import _ from "lodash";
import CurrencyFormat from 'react-currency-format';
import Swal from 'sweetalert2';

import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'

import { isMobile } from 'react-device-detect';
import { Link } from 'react-router-dom';
import { useNavigate, } from "react-router-dom";

function useForceUpdate() {
  const [value, setValue] = useState(0); // integer state
  return () => setValue(value => value + 1); // update the state to force render
}

export default function Patient_history(props) {
  const navigate = useNavigate();
  const params = useParams();

  //forceUpdate
  const forceUpdate = useForceUpdate();

  const [listPromotion_category, setListPromotion_category] = useState([])
  const [selectedPromotion_category, setSelectedPromotion_category] = useState('all')

  const [patientData, setPatientData] = useState([])
  const [mode, setMode] = useState('diagnose') // historical , diagnose
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [resetRadio, setResetRadio] = useState(false)

  //list
  const [listAgent, setListAgent] = useState([])
  const [listPromotions, setListPromotions] = useState([])

  //state historical
  const [operate_date, setOperate_date] = useState(moment().toDate())
  const [promotion_id, setPromotion_id] = useState(null)
  const [promotion_name, setPromotion_name] = useState(null)
  const [promotion_startPrice, setPromotion_startPrice] = useState(0)
  const [promotion_price, setPromotion_price] = useState(0)
  // const [discount, setDiscount] = useState(0)
  // const [commission, setCommission] = useState(0)
  const [agent, setAgent] = useState('')
  const [details, setDetails] = useState('')
  const [updater, setupdater] = useState(localStorage.getItem(key.USER_NAME))

  //list selected promotions
  const [listSelectedPromotions, setListSelectedPromotions] = useState([])

  const [listTimeLine, setlistTimeLine] = useState([])

  //upload image
  const [modeAddImages, setmodeAddImages] = useState(false)
  const [history_id, sethistory_id] = useState(null)
  const [images, setimages] = useState(null)
  const [image_description, setimage_description] = useState(null)
  const [progress, setprogress] = useState(0)

  //images
  const [images_id_list, setimages_id_list] = useState(null)

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

  const debounceSearch = useRef(_.debounce((e, valueIsOpen, selected_category) => findPromotionsData(e, valueIsOpen, selected_category), 500)).current;
  const searchChanged = (e, valueIsOpen, selected_category) => {
    e.persist();
    debounceSearch(e, valueIsOpen, selected_category);
  };
  const findPromotionsData = async (e, valueIsOpen, selected_category) => {
    setPromotion_id(null)
    setPromotion_name(null)
    setPromotion_startPrice(0)
    setPromotion_price(0)
    setResetRadio(false)
    if (e.target.value != '') {
      let response = await httpClient.get(server.FIND_PROMOTIONS_DATA_URL + '/' + e.target.value + '/' + valueIsOpen + '/' + selected_category)
      if (response.data.result.length > 0 && response.data.api_result === OK) {
        setListPromotions(response.data.result)
      } else {
        doGetPromotions(mode == 'diagnose' ? 'true' : 'all', selectedPromotion_category)
      }
    } else {
      doGetPromotions(mode == 'diagnose' ? 'true' : 'all', selectedPromotion_category)
    }
  }
  const doGetPromotions = async (isOpen_t, selectedPromotion_category_t) => {
    try {
      setResetRadio(false)
      setPromotion_id(null)
      setPromotion_name(null)
      setPromotion_startPrice(0)
      setPromotion_price(0)
      let response = await httpClient.get(server.PROMOTIONS_CATEGORY_URL + '/' + isOpen_t + '/' + selectedPromotion_category_t)
      if (response.data.result.length > 0 && response.data.api_result === OK) {
        setListPromotions(response.data.result)
      } else {
        setListPromotions([])
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    setisLoad(true)
    await doGetPatientData()
    await doGetAgent()
    await doGetPatientHistory()
    await doGetCategories()
    await doGetCustomerImages()
    setisLoad(false)
  }

  const doGetPatientData = async () => {
    const { patient_id } = params
    const response = await httpClient.get(server.PATIENT_DATA_URL + '/' + patient_id)
    if (response.data.api_result === OK) {
      setPatientData(response.data.result)
    } else {
      setPatientData([])
    }
  }
  const doGetAgent = async () => {
    const response = await httpClient.get(server.USER_URL)
    if (response.data.api_result === OK) {
      setListAgent(response.data.result)
    } else {
      setListAgent([])
    }
  }
  const doGetCategories = async () => {
    try {
      let response = await httpClient.get(server.PROMOTIONS_CATEGORY_URL)
      if (response.data.result.length > 0 && response.data.api_result === OK) {
        setListPromotion_category(response.data.result)
      } else {
        setListPromotion_category([])
      }
    } catch (error) {
      console.log(error);
    }
  }

  const renderPatientData = () => {
    return (
      <div className="card" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(233, 192, 112, 0.35)', boxShadow: '0 6px 20px rgba(30, 36, 48, 0.06)' }}>
        <div className="card-header d-flex align-items-center justify-content-between" style={{ background: 'linear-gradient(135deg, #1E2430 0%, #2A3242 100%)', color: '#E9C070', borderBottom: '2px solid #C5953A', padding: '0.9rem 1.25rem' }}>
          <h3 className="card-title mb-0 font-weight-bold" style={{ fontSize: '1.05rem' }}>
            <i className="fas fa-id-badge mr-2" /> ข้อมูลผู้ป่วย (Patient Profile)
          </h3>
          <span className={getStatusBadgeClass(patientData.status)}>{patientData.status}</span>
        </div>

        <div className="card-body box-profile">
          <h3 className="profile-username text-center font-weight-bold mb-1" style={{ color: '#1E2430', fontSize: '1.35rem' }}>
            {patientData.first_name + ' ' + patientData.last_name}
          </h3>
          <p className="text-muted text-center mb-3">
            <i className="fas fa-briefcase mr-1" style={{ color: '#C5953A' }} /> {patientData.job || 'ไม่ระบุอาชีพ'}
          </p>
          <ul className="list-group list-group-unbordered mb-3">
            <li className="list-group-item d-flex justify-content-between align-items-center py-2">
              <span><i className="fas fa-venus-mars mr-2 text-muted" /><b>เพศ</b></span>
              <span className="text-muted font-weight-bold">{patientData.sex}</span>
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
          </ul>

          <div className="card mb-0" style={{ borderRadius: '12px', backgroundColor: '#FAF8F5', border: '1px solid rgba(233, 192, 112, 0.4)' }}>
            <div className="card-body p-3">
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
              <p className="text-muted mb-2">
                {patientData.drug_allergy == '' ? 'ไม่มี' : patientData.chronic_disease}
              </p>
              <hr className="my-2" />
              <div className="d-flex justify-content-between align-items-center pt-1">
                <b><i className="fas fa-calendar-check mr-1" style={{ color: '#C5953A' }} /> นัดหมาย</b>
                <Link to={"/appointment/" + patientData.patient_id} className="btn btn-sm px-3" style={{ background: 'linear-gradient(135deg, #E9C070 0%, #C5953A 100%)', color: '#1E2430', fontWeight: 600, borderRadius: '8px' }}>
                  <i className="fas fa-calendar-alt mr-1" /> จัดการนัดหมาย
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="card-footer bg-white d-flex justify-content-between align-items-center py-3">
          <button onClick={(e) => {
            e.preventDefault();
            renderAddHistoricalData()
          }} className="btn btn-outline-dark px-3" style={{ borderRadius: '10px', fontWeight: 600 }}>
            <i className="fas fa-history mr-1" style={{ color: '#C5953A' }} /> เพิ่มประวัติย้อนหลัง
          </button>
          <button onClick={(e) => {
            e.preventDefault();
            renderAddDiagnoseData()
          }} className="btn px-3" style={{ background: 'linear-gradient(135deg, #55C5D9 0%, #3aa8bc 100%)', color: '#fff', fontWeight: 600, borderRadius: '10px', border: 'none' }}>
            <i className="fas fa-stethoscope mr-1" /> เริ่มการวินิจฉัย
          </button>
        </div>
      </div>
    )
  }


  //Patient history
  const doGetPatientHistory = async () => {
    try {
      const { patient_id } = params
      const response = await httpClient.get(server.PANTIENT_HISTORY_URL + '/' + patient_id)
      setlistTimeLine(response.data.result)
    } catch (error) {
      console.log(error);
      setlistTimeLine([])
    }

    // console.log(response.data.result);
  }
  const renderTimeLine = () => {
    if (!listTimeLine) {
      return
    }
    if (listTimeLine.length > 0) {
      let distinctDateTimeline = []
      for (let i = 0; i < listTimeLine.length; i++) {
        const item = listTimeLine[i];
        if (!distinctDateTimeline.includes(item.operate_date)) {
          distinctDateTimeline.push(item.operate_date)
        }
      }

      const doDeleteTimeLine = (history_id) => {
        Swal.fire({
          title: 'ต้องการลบประวัติ?',
          text: "You won't be able to revert this!",
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'ใช่, ลบเลย!',
          cancelButtonText: 'ยกเลิก',
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire({
              title: 'โปรดยืนยันอีกครั้ง!',
              text: "ลบแล้วลบเลยนะ โปรดระวัง",
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: 'ยืนยัน',
              cancelButtonText: 'ยกเลิก',
            }).then(async (confirmResult) => {
              if (confirmResult.isConfirmed) {
                const response = await httpClient.delete(server.PANTIENT_HISTORY_URL, { data: { history_id } })
                if (response.data.api_result === OK) {
                  Swal.fire(
                    'Deleted!',
                    'ประวัติคนไข้ถูกลบเรียบร้อย',
                    'success'
                  ).then(() => {
                    doGetPatientHistory()
                  })
                } else {
                  Swal.fire(
                    'Error!',
                    'ประวัติคนไข้ลบไม่สมบูรณ์',
                    'error'
                  )
                }

              }
            })
          }
        })
      }

      const renderCustomerImages = (history_id) => {
        if (images_id_list) {
          if (images_id_list[history_id]) {
            return images_id_list[history_id].map((item) => (
              <div className={isMobile ? "col-6 mb-2" : "col-4 mb-2"} key={item}>
                <div className="card mb-0" style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}>
                  <div className="card-header bg-light py-1 px-2 d-flex justify-content-between align-items-center">
                    <a target="_blank" rel="noreferrer" href={apiUrl + server.CUSTOMER_FULL_IMAGE_URL + '/' + item} className="btn btn-outline-primary btn-xs" title="ดูภาพขนาดเต็ม">
                      <i className="far fa-file-image"></i>
                    </a>
                    <button onClick={() => {
                      doDeleteCustomerImages(item)
                    }} className="btn btn-outline-danger btn-xs ml-auto" title="ลบรูปภาพ">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <div className="card-body p-1">
                    <Zoom>
                      <img style={{ width: '100%', borderRadius: '6px', objectFit: 'cover' }} src={apiUrl + server.CUSTOMER_IMAGE_URL + '/' + item} alt="Treatment" />
                    </Zoom>
                  </div>
                </div>
              </div>
            ))
          }
        }
      }

      const renderTimeLineOnDate = (date) => {
        let listTimeLineOnDate = []
        for (let i = 0; i < listTimeLine.length; i++) {
          const item = listTimeLine[i];
          if (item.operate_date == date) {
            listTimeLineOnDate.push(item)
          }
        }

        return listTimeLineOnDate.map(item => (
          <div key={item.history_id}>
            <i className="fas fa-hand-holding-medical" style={{ backgroundColor: '#55C5D9', color: '#fff' }} />
            <div className="timeline-item">
              <span className="time">
                <i className="fas fa-clock mr-1"></i>{moment(item.updatedAt).format('HH:mm')} น.
              </span>
              <h2 className="timeline-header" style={{ backgroundColor: '#FAF8F5', borderBottom: '1px solid rgba(233,192,112,0.25)', color: '#1E2430' }}>
                <i className="fas fa-spa mr-2" style={{ color: '#C5953A' }} />
                <b>{item.promotionMaster.promotion_name}</b>
              </h2>
              <div className="timeline-body">
                <p className="text-muted mb-2">{item.promotionMaster.promotion_detail}</p>
                {item.details !== '' ? (
                  <p className="mb-2">
                    <span className="font-weight-bold text-dark"><i className="fas fa-file-alt mr-1 text-muted" />รายละเอียด : </span>
                    {item.details}
                  </p>
                ) : <></>}
                <p className="mb-2">
                  <span className="font-weight-bold text-dark"><i className="fas fa-tag mr-1" style={{ color: '#C5953A' }} />ราคาลูกค้า : </span>
                  <CurrencyFormat value={item.promotion_price} displayType={'text'} thousandSeparator={true} suffix={' ฿'} renderText={value => <b style={{ color: '#1b7f91', fontSize: '1.05rem' }}>{value}</b>} />
                  {item.discount > 0 ? (
                    <span className="badge badge-success ml-2 px-2 py-1">ส่วนลด {item.discount} ฿</span>
                  ) : ''}
                </p>
                <div className="d-flex flex-wrap text-muted" style={{ fontSize: '0.85rem' }}>
                  {item.agent !== '' ? <span className="mr-3"><i className="fas fa-user-tie mr-1" />ผู้แนะนำ : <b>{item.agent}</b></span> : <></>}
                  <span><i className="fas fa-user-check mr-1" />อัพเดทโดย : <b>{item.updater}</b></span>
                </div>
                <div className="row mt-2">
                  {renderCustomerImages(item.history_id)}
                </div>
              </div>
              <div className="timeline-footer bg-light px-3 py-2 d-flex justify-content-between align-items-center">
                <button onClick={(e) => {
                  e.preventDefault();
                  addImage(item.history_id)
                }}
                  className="btn btn-sm px-3"
                  style={{ backgroundColor: '#55C5D9', color: '#fff', borderRadius: '8px', fontWeight: 600 }}
                >
                  <i className="fas fa-images mr-1" /> เพิ่มรูปภาพ
                </button>
                <button onClick={(e) => {
                  e.preventDefault();
                  doDeleteTimeLine(item.history_id)
                }} className="btn btn-outline-danger btn-sm ml-auto" style={{ borderRadius: '8px' }}>
                  <i className="fas fa-trash-alt mr-1" /> ลบประวัติ
                </button>
              </div>
            </div>
          </div>
        ))

      }

      return distinctDateTimeline.map(item => (
        <React.Fragment key={item}>
          <div className="time-label">
            <span className="px-3 py-1" style={{ backgroundColor: '#1E2430', color: '#E9C070', borderRadius: '20px', border: '1px solid #C5953A', fontWeight: 600 }}>
              <i className="far fa-calendar-alt mr-1" /> {moment(item).format('DD MMM (MM) YYYY')}
            </span>
          </div>
          {renderTimeLineOnDate(item)}
        </React.Fragment>
      ))
    }
  }
  const renderPatientHistory = () => {
    return (
      <div className="card" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(233, 192, 112, 0.35)', boxShadow: '0 6px 20px rgba(30, 36, 48, 0.06)' }}>
        <div className="card-header d-flex align-items-center justify-content-between" style={{ background: 'linear-gradient(135deg, #1E2430 0%, #2A3242 100%)', color: '#E9C070', borderBottom: '2px solid #C5953A', padding: '0.9rem 1.25rem' }}>
          <h3 className="card-title mb-0 font-weight-bold" style={{ fontSize: '1.05rem' }}>
            <i className="fas fa-stream mr-2" /> ประวัติการรักษา (Treatment Timeline)
          </h3>
          <button onClick={(e) => {
            e.preventDefault();
            renderAddDiagnoseData()
          }} className="btn btn-sm px-3 ml-auto" style={{ background: 'linear-gradient(135deg, #E9C070 0%, #C5953A 100%)', color: '#1E2430', fontWeight: 700, borderRadius: '8px', border: 'none' }}>
            <i className="fas fa-stethoscope mr-1" /> เริ่มการวินิจฉัย
          </button>
        </div>
        <div className="card-body">
          <div className="timeline">
            {renderTimeLine()}
            <div>
              <i className="fas fa-clock bg-gray"></i>
              <button onClick={(e) => {
                e.preventDefault();
                renderAddDiagnoseData()
              }} className="btn px-4 float-right" style={{ background: 'linear-gradient(135deg, #55C5D9 0%, #3aa8bc 100%)', color: '#fff', fontWeight: 600, borderRadius: '10px', border: 'none' }}>
                <i className="fas fa-stethoscope mr-1" /> เริ่มการวินิจฉัย
              </button>
            </div>
          </div>
        </div>
      </div>

    )
  }

  //Modal historical
  const closeModal = () => {
    setOperate_date(moment().toDate())
    setPromotion_id(null)
    setPromotion_startPrice(0)
    setPromotion_price(0)
    setAgent('')
    setDetails('')
    setListPromotions([])
    setSelectedPromotion_category('all')
    setIsModalOpen(false)
    //image
    sethistory_id(null)
    setimages([])
    setimage_description(null)
    setmodeAddImages(false)
    setprogress(0)
  }
  const openModal = () => {
    setIsModalOpen(true)
  }
  const renderAddHistoricalData = () => {
    setMode('historical')
    setListSelectedPromotions([])
    openModal()
  }
  const renderAddDiagnoseData = () => {
    if (patientData.status === 'diagnose') {
      setMode('diagnose')
      openModal()
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'วินิจฉัยไม่ได้...',
        text: 'เนื่องจากสถานะลูกค้า/คนไข้ ไม่ใช่ diagnose',
      })
    }
  }
  const renderCreateHistoricalData = () => {
    const renderPromotions = () => {
      const searchPromotions = () => {
        return listPromotions.map((item) => (
          <div className="form-check ala-promo-item" key={item.promotion_id}>
            <input className="form-check-input"
              type="radio"
              checked={resetRadio ? false : null}
              value={item.promotion_id}
              name="promotions"
              onChange={() => {
                // console.log(resetRadio);
                // setResetRadio(false)
                setPromotion_id(item.promotion_id)
                setPromotion_name(item.promotion_name)
                findPromotionPrice(item.promotion_id)
              }} />
            <label className="form-check-label d-block">
              <b className="text-dark">{item.promotion_name + ' ' + item.unit_quantity + ' ' + item.unit_suffix + ' '}</b>
              <CurrencyFormat value={item.promotion_price} displayType={'text'} thousandSeparator={true} suffix={'฿'} renderText={value => <span className="ml-1 badge px-2 py-1" style={{ backgroundColor: 'rgba(85,197,217,0.16)', color: '#1b7f91', fontSize: '0.85rem' }}>{value}</span>} />
              <span className="text-muted ml-2">{item.promotion_detail}</span>
            </label>
          </div>
        ))
      }
      const renderCategories = () => {
        return listPromotion_category.map((item) => (
          <option key={item.promotion_category} value={item.promotion_category}>{item.promotion_category}</option>
        )
        )
      }
      return (
        <>
          <div className="form-group">
            <label className="font-weight-bold text-dark">
              <i className="fas fa-tags mr-1" style={{ color: '#C5953A' }} /> เลือกหมวดหมู่และค้นหาโปรโมชั่น
            </label>
            <div className="row">
              <div className="col-sm-4 mb-2 mb-sm-0">
                <select className="form-control"
                  style={{ borderRadius: '10px', borderColor: '#E9C070' }}
                  value={selectedPromotion_category}
                  onChange={async (e) => {
                    await setSelectedPromotion_category(e.target.value)
                    doGetPromotions(mode == 'diagnose' ? 'true' : 'all', e.target.value)
                  }}>
                  <option value="all">หมวดหมู่ทั้งหมด</option>
                  {renderCategories()}
                </select>
              </div>
              <div className="col-sm-8">
                <input
                  onChange={(e) => {
                    e.preventDefault()
                    setResetRadio(true)
                    searchChanged(e, mode == 'diagnose' ? 'true' : 'all', selectedPromotion_category)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setResetRadio(true)
                      searchChanged(e, mode == 'diagnose' ? 'true' : 'all', selectedPromotion_category)
                    }
                  }}
                  type="search"
                  className="form-control"
                  placeholder="พิมพ์ชื่อโปรโมชั่นเพื่อค้นหา..."
                  style={{ borderRadius: '10px', borderColor: '#E9C070' }}
                />
              </div>
            </div>
          </div>
          {listPromotions.length > 0 && (
            <div className="form-group ala-promo-list-box">
              {searchPromotions()}
            </div>
          )}
        </>
      )
    }

    const findPromotionPrice = (id) => {
      listPromotions.forEach(item => {
        if (id == item.promotion_id) {
          setPromotion_startPrice(parseFloat(item.promotion_price));
          setPromotion_price(parseFloat(item.promotion_price))
        }
      });
    }

    const renderAgentList = () => {
      return listAgent.map((item) => (
        <option key={item.username} value={item.username}>{item.username}</option>
      ))
    }

    const addListSelectedPromotions = async () => {
      if (promotion_id == null || promotion_id == '') {
        Swal.fire({
          icon: 'error',
          title: 'ยังไม่ได้เลือกโปรโมชั่น!',
          text: 'กรุณาเลือกโปรโมชั่น...',
        })
        return
      }
      //check duplication
      const isMemberInListSelectedPromotions = (compareValues) => {
        for (let i = 0; i < listSelectedPromotions.length; i++) {
          const item = listSelectedPromotions[i];
          if (item.promotion_id == compareValues) {
            return true;
          }

        }
        return false
      }
      if (isMemberInListSelectedPromotions(promotion_id)) {
        Swal.fire({
          icon: 'error',
          title: 'โปรโมชั่นซ้ำ!',
          text: 'กรุณาเลือกใหม่...',
        })
        return
      }

      var templistSelectedPromotions = listSelectedPromotions
      const dataSelectedPromotions = {
        operate_date,
        promotion_id,
        promotion_name,
        promotion_startPrice,
        promotion_price,
        discount: promotion_startPrice - promotion_price,
        commission: agent == '' ? 0 : promotion_price * 0.1,
        agent,
        details,
        updater,
      }
      templistSelectedPromotions.push(dataSelectedPromotions)
      await setListSelectedPromotions(templistSelectedPromotions)
      // console.log(listSelectedPromotions);
      forceUpdate()
    }

    const removeListSelectedPromotions = async (index) => {
      Swal.fire({
        title: 'ต้องการนำโปรโมชั่นนี้ออก?',
        text: "ต้องการลบ " + listSelectedPromotions[0].promotion_name,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'ต้องการลบ',
        cancelButtonText: 'ยกเลิก'
      }).then(async (result) => {
        if (result.isConfirmed) {
          var templistSelectedPromotions = listSelectedPromotions
          templistSelectedPromotions.splice(index, 1)
          await setListSelectedPromotions(templistSelectedPromotions)
          // console.log(templistSelectedPromotions);
          Swal.fire(
            'Deleted!',
            'Your file has been deleted.',
            'success'
          )
          forceUpdate()
        }
      })
    }

    const renderListSelectedPromotions = () => {
      if (listSelectedPromotions.length > 0) {
        const renderTableHeader = () => {
          return (
            <tr role="row" style={{ backgroundColor: '#1E2430', color: '#E9C070' }}>
              <th className="sorting">ชื่อโปรโมชั่น</th>
              <th className="sorting">ราคาเริ่มต้น</th>
              <th className="sorting">ราคาลูกค้า</th>
              <th className="sorting">รายละเอียด</th>
              <th className="sorting">ผู้แนะนำ</th>
              <th className="sorting text-center">เครื่องมือ</th>
            </tr>
          )
        }

        const renderTableRow = () => {
          return listSelectedPromotions.map((item, index) => (
            <tr key={index}>
              <td className="font-weight-bold">{item.promotion_name}</td>
              <td>{item.promotion_startPrice}</td>
              <td className="font-weight-bold" style={{ color: '#1b7f91' }}>{item.promotion_price}</td>
              <td>{item.details}</td>
              <td>{item.agent || '-'}</td>
              <td className="text-center">
                <button className="btn btn-outline-danger btn-sm" style={{ borderRadius: '8px' }} onClick={(e) => {
                  e.preventDefault()
                  removeListSelectedPromotions(index)
                }}>
                  <i className="fas fa-trash-alt" />
                </button>
              </td>
            </tr>
          ))
        }

        return (
          <div className="table-responsive mt-2" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}>
            <table
              id="example2"
              className="table table-hover text-nowrap mb-0"
              role="grid"
              aria-describedby="example2_info"
            >
              <thead>
                {renderTableHeader()}
              </thead>
              <tbody>
                {renderTableRow()}
              </tbody>
            </table>
          </div>
        )
      }
    }

    const submitPromotions = () => {
      if (listSelectedPromotions.length > 0) {
        Swal.fire({
          title: 'ยืนยันผลโปรโมชั่น',
          text: "ต้องการบันทึกผลโปรโมชั่นทั้งหมดของวันที่ " + moment(operate_date).format('DD/MM/YYYY') + " ?",
          icon: 'alert',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'ตกลง',
          cancelButtonText: 'ยกเลิก'
        }).then(async (result) => {
          if (result.isConfirmed) {
            // console.log(listSelectedPromotions);
            var payment_id = ''
            // if (mode === 'diagnose') {
            const response = await httpClient.post(server.PAYMENT_URL, { patient_id: patientData.patient_id, updater: localStorage.getItem(key.USER_NAME), })
            payment_id = response.data.result.payment_id
            // }
            for (let i = 0; i < listSelectedPromotions.length; i++) {
              const item = listSelectedPromotions[i];
              try {
                const data = {
                  patient_id: patientData.patient_id,
                  operate_date: item.operate_date,
                  promotion_id: item.promotion_id,
                  promotion_price: item.promotion_price,
                  discount: item.promotion_startPrice - item.promotion_price,
                  commission: item.commission,
                  agent: item.agent,
                  details: item.details,
                  updater: localStorage.getItem(key.USER_NAME),
                }
                // if (mode === 'diagnose') {
                data.payment_id = payment_id
                // }
                await httpClient.post(server.PANTIENT_HISTORY_URL, data)

              } catch (error) {
                console.log(error);
                Swal.fire({
                  title: 'การเพิ่มโปรโมชั่นล้มเหลว',
                  text: JSON.stringify(error),
                  icon: 'error',
                })
                return
              }
            }
            Swal.fire({
              title: 'เพิ่มโปรโมชั่นเสร็จสมบูรณ์',
              icon: 'success',
            }).then(async () => {
              if (mode == 'diagnose') {
                const transactionData = {
                  patient_id: patientData.patient_id,
                  status: 'operate',
                  updater: localStorage.getItem(key.USER_NAME)
                }
                let transactionResponse = await httpClient.post(server.PROCESS_TRANSACTION_URL, transactionData)
                let response = await httpClient.put(server.PATIENT_DATA_URL, transactionData)
                navigate('/patient/patient_status')
              } else {
                doGetPatientHistory();
                closeModal();
              }
            })
          }
        })
      } else {
        Swal.fire({
          title: 'กรุณาเลือกโปรโมชั่นด้วยครับ',
          icon: 'alert',
        })
      }
    }

    const totalPromotionsPrice = () => {
      var listPrices = {
        totalPromotionsStartPrice: 0,
        totalPromotionsPrice: 0,
        totalPromotionsDiscountPrice: 0
      }
      for (let index = 0; index < listSelectedPromotions.length; index++) {
        const item = listSelectedPromotions[index];
        listPrices.totalPromotionsPrice = listPrices.totalPromotionsPrice + item.promotion_price
        listPrices.totalPromotionsStartPrice = listPrices.totalPromotionsStartPrice + item.promotion_startPrice
      }

      listPrices.totalPromotionsDiscountPrice = listPrices.totalPromotionsStartPrice - listPrices.totalPromotionsPrice
      return listPrices

    }

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
            <div className="card-header d-flex align-items-center justify-content-between" style={{ background: 'linear-gradient(135deg, #1E2430 0%, #2A3242 100%)', color: '#E9C070', borderBottom: '2px solid #C5953A', padding: '1rem 1.25rem' }}>
              <h3 className="card-title mb-0 font-weight-bold" style={{ fontSize: '1.2rem' }}>
                <i className={mode == 'diagnose' ? 'fas fa-stethoscope mr-2' : 'fas fa-history mr-2'} />
                {mode == 'diagnose' ? 'เริ่มการวินิจฉัย (Clinical Diagnosis)' : 'เพิ่มข้อมูลประวัติคนไข้ย้อนหลัง (Add Historical Record)'}
              </h3>
              <div className="card-tools ml-auto">
                <button type="button" className="btn btn-tool text-white" onClick={(e) => {
                  e.preventDefault()
                  closeModal();
                }}><i className="fas fa-times" style={{ fontSize: '1.1rem' }}></i>
                </button>
              </div>
            </div>
            <div className="card-body pb-0 pt-3" style={{ textAlign: 'center', background: 'linear-gradient(180deg, rgba(233,192,112,0.08) 0%, rgba(255,255,255,0) 100%)' }}>
              <img src="/img/ALA_logo.png" alt="ALA Clinic" style={{ maxHeight: '64px', objectFit: 'contain' }} />
            </div>
            <div className='card-body pt-3'>
              <div className='row'>
                <div className='col-sm-6'>
                  <div className="form-group">
                    <label className="font-weight-bold text-dark">
                      <i className="far fa-calendar-alt mr-1" style={{ color: '#C5953A' }} /> วันที่ทำหัตถการ
                    </label>
                    <DatePicker disabled={mode == 'diagnose' ? true : false} className="form-control" selected={operate_date} onChange={(date) => setOperate_date(date)} />
                  </div>
                </div>
                <div className='col-sm-6'>
                  <div className="form-group">
                    <label className="font-weight-bold text-dark">
                      <i className="fas fa-user-tie mr-1" style={{ color: '#C5953A' }} /> ผู้แนะนำ
                    </label>
                    <select className="form-control" style={{ borderRadius: '10px' }} onChange={(e) => {
                      setAgent(e.target.value)
                    }}>
                      <option value=''>ไม่มี</option>
                      {renderAgentList()}
                    </select>
                  </div>
                </div>
                <div className='col-12'>
                  {renderPromotions()}
                </div>
                <div className='col-sm-6'>
                  <div className="form-group">
                    <label className="font-weight-bold text-dark">ราคาโปรโมชั่นเริ่มต้น</label>
                    <CurrencyFormat
                      className="form-control"
                      style={{ borderRadius: '10px' }}
                      value={promotion_startPrice}
                      thousandSeparator={true} suffix={'฿'}
                      isNumericString={true}
                      disabled={true}
                    />
                  </div>
                </div>
                <div className='col-sm-6'>
                  <div className="form-group">
                    <label className="font-weight-bold text-dark">ราคาโปรโมชั่นของลูกค้า</label>
                    <CurrencyFormat
                      className="form-control"
                      style={{ borderRadius: '10px', borderColor: '#55C5D9', fontWeight: 600 }}
                      value={promotion_price} thousandSeparator={true} suffix={'฿'}
                      isNumericString={true}
                      onValueChange={(values) => {
                        setPromotion_price(values.floatValue)
                      }}
                    />
                  </div>
                </div>
                <div className='col-12'>
                  <div className="form-group">
                    <label className="font-weight-bold text-dark">รายละเอียดเพิ่มเติม</label>
                    <textarea className='form-control' rows="2" style={{ borderRadius: '10px' }} value={details} onChange={(e) => {
                      setDetails(e.target.value)
                    }} />
                  </div>
                </div>
                <div className='col-12'>
                  <button type="submit" className='btn py-2' onClick={(e) => {
                    e.preventDefault();
                    addListSelectedPromotions()
                  }} style={{ width: '100%', background: 'linear-gradient(135deg, #E9C070 0%, #C5953A 100%)', color: '#1E2430', fontWeight: 700, borderRadius: '10px', border: 'none' }}>
                    <i className="fas fa-plus-circle mr-2" /> เพิ่มโปรโมชั่นในรายการ
                  </button>
                </div>
              </div>
              <div className="mt-4">
                <h5 className="font-weight-bold mb-2" style={{ color: '#1E2430' }}>
                  <i className="fas fa-clipboard-list mr-2" style={{ color: '#C5953A' }} />
                  รวมผล Promotion ของลูกค้าวันที่ {moment(operate_date).format('DD/MM/YYYY')}
                </h5>
                {renderListSelectedPromotions()}
              </div>
            </div>

            <div className="card-footer bg-light px-4 py-3">
              <div className="row text-center mb-3 p-2" style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid rgba(233,192,112,0.35)' }}>
                <div className="col-sm-4">
                  <span className="text-muted d-block" style={{ fontSize: '0.85rem' }}>รวมราคาทั้งหมด</span>
                  <b className="text-dark" style={{ fontSize: '1.1rem' }}>{totalPromotionsPrice().totalPromotionsStartPrice} ฿</b>
                </div>
                <div className="col-sm-4">
                  <span className="text-muted d-block" style={{ fontSize: '0.85rem' }}>รวมราคาของลูกค้า</span>
                  <b style={{ color: '#1b7f91', fontSize: '1.2rem' }}>{totalPromotionsPrice().totalPromotionsPrice} ฿</b>
                </div>
                <div className="col-sm-4">
                  <span className="text-muted d-block" style={{ fontSize: '0.85rem' }}>ราคาที่ประหยัดไป</span>
                  <b className="text-success" style={{ fontSize: '1.1rem' }}>{totalPromotionsPrice().totalPromotionsDiscountPrice} ฿</b>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <button onClick={(e) => {
                  e.preventDefault()
                  submitPromotions()
                }} className="btn px-4 py-2" style={{ background: 'linear-gradient(135deg, #55C5D9 0%, #3aa8bc 100%)', color: '#fff', fontWeight: 700, borderRadius: '10px', border: 'none' }}>
                  <i className="fas fa-check-circle mr-1" /> ยืนยันบันทึกข้อมูล (Submit)
                </button>
                <button onClick={(e) => {
                  e.preventDefault();
                  closeModal();
                }} className="btn btn-secondary px-4 py-2" style={{ borderRadius: '10px' }}>
                  ยกเลิก
                </button>
              </div>
            </div>

          </div>
        </div>
      </Modal>
    )
  }

  //add image
  const addImage = (history_id) => {
    setmodeAddImages(true)
    setimages([])
    sethistory_id(history_id)

  }
  const doUploadImages = async () => {
    const imageConversion = require("image-conversion")
    if (images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        var formData = new FormData();
        const image = images[i];
        await imageConversion.compressAccurately(image, {
          size: 400,    //The compressed image size is 100kb
          accuracy: 1,
          scale: 0.7,
        }).then(async img => {
          await formData.append("image", img);
          // console.log(res);
          // await formData.append("image", image);
          await formData.append("updater", localStorage.getItem(key.USER_NAME))
          await formData.append("history_id", history_id);
          await formData.append("patient_id", patientData.patient_id);
          await formData.append("image_description", '');
          const result = await httpClient.post(server.CUSTOMER_IMAGE_URL, formData)
          console.log(result.data);
          setprogress(parseInt(((i + 1) / images.length) * 100))
        })

      }
      doGetCustomerImages()
      setTimeout(() => {
        closeModal()
      }, 1000);
    }
  }
  const renderProgress = () => {
    if (progress > 0) {
      return (
        <div className="mt-3" style={{ width: '100%' }}>
          <ProgressBar width='100%' bgColor='#55C5D9' completed={progress} />
        </div>
      )
    }
  }
  const renderAddImages = () => {
    return (
      <Modal
        isOpen={modeAddImages}
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
            <div className="card-header d-flex align-items-center justify-content-between" style={{ background: 'linear-gradient(135deg, #1E2430 0%, #2A3242 100%)', color: '#E9C070', borderBottom: '2px solid #C5953A', padding: '1rem 1.25rem' }}>
              <h3 className="card-title mb-0 font-weight-bold" style={{ fontSize: '1.15rem' }}>
                <i className="fas fa-cloud-upload-alt mr-2" /> อัพโหลดรูปภาพการรักษา
              </h3>
              <div className="card-tools ml-auto">
                <button type="button" className="btn btn-tool text-white" onClick={(e) => {
                  e.preventDefault()
                  closeModal();
                }}><i className="fas fa-times"></i>
                </button>
              </div>
            </div>
            <div className='card-body pb-0 pt-3' style={{ textAlign: 'center' }}>
              <img src="/img/ALA_logo.png" alt="ALA Clinic" style={{ maxHeight: '60px', objectFit: 'contain' }} />
            </div>
            <div className='card-body'>
              <div className="input-group" style={{ marginTop: 10, overflow: 'auto' }}>
                <DropZone parentCallback={setimages} />
              </div>
              {renderProgress()}
            </div>
            <div className='card-footer bg-light d-flex justify-content-between align-items-center px-4 py-3'>
              <button onClick={(e) => {
                e.preventDefault()
                doUploadImages()
              }} className="btn px-4" style={{ background: 'linear-gradient(135deg, #E9C070 0%, #C5953A 100%)', color: '#1E2430', fontWeight: 700, borderRadius: '10px', border: 'none' }}>
                <i className="fas fa-upload mr-1" /> ตกลง (Upload)
              </button>
              <button onClick={(e) => {
                e.preventDefault();
                closeModal();
              }} className="btn btn-secondary px-4" style={{ borderRadius: '10px' }}>ยกเลิก</button>
            </div>
          </div>
        </div>
      </Modal>
    )
  }

  const doDeleteCustomerImages = async (id) => {
    // console.log(id);
    Swal.fire({
      title: 'ต้องการลบรูปนี้?',
      text: "ถ้าลบแลวจะไม่สามารถกู้คืนได้นะ",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ลบเลย!',
      cancelButtonText: 'ไม่ลบละเปลี่ยนใจ'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const result = await httpClient.delete(server.CUSTOMER_IMAGE_URL, { data: { id } })
        doGetCustomerImages()
        Swal.fire(
          'ลบเรียบร้อย!',
          'รูปนี้ถูกลบแล้ว',
          'success'
        )
      }
    })


  }
  //get images
  const doGetCustomerImages = async () => {
    const { patient_id } = params
    const response = await httpClient.get(server.CUSTOMER_IMAGE_URL + '_customer' + '/' + patient_id)

    if (response.data.result && response.data.api_result === OK) {
      var image_obj = {}
      for (let index = 0; index < response.data.list_history_id.length; index++) {
        const item = response.data.list_history_id[index];
        image_obj[item.history_id] = []
      }

      for (let i = 0; i < response.data.result.length; i++) {
        const item = response.data.result[i];
        var t = image_obj[item.history_id]
        t.push(item.id)
        image_obj[item.history_id] = t
      }

      console.log(image_obj);
      setimages_id_list(image_obj)
    }
  }


  return (
    <div className='content-wrapper'>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2 align-items-center">
            <div className="col-sm-6">
              <h1 className="m-0 font-weight-bold" style={{ color: '#1E2430', fontSize: '1.6rem' }}>
                <i className="fas fa-file-medical-alt mr-2" style={{ color: '#C5953A' }} />
                ประวัติคนไข้ / ลูกค้า
              </h1>
              <p className="text-muted mb-0 mt-1" style={{ fontSize: '0.9rem' }}>
                เวชระเบียน การวินิจฉัยโรค และประวัติการทำหัตถการ
              </p>
            </div>
            <div className="col-sm-6">
              {renderAddImages()}
            </div>
          </div>
        </div>
      </div>
      <section className="content">
        <div className="container-fluid">
          <div className="overlay-wrapper" style={{ visibility: isLoad ? 'visible' : 'hidden' }}>
            <div className="overlay">
              <i className="fas fa-3x fa-sync-alt fa-spin">
              </i>
              <div className="text-bold pt-2">Loading...</div>
            </div>
          </div>
          <div className='row'>
            <div className={isMobile ? 'col-12' : 'col-5'}>
              {renderPatientData()}
            </div>
            <div className={isMobile ? 'col-12' : 'col-7'}>
              {renderPatientHistory()}
            </div>
            <div className='col-12'>
              {renderCreateHistoricalData()}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
