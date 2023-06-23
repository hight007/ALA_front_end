import React, { useEffect, useState } from "react";
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
import CurrencyFormat from 'react-currency-format';

export default function Product() {

  const [isLoad, setisLoad] = useState(false)
  const [isCreate, setisCreate] = useState(true)

  const [modalIsOpen, setmodalIsOpen] = useState(false)
  const [sugressionsProductTypeList, setsugressionsProductTypeList] = useState([])

  const [productsData, setproductsData] = useState([])

  const [product_id, setproduct_id] = useState('')
  const [product_name, setproduct_name] = useState('')
  const [product_type, setproduct_type] = useState('')
  const [spec, setspec] = useState('')
  const [description, setdescription] = useState('')
  const [product_unit, setproduct_unit] = useState('')
  const [alertQuantity, setalertQuantity] = useState(0)

  useEffect(() => {
    doGetProducts()
  }, [])

  //Modal
  const openModal = () => {
    setmodalIsOpen(true)
    doGetSugressionsProductTypeList()
  }
  const closeModal = () => {
    setmodalIsOpen(false)
    setproduct_name('')
    setproduct_type('')
    setspec('')
    setproduct_unit('')
    setdescription('')
    setalertQuantity(0)
    setproduct_id(0)
  }

  //Action
  const doGetSugressionsProductTypeList = async () => {
    const result = await httpClient.get(server.product.sugressionProductType)
    result.data.api_result === OK ? setsugressionsProductTypeList(result.data.result) : setsugressionsProductTypeList([])
  }
  const doCreate = () => {
    Swal.fire({
      title: 'โปรดยืนยัน',
      text: `ต้องการเพิ่มสินค้า ${product_name} `,
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
          const result = await httpClient.post(server.product.product, { product_name, product_type, spec, description, alertQuantity, product_unit, createdBy: localStorage.getItem(key.user_id) ?? 1 })
          setisLoad(false)
          if (result.data.api_result === OK) {
            doGetProducts()
            Swal.fire({
              icon: 'success',
              title: 'สำเร็จ',
              text: `เพิ่มสินค้า ${product_name} สำเร็จ`
            }).then(() => closeModal());
          } else {
            Swal.fire({
              icon: 'error',
              title: 'ล้มเหลว',
              text: `เพิ่มสินค้า ${product_name} ล้มเหลว`
            })
          }
        } catch (error) {
          setisLoad(false)
        }

      }
    })
  }
  const doUpdate = () => {
    Swal.fire({
      title: 'โปรดยืนยัน',
      text: `ต้องการแก้ไข ${product_name} `,
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
          const result = await httpClient.patch(server.product.product, {product_id, product_name, product_type, spec, description, alertQuantity, product_unit, updatedBy: localStorage.getItem(key.user_id) ?? 1 })
          setisLoad(false)
          if (result.data.api_result == OK) {
            doGetProducts()
            Swal.fire({
              icon: 'success',
              title: 'สำเร็จ',
              text: `แก้ไขสินค้า ${product_name} สำเร็จ`
            }).then(() => closeModal());
          } else {
            Swal.fire({
              icon: 'error',
              title: 'ล้มเหลว',
              text: `แก้ไขสินค้า ${product_name} ล้มเหลว`
            })
          }
        } catch (error) {
          console.log(error);
          setisLoad(false)
        }

      }
    })
  }
  const doSetIsDeleted = (product_id_, product_name_ , isDeleted) => {
    Swal.fire({
      title: 'โปรดยืนยัน',
      text: `ต้องการ${isDeleted ? 'ลบ' : 'เปิดการใช้งาน' } ${product_name_} `,
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
          const result = await httpClient.patch(server.product.product,  { product_id: product_id_, isDeleted })
          setisLoad(false)
          if (result.data.api_result == OK) {
            doGetProducts()
            Swal.fire({
              icon: 'success',
              title: 'สำเร็จ',
              text: `${isDeleted ? 'ลบ' : 'เปิดการใช้งาน' }สินค้า ${product_name_} สำเร็จ`
            }).then(() => closeModal());
          } else {
            Swal.fire({
              icon: 'error',
              title: 'ล้มเหลว',
              text: `${isDeleted ? 'ลบ' : 'เปิดการใช้งาน' }สินค้า ${product_name_} ล้มเหลว`
            })
          }
        } catch (error) {
          console.log(error);
          setisLoad(false)
        }

      }
    })
  }
  const doGetProducts = async () => {
    try {
      setisLoad(true)
      const response = await httpClient.get(server.product.product)
      if (response.data.api_result === OK) {
        await setproductsData(response.data.result)
      }
    } catch (error) {

    } finally {
      setisLoad(false)
    }
  }
  const setStateForEdit = (productResult) => {
    setproduct_name(productResult.product_name)
    setproduct_type(productResult.product_type)
    setspec(productResult.spec)
    setdescription(productResult.description)
    setalertQuantity(productResult.alertQuantity)
    setproduct_unit(productResult.default_total_quantity)
    setalertQuantity(productResult.alertQuantity)
    setproduct_unit(productResult.product_unit)
  }

  //Render
  const renderModalProduct = () => {
    const renderSugressionsProductType = () => {
      return sugressionsProductTypeList.map((item) => <option value={item.productType} />);
    };

    return <Modal
      isOpen={modalIsOpen}
      style={{
        content: {
          transform: 'translate(0%, 0%)',
          overlfow: 'scroll' // <-- This tells the modal to scrol
        },
      }}
      className="content-wrapper resizeable"
    >
      <div className="row" style={{ margin: '5%', marginTop: '15%', padding: '0%', backgroundColor: 'rgba(0,0,0,0)', overflow: 'auto' }}>
        <div className="col-sm-12" >

          <div className="card card-dark bg-main2">
            <div className="card-header">
              <h3 class="card-title">{isCreate ? 'เพิ่มสินค้าใหม่' : 'แก้ไขสินค้า'}</h3>
              <div class="card-tools">
                <button type="button" class="btn btn-tool" onClick={(e) => {
                  closeModal();
                }}><i className="fas fa-times" />

                </button>
              </div>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              isCreate ? doCreate() : doUpdate()
            }}>
              <div className="card-body row">
                <div className="col-sm-12" style={{ textAlign: 'center' }}>
                  <img
                    src="/img/ALA_logo.png"
                    alt="ALA Logo"

                  // style={{ opacity: "1", width: "15%", borderRadius: '50%', padding: 5, backgroundColor: 'black' }}
                  />
                  <hr />
                </div>
                <div className="form-group col-sm-12">
                  <label >ชื่อสินค้า</label>
                  <input value={product_name} onChange={(e) => setproduct_name(e.target.value)} required className="form-control" placeholder="กรอกชื่อสินค้า" />
                </div>
                <div className="form-group col-sm-12">
                  <datalist id="sugressionProductType">{renderSugressionsProductType()}</datalist>
                  <label >ชนิดสินค้า</label>
                  <input list="sugressionProductType" value={product_type} onChange={(e) => setproduct_type(e.target.value)} className="form-control" placeholder="กรอกชนิดสินค้า" />
                </div>
                <div className="form-group col-sm-12">
                  <label >สเปคสินค้า</label>
                  <textarea value={spec} onChange={(e) => setspec(e.target.value)} rows={1} className="form-control" placeholder="กรอกสเปคสินค้า" />
                </div>
                <div className="form-group col-sm-12">
                  <label >คำอธิบายสินค้า</label>
                  <textarea value={description} onChange={(e) => setdescription(e.target.value)} rows={3} className="form-control" placeholder="กรอกคำอธิบายสินค้า" />
                </div>
                <div className="form-group col-sm-12">
                  <label >แจ้งเตือนจำนวนสินค้าเมื่อถึงจำนวนที่กำหนด</label>
                  <input value={alertQuantity} type="number" onChange={(e) => setalertQuantity(e.target.value)} className="form-control" />
                </div>
                <div className="form-group col-sm-12">
                  <label >หน่วยสินค้า</label>
                  <input
                    className="form-control"
                    value={product_unit}
                    list="unit_suffix"
                    onChange={(e) => {
                      setproduct_unit(e.target.value)
                    }}
                  />
                  <datalist id="unit_suffix">
                    <option value="cc" />
                    <option value="ชิ้น" />
                    <option value="mg" />
                  </datalist>
                </div>

              </div>
              <div className="card-footer">
                <button type="submit" className="btn btn-dark">ตกลง</button>
                <button type="reset" onClick={() => closeModal()} className="btn btn-default float-right">ยกเลิก</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Modal>
  }
  const renderProducts = () => {
    const columns = [
      {
        header: 'จัดการ',
        accessorKey: 'product_id',
        Cell: ({ cell, row }) => (
          <>
            <button style={{ marginRight: 5 }} className="btn btn-warning" onClick={async (e) => {
              e.preventDefault()
              setisCreate(false)
              setisLoad(true)
              setproduct_id(cell.getValue())
              const productResult = await httpClient.get(server.product.findProduct + `/${cell.getValue()}`)
              setStateForEdit(productResult.data.result)
              setisLoad(false)
              openModal()
            }
            }>
              <FontAwesomeIcon icon={iconsModule.faEdit} />
            </button>
            <button style={{ marginRight: 5 }} className={`btn btn-${row.original.isDeleted ? 'danger' : 'success'}`} onClick={async (e) => {
              doSetIsDeleted(cell.getValue() , row.original.product_name , !row.original.isDeleted)
            }
            }>
              <FontAwesomeIcon icon={iconsModule.faPowerOff} />
            </button>
          </>
        )
      },
      {
        header: 'ลบ',
        accessorKey: 'isDeleted', //simple accessorKey pointing to flat data
        Cell: ({ cell, row }) => (cell.getValue().toString())
      },
      {
        header: 'ชนิดสินค้า',
        accessorKey: 'product_type', //simple accessorKey pointing to flat data
      },
      {
        header: 'ชื่อสินค้า',
        accessorKey: 'product_name', //simple accessorKey pointing to flat data
      },
      {
        header: 'สเปค',
        accessorKey: 'spec', //simple accessorKey pointing to flat data
      },
      {
        header: 'คำอธิบาย',
        accessorKey: 'description', //simple accessorKey pointing to flat data
      },
      {
        header: 'จำนวนที่ต้องแจ้งเตือน',
        accessorKey: 'alertQuantity', //simple accessorKey pointing to flat data
      },
      {
        header: 'หน่วย',
        accessorKey: 'product_unit', //simple accessorKey pointing to flat data
      },
      {
        header: 'สร้างโดย',
        accessorKey: 'createdBy', //simple accessorKey pointing to flat data
      },
      {
        header: 'วันที่สร้าง',
        accessorKey: 'createdAt', //simple accessorKey pointing to flat data
        Cell: ({ cell, row }) => moment(cell.getValue()).format("DD-MMM-yyyy HH:mm:ss")
      },
      {
        header: 'แก้ไขโดย',
        accessorKey: 'updatedBy', //simple accessorKey pointing to flat data
      },
      {
        header: 'วันที่แก้ไขล่าสุด',
        accessorKey: 'updatedAt', //simple accessorKey pointing to flat data
        Cell: ({ cell, row }) => moment(cell.getValue()).format("DD-MMM-yyyy HH:mm:ss")
      },
    ]

    if (productsData.length > 0) {

      return <MaterialReactTable
        columns={columns}
        data={productsData}
        enableColumnOrdering
        enableStickyHeader
        enableStickyFooter
      />
    }
  }

  return (
    <div className="content-wrapper resizeable bg-main2">
      <ContentHeader header="จัดการสินค้า" />
      <section className="content ">
        <div className="container-fluid">
          <LoadingScreen isLoad={isLoad} />
          <div className="row" style={{ minHeight: '100%' }}>
            <div className="col-md-12" style={{ textAlign: "center" }}>
              <div className="card card-dark">
                <div className="card-header ">
                  <button className="btn btn-dark" onClick={() => {
                    setisCreate(true)
                    openModal()
                  }}>
                    <FontAwesomeIcon style={{ marginRight: 5 }} icon={iconsModule.faBox} />
                    เพิ่มสินค้าใหม่
                  </button>
                </div>
                <div className="card-body">
                  {/* {renderActive()} */}
                  {renderModalProduct()}
                  {renderProducts()}

                </div>
                <div className="card-footer"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
