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

export default function StockIssues() {
  const [isLoad, setisLoad] = useState(false)
  const [key, setkey] = useState(0)

  const [users, setusers] = useState([])

  const [productsData, setproductsData] = useState([])
  const [productTypeDropDown, setproductTypeDropDown] = useState([])

  const [product_id, setproduct_id] = useState(0)
  const [quantity, setquantity] = useState('')
  const [maxQuantity, setmaxQuantity] = useState(0)

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
  const doIssuesStock = () => {
    Swal.fire({
      title: 'โปรดยืนยัน',
      text: `ต้องการจ่ายสต๊อก ${productsData.filter(data => data.product_id === product_id)[0]?.product_name} `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ตกลง',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setisLoad(true)
          const result = await httpClient.patch(server.stock.issue, { productId : product_id, quantity, updatedBy: localStorage.getItem(key.user_id) ?? 1 })

          setisLoad(false)
          if (result.data.api_result === OK) {
            
            Swal.fire({
              icon: 'success',
              title: 'สำเร็จ',
              text: `จ่ายสต๊อก ${productsData.filter(data => data.product_id === product_id)[0]?.product_name} สำเร็จ`
            }).then(() => {
              doReset()
              doGetStockDetail()
              doGetSummaryStock()
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'ล้มเหลว',
              text: `จ่ายสต๊อก ${productsData.filter(data => data.product_id === product_id)[0]?.product_name} ล้มเหลว`
            })
          }
        } catch (error) {
          console.log(error);
          setisLoad(false)
        }

      }
    })
  }
  const doReset = () => {
    setproduct_id(0)
    setquantity('')
    setkey(key + 1)
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

  //Render
  const renderStockByProduct = () => {
    return (
      <div className=" col-sm-12">
        <form onSubmit={(e) => {
          e.preventDefault()
          doIssuesStock()
        }} className="card card-dark">
          <div className="card-header"></div>
          <div className="card-body">
            <div className="form-group col-sm-12">
              <label >เลือกชนิดสินค้า</label>
              <Select
                key={key}
                className="basic-single"
                classNamePrefix="select"
                isClearable={false}
                isSearchable={true}
                options={productTypeDropDown}
                required={true}
                onChange={(data) => {
                  setproduct_id(data.value)
                  setmaxQuantity(summaryStock.filter(item => item.product_id === data.value)[0]?.total);
                }}
              />
            </div>
            <div className="form-group col-sm-12">
              <label >จำนวนที่จ่ายออก</label>
              <CurrencyFormat
                min={0} // Set the minimum value
                max={100} // Set the maximum value
                className="form-control"
                onValueChange={values => {
                  const { formattedValue, value } = values

                  const parsedValue = parseFloat(value);

                  // Define your minimum and maximum values
                  const minValue = 0;
                  const maxValue = maxQuantity;

                  // Check if the parsed value is within the allowed range
                  if (parsedValue >= minValue && parsedValue <= maxValue) {
                    setquantity(value);
                  } else if (parsedValue < minValue) {
                    setquantity(0)
                  } else {
                    setquantity('')
                  }
                }}
                required
                value={quantity}
                suffix={` ${(productsData.filter(item => item.product_id === product_id))[0]?.product_unit}`} />
            </div>
          </div>
          <div className="card-footer">
            <button type="submit" className="btn btn-primary">ตกลง</button>
            <button type="reset" onClick={() => doReset()} className="btn btn-default float-right">ยกเลิก</button>
          </div>
        </form>
      </div>
    )
  }

  const renderStockDetails = useMemo(() => {
    const columns = [
      {
        header: 'ชื่อสินค้า',
        accessorKey: 'product_name', //simple accessorKey pointing to flat data
      },
      {
        header: 'ชนิดสินค้า',
        accessorKey: 'product_type', //simple accessorKey pointing to flat data
      },
      {
        header: 'จำนวนสินค้า',
        accessorKey: 'quantity', //simple accessorKey pointing to flat data
        Cell: ({ cell, row }) => cell.getValue() + ' ' + row.original.product_unit
      },
      {
        header: 'สเปคสินค้า',
        accessorKey: 'spec', //simple accessorKey pointing to flat data
      },
      {
        header: 'รายละเอียดสินค้า',
        accessorKey: 'description', //simple accessorKey pointing to flat data
      },
      {
        header: 'สร้างโดย',
        accessorKey: 'createdByName', //simple accessorKey pointing to flat data
      },
      {
        header: 'วันที่สร้าง',
        accessorKey: 'createdAt', //simple accessorKey pointing to flat data
        Cell: ({ cell, row }) => moment(cell.getValue()).format("DD-MMM-yyyy HH:mm:ss")
      },
      {
        header: 'แก้ไขโดย',
        accessorKey: 'updatedByName', //simple accessorKey pointing to flat data
      },
      {
        header: 'วันที่แก้ไขล่าสุด',
        accessorKey: 'updatedAt', //simple accessorKey pointing to flat data
        Cell: ({ cell, row }) => moment(cell.getValue()).format("DD-MMM-yyyy HH:mm:ss")
      },
    ]
    if (stockDetail.length > 0) {
      return (
        <div className="card card-default col-sm-12">
          <div className="card-header">
            <div className="card-title">
              รายละเอียดสต๊อก
            </div>
          </div>
          <div className="card-body" style={{ zIndex: 0 }}>
            <MaterialReactTable
              columns={columns}
              data={stockDetail}
              enableColumnOrdering
              enableStickyHeader
              enableStickyFooter
              initialState={{ pagination: { pageSize: 100, } }}
            />
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
          accessorKey: 'product_name', //simple accessorKey pointing to flat data
        },
        {
          header: 'สเปค',
          accessorKey: 'spec', //simple accessorKey pointing to flat data
        },
        {
          header: 'จำนวนทั้งหมด',
          accessorKey: 'total', //simple accessorKey pointing to flat data
          Cell: ({ cell, row }) => cell.getValue() + ' ' + row.original.product_unit
        },
      ]
      return (
        <div className="card card-default col-sm-12">
          <div className="card-header">
            <div className="card-title">
              สรุปจำนวนสต๊อก
            </div>
          </div>
          <div className="card-body" style={{ zIndex: 0 }}>
            <MaterialReactTable

              columns={columns}
              data={summaryStock}
              enableColumnOrdering
              enableStickyHeader
              enableStickyFooter
              initialState={{ pagination: { pageSize: 100, } }}
            />
          </div>
        </div>
      )
    }
  }, [summaryStock])

  return (
    <div className="content-wrapper resizeable">
      <ContentHeader header="จ่ายสต๊อก" />
      <section className="content ">
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
