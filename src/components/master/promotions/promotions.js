import React, { Component, useEffect, useRef, useState } from "react";
import moment from 'moment';
import Modal from 'react-modal';
import Swal from 'sweetalert2';
import { Link } from "react-router-dom";

import './promotions.css'
import _ from "lodash";
import FlatList from 'flatlist-react';

import { key, OK, server } from "../../../constants";
import { httpClient } from '../../../utils/HttpClient';

import CurrencyFormat from 'react-currency-format';

export default function Promotions(props) {
  const [mode, setMode] = useState('add')
  const [PromotionsData, setPromotionsData] = useState([])
  const [isOpenModal, setIsOpenModal] = useState(false)
  const [listPromotion_category, setListPromotion_category] = useState([])
  const [selectedPromotion_category, setSelectedPromotion_category] = useState('all')

  const [promotion_id, setPromotion_id] = useState('')
  const [promotion_category, setPromotion_category] = useState('')
  const [promotion_name, setPromotion_name] = useState('')
  const [promotion_detail, setPromotion_detail] = useState('')
  const [promotion_price, setPromotion_price] = useState(0)
  const [unit_quantity, setUnit_quantity] = useState(0)
  const [unit_suffix, setUnit_suffix] = useState('')
  const [isOpen, setIsOpen] = useState('all')


  useEffect(() => {
    doGetPromotions(isOpen, selectedPromotion_category)
    doGetCategories()
  }, [])

  //Find data
  const debounceSearch = useRef(_.debounce((e, valueIsOpen, selected_category) => findPromotionsData(e, valueIsOpen, selected_category), 500)).current;
  const searchChanged = (e, valueIsOpen, selected_category) => {
    e.persist();
    debounceSearch(e, valueIsOpen, selected_category);
  };
  const findPromotionsData = async (e, valueIsOpen, selected_category) => {
    if (e.target.value != '') {
      let response = await httpClient.get(server.FIND_PROMOTIONS_DATA_URL + '/' + e.target.value + '/' + valueIsOpen + '/' + selected_category)
      if (response.data.result.length > 0 && response.data.api_result === OK) {
        setPromotionsData(response.data.result)
      } else {
        setPromotionsData([])
      }
    } else {
      doGetPromotions(isOpen, selectedPromotion_category)
    }
  }

  //add new promotions
  const doAddPromotions = () => {
    Swal.fire({
      title: 'ต้องการเพิ่มโปรโมชั่น?',
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
          promotion_category,
          promotion_name,
          promotion_detail,
          promotion_price,
          unit_quantity,
          unit_suffix,
          updater: localStorage.getItem(key.USER_NAME)
        }
        const response = await httpClient.post(server.PROMOTIONS_DATA_URL, data)
        if (response.data.api_result === OK) {
          Swal.fire({
            icon: 'success',
            title: 'Yeah...',
            text: 'เพิ่มโปรโมชั่นใหม่สำเร็จ',
          }).then(() => {
            closeModal()
            doGetPromotions(isOpen, selectedPromotion_category)
            doGetCategories()
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
  const closeModal = () => {
    setIsOpen('all')
    setPromotion_id('')
    setPromotion_name('')
    setPromotion_detail('')
    setPromotion_category('')
    setUnit_suffix('')
    setUnit_quantity(0)
    setPromotion_price(0)
    setIsOpenModal(false)
  }
  const renderAddNewPromotion = () => {
    const renderSuggestPromotionCategory = () => {
      return listPromotion_category.map((item) => (
        <option value={item.promotion_category}></option>
      )
      )
    }

    const renderIsOpen = () => {
      if (mode === 'edit') {
        return (
          <div className="col-sm-12">
            <div className="form-group">
              <label>สถานะการขาย (Sales status)</label>
              <div className="input-group">
                <select className="form-control"
                  value={isOpen}
                  onChange={(e) => {
                    setIsOpen(e.target.value)
                  }}>
                  <option value="true">เปิดการขาย</option>
                  <option value="false">เลิกขาย</option>
                </select>
              </div>
            </div>
          </div>

        )
      }
    }
    return (
      <Modal
        isOpen={isOpenModal}
        style={{
          content: {
            transform: 'translate(0%, 0%)',
            overlfow: 'scroll' // <-- This tells the modal to scrol
          },
        }}
        className="content-wrapper"
      >
        <div style={{ margin: '5%', marginTop: '10%', padding: '0%', backgroundColor: 'rgba(0,0,0,0)', overflow: 'auto' }}>
          <div className={mode === 'add' ? "card card-success" : "card card-warning"}>
            <div className="card-header">
              <h2 className="card-title">{mode === 'add' ? 'เพิ่มข้อมูลโปรโมชั่นใหม่' : 'แก้ไขข้อมูลโปรโมชั่น'}</h2>
              <div className="card-tools">
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
              if (mode === 'add') {
                doAddPromotions()
              } else {
                doUpdatePromotions()
              }
            }}>
              <div className="card-body">
                <div className="row">
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>หมวดหมู่โปรโมชั่น (Promotion category)</label>
                      <input type="text"
                        required
                        value={promotion_category}
                        list="promotion_category"
                        onChange={(e) => {
                          setPromotion_category(e.target.value)
                        }}
                        className="form-control"
                        placeholder="กรอกหมวดหมู่โปรโมชั่น (Enter promotion category)" />
                    </div>
                    <datalist id="promotion_category">
                      {renderSuggestPromotionCategory()}
                    </datalist>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>ชื่อโปรโมชั่น (Promotion name)</label>
                      <input type="text"
                        required
                        value={promotion_name}
                        onChange={(e) => {
                          setPromotion_name(e.target.value)
                        }}
                        className="form-control"
                        placeholder="กรอกชื่อโปรโมชั่น (Enter promotion name)" />
                    </div>
                  </div>
                  <div className="col-sm-3">
                    <div className="form-group">
                      <label>จำนวนหน่วย (Unit quantity)</label>
                      <input
                        className="form-control"
                        value={unit_quantity}
                        type="number"
                        step={1}
                        min={0}
                        onChange={(e) => {
                          setUnit_quantity(e.target.value)
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-sm-3">
                    <label>ชื่อหน่วย (Unit_suffix)</label>
                    <input
                      className="form-control"
                      value={unit_suffix}
                      list="unit_suffix"
                      onChange={(e) => {
                        setUnit_suffix(e.target.value)
                      }}
                    />
                    <datalist id="unit_suffix">
                      <option value="cc" />
                      <option value="ครั้ง" />
                      <option value="เส้น" />
                      <option value="mg" />
                    </datalist>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>ราคาโปรโมชั่น (Promotion price)</label>
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
                  <div className="col-sm-12">
                    <div className="form-group">
                      <label>รายละเอียดโปรโมชั่น (Promotion detail)</label>
                      <textarea type="text"
                        value={promotion_detail}
                        onChange={(e) => {
                          setPromotion_detail(e.target.value)
                        }}
                        className="form-control"
                        placeholder="กรอกรายละเอียดโปรโมชั่น (Enter promotion detail)" />
                    </div>
                  </div>
                  {renderIsOpen()}
                </div>
              </div>
              {/* /.card-body */}
              <div className="card-footer">
                <button type="submit" className={mode === 'add' ? "btn btn-primary" : "btn btn-warning"}>{mode === 'add' ? 'ตกลง (Submit)' : 'อัพเดท (Update)'}</button>
                <button type="reset" className="btn btn-default float-right" onClick={(e) => {
                  e.preventDefault()
                  closeModal();
                }}>ยกเลิก (Cancel)</button>
              </div>
            </form>
          </div>
        </div>
      </Modal >
    )
  }

  //get promotions
  const doGetPromotions = async (isOpen_t, selectedPromotion_category_t) => {
    try {
      let response = await httpClient.get(server.PROMOTIONS_CATEGORY_URL + '/' + isOpen_t + '/' + selectedPromotion_category_t)
      if (response.data.result.length > 0 && response.data.api_result === OK) {
        setPromotionsData(response.data.result)
      } else {
        setPromotionsData([])
      }
    } catch (error) {
      console.log(error);
    }
  }
  const doGetCategories = async () => {
    try {
      let response = await httpClient.get(server.PROMOTIONS_CATEGORY_URL)
      if (response.data.result.length > 0 && response.data.api_result === OK) {
        console.log(response.data.result);
        setListPromotion_category(response.data.result)
      } else {
        setListPromotion_category([])
      }
    } catch (error) {
      console.log(error);
    }
  }

  //actions
  const doDeletePromotion = async (promotion_id_t, promotion_name_t) => {
    try {
      Swal.fire({
        title: 'ต้องการลบโปรโมชั่น?',
        text: promotion_name_t,
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
              const data = {
                promotion_id: promotion_id_t,
                updater: localStorage.getItem(key.USER_NAME),
              }
              const response = await httpClient.delete(server.PROMOTIONS_DATA_URL, { data })
              if (response.data.api_result === OK) {
                Swal.fire(
                  'Deleted!',
                  'โปรโมชั่นถูกลบเรียบร้อย',
                  'success'
                )
                doGetPromotions(isOpen, selectedPromotion_category)
              } else {
                Swal.fire(
                  'Error!',
                  'โปรโมชั่นถูกลบไม่สมบูรณ์',
                  'error'
                )
              }

            }
          })
        }
      })
    } catch (error) {
      console.log(error);
    }
  }
  const doUpdatePromotions = async () => {
    Swal.fire({
      title: 'ต้องการอัพเดทโปรโมชั่น?',
      text: promotion_name,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ใช่, อัพเดทเลย!',
      cancelButtonText: 'ยกเลิก',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const data = {
          promotion_id,
          promotion_category,
          promotion_name,
          promotion_detail,
          promotion_price,
          unit_quantity,
          unit_suffix,
          isOpen,
          updater: localStorage.getItem(key.USER_NAME)
        }
        const response = await httpClient.put(server.PROMOTIONS_DATA_URL, data)
        if (response.data.api_result === OK) {
          Swal.fire(
            'Updated!',
            'โปรโมชั่นอัพเดทเรียบร้อย',
            'success'
          )
          doGetPromotions(isOpen, selectedPromotion_category)
          closeModal()
        } else {
          Swal.fire(
            'Error!',
            'โปรโมชั่นอัพเดทไม่สมบูรณ์',
            'error'
          )
        }
      }
    })
  }
  const prepareUpdatePromotion = async (promotion_id_t, promotion_name_t) => {
    try {
      Swal.fire({
        title: 'ต้องการอัพเดทโปรโมชั่น?',
        text: promotion_name_t,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'ตกลง!',
        cancelButtonText: 'ยกเลิก',
      }).then(async (result) => {
        if (result.isConfirmed) {
          setMode('edit')
          setPromotion_id(promotion_id_t)
          const response = await httpClient.get(server.PROMOTIONS_DATA_URL + '/' + promotion_id_t)
          if (response.data.api_result === OK) {
            setPromotion_category(response.data.result.promotion_category)
            setPromotion_name(response.data.result.promotion_name)
            setPromotion_detail(response.data.result.promotion_detail)
            setPromotion_price(response.data.result.promotion_price)
            setIsOpen(response.data.result.isOpen)
            setUnit_suffix(response.data.result.unit_suffix)
            setUnit_quantity(response.data.result.unit_quantity)
          }
          setIsOpenModal(true)
        }
      })
    } catch (error) {
      console.log(error);
    }
  }


  //find promotions
  const renderFindPromotionsData = () => {
    const renderPromotionsData = (item, idx) => {
      return (
        <div className="col-12 col-sm-6 col-md-4 d-flex align-items-stretch flex-column">
          <div className="card bg-light d-flex flex-fill">
            <div className="card-header text-muted border-bottom-0">
              {/* {'promotion id :' + item.promotion_id} */}
            </div>
            <div className="card-body pt-0">
              <div className="row">
                <div className="col-12">
                  <h2 className="lead text-xl"><b>{item.promotion_name}</b></h2>
                  <p className="text-muted ">
                    <b>หมวดหมู่โปรโมชั่น: </b>{item.promotion_category}
                    <br></br>
                    <b>รายละเอียด: </b>{item.promotion_detail}
                  </p>
                  <ul className="ml-4 mb-0 fa-ul text-muted">
                    <li className="ml-4 mb-0 fa-ul text-muted">
                      <span className="fa-li">
                        <i className="fas fa-hand-holding-medical" />
                      </span>
                      <div >จำนวน : <b>{item.unit_quantity + ' ' + item.unit_suffix}</b></div>

                      <span className="fa-li">
                        <i className="fab fa-bitcoin" />
                      </span>
                      <CurrencyFormat value={item.promotion_price} displayType={'text'} thousandSeparator={true} suffix={'฿'}
                        renderText={value => <div style={{}}>ราคา : <b>{value}</b></div>} />
                      <span className="fa-li">
                        <i className="fab fa-shopify" />
                      </span>
                      <div >สถานะ : <b style={{ color: item.isOpen ? 'green' : 'red' }}>{item.isOpen ? 'เปิดการขาย' : 'เลิกขาย'}</b></div>
                      <br></br>

                      <span className="fa-li">
                        <i className="fas fa-user-cog" />
                      </span>
                      <div className="text-sm">แก้ไขโดย : {item.updater}</div>
                      <span className="fa-li">
                        <i className="far fa-clock" />
                      </span>
                      <div className="text-sm">เพิ่มเมื่อ : {moment(item.createdAt).format('DD-MM-YYYY hh:mm')}</div>
                      <span className="fa-li">
                        <i className="fas fa-clock" />
                      </span>
                      <div className="text-sm">แก้ไขเมื่อ : {moment(item.updatedAt).format('DD-MM-YYYY hh:mm')}</div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <div >
                <button className="btn btn-sm btn-warning" onClick={(e) => {
                  e.preventDefault()
                  prepareUpdatePromotion(item.promotion_id, item.promotion_name)
                }}>
                  <i className="fas fa-edit" />

                  {" อัพเดทโปรโมชั่น"}
                </button>
                <button className="btn btn-sm btn-danger float-right" onClick={(e) => {
                  e.preventDefault()
                  doDeletePromotion(item.promotion_id, item.promotion_name)
                }}>
                  <i className="fas fa-trash-alt" />
                  {" ลบโปรโมชั่น"}
                </button>
              </div>
            </div>
          </div>
        </div>

      );
    }
    const renderCategories = () => {
      return listPromotion_category.map((item) => (
        <option value={item.promotion_category}>{item.promotion_category}</option>
      )
      )
    }
    return (
      <div className="card card-default">
        <div className="card-body">
          <div className="row">
            <div className="col-2">
              <div className="input-group">
                <select className="form-control"
                  value={isOpen}
                  onChange={async (e) => {
                    setIsOpen(e.target.value)
                    doGetPromotions(e.target.value, selectedPromotion_category)
                  }}>
                  <option value="all">ทั้งหมด</option>
                  <option value="true">เปิดการขาย</option>
                  <option value="false">เลิกขาย</option>
                </select>
              </div>
            </div>
            <div className="col-3">
              <select className="form-control"
                value={selectedPromotion_category}
                onChange={async (e) => {
                  await setSelectedPromotion_category(e.target.value)
                  doGetPromotions(isOpen, e.target.value)
                }}>
                <option value="all">ทั้งหมด</option>
                {renderCategories()}
              </select>
            </div>
            <div className="col-7">
              <div className="input-group">
                <input
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      searchChanged(e, isOpen, selectedPromotion_category)
                    }
                  }
                  }
                  onChange={(e) => searchChanged(e, isOpen, selectedPromotion_category)}
                  type="search"
                  className="form-control input-lg"
                  placeholder="ค้นหาโปรโมชั่น"
                  style={{ borderRadius: 10, marginRight: 10 }}
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setMode('add')
                    setIsOpenModal(true)
                  }} className="btn btn-success btn-sm">
                  เพิ่มโปรโมชั่น
                </button>
              </div>
            </div>
          </div>

        </div>
        <div className="card-body pb-0">
          <div className="row">
            <FlatList
              list={PromotionsData}
              renderItem={renderPromotionsData}
              renderWhenEmpty={() => { return <></> }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="content-wrapper">
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">จัดการโปรโมชั่น</h1>
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
              {renderAddNewPromotion()}
            </div>
            <div className='col-12'>
              {renderFindPromotionsData()}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
