import moment from 'moment'
import React, { useEffect, useState, useRef, Component } from 'react'
import { key, OK, server, themeColor1, themeColor2 } from '../../../constants'
import { httpClient } from '../../../utils/HttpClient'
import { useReactToPrint } from 'react-to-print';
import './patient_payment.css';
import CurrencyFormat from 'react-currency-format';
import Swal from 'sweetalert2';
import Modal from 'react-modal';
import _ from "lodash";
import { Link } from 'react-router-dom';
import { useParams } from "react-router-dom";
import { useNavigate, } from "react-router-dom";

export default function Patient_payment(props) {
  const navigate = useNavigate();
  const params = useParams();

  const [patientData, setPatientData] = useState([])
  const [paymentHistory, setpaymentHistory] = useState([])
  const [listPantientHistory, setlistPantientHistory] = useState([])
  const [payment_id, setPayment_id] = useState(null)
  const [payment_type, setPayment_type] = useState(null)
  const [selected_payment_type, setSelected_payment_type] = useState(null)
  const [cash, setCash] = useState(0)
  const [credit_add_price, setCredit_add_price] = useState(0)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [mode, setMode] = useState('pay') //add , edit , pay
  const [resetRadio, setResetRadio] = useState(false)

  //list
  const [listAgent, setListAgent] = useState([])
  const [listPromotions, setListPromotions] = useState([])

  //promotions
  const [listPromotion_category, setListPromotion_category] = useState([])
  const [selectedPromotion_category, setSelectedPromotion_category] = useState('all')

  //state historical
  const [history_id, setHistory_id] = useState(null)
  const [promotion_id, setPromotion_id] = useState(null)
  const [promotion_name, setPromotion_name] = useState(null)
  const [promotion_startPrice, setPromotion_startPrice] = useState(0)
  const [promotion_price, setPromotion_price] = useState(0)
  const [agent, setAgent] = useState('')
  const [details, setDetails] = useState('')
  const [updater, setupdater] = useState(localStorage.getItem(key.USER_NAME))

  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

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
    doGetPatientData()
    doGetPaymentList()
    doGetAgent()
    doGetCategories()
  }, [])


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
        doGetPromotions('true', selectedPromotion_category)
      }
    } else {
      doGetPromotions('true', selectedPromotion_category)
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
  const doGetPatientData = async () => {
    const { patient_id } = params
    const response = await httpClient.get(server.PATIENT_DATA_URL + '/' + patient_id)
    // console.log(response);
    if (response.data.api_result === OK) {
      setPatientData(response.data.result)
    } else {
      setPatientData([])
    }
  }
  const doGetPaymentList = async () => {
    const { patient_id } = params
    const response = await httpClient.get(server.PAYMENT_LIST_URL + '/' + patient_id + '/')
    if (response.data.api_result === OK) {
      setpaymentHistory(response.data.result)
      return response.data.result
    } else {
      setpaymentHistory([])
      return []
    }
  }
  const doGetPaymentData = async (payment_id_t, listPantientHistory_t, reset_selected_payment_type) => {
    const response = await httpClient.get(server.PAYMENT_URL + '/' + payment_id_t)
    if (response.data.api_result === OK) {
      setlistPantientHistory(response.data.result)
      setPayment_type(listPantientHistory_t[document.getElementById("selectedPayment").selectedIndex].payment_type)
      setPayment_id(payment_id_t)
      if (reset_selected_payment_type) {
        setSelected_payment_type(null)
        setCash(0)
      } else {
        const getTotalPayment = () => {
          let totalPayment = 0
          let totalPromotion = 0
          let totalDiscount = 0
          for (let i = 0; i < response.data.result.length; i++) {
            const item = response.data.result[i];
            totalPromotion += item.promotionMaster.promotion_price
            totalPayment += item.promotion_price
            totalDiscount += item.discount
          }
          return { totalPromotion, totalPayment, totalDiscount }
        }
        switch (selected_payment_type) {
          case 'credit':
            setCredit_add_price((getTotalPayment().totalPayment * 0.03).toFixed(2))
            break;

          default:
            setCredit_add_price(0)
            break;
        }
      }
    } else {
      setlistPantientHistory([])
    }
  }
  const doSubmitPayment = async (price) => {
    if (payment_id == null) {
      return
    }
    Swal.fire({
      title: 'คุณลูกค้า ' + patientData.first_name + ' ' + patientData.last_name + ' จ่ายเงินเสร็จสิ้น?',
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
          patient_id: patientData.patient_id,
          status: 'payment',
          updater,
        }
        await httpClient.post(server.PROCESS_TRANSACTION_URL, transactionData)

        const paymentData = {
          payment_id,
          payment_type: selected_payment_type,
          credit_add_price,
          price,
        }
        let submitPaymentResponse = await httpClient.put(server.PAYMENT_URL, paymentData)

        if (submitPaymentResponse.data.api_result === OK) {
          transactionData.status = "open"
          await httpClient.post(server.PROCESS_TRANSACTION_URL, transactionData)
          await httpClient.put(server.PATIENT_DATA_URL, transactionData)

          Swal.fire({
            title: 'คุณลูกค้า ' + patientData.first_name + ' ' + patientData.last_name + ' ต้องการใบเสร็จ?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'ต้องการ',
            cancelButtonText: 'ไม่ต้องการ',
          }).then(async (result) => {
            if (result.isConfirmed) {
              doGetPaymentData(payment_id, await doGetPaymentList(), true)
            } else {
              navigate('/patient/patient_status')
            }

          })
        }
      }
    })
  }
  const doCancelPayment = async () => {
    if (payment_id == null) {
      return
    }
    try {
      Swal.fire({
        title: 'ลูกค้า ' + patientData.first_name + ' ' + patientData.last_name + ' ต้องการยกเลิกการจ่ายเงิน',
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
            patient_id: patientData.patient_id,
            status: 'open',
            updater,
          }
          const cancelPaymentData = {
            payment_id,
          }
          let transactionResponse = await httpClient.post(server.PROCESS_TRANSACTION_URL, transactionData)
          let response = await httpClient.put(server.PATIENT_DATA_URL, transactionData)
          let cancelPaymentResponse = await httpClient.delete(server.PAYMENT_URL, { data: cancelPaymentData })

          if (transactionResponse.data.api_result === OK && response.data.api_result === OK && cancelPaymentResponse.data.api_result === OK) {
            doGetPatientData()
            Swal.fire({
              icon: 'success',
              title: 'Yeah...',
              text: 'การยกเลิกการจ่ายเงินเสร็จสิ้น',
            }).then(() => {
              navigate('/patient/patient_status')
            })
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'การยกเลิกการจ่ายเงินล้มเหลว โปรดลองอีกครั้ง',
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

  //PantientHistory
  const prepareEditPantientHistory = (index) => {
    setHistory_id(listPantientHistory[index].history_id)
    setPromotion_id(listPantientHistory[index].promotion_id)
    setPromotion_name(listPantientHistory[index].promotionMaster.promotion_name + ' ' + listPantientHistory[index].promotionMaster.unit_quantity + ' ' + listPantientHistory[index].promotionMaster.unit_suffix)
    setPromotion_startPrice(listPantientHistory[index].promotionMaster.promotion_price)
    setPromotion_price(listPantientHistory[index].promotion_price)
    setAgent(listPantientHistory[index].agent)
    setDetails(listPantientHistory[index].details)
    openModal('edit')
  }
  const prepareAddPantientHistory = () => {
    openModal('add')
  }
  const doEditPantientHistory = async () => {
    Swal.fire({
      title: 'ต้องการแก้ไขรายการ ' + promotion_name,
      text: "กรุณาตรวจสอบให้แน่ใจก่อนกดตกลง",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const data = {
          history_id,
          promotion_price,
          details,
          discount: promotion_startPrice - promotion_price,
          commission: agent == '' ? 0 : promotion_price * 0.1,
          updater,
          agent,
        }
        const response = await httpClient.put(server.PANTIENT_HISTORY_URL, data)
        if (response.data.api_result === OK) {
          Swal.fire({
            icon: 'success',
            title: 'แก้ไขรายการสำเร็จ',
          })
          doGetPaymentData(payment_id, await doGetPaymentList(), false)
          closeModal()
        } else {
          Swal.fire({
            icon: 'error',
            title: 'แก้ไขรายการไม่สำเร็จ',
          })
        }
      }
    })
  }
  const doAddPantientHistory = async () => {
    if (promotion_id != null) {
      const checkDuplicatePromotion = () => {
        for (let i = 0; i < listPantientHistory.length; i++) {
          const promotion = listPantientHistory[i];
          if (promotion_id === promotion.promotion_id) {
            return true
          }
        }
        return false
      }
      if (checkDuplicatePromotion()) {
        Swal.fire({
          title: 'โปรโมชั่นซ้ำ!',

          icon: 'warning',
        })
        return
      }
      Swal.fire({
        title: 'ต้องการเพิ่มโปรโมชั่น ?',
        text: promotion_name + ' ' + promotion_price + ' บาท',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ตกลง',
        cancelButtonText: 'ยกเลิก',
      }).then(async (result) => {
        if (result.isConfirmed) {
          const data = {
            patient_id: patientData.patient_id,
            operate_date: moment(paymentHistory[document.getElementById("selectedPayment").selectedIndex].createdAt).toDate(),
            promotion_id,
            promotion_price: promotion_price,
            discount: promotion_startPrice - promotion_price,
            commission: agent == '' ? 0 : promotion_price * 0.1,
            agent,
            details,
            updater,
            payment_id: parseInt(payment_id),
          }
          const response = await httpClient.post(server.PANTIENT_HISTORY_URL, data)
          if (response.data.api_result === OK) {
            Swal.fire({
              icon: 'success',
              title: 'เพิ่มรายการสำเร็จ',
            })
            doGetPaymentData(payment_id, await doGetPaymentList(), false)
            closeModal()
          }
        }
      })

    } else {
      Swal.fire({
        icon: 'error',
        title: 'กรุณาเลือกโปรโมชั่น',
      })
    }
  }
  const doDeletePantientHistory = (index) => {
    Swal.fire({
      title: 'ต้องการลบรายการ ' + listPantientHistory[index].promotionMaster.promotion_name + ' ' + listPantientHistory[index].promotionMaster.unit_quantity + ' ' + listPantientHistory[index].promotionMaster.unit_suffix,
      text: "กรุณาตรวจสอบให้แน่ใจก่อนกดตกลง",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'โปรดยืนยันอีกครั้ง',
          text: "กรุณาตรวจสอบให้แน่ใจก่อนกดตกลง",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'ลบเลย',
          cancelButtonText: 'ยกเลิก',
        }).then(async (confirmResult) => {
          if (confirmResult.isConfirmed) {

            const data = { history_id: listPantientHistory[index].history_id }
            const response = await httpClient.delete(server.PANTIENT_HISTORY_URL, { data })
            if (response.data.api_result === OK) {
              doGetPaymentData(payment_id, await doGetPaymentList(), false)
              Swal.fire({
                icon: 'success',
                title: 'ลบข้อมูลสำเร็จ',
              }).then(() => {

              })
            } else {
              Swal.fire({
                icon: 'error',
                title: 'ลบข้อมูลไม่สำเร็จ',
                text: 'โปรดลองอีกครั้ง'
              })
            }
          }
        })
      }
    })
  }

  const renderPatientData = () => {
    return (
      <div className="card" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(233, 192, 112, 0.35)', boxShadow: '0 6px 20px rgba(30, 36, 48, 0.06)' }}>
        <div className="card-header d-flex align-items-center justify-content-between" style={{ background: 'linear-gradient(135deg, #1E2430 0%, #2A3242 100%)', color: '#E9C070', borderBottom: '2px solid #C5953A', padding: '0.9rem 1.25rem' }}>
          <h3 className="card-title mb-0 font-weight-bold" style={{ fontSize: '1.05rem' }}>
            <i className="fas fa-user-check mr-2" /> ข้อมูลลูกค้าและการชำระเงิน (Customer Billing Info)
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
                  <span><i className="fas fa-calendar-check mr-2 text-muted" /><b>นัดหมาย</b></span>
                  <Link to={"/appointment/" + patientData.patient_id} className="btn btn-sm px-3" style={{ background: 'linear-gradient(135deg, #E9C070 0%, #C5953A 100%)', color: '#1E2430', fontWeight: 600, borderRadius: '8px' }}>
                    <i className="fas fa-calendar-alt mr-1" /> นัดหมาย
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
  const renderPaymentHistory = () => {
    const renderOptionpaymentHistory = () => {
      return paymentHistory.map(item => (
        <option key={item.payment_id} value={item.payment_id} className="py-2 px-2">
          วันที่ออกบิล : {moment(item.createdAt).format('DD-MM-YYYY')} , เลขที่บิล : {item.payment_id} {item.payment_type ? `(ชำระแล้ว - ${item.payment_type})` : '(รอชำระเงิน)'}
        </option>
      ))
    }
    return (
      <div className="card" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(233, 192, 112, 0.35)', boxShadow: '0 4px 16px rgba(30, 36, 48, 0.05)' }}>
        <div className="card-header d-flex align-items-center" style={{ background: 'linear-gradient(135deg, #1E2430 0%, #2A3242 100%)', color: '#E9C070', borderBottom: '2px solid #C5953A', padding: '0.85rem 1.25rem' }}>
          <h3 className="card-title mb-0 font-weight-bold" style={{ fontSize: '1.05rem' }}>
            <i className="fas fa-receipt mr-2" /> เลือกบิลชำระเงิน (Select Invoice)
          </h3>
        </div>
        <div className="card-body">
          <div className="form-group mb-0">
            <select
              id='selectedPayment'
              onChange={(e) => {
                doGetPaymentData(e.target.value, paymentHistory, true)
              }}
              multiple
              className="form-control"
              style={{ borderRadius: '12px', borderColor: '#E9C070', minHeight: '120px', fontSize: '0.95rem' }}
            >
              {renderOptionpaymentHistory()}
            </select>
          </div>
        </div>
      </div>
    )
  }
  const renderlistPantientHistory = () => {
    if (listPantientHistory.length > 0) {

      const renderPrintPayment = () => {
        return (
          <div className="card" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(233, 192, 112, 0.35)', boxShadow: '0 6px 20px rgba(30, 36, 48, 0.06)' }}>
            <div className="card-header d-flex align-items-center justify-content-between" style={{ background: 'linear-gradient(135deg, #1E2430 0%, #2A3242 100%)', color: '#E9C070', borderBottom: '2px solid #C5953A', padding: '0.9rem 1.25rem' }}>
              <h3 className="card-title mb-0 font-weight-bold" style={{ fontSize: '1.1rem' }}>
                <i className="fas fa-file-invoice mr-2" /> ใบเสร็จรับเงิน (Official Receipt)
              </h3>
              <button
                className="btn btn-sm px-4 py-2 ml-auto"
                style={{ background: 'linear-gradient(135deg, #E9C070 0%, #C5953A 100%)', color: '#1E2430', fontWeight: 700, borderRadius: '10px', border: 'none' }}
                onClick={handlePrint}
              >
                <i className="fas fa-print mr-2" /> ปริ้นใบเสร็จ
              </button>
            </div>

            <div className='card-body bg-light overflow-auto'>
              <ComponentToPrint
                patientData={patientData}
                listPantientHistory={listPantientHistory}
                paymentData={paymentHistory[document.getElementById("selectedPayment").selectedIndex]}
                ref={componentRef} />
            </div>
          </div>
        )
      }

      if (payment_type == null) {
        const renderTableData = () => {
          return listPantientHistory.map((item, index) => (
            <tr key={item.history_id || index}>
              <td>{index + 1}</td>
              <td className="font-weight-bold text-dark">
                {item.promotionMaster.promotion_name + ' ' + item.promotionMaster.unit_quantity + ' ' + item.promotionMaster.unit_suffix}
              </td>
              <td>
                <CurrencyFormat value={item.promotionMaster.promotion_price} displayType={'text'} thousandSeparator={true} suffix={' บาท'} renderText={value => <>{value}</>} />
              </td>
              <td>
                <CurrencyFormat value={item.promotion_price} displayType={'text'} thousandSeparator={true} suffix={' บาท'} renderText={value => <b style={{ color: '#1b7f91' }}>{value}</b>} />
              </td>
              <td>
                <CurrencyFormat value={item.discount} displayType={'text'} thousandSeparator={true} suffix={' บาท'} renderText={value => <b className="text-success">{value}</b>} />
              </td>
              <td>{item.agent || '-'}</td>
              <td>
                <button className="btn btn-warning btn-xs px-2 py-1 mr-2" style={{ borderRadius: '6px', fontWeight: 600 }} onClick={(e) => {
                  e.preventDefault()
                  prepareEditPantientHistory(index)
                }}>
                  <i className="fas fa-edit mr-1" /> แก้ไข
                </button>
                <button className="btn btn-outline-danger btn-xs px-2 py-1" style={{ borderRadius: '6px', fontWeight: 600 }} onClick={(e) => {
                  e.preventDefault()
                  doDeletePantientHistory(index)
                }}>
                  <i className="fas fa-trash-alt mr-1" /> ลบ
                </button>
              </td>
            </tr>
          ))
        }
        const getTotalPayment = () => {
          let totalPayment = 0
          let totalPromotion = 0
          let totalDiscount = 0
          for (let i = 0; i < listPantientHistory.length; i++) {
            const item = listPantientHistory[i];
            totalPromotion += item.promotionMaster.promotion_price
            totalPayment += item.promotion_price
            totalDiscount += item.discount
          }
          return { totalPromotion, totalPayment, totalDiscount }
        }
        const totalPayment = getTotalPayment()

        const renderPaymentTypeSelector = () => {
          if (payment_id != null) {
            return (
              <div className="form-group mb-0">
                <label className="font-weight-bold text-dark mb-2">
                  <i className="fas fa-wallet mr-2" style={{ color: '#C5953A' }} /> เลือกช่องทางการชำระเงิน
                </label>
                <label className="ala-payment-method-card">
                  <input style={{ width: 20, height: 20 }} onChange={(e) => {
                    setSelected_payment_type('cash')
                    setCredit_add_price(0)
                  }} className="mr-3" type="radio" name="payment_type" required />
                  <span style={{ fontSize: '1.15rem', fontWeight: 600, color: '#1E2430' }}>
                    <i className="fas fa-money-bill-wave mr-2 text-success" /> เงินสด (Cash)
                  </span>
                </label>
                <label className="ala-payment-method-card">
                  <input style={{ width: 20, height: 20 }} onChange={(e) => {
                    setSelected_payment_type('transfer')
                    setCredit_add_price(0)
                  }} className="mr-3" type="radio" name="payment_type" required />
                  <span style={{ fontSize: '1.15rem', fontWeight: 600, color: '#1E2430' }}>
                    <i className="fas fa-mobile-alt mr-2" style={{ color: '#55C5D9' }} /> โอนเงิน (Bank Transfer / QR)
                  </span>
                </label>
                <label className="ala-payment-method-card mb-0">
                  <input style={{ width: 20, height: 20 }} onChange={(e) => {
                    setSelected_payment_type('credit')
                    setCredit_add_price((totalPayment.totalPayment * 0.03).toFixed(2))
                  }} className="mr-3" type="radio" name="payment_type" required />
                  <span style={{ fontSize: '1.15rem', fontWeight: 600, color: '#1E2430' }}>
                    <i className="far fa-credit-card mr-2" style={{ color: '#C5953A' }} /> บัตรเครดิต (Credit Card +3%)
                  </span>
                </label>
              </div>
            )
          }

        }
        const cashCalculator = () => {
          if (selected_payment_type === 'cash') {
            return (
              <div className="p-3" style={{ backgroundColor: '#FAF8F5', borderRadius: '12px', border: '1px solid rgba(233,192,112,0.4)' }}>
                <div className="form-group">
                  <label className="font-weight-bold text-dark">
                    <i className="fas fa-hand-holding-usd mr-1 text-success" /> รับเงินมา
                  </label>
                  <CurrencyFormat value={cash} onValueChange={(values) => {
                    setCash(values.value)
                  }}
                    className="form-control form-control-lg" style={{ borderRadius: '10px', fontWeight: 600 }} thousandSeparator={true} suffix={' บาท'} />
                </div>
                <div className="form-group mb-0">
                  <label className="font-weight-bold text-dark mr-2">เงินทอน (ต้องทอน)</label>
                  <CurrencyFormat value={cash - totalPayment.totalPayment}
                    className="form-control"
                    displayType={'text'}
                    thousandSeparator={true}
                    suffix={' บาท'}
                    renderText={value => <div className="p-2 bg-white text-center" style={{ borderRadius: '10px', border: '1px solid #55C5D9', fontSize: '1.25rem', color: '#1b7f91' }}><b className='doubleUnderline'>{value}</b></div>} />
                </div>
              </div>
            )
          }
        }
        const creditAddPrice = () => {
          if (selected_payment_type === 'credit') {
            return (
              <div className="p-3" style={{ backgroundColor: '#FAF8F5', borderRadius: '12px', border: '1px solid rgba(233,192,112,0.4)' }}>
                <div className="form-group">
                  <label className="font-weight-bold text-dark">ค่าธรรมเนียมบัตรเครดิต 3%</label>
                  <CurrencyFormat value={credit_add_price} onValueChange={(values) => {
                    setCredit_add_price(values.value)
                  }}
                    className="form-control" style={{ borderRadius: '10px' }} thousandSeparator={true} suffix={' บาท'} />
                </div>
                <div className="form-group mb-0">
                  <label className="font-weight-bold text-dark mr-2">ยอดชำระรวมทั้งสิ้น</label>
                  <CurrencyFormat value={parseFloat(credit_add_price) + totalPayment.totalPayment}
                    className="form-control"
                    displayType={'text'}
                    thousandSeparator={true}
                    suffix={' บาท'}
                    renderText={value => <h3 className="mb-0 mt-1" style={{ color: '#1b7f91' }}><b className='doubleUnderline'>{value}</b></h3>} />
                </div>
              </div>
            )
          }
        }
        return (
          <div className="card" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(233, 192, 112, 0.35)', boxShadow: '0 6px 20px rgba(30, 36, 48, 0.06)' }}>
            <div className="card-header d-flex align-items-center justify-content-between" style={{ background: 'linear-gradient(135deg, #E9C070 0%, #C5953A 100%)', color: '#1E2430', padding: '0.9rem 1.25rem' }}>
              <h3 className="card-title mb-0 font-weight-bold" style={{ fontSize: '1.1rem' }}>
                <i className="fas fa-file-invoice-dollar mr-2" /> รวมรายการใบเสร็จ (Invoice Summary)
              </h3>
              <div className="card-tools ml-auto">
                <button onClick={(e) => {
                  e.preventDefault()
                  prepareAddPantientHistory()
                }} className="btn btn-dark btn-sm px-3 py-1" style={{ borderRadius: '8px', fontWeight: 600, color: '#E9C070' }}>
                  <i className="fas fa-plus-circle mr-1" /> เพิ่มรายการ
                </button>
              </div>
            </div>
            {/* /.card-header */}
            <div className="card-body table-responsive p-0">
              <table className="table table-hover text-nowrap mb-0">
                <thead style={{ backgroundColor: '#1E2430', color: '#E9C070' }}>
                  <tr>
                    <th>ลำดับที่</th>
                    <th>รายการ</th>
                    <th>ราคาโปรโมชั่น</th>
                    <th>ราคาลูกค้า</th>
                    <th>ส่วนลด</th>
                    <th>ผู้แนะนำ</th>
                    <th>แก้ไขรายการ</th>
                  </tr>
                </thead>
                <tbody>
                  {renderTableData()}
                  <tr style={{ backgroundColor: 'rgba(85, 197, 217, 0.18)', borderTop: '2px solid #55C5D9' }}>
                    <th></th>
                    <th style={{ color: '#1E2430', fontSize: '1.05rem' }}>รวมจำนวนเงิน</th>
                    <th>
                      <CurrencyFormat value={totalPayment.totalPromotion} displayType={'text'} thousandSeparator={true} suffix={' บาท'} renderText={value => <b className='doubleUnderline'>{value}</b>} />
                    </th>
                    <th>
                      <CurrencyFormat value={totalPayment.totalPayment} displayType={'text'} thousandSeparator={true} suffix={' บาท'} renderText={value => <b style={{ color: '#1b7f91', fontSize: '1.1rem' }} className='doubleUnderline'>{value}</b>} />
                    </th>
                    <th>
                      <CurrencyFormat value={totalPayment.totalDiscount} displayType={'text'} thousandSeparator={true} suffix={' บาท'} renderText={value => <b className="text-success doubleUnderline">{value}</b>} />
                    </th>
                    <th></th>
                    <th></th>
                  </tr>
                </tbody>
              </table>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault()
              doSubmitPayment(totalPayment.totalPayment)
            }}>
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-sm-6">
                    {renderPaymentTypeSelector()}
                  </div>
                  <div className="col-sm-6 mt-3 mt-sm-0">
                    {cashCalculator()}
                    {creditAddPrice()}
                  </div>
                </div>
              </div>
              <div className='card-footer bg-light px-4 py-3 d-flex justify-content-between align-items-center'>
                <button className="btn px-4 py-2" style={{ background: 'linear-gradient(135deg, #E9C070 0%, #C5953A 100%)', color: '#1E2430', fontWeight: 700, borderRadius: '10px', border: 'none' }} type="submit">
                  <i className="fas fa-check-circle mr-2" /> ยืนยันการชำระเงิน (ตกลง)
                </button>
                <button className="btn btn-outline-danger px-4 py-2 ml-auto" style={{ borderRadius: '10px', fontWeight: 600 }} type="reset" onClick={(e) => {
                  e.preventDefault()
                  doCancelPayment()
                }}>
                  <i className="fas fa-times-circle mr-1" /> ยกเลิกบิล
                </button>
              </div>
            </form>
          </div>
        )
      } else {
        return renderPrintPayment()
      }

    } else {
      if (payment_id) {
        return (
          <div className="card" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(233, 192, 112, 0.35)' }}>
            <div className="card-header d-flex align-items-center justify-content-between" style={{ background: 'linear-gradient(135deg, #E9C070 0%, #C5953A 100%)', color: '#1E2430' }}>
              <h3 className="card-title mb-0 font-weight-bold">รวมรายการใบเสร็จ</h3>
              <div className="card-tools ml-auto">
                <button onClick={(e) => {
                  e.preventDefault()
                  prepareAddPantientHistory()
                }} className="btn btn-dark btn-sm px-3" style={{ color: '#E9C070', borderRadius: '8px' }}>
                  <i className="fas fa-plus-square mr-1" /> เพิ่มรายการ
                </button>
              </div>
            </div>
            <div className='card-footer bg-light'>
              <button className="btn btn-outline-danger float-right" style={{ borderRadius: '10px' }} type="reset" onClick={(e) => {
                e.preventDefault()
                doCancelPayment()
              }}>
                ยกเลิก
              </button>
            </div>
          </div>
        )
      }

    }
  }
  const renderEditPayment = () => {
    const renderAgentList = () => {
      return listAgent.map((item) => (
        <option key={item.username} value={item.username}>{item.username}</option>
      ))
    }
    const renderPromotions = () => {
      const searchPromotions = () => {
        return listPromotions.map((item) => (
          <div className="form-check py-1" key={item.promotion_id}>
            <input className="form-check-input"
              type="radio"
              checked={resetRadio ? false : null}
              value={item.promotion_id}
              name="promotions"
              onChange={() => {
                // console.log(resetRadio);
                // setResetRadio(false)
                setPromotion_id(item.promotion_id)
                setPromotion_name(item.promotion_name + ' ' + item.unit_quantity + ' ' + item.unit_suffix)
                findPromotionPrice(item.promotion_id)
              }} />
            <label className="form-check-label"><b>{item.promotion_name + ' ' + item.unit_quantity + ' ' + item.unit_suffix + ' '}</b>
              <CurrencyFormat value={item.promotion_price} displayType={'text'} thousandSeparator={true} suffix={'฿'} renderText={value => <label>{','}<b style={{ color: '#1b7f91' }}>{' ' + value}</b></label>} />
              {' , ' + item.promotion_detail}</label>
          </div>
        ))
      }
      const renderCategories = () => {
        return listPromotion_category.map((item) => (
          <option key={item.promotion_category} value={item.promotion_category}>{item.promotion_category}</option>
        )
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
      return (
        <>
          <div className="form-group">
            <label className="font-weight-bold text-dark">โปรโมชั่น</label>
            <div className="row">
              <div className="col-sm-4 mb-2 mb-sm-0">
                <select className="form-control"
                  style={{ borderRadius: '10px', borderColor: '#E9C070' }}
                  value={selectedPromotion_category}
                  onChange={async (e) => {
                    await setSelectedPromotion_category(e.target.value)
                    setResetRadio(true)
                    doGetPromotions('true', e.target.value)
                  }}>
                  <option value="all">ทั้งหมด</option>
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
                  placeholder="ค้นหาโปรโมชั่น..."
                  style={{ borderRadius: '10px', borderColor: '#E9C070' }}
                />
              </div>
            </div>
          </div>
          {listPromotions.length > 0 && (
            <div className="form-group p-3" style={{ maxHeight: '200px', overflowY: 'auto', backgroundColor: '#fafbfc', borderRadius: '12px', border: '1px solid rgba(233,192,112,0.35)' }}>
              {searchPromotions()}
            </div>
          )}
        </>
      )
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
              <h3 className="card-title mb-0 font-weight-bold" style={{ fontSize: '1.15rem' }}>
                <i className={mode === 'add' ? 'fas fa-plus-circle mr-2' : 'fas fa-edit mr-2'} />
                {mode === 'add' ? 'เพิ่มรายการโปรโมชั่น' : 'แก้ไขราคาโปรโมชั่นของลูกค้า'}
              </h3>
              <div className="card-tools ml-auto">
                <button type="button" className="btn btn-tool text-white" onClick={(e) => {
                  e.preventDefault()
                  closeModal();
                }}><i className="fas fa-times"></i>
                </button>
              </div>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault()
              if (mode === 'add') {
                doAddPantientHistory()
              } else {
                doEditPantientHistory()
              }
            }}>
              <div className='card-body'>
                <div className='row'>
                  <div className='col-12'>
                    {mode === 'add' ? renderPromotions() :
                      <div className="form-group">
                        <label className="font-weight-bold text-dark">
                          ถ้าจะเปลี่ยนโปรโมชั่นให้ลบออกแล้วเพิ่มใหม่
                        </label>
                        <input value={promotion_name} disabled className="form-control" style={{ borderRadius: '10px' }} />
                      </div>
                    }
                  </div>
                  <div className='col-12'>
                    <div className="form-group">
                      <label className="font-weight-bold text-dark">ผู้แนะนำ</label>
                      <select className="form-control" style={{ borderRadius: '10px' }} value={agent} onChange={(e) => {
                        setAgent(e.target.value)
                      }}>
                        <option value=''>ไม่มี</option>
                        {renderAgentList()}
                      </select>
                    </div>
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
                    <div className="form-group mb-0">
                      <label className="font-weight-bold text-dark">รายละเอียด</label>
                      <textarea className='form-control' rows="2" style={{ borderRadius: '10px' }} value={details} onChange={(e) => {
                        setDetails(e.target.value)
                      }} />
                    </div>
                  </div>
                </div>
              </div>
              <div className='card-footer bg-light px-4 py-3 d-flex justify-content-between align-items-center'>
                <button className='btn px-4' style={{ background: 'linear-gradient(135deg, #E9C070 0%, #C5953A 100%)', color: '#1E2430', fontWeight: 700, borderRadius: '10px', border: 'none' }} type='submit'>
                  <i className="fas fa-check-circle mr-1" /> ตกลง
                </button>
                <button className='btn btn-secondary px-4 ml-auto' style={{ borderRadius: '10px' }} onClick={(e) => {
                  e.preventDefault()
                  closeModal();
                }}>ยกเลิก</button>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    )

  }

  const closeModal = () => {
    setHistory_id(null)
    setPromotion_id(null)
    setPromotion_name(null)
    setPromotion_startPrice(0)
    setPromotion_price(0)
    setAgent('')
    setDetails('')
    setListPromotions([])
    setSelectedPromotion_category('all')
    setIsModalOpen(false)
    setMode('pay')
  }
  const openModal = (mode) => {
    setIsModalOpen(true)
    setMode(mode)
  }
  return (
    <div className="content-wrapper">
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2 align-items-center">
            <div className="col-sm-6">
              <h1 className="m-0 font-weight-bold" style={{ color: '#1E2430', fontSize: '1.6rem' }}>
                <i className="fas fa-file-invoice-dollar mr-2" style={{ color: '#C5953A' }} />
                ขั้นตอนการจ่ายเงิน
              </h1>
              <p className="text-muted mb-0 mt-1" style={{ fontSize: '0.9rem' }}>
                ตรวจสอบรายการหัตถการ คำนวณยอดชำระ และพิมพ์ใบเสร็จรับเงิน
              </p>
            </div>
            <div className="col-sm-6">
            </div>
          </div>
        </div>
      </div>
      <section className='content'>
        <div className='container-fluid'>
          <div className='row'>
            <div className='col-12'>
              {renderPatientData()}
            </div>
            <div className='col-12'>
              {renderPaymentHistory()}
            </div>
            <div className='col-12'>
              {renderlistPantientHistory()}
              {renderEditPayment()}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}


class ComponentToPrint extends Component {
  renderPaymentList = () => {
    return this.props.listPantientHistory.map((item, index) => (
      <tr key={index}>
        <td>{index + 1}</td>
        <td>{item.promotionMaster.promotion_name + ' ' + item.promotionMaster.unit_quantity + ' ' + item.promotionMaster.unit_suffix}</td>
        <td><CurrencyFormat value={item.promotion_price} displayType={'text'} thousandSeparator={true} suffix={' บาท'} renderText={value => <b>{value}</b>} /></td>
      </tr>
    ))
  }
  getTotalPayment = () => {
    let totalPayment = 0
    for (let i = 0; i < this.props.listPantientHistory.length; i++) {
      const item = this.props.listPantientHistory[i];
      totalPayment += item.promotion_price
    }
    return (totalPayment + this.props.paymentData.credit_add_price).toFixed(2)
  }
  renderCreditAddPrice = () => {
    if (this.props.paymentData.payment_type === 'credit') {
      return (
        <tr>
          <td >
            {this.props.listPantientHistory.length + 1}
          </td>
          <td >
            ค่าบริการบัตรเครดิต (3%)
          </td>
          <td >
            <CurrencyFormat value={this.props.paymentData.credit_add_price} displayType={'text'} thousandSeparator={true} suffix={' บาท'} renderText={value => <b>{value}</b>} />
          </td>
        </tr>
      )
    } else {
    }
  }
  render() {
    return (
      <div className="page">
        <div className="subpage">
          <div style={{ float: 'left', width: '5.5cm', height: '6cm', marginTop: '1cm', marginLeft: '0.5cm' }}>
            <img style={{ height: '5cm' }} src='/img/ALA_logo.png' alt="ALA Logo" />
          </div>
          <div style={{ float: 'left', width: '14.5cm', height: '6cm', marginTop: '1cm', marginLeft: '0.5cm' }}>
            <h3 style={{ fontSize: '1cm' }}><b>อัลลาคลินิคเวชกรรม</b></h3>
            <p style={{ fontSize: '6mm' }}>184/3 หมู่ที่ 2 ต.สุรศักด์ อ.ศรีราชา จ.ชลบุรี 20110</p>
            <p style={{ fontSize: '6mm' }}>โทรศัพท์ 096-4595396</p>
          </div>
          <div style={{ float: 'left', width: '21cm', fontSize: '1cm', textAlign: 'center' }}>
            <h2 >ใบเสร็จรับเงิน</h2>
          </div>
          <div style={{ float: 'left', width: '20.5cm', fontSize: '0.5cm', textAlign: 'right' }}>
            <p><b>เลขที่ใบเสร็จ</b> : {this.props.listPantientHistory[0].payment_id}</p>
          </div>
          <div style={{ float: 'left', width: '20.5cm', fontSize: '0.5cm', textAlign: 'right' }}>
            <p><b>วันที่</b> : {moment(this.props.listPantientHistory[0].operate_date).format('DD-MM-YYYY')}</p>
          </div>
          <div style={{ float: 'left', width: '20cm', fontSize: '0.5cm', textAlign: 'left', marginLeft: '0.5cm' }}>
            <p><b>ชื่อ - นามสกุล</b> : {this.props.patientData.first_name + ' ' + this.props.patientData.last_name}</p>
          </div>
          <table className="table table-bordered" style={{ float: 'left', width: '20cm', fontSize: '0.5cm', textAlign: 'left', marginLeft: '0.5cm' }}>
            <thead>
              <tr>
                <th style={{ width: '2.5cm' }}>ลำดับที่</th>
                <th style={{ width: '13.0cm' }}>รายการ</th>
                <th>จำนวนเงิน</th>
              </tr>
            </thead>
            <tbody>
              {this.renderPaymentList()}
              {this.renderCreditAddPrice()}
              <tr>
                <th >

                </th>
                <th >
                  จำนวนเงินรวม
                </th>
                <th >
                  <CurrencyFormat value={this.getTotalPayment()} displayType={'text'} thousandSeparator={true} suffix={' บาท'} renderText={value => <b className='doubleUnderline'>{value}</b>} />
                </th>
              </tr>
            </tbody>
          </table>
          <div style={{ float: 'left', width: '20cm', fontSize: '0.6cm', textAlign: 'left', marginLeft: '0.5cm' }}>
            <input style={{ width: '0.6cm', height: '0.6cm' }} checked={this.props.paymentData.payment_type === 'cash' ? true : false} readOnly type="checkbox" />
            <label style={{ marginLeft: '0.5cm' }}>{"เงินสด"}</label>
          </div>
          <div style={{ float: 'left', width: '20cm', fontSize: '0.6cm', textAlign: 'left', marginLeft: '0.5cm' }}>
            <input style={{ width: '0.6cm', height: '0.6cm' }} checked={this.props.paymentData.payment_type === 'transfer' ? true : false} readOnly type="checkbox" />
            <label style={{ marginLeft: '0.5cm' }}>{"โอน"}</label>
          </div>
          <div style={{ float: 'left', width: '20cm', fontSize: '0.6cm', textAlign: 'left', marginLeft: '0.5cm' }}>
            <input style={{ width: '0.6cm', height: '0.6cm' }} checked={this.props.paymentData.payment_type === 'credit' ? true : false} readOnly type="checkbox" />
            <label style={{ marginLeft: '0.5cm' }}>{"บัตรเครดิต"}</label>
          </div>
          <div style={{ float: 'left', width: '20cm', fontSize: '0.5cm', textAlign: 'right', marginLeft: '0.5cm' }}>
            <p>ขอบคุณที่มาอุดหนุนค่ะ</p>
          </div>
        </div>
      </div>
    );
  }
}
