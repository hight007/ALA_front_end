import moment from 'moment';
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { key, OK, server, apiUrl } from "../../../constants";
import { httpClient } from '../../../utils/HttpClient';
import Modal from 'react-modal';
import './patient_history.css'

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
          <h3 class="card-title">?????????????????????</h3>
        </div> */}

        <div className="card-body box-profile">
          <h3 className="profile-username text-center">{patientData.first_name + ' ' + patientData.last_name}</h3>
          <p className="text-muted text-center">{patientData.job}</p>
          <ul className="list-group list-group-unbordered mb-3">
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
              <b>??????????????? </b> <label style={{ color: 'red' }} className={patientData.status != 'diagnose' ? 'float-right text-center' : 'float-right text-center text-muted'}>{patientData.status}</label>
            </li>
            <div className="card card-default" style={{ marginTop: 10 }}>
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
                <hr />
                <b>????????????????????? </b> <label className={'float-right text-center text-muted'}><Link to={"/appointment/" + patientData.patient_id} className="btn btn-primary btn-xs">?????????????????????</Link></label>

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
          }} className="btn btn-primary">????????????????????????????????????????????????????????????</button>
          <button onClick={(e) => {
            e.preventDefault();
            renderAddDiagnoseData()
          }} className="btn btn-success float-right">????????????????????????????????????????????????</button>
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
          title: '?????????????????????????????????????????????????',
          text: "You won't be able to revert this!",
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: '?????????, ???????????????!',
          cancelButtonText: '??????????????????',
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire({
              title: '??????????????????????????????????????????????????????!',
              text: "??????????????????????????????????????? ???????????????????????????",
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#d33',
              confirmButtonText: '??????????????????',
              cancelButtonText: '??????????????????',
            }).then(async (confirmResult) => {
              if (confirmResult.isConfirmed) {
                const response = await httpClient.delete(server.PANTIENT_HISTORY_URL, { data: { history_id } })
                if (response.data.api_result === OK) {
                  Swal.fire(
                    'Deleted!',
                    '??????????????????????????????????????????????????????????????????????????????',
                    'success'
                  ).then(() => {
                    doGetPatientHistory()
                  })
                } else {
                  Swal.fire(
                    'Error!',
                    '????????????????????????????????????????????????????????????????????????',
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
              <div className={isMobile ? "col-6" : "col-4"} >
                <div className="card card-default">
                  <div className="card-footer">
                    <a target="_blank" href={apiUrl + server.CUSTOMER_FULL_IMAGE_URL + '/' + item} className="btn btn-primary btn-xs">
                      <i class="far fa-file-image"></i>
                    </a>
                    <button onClick={() => {
                      doDeleteCustomerImages(item)
                    }} style={{ marginBottom: 5 }} className="btn btn-danger btn-xs float-right">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                  <div className="card-body">
                    <Zoom>
                      <img style={{ width: '100%' , objectFit : 'cover' }} src={apiUrl + server.CUSTOMER_IMAGE_URL + '/' + item} />
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
          <div>
            <i className="fas fa-hand-holding-medical bg-success" />
            <div class="timeline-item">
              <span class="time">
                <i class="fas fa-clock"></i>{moment(item.updatedAt).format('HH:mm')}</span>
              <h2 class="timeline-header"><b>{item.promotionMaster.promotion_name}</b></h2>
              <div class="timeline-body">
                <p>{item.promotionMaster.promotion_detail}</p>
                {item.details !== '' ? <p>?????????????????????????????? : {item.details}</p> : <></>}
                <p>?????????????????????????????? : <CurrencyFormat value={item.promotion_price} displayType={'text'} thousandSeparator={true} suffix={'???'} renderText={value => <b style={{ color: 'blue' }}>{value}</b>} />
                  {item.discount > 0 ? ' , ??????????????????????????? : ' + item.discount : ''}</p>
                {item.agent !== '' ? <p>???????????????????????? : {item.agent}</p> : <></>}
                <p>??????????????????????????? : {item.updater}</p>
                <div className="row">
                  {renderCustomerImages(item.history_id)}
                </div>
              </div>
              <div class="timeline-footer">
                <div>
                  <button onClick={(e) => {
                    e.preventDefault();
                    addImage(item.history_id)
                  }}
                    style={{ marginLeft: 5 }} className="btn btn-success btn-xs">
                    <i className="fas fa-images" />

                  </button>
                  <button onClick={(e) => {
                    e.preventDefault();
                    doDeleteTimeLine(item.history_id)
                  }} style={{ marginLeft: 5 }} className="btn btn-danger btn-xs float-right"><i className="fas fa-trash-alt" /></button>
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
              }} className="btn btn-success float-right">????????????????????????????????????????????????</button>
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
        title: '??????????????????????????????????????????...',
        text: '????????????????????????????????????????????????????????????/??????????????? ?????????????????? diagnose',
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
                    doGetPromotions(mode == 'diagnose' ? 'true' : 'all', e.target.value)
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
          title: '?????????????????????????????????????????????????????????????????????!',
          text: '?????????????????????????????????????????????????????????...',
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
          title: '????????????????????????????????????!',
          text: '??????????????????????????????????????????...',
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
        title: '?????????????????????????????????????????????????????????????????????????',
        text: "??????????????????????????? " + listSelectedPromotions[0].promotion_name,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: '???????????????????????????',
        cancelButtonText: '??????????????????'
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
                ???????????????????????????????????????
              </th>
              <th className="sorting" rowSpan={1} colSpan={1}>
                ????????????????????????????????????
              </th>
              <th className="sorting" rowSpan={1} colSpan={1}>
                ??????????????????????????????
              </th>
              <th className="sorting" rowSpan={1} colSpan={1}>
                ??????????????????????????????
              </th>
              <th className="sorting" rowSpan={1} colSpan={1}>
                ????????????????????????
              </th>
              <th className="sorting" rowSpan={1} colSpan={1}>
                ??????????????????????????????
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
          title: '???????????????????????????????????????????????????',
          text: "???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????? " + moment(operate_date).format('DD/MM/YYYY') + " ?",
          icon: 'alert',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          confirmButtonText: '????????????',
          cancelButtonText: '??????????????????'
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
                  title: '????????????????????????????????????????????????????????????????????????',
                  text: JSON.stringify(error),
                  icon: 'error',
                })
                return
              }
            }
            Swal.fire({
              title: '??????????????????????????????????????????????????????????????????????????????',
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
          title: '?????????????????????????????????????????????????????????????????????????????????',
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
              <h2 className="card-title">{mode == 'diagnose' ? '????????????????????????????????????????????????' : '?????????????????????????????????????????????????????????????????????????????????????????????'}</h2>
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
                    <label>?????????????????????????????????????????????</label>
                    <DatePicker disabled={mode == 'diagnose' ? true : false} className="form-control" selected={operate_date} onChange={(date) => setOperate_date(date)} />
                  </div>
                </div>
                <div className='col-6'>
                  <div className="form-group">
                    <label>????????????????????????</label>
                    <select className="form-control" onChange={(e) => {
                      setAgent(e.target.value)
                    }}>
                      <option value=''>???????????????</option>
                      {renderAgentList()}
                    </select>
                  </div>
                </div>
                <div className='col-12'>
                  {renderPromotions()}
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
                <div className='col-12'>
                  <button type="submit" className='btn btn-success' onClick={(e) => {
                    e.preventDefault();
                    addListSelectedPromotions()
                  }} style={{ width: '100%' }}>??????????????????????????????????????????</button>
                </div>
              </div>
              <div className="card-body">
                <div className='row'>
                  <h2 className="card-title">??????????????? Promotion ????????????????????????????????????????????? {moment(operate_date).format('DD/MM/YYYY')}</h2>
                  <div className="col-12">
                    {renderListSelectedPromotions()}
                  </div>
                </div>
              </div>
            </div>

            <div className="card-footer">
              <div className="row">
                <div className="col-sm-4">
                  <b>?????????????????????????????????????????? : {totalPromotionsPrice().totalPromotionsStartPrice}</b>
                </div>
                <div className="col-sm-4">
                  <b>???????????????????????????????????????????????? : <label style={{ color: 'blue' }}>{totalPromotionsPrice().totalPromotionsPrice}</label></b>
                </div>
                <div className="col-sm-4">
                  <b>???????????????????????????????????????????????? : {totalPromotionsPrice().totalPromotionsDiscountPrice}</b>
                </div>
              </div>
              <br></br>
              <div>
                <button onClick={(e) => {
                  e.preventDefault()
                  submitPromotions()
                }} className="btn btn-primary">????????????</button>
                <button onClick={(e) => {
                  e.preventDefault();
                  closeModal();
                }} className="btn btn-default float-right">??????????????????</button>
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
        <div style={{ width: '100%' }}>
          <ProgressBar width='100%' bgColor='blue' completed={progress} />
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
            overlfow: 'scroll' // <-- This tells the modal to scrol
          },
        }}
        className="content-wrapper"
      >
        <div style={{ margin: '5%', marginTop: '10%', padding: '0%', backgroundColor: 'rgba(0,0,0,0)', overflow: 'auto' }}>
          <div className={'card card-dark'}>
            <div className="card-header">
              <h2 className="card-title">???????????????????????????????????????</h2>
              <div class="card-tools">
                <button type="button" className="btn btn-tool" onClick={(e) => {
                  e.preventDefault()
                  closeModal();
                }}><i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <div className='card-body' style={{ textAlign: 'center' }}><img src="/img/ALA_logo.png" /></div>
            <div className='card-body'>
              <div className="input-group" style={{ marginTop: 15, overflow: 'auto' }}>
                <DropZone parentCallback={setimages} />
              </div>
              {renderProgress()}
            </div>
            <div className='card-footer'>
              <button onClick={(e) => {
                e.preventDefault()
                doUploadImages()
              }} className="btn btn-primary">????????????</button>
              <button onClick={(e) => {
                e.preventDefault();
                closeModal();
              }} className="btn btn-default float-right">??????????????????</button>
            </div>
          </div>
        </div>
      </Modal>
    )
  }

  const doDeleteCustomerImages = async (id) => {
    // console.log(id);
    Swal.fire({
      title: '??????????????????????????????????????????????',
      text: "??????????????????????????????????????????????????????????????????????????????????????????",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '???????????????!',
      cancelButtonText: '????????????????????????????????????????????????'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const result = await httpClient.delete(server.CUSTOMER_IMAGE_URL, { data: { id } })
        doGetCustomerImages()
        Swal.fire(
          '?????????????????????????????????!',
          '?????????????????????????????????????????????',
          'success'
        )
      }
    })


  }
  //get images
  const doGetCustomerImages = async () => {
    const { patient_id } = props.match.params
    const response = await httpClient.get(server.CUSTOMER_IMAGE_URL + '_customer' + '/' + patient_id)
    console.log(response.data);


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
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">???????????????????????????????????? / ??????????????????</h1>
            </div>{/* /.col */}
            <div className="col-sm-6">
              {renderAddImages()}
            </div>{/* /.col */}
          </div>{/* /.row */}
        </div>{/* /.container-fluid */}
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