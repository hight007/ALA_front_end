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
      confirmButtonColor: '#C5953A',
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
      return listPromotion_category.map((item, idx) => (
        <option key={idx} value={item.promotion_category}></option>
      ))
    }

    const renderIsOpen = () => {
      if (mode === 'edit') {
        return (
          <div className="col-sm-12">
            <div className="form-group">
              <label style={{ fontWeight: 600, color: '#1E2430' }}>
                <i className="fas fa-toggle-on mr-1" style={{ color: '#C5953A' }} /> สถานะการขาย (Sales status)
              </label>
              <div className="input-group">
                <select
                  className="form-control"
                  style={{ borderRadius: '10px', height: '42px' }}
                  value={isOpen}
                  onChange={(e) => {
                    setIsOpen(e.target.value)
                  }}
                >
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
        onRequestClose={closeModal}
        ariaHideApp={false}
      >
        <div className="card shadow-lg border-0 m-0" style={{ borderRadius: '20px', overflow: 'hidden' }}>
          <div
            className="card-header d-flex align-items-center justify-content-between"
            style={{
              backgroundColor: '#1E2430',
              color: '#E9C070',
              padding: '18px 24px',
              borderBottom: '3px solid #C5953A'
            }}
          >
            <h3 className="card-title m-0" style={{ fontWeight: 600, fontSize: '1.25rem', color: '#E9C070' }}>
              <i className={mode === 'add' ? "fas fa-plus-circle mr-2" : "fas fa-edit mr-2"} />
              {mode === 'add' ? 'เพิ่มข้อมูลโปรโมชั่นใหม่' : 'แก้ไขข้อมูลโปรโมชั่น'}
            </h3>
            <button
              type="button"
              className="btn btn-sm"
              style={{ color: '#E9C070', fontSize: '1.1rem' }}
              onClick={(e) => {
                e.preventDefault()
                closeModal();
              }}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (mode === 'add') {
              doAddPromotions()
            } else {
              doUpdatePromotions()
            }
          }}>
            <div className="card-body" style={{ padding: '24px' }}>
              <div className="text-center mb-4">
                <img src="/img/ALA_logo.png" alt="ALA Clinic" style={{ maxHeight: '80px', borderRadius: '12px' }} />
              </div>
              <div className="row">
                <div className="col-sm-6">
                  <div className="form-group">
                    <label style={{ fontWeight: 600, color: '#1E2430' }}>หมวดหมู่โปรโมชั่น (Promotion category)</label>
                    <input
                      type="text"
                      required
                      value={promotion_category}
                      list="promotion_category"
                      onChange={(e) => {
                        setPromotion_category(e.target.value)
                      }}
                      className="form-control"
                      style={{ borderRadius: '10px', height: '42px' }}
                      placeholder="กรอกหมวดหมู่โปรโมชั่น"
                    />
                  </div>
                  <datalist id="promotion_category">
                    {renderSuggestPromotionCategory()}
                  </datalist>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label style={{ fontWeight: 600, color: '#1E2430' }}>ชื่อโปรโมชั่น (Promotion name)</label>
                    <input
                      type="text"
                      required
                      value={promotion_name}
                      onChange={(e) => {
                        setPromotion_name(e.target.value)
                      }}
                      className="form-control"
                      style={{ borderRadius: '10px', height: '42px' }}
                      placeholder="กรอกชื่อโปรโมชั่น"
                    />
                  </div>
                </div>
                <div className="col-sm-3">
                  <div className="form-group">
                    <label style={{ fontWeight: 600, color: '#1E2430' }}>จำนวนหน่วย (Quantity)</label>
                    <input
                      className="form-control"
                      style={{ borderRadius: '10px', height: '42px' }}
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
                  <div className="form-group">
                    <label style={{ fontWeight: 600, color: '#1E2430' }}>ชื่อหน่วย (Unit)</label>
                    <input
                      className="form-control"
                      style={{ borderRadius: '10px', height: '42px' }}
                      value={unit_suffix}
                      list="unit_suffix"
                      placeholder="เช่น cc, ครั้ง"
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
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label style={{ fontWeight: 600, color: '#1E2430' }}>ราคาโปรโมชั่น (Promotion price)</label>
                    <CurrencyFormat
                      className="form-control"
                      style={{ borderRadius: '10px', height: '42px', fontWeight: 600, color: '#C5953A' }}
                      value={promotion_price}
                      thousandSeparator={true}
                      suffix={' ฿'}
                      isNumericString={true}
                      onValueChange={(values) => {
                        setPromotion_price(values.floatValue)
                      }}
                    />
                  </div>
                </div>
                <div className="col-sm-12">
                  <div className="form-group">
                    <label style={{ fontWeight: 600, color: '#1E2430' }}>รายละเอียดโปรโมชั่น (Promotion detail)</label>
                    <textarea
                      type="text"
                      rows={3}
                      value={promotion_detail}
                      onChange={(e) => {
                        setPromotion_detail(e.target.value)
                      }}
                      className="form-control"
                      style={{ borderRadius: '10px' }}
                      placeholder="กรอกรายละเอียดโปรโมชั่น"
                    />
                  </div>
                </div>
                {renderIsOpen()}
              </div>
            </div>
            <div className="card-footer d-flex justify-content-between align-items-center" style={{ backgroundColor: '#F8F9FC', padding: '16px 24px' }}>
              <button
                type="reset"
                className="btn btn-light px-4"
                style={{ borderRadius: '10px', fontWeight: 500, border: '1px solid #CBD5E0' }}
                onClick={(e) => {
                  e.preventDefault()
                  closeModal();
                }}
              >
                ยกเลิก (Cancel)
              </button>
              <button
                type="submit"
                className="btn px-4"
                style={{
                  backgroundColor: '#C5953A',
                  color: '#FFFFFF',
                  borderRadius: '10px',
                  fontWeight: 600
                }}
              >
                <i className="fas fa-save mr-1" />
                {mode === 'add' ? 'ตกลง (Submit)' : 'อัพเดท (Update)'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
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
        confirmButtonColor: '#C5953A',
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
            confirmButtonColor: '#C5953A',
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
      confirmButtonColor: '#C5953A',
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
        confirmButtonColor: '#C5953A',
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
        <div key={idx} className="col-12 col-sm-6 col-md-4 d-flex align-items-stretch flex-column mb-4">
          <div className="card shadow-sm border-0 d-flex flex-fill m-0" style={{ borderRadius: '16px', overflow: 'hidden', borderTop: '4px solid #E9C070' }}>
            <div className="card-header d-flex justify-content-between align-items-center" style={{ backgroundColor: '#1E2430', color: '#E9C070', padding: '12px 20px' }}>
              <span className="badge px-2 py-1" style={{ backgroundColor: 'rgba(233, 192, 112, 0.2)', color: '#E9C070', borderRadius: '6px', fontSize: '0.8rem' }}>
                <i className="fas fa-tag mr-1" /> {item.promotion_category || 'ทั่วไป'}
              </span>
              <span className="badge px-2 py-1" style={{ backgroundColor: item.isOpen ? 'rgba(40, 167, 69, 0.2)' : 'rgba(220, 53, 69, 0.2)', color: item.isOpen ? '#48BB78' : '#F56565', borderRadius: '6px', fontSize: '0.8rem' }}>
                <i className={item.isOpen ? "fas fa-check-circle mr-1" : "fas fa-ban mr-1"} />
                {item.isOpen ? 'เปิดการขาย' : 'เลิกขาย'}
              </span>
            </div>
            <div className="card-body" style={{ padding: '20px' }}>
              <h5 className="mb-2" style={{ fontWeight: 700, color: '#1E2430', fontSize: '1.15rem' }}>
                {item.promotion_name}
              </h5>
              <p className="text-muted mb-3" style={{ fontSize: '0.9rem', minHeight: '40px' }}>
                {item.promotion_detail || '-'}
              </p>

              <div className="p-3 mb-3" style={{ backgroundColor: '#F8F9FC', borderRadius: '12px', border: '1px solid #EDF2F7' }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                    <i className="fas fa-hand-holding-medical mr-2" style={{ color: '#55C5D9' }} /> จำนวนหน่วย:
                  </span>
                  <strong style={{ color: '#1E2430' }}>{item.unit_quantity + ' ' + item.unit_suffix}</strong>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                    <i className="fas fa-coins mr-2" style={{ color: '#C5953A' }} /> ราคาโปรโมชั่น:
                  </span>
                  <CurrencyFormat
                    value={item.promotion_price}
                    displayType={'text'}
                    thousandSeparator={true}
                    suffix={' ฿'}
                    renderText={value => <strong style={{ color: '#C5953A', fontSize: '1.1rem' }}>{value}</strong>}
                  />
                </div>
              </div>

              <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                <div><i className="fas fa-user-cog mr-1" /> แก้ไขโดย: {item.updater || '-'}</div>
                <div><i className="far fa-clock mr-1" /> เพิ่มเมื่อ: {moment(item.createdAt).format('DD-MM-YYYY HH:mm')}</div>
                <div><i className="fas fa-history mr-1" /> แก้ไขเมื่อ: {moment(item.updatedAt).format('DD-MM-YYYY HH:mm')}</div>
              </div>
            </div>
            <div className="card-footer d-flex justify-content-between align-items-center" style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #EDF2F7', padding: '12px 20px' }}>
              <button
                className="btn btn-sm px-3"
                style={{ backgroundColor: '#E9C070', color: '#1E2430', borderRadius: '8px', fontWeight: 600 }}
                onClick={(e) => {
                  e.preventDefault()
                  prepareUpdatePromotion(item.promotion_id, item.promotion_name)
                }}
              >
                <i className="fas fa-edit mr-1" /> อัพเดทโปรโมชั่น
              </button>
              <button
                className="btn btn-sm btn-outline-danger px-3"
                style={{ borderRadius: '8px', fontWeight: 500 }}
                onClick={(e) => {
                  e.preventDefault()
                  doDeletePromotion(item.promotion_id, item.promotion_name)
                }}
              >
                <i className="fas fa-trash-alt mr-1" /> ลบโปรโมชั่น
              </button>
            </div>
          </div>
        </div>
      );
    }
    const renderCategories = () => {
      return listPromotion_category.map((item, idx) => (
        <option key={idx} value={item.promotion_category}>{item.promotion_category}</option>
      ))
    }
    return (
      <div className="card shadow-sm border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div className="card-header" style={{ backgroundColor: '#1E2430', color: '#E9C070', padding: '16px 24px', borderBottom: '3px solid #E9C070' }}>
          <div className="row align-items-center">
            <div className="col-md-3 col-sm-6 mb-2 mb-md-0">
              <label className="small mb-1" style={{ color: '#E9C070' }}>สถานะการขาย</label>
              <select
                className="form-control"
                style={{ borderRadius: '10px', height: '40px' }}
                value={isOpen}
                onChange={async (e) => {
                  setIsOpen(e.target.value)
                  doGetPromotions(e.target.value, selectedPromotion_category)
                }}
              >
                <option value="all">ทั้งหมด (All Status)</option>
                <option value="true">เปิดการขาย (Active)</option>
                <option value="false">เลิกขาย (Closed)</option>
              </select>
            </div>
            <div className="col-md-3 col-sm-6 mb-2 mb-md-0">
              <label className="small mb-1" style={{ color: '#E9C070' }}>หมวดหมู่โปรโมชั่น</label>
              <select
                className="form-control"
                style={{ borderRadius: '10px', height: '40px' }}
                value={selectedPromotion_category}
                onChange={async (e) => {
                  await setSelectedPromotion_category(e.target.value)
                  doGetPromotions(isOpen, e.target.value)
                }}
              >
                <option value="all">ทั้งหมด (All Categories)</option>
                {renderCategories()}
              </select>
            </div>
            <div className="col-md-6 col-sm-12">
              <label className="small mb-1" style={{ color: '#E9C070' }}>ค้นหา & จัดการ</label>
              <div className="d-flex">
                <input
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      searchChanged(e, isOpen, selectedPromotion_category)
                    }
                  }}
                  onChange={(e) => searchChanged(e, isOpen, selectedPromotion_category)}
                  type="search"
                  className="form-control mr-2"
                  placeholder="ค้นหาชื่อหรือหมวดหมู่โปรโมชั่น..."
                  style={{ borderRadius: '10px', height: '40px' }}
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setMode('add')
                    setIsOpenModal(true)
                  }}
                  className="btn text-nowrap px-3"
                  style={{ backgroundColor: '#C5953A', color: '#FFFFFF', borderRadius: '10px', fontWeight: 600, height: '40px' }}
                >
                  <i className="fas fa-plus mr-1" /> เพิ่มโปรโมชั่น
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="card-body" style={{ backgroundColor: '#F8F9FC', padding: '24px' }}>
          <div className="row">
            <FlatList
              list={PromotionsData}
              renderItem={renderPromotionsData}
              renderWhenEmpty={() => (
                <div className="col-12 text-center py-5 text-muted">
                  <i className="fas fa-tags fa-3x mb-3 d-block" style={{ color: '#E9C070' }} />
                  ไม่พบรายการโปรโมชั่น
                </div>
              )}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="content-wrapper" style={{ backgroundColor: '#F8F9FC', minHeight: '100vh', paddingBottom: '2rem' }}>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-3 align-items-center">
            <div className="col-sm-6">
              <h1 className="m-0" style={{ color: '#1E2430', fontWeight: 700, fontSize: '1.75rem' }}>
                <i className="fas fa-tags mr-2" style={{ color: '#C5953A' }} />
                จัดการโปรโมชั่น (Promotions)
              </h1>
            </div>
            <div className="col-sm-6 text-sm-right">
              <span className="badge px-3 py-2" style={{ backgroundColor: '#1E2430', color: '#E9C070', borderRadius: '20px', fontSize: '0.9rem' }}>
                <i className="fas fa-list-ul mr-1" /> ทั้งหมด {PromotionsData.length} รายการ
              </span>
            </div>
          </div>
        </div>
      </div>
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              {renderAddNewPromotion()}
            </div>
            <div className="col-12">
              {renderFindPromotionsData()}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
