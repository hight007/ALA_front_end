import moment from 'moment';
import React, { useState, useEffect, useRef } from 'react'
import { key, OK, server } from "../../../constants";
import { httpClient } from '../../../utils/HttpClient';
import Modal from 'react-modal';
import './patient_history.css'

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import _ from "lodash";
import CurrencyFormat from 'react-currency-format';
import Swal from 'sweetalert2';

function useForceUpdate() {
  const [value, setValue] = useState(0); // integer state
  return () => setValue(value => value + 1); // update the state to force render
}

export default function Patient_history(props) {

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
    doGetPatientData()
    doGetAgent()
    doGetPatientHistory()
    doGetCategories()
  }, [])

  const doGetPatientData = async () => {
    const { patient_id } = props.match.params
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
      <div className="card card-dark">
        {/* <div class="card-header">
          <h3 class="card-title">ประวัติ</h3>
        </div> */}
        <div className="card-body box-profile">
          <h3 className="profile-username text-center">{patientData.first_name + ' ' + patientData.last_name}</h3>
          <p className="text-muted text-center">{patientData.job}</p>
          <ul className="list-group list-group-unbordered mb-3">
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
              <b>สถานะ </b> <label style={{ color: 'red' }} className={patientData.status != 'diagnose' ? 'float-right text-center' : 'float-right text-center text-muted'}>{patientData.status}</label>
            </li>
            <div className="card card-default" style={{ marginTop: 10 }}>
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

          </ul>
        </div>
        {/* /.card-body */}

        <div className="card-footer">
          <button onClick={(e) => {
            e.preventDefault();
            renderAddHistoricalData()
          }} className="btn btn-primary">เพิ่มประวัติย้อนหลัง</button>
          <button onClick={(e) => {
            e.preventDefault();
            renderAddDiagnoseData()
          }} className="btn btn-success float-right">เริ่มการวินิจฉัย</button>
        </div>
      </div>
    )
  }


  //Patient history
  const doGetPatientHistory = async () => {
    try {
      const { patient_id } = props.match.params
      const response = await httpClient.get(server.PANTIENT_HISTORY_URL + '/' + patient_id)
      setlistTimeLine(response.data.result)
    } catch (error) {
      console.log(error);
      setlistTimeLine([])
    }

    // console.log(response.data.result);
  }

  const renderTimeLine = () => {
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

      const renderTimeLineOnDate = (date) => {
        let listTimeLineOnDate = []
        for (let i = 0; i < listTimeLine.length; i++) {
          const item = listTimeLine[i];
          if (item.operate_date == date) {
            listTimeLineOnDate.push(item)
          }
        }

        return listTimeLineOnDate.map(item => (
          <div>
            <i className="fas fa-hand-holding-medical bg-success" />
            <div class="timeline-item">
              <span class="time">
                <i class="fas fa-clock"></i>{moment(item.updatedAt).format('HH:mm')}</span>
              <h2 class="timeline-header"><b>{item.promotionMaster.promotion_name}</b></h2>
              <div class="timeline-body">
                <p>{item.promotionMaster.promotion_detail}</p>
                {item.details !== '' ? <p>รายละเอียด : {item.details}</p> : <></>}
                <p>ราคาลูกค้า : <CurrencyFormat value={item.promotion_price} displayType={'text'} thousandSeparator={true} suffix={'฿'} renderText={value => <b style={{ color: 'blue' }}>{value}</b>} />
                  {item.discount > 0 ? ' , ราคาที่ลด : ' + item.discount : ''}</p>
                {item.agent !== '' ? <p>ผู้แนะนำ : {item.agent}</p> : <></>}
                <p>อัพเดทโดย : {item.updater}</p>
              </div>
              <div class="timeline-footer">
                <div>
                  <button onClick={(e) => {
                    e.preventDefault();
                    doDeleteTimeLine(item.history_id)
                  }} style={{ marginLeft: 5 }} className="btn btn-danger btn-xs"><i className="fas fa-trash-alt" /></button>
                  {/* <button className="btn btn-danger btn-xs float-right">Delete</button> */}
                </div>
              </div>
            </div>
          </div>
        ))

      }

      return distinctDateTimeline.map(item => (
        <>
          <div class="time-label">
            <span class="bg-primary">{moment(item).format('DD MMM(MM) YYYY')}</span>
          </div>
          {renderTimeLineOnDate(item)}
        </>
      ))
    }
  }

  const renderPatientHistory = () => {
    return (
      <div className="card card-primary">
        <div className="card-body">
          <div className="timeline">
            {renderTimeLine()}
            <div>
              <i class="fas fa-clock bg-gray"></i>
              <button onClick={(e) => {
                e.preventDefault();
                renderAddDiagnoseData()
              }} className="btn btn-success float-right">เริ่มการวินิจฉัย</button>
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
  }
  const openModal = () => {
    setIsModalOpen(true)
  }
  const renderAddHistoricalData = () => {
    setMode('historical')
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
          <div className="form-check">
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
            <label className="form-check-label"><b>{item.promotion_name + ' ' + item.unit_quantity + ' ' + item.unit_suffix + ' '}</b>
              <CurrencyFormat value={item.promotion_price} displayType={'text'} thousandSeparator={true} suffix={'฿'} renderText={value => <label>{','}<b style={{ color: 'blue' }}>{' ' + value}</b></label>} />
              {' , ' + item.promotion_detail}</label>
          </div>
        ))
      }
      const renderCategories = () => {
        return listPromotion_category.map((item) => (
          <option value={item.promotion_category}>{item.promotion_category}</option>
        )
        )
      }
      return (
        <>
          <div className="form-group">
            <label>โปรโมชั่น</label>
            <div className="row">
              <div className="col-4">
                <select className="form-control"
                  value={selectedPromotion_category}
                  onChange={async (e) => {
                    await setSelectedPromotion_category(e.target.value)
                    doGetPromotions(mode == 'diagnose' ? 'true' : 'all', e.target.value)
                  }}>
                  <option value="all">ทั้งหมด</option>
                  {renderCategories()}
                </select>
              </div>
              <div className="col-8">
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
                  }
                  }
                  type="search"
                  className="form-control input-lg"
                  placeholder="ค้นหาโปรโมชั่น"
                  style={{ borderRadius: 10, marginRight: 10 }}
                />
              </div>
            </div>
          </div>
          <div className="form-group">
            {searchPromotions()}
          </div>
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
        <option value={item.username}>{item.username}</option>
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
            <tr role="row">
              <th className="sorting" rowSpan={2} colSpan={1}>
                ชื่อโปรโมชั่น
              </th>
              <th className="sorting" rowSpan={1} colSpan={1}>
                ราคาเริ่มต้น
              </th>
              <th className="sorting" rowSpan={1} colSpan={1}>
                ราคาลูกค้า
              </th>
              <th className="sorting" rowSpan={1} colSpan={1}>
                รายละเอียด
              </th>
              <th className="sorting" rowSpan={1} colSpan={1}>
                ผู้แนะนำ
              </th>
              <th className="sorting" rowSpan={1} colSpan={1}>
                เครื่องมือ
              </th>
            </tr>
          )
        }

        const renderTableRow = () => {
          return listSelectedPromotions.map((item, index) => (
            <tr>
              <td>
                {item.promotion_name}
              </td>
              <td>
                {item.promotion_startPrice}
              </td>
              <td>
                {item.promotion_price}
              </td>
              <td>
                {item.details}
              </td>
              <td>
                {item.agent}
              </td>
              <td className="text-center">
                <button class="btn btn-danger" onClick={(e) => {
                  e.preventDefault()
                  removeListSelectedPromotions(index)
                }}>
                  <i className="fas fa-trash-alt" color='danger' />
                </button>
              </td>
            </tr>
          ))
        }

        return (
          <div className="card-body table-responsive p-0">
            <table
              id="example2"
              className="table table-hover text-nowrap"
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
            if (mode === 'diagnose') {
              const response = await httpClient.post(server.PAYMENT_URL, { patient_id: patientData.patient_id, updater: localStorage.getItem(key.USER_NAME), })
              payment_id = response.data.result.payment_id
            }
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
                if (mode === 'diagnose') {
                  data.payment_id = payment_id
                }
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
                props.history.push('/patient/patient_status')
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
            overlfow: 'scroll' // <-- This tells the modal to scrol
          },
        }}
        className="content-wrapper"
      >
        <div style={{ margin: '5%', marginTop: '10%', padding: '0%', backgroundColor: 'rgba(0,0,0,0)', overflow: 'auto' }}>
          <div className={mode == 'diagnose' ? 'card card-success' : 'card card-primary'}>
            <div className="card-header">
              <h2 className="card-title">{mode == 'diagnose' ? 'เริ่มการวินิจฉัย' : 'เพิ่มข้อมูลประวัติคนไข้ย้อนหลัง'}</h2>
              <div class="card-tools">
                <button type="button" class="btn btn-tool" onClick={(e) => {
                  e.preventDefault()
                  closeModal();
                }}><i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <div className='card-body' style={{ textAlign: 'center' }}><img src="/img/ALA_logo.png" /></div>
            <div className='card-body'>
              <div className='row'>
                <div className='col-6'>
                  <div className="form-group">
                    <label>วันที่ทำหัตถการ</label>
                    <DatePicker disabled={mode == 'diagnose' ? true : false} className="form-control" selected={operate_date} onChange={(date) => setOperate_date(date)} />
                  </div>
                </div>
                <div className='col-6'>
                  <div className="form-group">
                    <label>ผู้แนะนำ</label>
                    <select className="form-control" onChange={(e) => {
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
                <div className='col-6'>
                  <div className="form-group">
                    <label>ราคาโปรโมชั่นเริ่มต้น</label>
                    <CurrencyFormat
                      className="form-control"
                      value={promotion_startPrice}
                      thousandSeparator={true} suffix={'฿'}
                      isNumericString={true}
                      disabled={true}
                    />
                  </div>
                </div>
                <div className='col-6'>
                  <div className="form-group">
                    <label>ราคาโปรโมชั่นของลูกค้า</label>
                    <CurrencyFormat
                      className="form-control"
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
                    <label>รายละเอียด</label>
                    <textarea className='form-control' value={details} onChange={(e) => {
                      setDetails(e.target.value)
                    }} />
                  </div>
                </div>
                <div className='col-12'>
                  <button type="submit" className='btn btn-success' onClick={(e) => {
                    e.preventDefault();
                    addListSelectedPromotions()
                  }} style={{ width: '100%' }}>เพิ่มโปรโมชั่น</button>
                </div>
              </div>
              <div className="card-body">
                <div className='row'>
                  <h2 className="card-title">รวมผล Promotion ของลูกค้าวันที่ {moment(operate_date).format('DD/MM/YYYY')}</h2>
                  <div className="col-12">
                    {renderListSelectedPromotions()}
                  </div>
                </div>
              </div>
            </div>

            <div className="card-footer">
              <div className="row">
                <div className="col-sm-4">
                  <b>รวมราคาทั้งหมด : {totalPromotionsPrice().totalPromotionsStartPrice}</b>
                </div>
                <div className="col-sm-4">
                  <b>รวมราคาของลูกค้า : <label style={{ color: 'blue' }}>{totalPromotionsPrice().totalPromotionsPrice}</label></b>
                </div>
                <div className="col-sm-4">
                  <b>ราคาที่ประหยัดไป : {totalPromotionsPrice().totalPromotionsDiscountPrice}</b>
                </div>
              </div>
              <br></br>
              <div>
                <button onClick={(e) => {
                  e.preventDefault()
                  submitPromotions()
                }} className="btn btn-primary">ตกลง</button>
                <button onClick={(e) => {
                  e.preventDefault();
                  closeModal();
                }} className="btn btn-default float-right">ยกเลิก</button>
              </div>
            </div>

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
              <h1 className="m-0">ประวัติคนไข้ / ลูกค้า</h1>
            </div>{/* /.col */}
            <div className="col-sm-6">

            </div>{/* /.col */}
          </div>{/* /.row */}
        </div>{/* /.container-fluid */}
      </div>
      <section className="content">
        <div className="container-fluid">
          <div className='row'>

            <div className='col-5'>
              {renderPatientData()}
            </div>
            <div className='col-7'>
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
