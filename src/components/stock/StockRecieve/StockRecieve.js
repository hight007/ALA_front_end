import React, { useEffect, useState, useMemo } from "react";
import ContentHeader from "../../../utils/ContentHeader";
import Modal from 'react-modal';
import LoadingScreen from "../../../utils/LoadingScreen";
import Swal from "sweetalert2";
import { httpClient } from "../../../utils/HttpClient";
import { server, key, OK } from "../../../constants";
import MaterialReactTable from 'material-react-table';
import moment from "moment";
import _ from "lodash";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as iconsModule from '@fortawesome/free-solid-svg-icons'
import Select from 'react-select';
import CurrencyFormat from 'react-currency-format';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function StockRecieve() {
  const [isLoad, setisLoad] = useState(false)
  const [key, setkey] = useState(0)
  const [users, setusers] = useState([])

  const [productsData, setproductsData] = useState([])
  const [productTypeDropDown, setproductTypeDropDown] = useState([])

  const [product_id, setproduct_id] = useState(0)
  const [quantity, setquantity] = useState('')
  const [expireDate, setexpireDate] = useState(null)

  const [stockDetail, setstockDetail] = useState([])
  const [summaryStock, setsummaryStock] = useState([])

  useEffect(() => {
    doGetProducts()
    doGetSummaryStock()
    doGetStockDetail()
  }, [])

  //Action
  const doGetProducts = async () => {
    try {
      setisLoad(true)
      const response = await httpClient.get(server.product.product)
      if (response.data.api_result === OK) {
        response.data.result = response.data.result.filter(item => item.isDeleted === false)
        await setproductsData(response.data.result)
        const dropDownResult = [...response.data.result.map((item) => ({ value: item.product_id, label: `${item.product_name} (${item.description})` }))]
        response.data.api_result === OK ? setproductTypeDropDown(dropDownResult) : setproductTypeDropDown([])
      }
    } catch (error) {

    } finally {
      setisLoad(false)
    }
  }
  const doReset = () => {
    setproduct_id(0)
    setquantity('')
    setexpireDate(null)
    setkey(key + 1)
  }
  const doRecieveStock = () => {
    const productName = productsData.filter(item => item.product_id == product_id)
    Swal.fire({
      title: 'โปรดยืนยัน',
      text: `ต้องการเพิ่มสต๊อก ${productName[0]?.product_name} `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#C5953A',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ตกลง',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setisLoad(true)
          const result = await httpClient.post(server.stock.stock, { stockName: `${product_id}${moment().format('YYYYMMDDHHmmssSSS')}`, productId: product_id, quantity, expireDate, status: 'recieved', createdBy: localStorage.getItem(key.user_id) ?? 1 })

          setisLoad(false)
          if (result.data.api_result === OK) {
            await httpClient.post(server.stock.stockTracking, { stockId: result.data.result.stockId, quantity, status: 'recieved', createdBy: localStorage.getItem(key.user_id) ?? 1 })
            Swal.fire({
              icon: 'success',
              title: 'สำเร็จ',
              text: `เพิ่มสต๊อก ${productName[0]?.product_name} สำเร็จ`
            }).then(() => {
              doReset()
              doGetStockDetail()
              doGetSummaryStock()
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'ล้มเหลว',
              text: `เพิ่มสต๊อก ${productName[0]?.product_name} ล้มเหลว`
            })
          }
        } catch (error) {
          setisLoad(false)
        }

      }
    })
  }
  const doGetStockDetail = async () => {
    try {
      setisLoad(true)
      const userList = await doGetUser()
      const response = await httpClient.get(server.stock.detail)
      if (response.data.api_result === OK) {
        setstockDetail(response.data.result.map(item => ({
          ...item,
          createdByName: findUserById(item.createdBy, userList),
          updatedByName: findUserById(item.updatedBy, userList),
          product_name: item.tbproduct.product_name,
          product_type: item.tbproduct.product_type,
          spec: item.tbproduct.spec,
          product_unit: item.tbproduct.product_unit,
          description: item.tbproduct.description
        })))
      }
    } catch (error) {

    } finally {
      setisLoad(false)
    }
  }
  const doGetSummaryStock = async () => {
    try {
      setisLoad(true)
      const response = await httpClient.get(server.stock.summary)
      if (response.data.api_result === OK) {
        setsummaryStock(response.data.result)
      }
    } catch (error) {

    } finally {
      setisLoad(false)
    }
  }
  const doGetUser = async () => {
    const result = await httpClient.get(server.USER_URL)
    if (result.data.api_result === OK) {
      setusers(result.data.result);
      return result.data.result
    }
  }
  const findUserById = (user_id, userList) => {
    if (user_id != '') {
      return userList.filter(item => item.id = user_id)[0]?.username
    } else {
      return ''
    }

  }

  //render
  const renderStockByProduct = () => {
    return (
      <div className="col-sm-12 mb-4">
        <form onSubmit={(e) => {
          e.preventDefault()
          doRecieveStock()
        }} className="card shadow-sm border-0 m-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <div
            className="card-header d-flex align-items-center"
            style={{ backgroundColor: '#1E2430', color: '#E9C070', padding: '16px 24px', borderBottom: '3px solid #E9C070' }}
          >
            <h3 className="card-title m-0" style={{ fontWeight: 600, fontSize: '1.1rem', color: '#E9C070' }}>
              <i className="fas fa-dolly-flatbed mr-2" /> บันทึกรับสินค้าเข้าสต๊อก (Receive Stock)
            </h3>
          </div>
          <div className="card-body" style={{ padding: '24px' }}>
            <div className="row">
              <div className="form-group col-md-5">
                <label style={{ fontWeight: 600, color: '#1E2430' }}>
                  <i className="fas fa-box mr-1" style={{ color: '#C5953A' }} /> เลือกชนิดสินค้า
                </label>
                <Select
                  key={key}
                  className="basic-single"
                  classNamePrefix="select"
                  isClearable={false}
                  isSearchable={true}
                  options={productTypeDropDown}
                  required={true}
                  placeholder="ค้นหาและเลือกสินค้า..."
                  onChange={(data) => {
                    setproduct_id(data.value)
                  }}
                />
              </div>
              <div className="form-group col-md-4">
                <label style={{ fontWeight: 600, color: '#1E2430' }}>
                  <i className="fas fa-sort-numeric-up mr-1" style={{ color: '#55C5D9' }} /> จำนวนที่รับเข้า
                </label>
                <CurrencyFormat
                  className="form-control"
                  style={{ borderRadius: '10px', height: '38px' }}
                  placeholder="ระบุจำนวนที่รับเข้า"
                  onValueChange={values => {
                    const { formattedValue, value } = values
                    setquantity(value)
                  }}
                  required
                  value={quantity}
                  suffix={` ${(productsData.filter(item => item.product_id === product_id))[0]?.product_unit || ''}`}
                />
              </div>
              <div className="form-group col-md-3">
                <label style={{ fontWeight: 600, color: '#1E2430' }}>
                  <i className="far fa-calendar-alt mr-1" style={{ color: '#C5953A' }} /> วันที่หมดอายุ (ถ้ามี)
                </label>
                <div>
                  <DatePicker
                    className="form-control"
                    dateFormat="dd-MMM-yyyy"
                    placeholderText="เลือกวันหมดอายุ"
                    selected={expireDate}
                    onChange={(date) => setexpireDate(date)}
                    isClearable={true}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="card-footer d-flex justify-content-end" style={{ backgroundColor: '#F8F9FC', padding: '14px 24px' }}>
            <button
              type="reset"
              onClick={() => doReset()}
              className="btn btn-light px-4 mr-2"
              style={{ borderRadius: '10px', fontWeight: 500, border: '1px solid #CBD5E0' }}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="btn px-4"
              style={{ backgroundColor: '#C5953A', color: '#FFFFFF', borderRadius: '10px', fontWeight: 600 }}
            >
              <i className="fas fa-check-circle mr-1" /> ตกลงรับสต๊อก
            </button>
          </div>
        </form>
      </div>
    )
  }

  const renderStockDetails = useMemo(() => {
    const columns = [
      {
        header: 'ชื่อสินค้า',
        accessorKey: 'product_name',
        Cell: ({ cell }) => <strong style={{ color: '#1E2430' }}>{cell.getValue()}</strong>
      },
      {
        header: 'ชนิดสินค้า',
        accessorKey: 'product_type',
      },
      {
        header: 'จำนวนสินค้า',
        accessorKey: 'quantity',
        Cell: ({ cell, row }) => (
          <span className="badge px-2 py-1" style={{ backgroundColor: 'rgba(85, 197, 217, 0.15)', color: '#1E2430', borderRadius: '6px', fontSize: '0.9rem' }}>
            {cell.getValue() + ' ' + row.original.product_unit}
          </span>
        )
      },
      {
        header: 'สเปคสินค้า',
        accessorKey: 'spec',
      },
      {
        header: 'รายละเอียดสินค้า',
        accessorKey: 'description',
      },
      {
        header: 'สร้างโดย',
        accessorKey: 'createdByName',
      },
      {
        header: 'วันที่สร้าง',
        accessorKey: 'createdAt',
        Cell: ({ cell }) => moment(cell.getValue()).format("DD-MMM-yyyy HH:mm:ss")
      },
      {
        header: 'แก้ไขโดย',
        accessorKey: 'updatedByName',
      },
      {
        header: 'วันที่แก้ไขล่าสุด',
        accessorKey: 'updatedAt',
        Cell: ({ cell }) => moment(cell.getValue()).format("DD-MMM-yyyy HH:mm:ss")
      },
    ]
    if (stockDetail.length > 0) {
      return (
        <div className="col-sm-12 mb-4">
          <div className="card shadow-sm border-0 m-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <div className="card-header" style={{ backgroundColor: '#1E2430', color: '#E9C070', padding: '16px 24px', borderBottom: '3px solid #55C5D9' }}>
              <h3 className="card-title m-0" style={{ fontWeight: 600, fontSize: '1.1rem', color: '#E9C070' }}>
                <i className="fas fa-clipboard-list mr-2" style={{ color: '#55C5D9' }} /> รายละเอียดสต๊อก (Stock Lot Details)
              </h3>
            </div>
            <div className="card-body" style={{ zIndex: 0, padding: '20px' }}>
              <MaterialReactTable
                columns={columns}
                data={stockDetail}
                enableColumnOrdering
                enableStickyHeader
                enableStickyFooter
                initialState={{ pagination: { pageSize: 100 } }}
                muiTablePaperProps={{
                  elevation: 0,
                  sx: { borderRadius: '12px', border: '1px solid #EDF2F7' }
                }}
              />
            </div>
          </div>
        </div>
      )
    }
  }, [stockDetail])

  const renderSummaryStock = useMemo(() => {
    if (summaryStock.length > 0) {
      const columns = [
        {
          header: 'ชื่อสินค้า',
          accessorKey: 'product_name',
          Cell: ({ cell }) => <strong style={{ color: '#1E2430' }}>{cell.getValue()}</strong>
        },
        {
          header: 'สเปค',
          accessorKey: 'spec',
        },
        {
          header: 'จำนวนทั้งหมด',
          accessorKey: 'total',
          Cell: ({ cell, row }) => (
            <strong style={{ color: '#C5953A', fontSize: '1rem' }}>
              {cell.getValue() + ' ' + row.original.product_unit}
            </strong>
          )
        },
      ]
      return (
        <div className="col-sm-12 mb-4">
          <div className="card shadow-sm border-0 m-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <div className="card-header" style={{ backgroundColor: '#1E2430', color: '#E9C070', padding: '16px 24px', borderBottom: '3px solid #E9C070' }}>
              <h3 className="card-title m-0" style={{ fontWeight: 600, fontSize: '1.1rem', color: '#E9C070' }}>
                <i className="fas fa-layer-group mr-2" /> สรุปจำนวนสต๊อกคงเหลือ (Stock Summary)
              </h3>
            </div>
            <div className="card-body" style={{ zIndex: 0, padding: '20px' }}>
              <MaterialReactTable
                columns={columns}
                data={summaryStock}
                enableColumnOrdering
                enableStickyHeader
                enableStickyFooter
                initialState={{ pagination: { pageSize: 100 } }}
                muiTablePaperProps={{
                  elevation: 0,
                  sx: { borderRadius: '12px', border: '1px solid #EDF2F7' }
                }}
              />
            </div>
          </div>
        </div>
      )
    }
  }, [summaryStock])

  return (
    <div className="content-wrapper resizeable" style={{ backgroundColor: '#F8F9FC', minHeight: '100vh', paddingBottom: '2rem' }}>
      <ContentHeader header="รับสต๊อกสินค้า (Stock Receive)" />
      <section className="content">
        <div className="container-fluid">
          <LoadingScreen isLoad={isLoad} />
          <div className="row" style={{ minHeight: '100%' }}>
            {renderStockByProduct()}
            {renderSummaryStock}
            {renderStockDetails}
          </div>
        </div>
      </section>
    </div>
  )
}
