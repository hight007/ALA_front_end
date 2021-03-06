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

export default function Patient_payment(props) {
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
    const { patient_id } = props.match.params
    const response = await httpClient.get(server.PATIENT_DATA_URL + '/' + patient_id)
    // console.log(response);
    if (response.data.api_result === OK) {
      setPatientData(response.data.result)
    } else {
      setPatientData([])
    }
  }
  const doGetPaymentList = async () => {
    const { patient_id } = props.match.params
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
      title: '??????????????????????????? ' + patientData.first_name + ' ' + patientData.last_name + ' ????????????????????????????????????????????????????',
      text: "??????????????????????????????????????????????????????????????????????????????????????????",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '????????????',
      cancelButtonText: '??????????????????',
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
            title: '??????????????????????????? ' + patientData.first_name + ' ' + patientData.last_name + ' ???????????????????????????????????????????',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: '?????????????????????',
            cancelButtonText: '??????????????????????????????',
          }).then(async (result) => {
            if (result.isConfirmed) {
              doGetPaymentData(payment_id, await doGetPaymentList(), true)
            } else {
              props.history.push('/patient/patient_status')
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
        title: '?????????????????? ' + patientData.first_name + ' ' + patientData.last_name + ' ????????????????????????????????????????????????????????????????????????',
        text: "??????????????????????????????????????????????????????????????????????????????????????????",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '????????????',
        cancelButtonText: '??????????????????',
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
              text: '???????????????????????????????????????????????????????????????????????????????????????',
            }).then(() => {
              props.history.push('/patient/patient_status')
            })
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: '????????????????????????????????????????????????????????????????????????????????? ?????????????????????????????????????????????',
            })
          }
        }
      })
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: '???????????????????????????????????????????????????????????? ?????????????????????????????????????????????',
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
      title: '?????????????????????????????????????????????????????? ' + promotion_name,
      text: "??????????????????????????????????????????????????????????????????????????????????????????",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '??????????????????',
      cancelButtonText: '??????????????????',
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
            title: '???????????????????????????????????????????????????',
          })
          doGetPaymentData(payment_id, await doGetPaymentList(), false)
          closeModal()
        } else {
          Swal.fire({
            icon: 'error',
            title: '????????????????????????????????????????????????????????????',
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
          title: '????????????????????????????????????!',

          icon: 'warning',
        })
        return
      }
      Swal.fire({
        title: '??????????????????????????????????????????????????????????????? ?',
        text: promotion_name + ' ' + promotion_price + ' ?????????',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '????????????',
        cancelButtonText: '??????????????????',
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
              title: '???????????????????????????????????????????????????',
            })
            doGetPaymentData(payment_id, await doGetPaymentList(), false)
            closeModal()
          }
        }
      })

    } else {
      Swal.fire({
        icon: 'error',
        title: '?????????????????????????????????????????????????????????',
      })
    }
  }
  const doDeletePantientHistory = (index) => {
    Swal.fire({
      title: '????????????????????????????????????????????? ' + listPantientHistory[index].promotionMaster.promotion_name + ' ' + listPantientHistory[index].promotionMaster.unit_quantity + ' ' + listPantientHistory[index].promotionMaster.unit_suffix,
      text: "??????????????????????????????????????????????????????????????????????????????????????????",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '??????????????????',
      cancelButtonText: '??????????????????',
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: '??????????????????????????????????????????????????????',
          text: "??????????????????????????????????????????????????????????????????????????????????????????",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: '???????????????',
          cancelButtonText: '??????????????????',
        }).then(async (confirmResult) => {
          if (confirmResult.isConfirmed) {

            const data = { history_id: listPantientHistory[index].history_id }
            const response = await httpClient.delete(server.PANTIENT_HISTORY_URL, { data })
            if (response.data.api_result === OK) {
              doGetPaymentData(payment_id, await doGetPaymentList(), false)
              Swal.fire({
                icon: 'success',
                title: '??????????????????????????????????????????',
              }).then(() => {

              })
            } else {
              Swal.fire({
                icon: 'error',
                title: '???????????????????????????????????????????????????',
                text: '?????????????????????????????????????????????'
              })
            }
          }
        })
      }
    })
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
                  <b>???????????? - ????????????????????? </b> <label className="float-right text-muted text-center">{patientData.first_name + ' ' + patientData.last_name}</label>
                </li>
                <li class="list-group-item">
                  <b>????????? </b> <label className="float-right text-muted text-center">{patientData.sex}</label>
                </li>
                <li class="list-group-item">
                  <b>???????????????????????? </b> <label className="float-right text-muted text-center">{patientData.telephone_number}</label>
                </li>
                <li class="list-group-item">
                  <b>???????????? </b> <label className="float-right text-muted text-center">{moment().format('yyyy') - patientData.year_of_birth}</label>
                </li>
                <li class="list-group-item">
                  <b>??????????????? </b> <label style={{ color: 'red' }} className={patientData.status != 'operate' ? 'float-right text-center' : 'float-right text-center text-muted'}>{patientData.status}</label>
                </li>
                <li class="list-group-item">
                  <b>????????????????????? </b> <label className={'float-right text-center text-muted'}><Link to={"/appointment/" + patientData.patient_id} className="btn btn-primary btn-xs">?????????????????????</Link></label>
                </li>

              </div>
              <div className="col-sm-6">
                <div className="card card-default">
                  {/* /.card-header */}
                  <div className="card-body">
                    <strong><i className="fas fa-skull-crossbones" /> ???????????????????????????????????????????????????</strong>
                    <p className="text-muted">
                      {patientData.drug_allergy == '' ? '???????????????' : patientData.drug_allergy}
                    </p>
                    <hr />
                    <strong><i className="fas fa-pills" /> ???????????????????????????????????????</strong>
                    <p className="text-muted">
                      {patientData.drug_allergy == '' ? '???????????????' : patientData.regular_medication}
                    </p>
                    <hr />
                    <strong><i className="fas fa-disease" /> ?????????????????????????????????</strong>
                    <p className="text-muted">
                      {patientData.drug_allergy == '' ? '???????????????' : patientData.chronic_disease}
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
  const renderPaymentHistory = () => {
    const renderOptionpaymentHistory = () => {
      return paymentHistory.map(item => (
        <option value={item.payment_id}>???????????????????????????????????? : {moment(item.createdAt).format('DD-MM-YYYY')} , ??????????????????????????? : {item.payment_id}</option>
      ))
    }
    return (
      <div className="form-group">
        <label>????????????????????????</label>
        <select id='selectedPayment' onChange={(e) => {
          doGetPaymentData(e.target.value, paymentHistory, true)
        }} multiple className="form-control">
          {renderOptionpaymentHistory()}
        </select>
      </div>
    )
  }
  const renderlistPantientHistory = () => {
    if (listPantientHistory.length > 0) {

      const renderPrintPayment = () => {
        return (
          <div className="card card-dark">
            <div className="card-header">
              <h1 className="card-title">??????????????????????????????????????????</h1>
              <button className="btn btn-default float-right" onClick={handlePrint}>????????????????????????????????????</button>
            </div>

            <div className='card-body'>
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
            <tr>
              <td>
                {index + 1}
              </td>
              <td>
                {item.promotionMaster.promotion_name + ' ' + item.promotionMaster.unit_quantity + ' ' + item.promotionMaster.unit_suffix}
              </td>
              <td>
                <CurrencyFormat value={item.promotionMaster.promotion_price} displayType={'text'} thousandSeparator={true} suffix={' ?????????'} renderText={value => <>{value}</>} />
              </td>
              <td>
                <CurrencyFormat value={item.promotion_price} displayType={'text'} thousandSeparator={true} suffix={' ?????????'} renderText={value => <b style={{ color: 'blue' }}>{value}</b>} />
              </td>
              <td>
                <CurrencyFormat value={item.discount} displayType={'text'} thousandSeparator={true} suffix={' ?????????'} renderText={value => <b style={{ color: 'green' }}>{value}</b>} />
              </td>
              <td>
                {item.agent}
              </td>
              <td>
                <button className="btn btn-warning btn-xs" onClick={(e) => {
                  e.preventDefault()
                  prepareEditPantientHistory(index)
                }}><i className="fas fa-edit" /> ???????????????
                </button>
                <button className="btn btn-danger btn-xs float-right" onClick={(e) => {
                  e.preventDefault()
                  doDeletePantientHistory(index)
                }}><i className="fas fa-trash-alt" /> ??????
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
              <div className="form-group">
                <div className="form-check">
                  <input style={{ width: 20, height: 20, }} onChange={(e) => {
                    setSelected_payment_type('cash')
                    setCredit_add_price(0)
                  }} className="form-check-input" type="radio" name="payment_type" required />
                  <label style={{ marginLeft: 5, fontSize: 25 }} className="form-check-label">??????????????????</label>
                </div>
                <div className="form-check">
                  <input style={{ width: 20, height: 20, }} onChange={(e) => {
                    setSelected_payment_type('transfer')
                    setCredit_add_price(0)
                  }} className="form-check-input" type="radio" name="payment_type" required />
                  <label style={{ marginLeft: 5, fontSize: 25 }} className="form-check-label">?????????</label>
                </div>
                <div className="form-check">
                  <input style={{ width: 20, height: 20, }} onChange={(e) => {
                    setSelected_payment_type('credit')
                    setCredit_add_price((totalPayment.totalPayment * 0.03).toFixed(2))
                  }} className="form-check-input" type="radio" name="payment_type" required />
                  <label style={{ marginLeft: 5, fontSize: 25 }} className="form-check-label">??????????????????????????????</label>
                </div>
              </div>
            )
          }

        }
        const cashCalculator = () => {
          if (selected_payment_type === 'cash') {
            return (
              <>
                <div className="form-group">
                  <label for="exampleInputEmail1">???????????????????????????</label>
                  <CurrencyFormat value={cash} onValueChange={(values) => {
                    setCash(values.value)
                  }}
                    className="form-control" thousandSeparator={true} suffix={' ?????????'} />
                </div>
                <div className="form-group">
                  <label style={{ marginRight: 5 }}>?????????????????????</label>
                  <CurrencyFormat value={cash - totalPayment.totalPayment}
                    className="form-control"
                    displayType={'text'}
                    thousandSeparator={true}
                    suffix={' ?????????'}
                    renderText={value => <b className='doubleUnderline'>{value}</b>} />

                </div>
              </>
            )
          }
        }
        const creditAddPrice = () => {
          if (selected_payment_type === 'credit') {
            return (
              <>
                <div className="form-group">
                  <label for="exampleInputEmail1">??????????????????????????????????????? 3%</label>
                  <CurrencyFormat value={credit_add_price} onValueChange={(values) => {
                    setCredit_add_price(values.value)
                  }}
                    className="form-control" thousandSeparator={true} suffix={' ?????????'} />
                </div>
                <div className="form-group">
                  <label style={{ marginRight: 5 }}>?????????????????????????????????</label>
                  <CurrencyFormat value={parseFloat(credit_add_price) + totalPayment.totalPayment}
                    className="form-control"
                    displayType={'text'}
                    thousandSeparator={true}
                    suffix={' ?????????'}
                    renderText={value => <h3 style={{ color: 'blue' }}><b className='doubleUnderline'>{value}</b></h3>} />

                </div>
              </>
            )
          }
        }
        return (
          <div className="card card-default">
            <div className="card-header" style={{ backgroundColor: '#E9C070' }}>
              <h3 className="card-title">????????????????????????????????????????????????</h3>
              <div className="card-tools">
                <button onClick={(e) => {
                  e.preventDefault()
                  prepareAddPantientHistory()
                }} className="btn btn-success btn-xs"><i className="fas fa-plus-square" style={{ marginRight: 5 }} />?????????????????????????????????</button>
              </div>
            </div>
            {/* /.card-header */}
            <div className="card-body table-responsive p-0">
              <table className="table table-head-fixed text-nowrap" >
                <thead >
                  <tr >
                    <th>????????????????????????</th>
                    <th>??????????????????</th>
                    <th>???????????????????????????????????????</th>
                    <th>??????????????????????????????</th>
                    <th>??????????????????</th>
                    <th>????????????????????????</th>
                    <th>?????????????????????????????????</th>
                  </tr>
                </thead>
                <tbody>
                  {renderTableData()}
                  <tr style={{ backgroundColor: '#55C5D9' }}>
                    <th >

                    </th>
                    <th >
                      ????????????????????????????????????
                    </th>
                    <th >
                      <CurrencyFormat value={totalPayment.totalPromotion} displayType={'text'} thousandSeparator={true} suffix={' ?????????'} renderText={value => <b className='doubleUnderline'>{value}</b>} />
                    </th>
                    <th >
                      <CurrencyFormat value={totalPayment.totalPayment} displayType={'text'} thousandSeparator={true} suffix={' ?????????'} renderText={value => <b style={{ color: 'blue' }} className='doubleUnderline'>{value}</b>} />
                    </th>
                    <th >
                      <CurrencyFormat value={totalPayment.totalDiscount} displayType={'text'} thousandSeparator={true} suffix={' ?????????'} renderText={value => <b style={{ color: 'green' }} className='doubleUnderline'>{value}</b>} />
                    </th>
                    <th >

                    </th>
                    <th >

                    </th>
                  </tr>
                </tbody>
              </table>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault()
              doSubmitPayment(totalPayment.totalPayment)
            }}>
              <div className="card-body">
                <div className="row">
                  <div className="col-sm-6">
                    {renderPaymentTypeSelector()}
                  </div>
                  <div className="col-sm-6">
                    {cashCalculator()}
                    {creditAddPrice()}
                  </div>
                </div>
              </div>
              <div className='card-footer'>
                <button className="btn btn-success" type="submit">
                  ????????????
                </button>
                <button className="btn btn-danger float-right" type="reset" onClick={(e) => {
                  e.preventDefault()
                  doCancelPayment()
                }}>
                  ??????????????????
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
          <div className="card card-default">
            <div className="card-header" style={{ backgroundColor: '#E9C070' }}>
              <h3 className="card-title">????????????????????????????????????????????????</h3>
              <div className="card-tools">
                <button onClick={(e) => {
                  e.preventDefault()
                  prepareAddPantientHistory()
                }} className="btn btn-success btn-xs"><i className="fas fa-plus-square" style={{ marginRight: 5 }} />?????????????????????????????????</button>
              </div>
            </div>
            <div className='card-footer'>
              
              <button className="btn btn-danger float-right" type="reset" onClick={(e) => {
                e.preventDefault()
                doCancelPayment()
              }}>
                ??????????????????
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
        <option value={item.username}>{item.username}</option>
      ))
    }
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
                setPromotion_name(item.promotion_name + ' ' + item.unit_quantity + ' ' + item.unit_suffix)
                findPromotionPrice(item.promotion_id)
              }} />
            <label className="form-check-label"><b>{item.promotion_name + ' ' + item.unit_quantity + ' ' + item.unit_suffix + ' '}</b>
              <CurrencyFormat value={item.promotion_price} displayType={'text'} thousandSeparator={true} suffix={'???'} renderText={value => <label>{','}<b style={{ color: 'blue' }}>{' ' + value}</b></label>} />
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
            <label>???????????????????????????</label>
            <div className="row">
              <div className="col-4">
                <select className="form-control"
                  value={selectedPromotion_category}
                  onChange={async (e) => {
                    await setSelectedPromotion_category(e.target.value)
                    setResetRadio(true)
                    doGetPromotions('true', e.target.value)
                  }}>
                  <option value="all">?????????????????????</option>
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
                  placeholder="??????????????????????????????????????????"
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
          <div className={'card'}>
            <div className="card-header" style={{ backgroundColor: mode === 'add' ? themeColor2 : themeColor1 }}>
              <h2 className="card-title">{mode === 'add' ? '????????????????????????????????????????????????????????????' : '?????????????????????????????????????????????????????????????????????????????????'}</h2>
              <div class="card-tools">
                <button type="button" class="btn btn-tool" onClick={(e) => {
                  e.preventDefault()
                  closeModal();
                }}><i class="fas fa-times"></i>
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
                        <label>
                          ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
                        </label>
                        <input value={promotion_name} disabled class="form-control" />
                      </div>
                    }
                  </div>
                  <div className='col-12'>
                    <div className="form-group">
                      <label>????????????????????????</label>
                      <select className="form-control" value={agent} onChange={(e) => {
                        setAgent(e.target.value)
                      }}>
                        <option value=''>???????????????</option>
                        {renderAgentList()}
                      </select>
                    </div>
                  </div>
                  <div className='col-6'>
                    <div className="form-group">
                      <label>???????????????????????????????????????????????????????????????</label>
                      <CurrencyFormat
                        className="form-control"
                        value={promotion_startPrice}
                        thousandSeparator={true} suffix={'???'}
                        isNumericString={true}
                        disabled={true}
                      />
                    </div>
                  </div>
                  <div className='col-6'>
                    <div className="form-group">
                      <label>??????????????????????????????????????????????????????????????????</label>
                      <CurrencyFormat
                        className="form-control"
                        value={promotion_price} thousandSeparator={true} suffix={'???'}
                        isNumericString={true}
                        onValueChange={(values) => {
                          setPromotion_price(values.floatValue)
                        }}
                      />
                    </div>
                  </div>
                  <div className='col-12'>
                    <div className="form-group">
                      <label>??????????????????????????????</label>
                      <textarea className='form-control' value={details} onChange={(e) => {
                        setDetails(e.target.value)
                      }} />
                    </div>
                  </div>
                </div>
              </div>
              <div className='card-footer'>
                <button className='btn btn-primary' type='submit'>????????????</button>
                <button className='btn btn-default float-right' onClick={(e) => {
                  e.preventDefault()
                  closeModal();
                }}>??????????????????</button>
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
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">??????????????????????????????????????????????????????</h1>
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
      <tr>
        <td>{index + 1}</td>
        <td>{item.promotionMaster.promotion_name + ' ' + item.promotionMaster.unit_quantity + ' ' + item.promotionMaster.unit_suffix}</td>
        <td><CurrencyFormat value={item.promotion_price} displayType={'text'} thousandSeparator={true} suffix={' ?????????'} renderText={value => <b>{value}</b>} /></td>
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
            ????????????????????????????????????????????????????????? (3%)
          </td>
          <td >
            <CurrencyFormat value={this.props.paymentData.credit_add_price} displayType={'text'} thousandSeparator={true} suffix={' ?????????'} renderText={value => <b>{value}</b>} />
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
            <img style={{ height: '5cm' }} src='/img/ALA_logo.png' />
          </div>
          <div style={{ float: 'left', width: '14.5cm', height: '6cm', marginTop: '1cm', marginLeft: '0.5cm' }}>
            <h3 style={{ fontSize: '1cm' }}><b>??????????????????????????????????????????????????????</b></h3>
            <p style={{ fontSize: '6mm' }}>184/3 ????????????????????? 2 ???.???????????????????????? ???.????????????????????? ???.?????????????????? 20110</p>
            <p style={{ fontSize: '6mm' }}>???????????????????????? 096-4595396</p>
          </div>
          <div style={{ float: 'left', width: '21cm', fontSize: '1cm', textAlign: 'center' }}>
            <h2 >??????????????????????????????????????????</h2>
          </div>
          <div style={{ float: 'left', width: '20.5cm', fontSize: '0.5cm', textAlign: 'right' }}>
            <p><b>???????????????????????????????????????</b> : {this.props.listPantientHistory[0].payment_id}</p>
          </div>
          <div style={{ float: 'left', width: '20.5cm', fontSize: '0.5cm', textAlign: 'right' }}>
            <p><b>??????????????????</b> : {moment(this.props.listPantientHistory[0].operate_date).format('DD-MM-YYYY')}</p>
          </div>
          <div style={{ float: 'left', width: '20cm', fontSize: '0.5cm', textAlign: 'left', marginLeft: '0.5cm' }}>
            <p><b>???????????? - ?????????????????????</b> : {this.props.patientData.first_name + ' ' + this.props.patientData.last_name}</p>
          </div>
          <table className="table table-bordered" style={{ float: 'left', width: '20cm', fontSize: '0.5cm', textAlign: 'left', marginLeft: '0.5cm' }}>
            <thead>
              <tr>
                <th style={{ width: '2.5cm' }}>????????????????????????</th>
                <th style={{ width: '13.0cm' }}>??????????????????</th>
                <th>???????????????????????????</th>
              </tr>
            </thead>
            <tbody>
              {this.renderPaymentList()}
              {this.renderCreditAddPrice()}
              <tr>
                <th >

                </th>
                <th >
                  ????????????????????????????????????
                </th>
                <th >
                  <CurrencyFormat value={this.getTotalPayment()} displayType={'text'} thousandSeparator={true} suffix={' ?????????'} renderText={value => <b className='doubleUnderline'>{value}</b>} />
                </th>
              </tr>
            </tbody>
          </table>
          <div style={{ float: 'left', width: '20cm', fontSize: '0.6cm', textAlign: 'left', marginLeft: '0.5cm' }}>
            <input style={{ width: '0.6cm', height: '0.6cm' }} checked={this.props.paymentData.payment_type === 'cash' ? true : false} type="checkbox" />
            <label style={{ marginLeft: '0.5cm' }}>{"??????????????????"}</label>
          </div>
          <div style={{ float: 'left', width: '20cm', fontSize: '0.6cm', textAlign: 'left', marginLeft: '0.5cm' }}>
            <input style={{ width: '0.6cm', height: '0.6cm' }} checked={this.props.paymentData.payment_type === 'transfer' ? true : false} type="checkbox" />
            <label style={{ marginLeft: '0.5cm' }}>{"?????????"}</label>
          </div>
          <div style={{ float: 'left', width: '20cm', fontSize: '0.6cm', textAlign: 'left', marginLeft: '0.5cm' }}>
            <input style={{ width: '0.6cm', height: '0.6cm' }} checked={this.props.paymentData.payment_type === 'credit' ? true : false} type="checkbox" />
            <label style={{ marginLeft: '0.5cm' }}>{"??????????????????????????????"}</label>
          </div>
          <div style={{ float: 'left', width: '20cm', fontSize: '0.5cm', textAlign: 'right', marginLeft: '0.5cm' }}>
            <p>???????????????????????????????????????????????????????????????</p>
          </div>
        </div>
      </div>
    );
  }
}
