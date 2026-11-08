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
      confirmButtonColor: '#C5953A',
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
      confirmButtonColor: '#C5953A',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ตกลง',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setisLoad(true)
          const result = await httpClient.patch(server.product.product, { product_id, product_name, product_type, spec, description, alertQuantity, product_unit, updatedBy: localStorage.getItem(key.user_id) ?? 1 })
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
  const doSetIsDeleted = (product_id_, product_name_, isDeleted) => {
    Swal.fire({
      title: 'โปรดยืนยัน',
      text: `ต้องการ${isDeleted ? 'ลบ' : 'เปิดการใช้งาน'} ${product_name_} `,
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
          const result = await httpClient.patch(server.product.product, { product_id: product_id_, isDeleted })
          setisLoad(false)
          if (result.data.api_result == OK) {
            doGetProducts()
            Swal.fire({
              icon: 'success',
              title: 'สำเร็จ',
              text: `${isDeleted ? 'ลบ' : 'เปิดการใช้งาน'}สินค้า ${product_name_} สำเร็จ`
            }).then(() => closeModal());
          } else {
            Swal.fire({
              icon: 'error',
              title: 'ล้มเหลว',
              text: `${isDeleted ? 'ลบ' : 'เปิดการใช้งาน'}สินค้า ${product_name_} ล้มเหลว`
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
      return sugressionsProductTypeList.map((item, idx) => <option key={idx} value={item.productType} />);
    };

    return (
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        ariaHideApp={false}
        style={{
          overlay: {
            backgroundColor: 'rgba(30, 36, 48, 0.65)',
            backdropFilter: 'blur(4px)',
            zIndex: 1050,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          },
          content: {
            position: 'relative',
            inset: 'auto',
            border: 'none',
            background: 'transparent',
            padding: 0,
            maxWidth: '720px',
            width: '100%',
            maxHeight: 'calc(100vh - 2rem)',
            overflowY: 'auto'
          },
        }}
      >
        <div className="card shadow-lg border-0 m-0" style={{ borderRadius: '20px', overflow: 'hidden', textAlign: 'left' }}>
          <div
            className="card-header d-flex align-items-center justify-content-between"
            style={{
              backgroundColor: '#1E2430',
              color: '#E9C070',
              padding: '18px 24px',
              borderBottom: '3px solid #C5953A'
            }}
          >
            <h3 className="card-title m-0" style={{ fontWeight: 600, fontSize: '1.2rem', color: '#E9C070' }}>
              <FontAwesomeIcon style={{ marginRight: 8 }} icon={isCreate ? iconsModule.faBoxOpen : iconsModule.faEdit} />
              {isCreate ? 'เพิ่มสินค้าใหม่ (New Product)' : 'แก้ไขสินค้า (Edit Product)'}
            </h3>
            <button
              type="button"
              className="btn btn-sm"
              style={{ color: '#E9C070', fontSize: '1.1rem' }}
              onClick={() => closeModal()}
            >
              <i className="fas fa-times" />
            </button>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            isCreate ? doCreate() : doUpdate()
          }}>
            <div className="card-body row" style={{ padding: '24px' }}>
              <div className="col-sm-12 text-center mb-3">
                <img
                  src="/img/ALA_logo.png"
                  alt="ALA Logo"
                  style={{ maxHeight: '75px', borderRadius: '12px' }}
                />
              </div>
              <div className="form-group col-sm-6">
                <label style={{ fontWeight: 600, color: '#1E2430' }}>ชื่อสินค้า (Product Name)</label>
                <input
                  value={product_name}
                  onChange={(e) => setproduct_name(e.target.value)}
                  required
                  className="form-control"
                  style={{ borderRadius: '10px', height: '42px' }}
                  placeholder="กรอกชื่อสินค้า"
                />
              </div>
              <div className="form-group col-sm-6">
                <datalist id="sugressionProductType">{renderSugressionsProductType()}</datalist>
                <label style={{ fontWeight: 600, color: '#1E2430' }}>ชนิดสินค้า (Category / Type)</label>
                <input
                  list="sugressionProductType"
                  value={product_type}
                  onChange={(e) => setproduct_type(e.target.value)}
                  className="form-control"
                  style={{ borderRadius: '10px', height: '42px' }}
                  placeholder="กรอกชนิดสินค้า"
                />
              </div>
              <div className="form-group col-sm-6">
                <label style={{ fontWeight: 600, color: '#1E2430' }}>แจ้งเตือนเมื่อถึงจำนวนที่กำหนด (Alert Qty)</label>
                <input
                  value={alertQuantity}
                  type="number"
                  onChange={(e) => setalertQuantity(e.target.value)}
                  className="form-control"
                  style={{ borderRadius: '10px', height: '42px' }}
                />
              </div>
              <div className="form-group col-sm-6">
                <label style={{ fontWeight: 600, color: '#1E2430' }}>หน่วยสินค้า (Unit)</label>
                <input
                  className="form-control"
                  style={{ borderRadius: '10px', height: '42px' }}
                  value={product_unit}
                  list="unit_suffix"
                  placeholder="เช่น cc, ชิ้น, mg"
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
              <div className="form-group col-sm-12">
                <label style={{ fontWeight: 600, color: '#1E2430' }}>สเปคสินค้า (Specification)</label>
                <textarea
                  value={spec}
                  onChange={(e) => setspec(e.target.value)}
                  rows={2}
                  className="form-control"
                  style={{ borderRadius: '10px' }}
                  placeholder="กรอกสเปคสินค้า"
                />
              </div>
              <div className="form-group col-sm-12 mb-0">
                <label style={{ fontWeight: 600, color: '#1E2430' }}>คำอธิบายสินค้า (Description)</label>
                <textarea
                  value={description}
                  onChange={(e) => setdescription(e.target.value)}
                  rows={3}
                  className="form-control"
                  style={{ borderRadius: '10px' }}
                  placeholder="กรอกคำอธิบายสินค้า"
                />
              </div>
            </div>
            <div className="card-footer d-flex justify-content-between align-items-center" style={{ backgroundColor: '#F8F9FC', padding: '16px 24px' }}>
              <button
                type="reset"
                onClick={() => closeModal()}
                className="btn btn-light px-4"
                style={{ borderRadius: '10px', fontWeight: 500, border: '1px solid #CBD5E0' }}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="btn px-4"
                style={{ backgroundColor: '#C5953A', color: '#FFFFFF', borderRadius: '10px', fontWeight: 600 }}
              >
                <i className="fas fa-check mr-1" /> ตกลง
              </button>
            </div>
          </form>
        </div>
      </Modal>
    )
  }

  const renderProducts = () => {
    const columns = [
      {
        header: 'จัดการ',
        accessorKey: 'product_id',
        size: 110,
        Cell: ({ cell, row }) => (
          <div className="d-flex align-items-center">
            <button
              style={{ marginRight: 6, borderRadius: '8px', backgroundColor: '#E9C070', color: '#1E2430', border: 'none' }}
              className="btn btn-sm px-2 py-1"
              title="แก้ไขสินค้า"
              onClick={async (e) => {
                e.preventDefault()
                setisCreate(false)
                setisLoad(true)
                setproduct_id(cell.getValue())
                const productResult = await httpClient.get(server.product.findProduct + `/${cell.getValue()}`)
                setStateForEdit(productResult.data.result)
                setisLoad(false)
                openModal()
              }}
            >
              <FontAwesomeIcon icon={iconsModule.faEdit} />
            </button>
            <button
              style={{ borderRadius: '8px' }}
              className={`btn btn-sm px-2 py-1 btn-${row.original.isDeleted ? 'danger' : 'success'}`}
              title={row.original.isDeleted ? 'เปิดการใช้งาน' : 'ระงับการใช้งาน'}
              onClick={async (e) => {
                doSetIsDeleted(cell.getValue(), row.original.product_name, !row.original.isDeleted)
              }}
            >
              <FontAwesomeIcon icon={iconsModule.faPowerOff} />
            </button>
          </div>
        )
      },
      {
        header: 'สถานะ',
        accessorKey: 'isDeleted',
        size: 100,
        Cell: ({ cell }) => (
          <span
            className="badge px-2 py-1"
            style={{
              backgroundColor: cell.getValue() ? 'rgba(220, 53, 69, 0.15)' : 'rgba(40, 167, 69, 0.15)',
              color: cell.getValue() ? '#DC3545' : '#28A745',
              borderRadius: '6px'
            }}
          >
            {cell.getValue() ? 'ระงับใช้งาน' : 'ปกติ'}
          </span>
        )
      },
      {
        header: 'ชนิดสินค้า',
        accessorKey: 'product_type',
      },
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
        header: 'คำอธิบาย',
        accessorKey: 'description',
      },
      {
        header: 'จำนวนแจ้งเตือน',
        accessorKey: 'alertQuantity',
      },
      {
        header: 'หน่วย',
        accessorKey: 'product_unit',
      },
      {
        header: 'สร้างโดย',
        accessorKey: 'createdBy',
      },
      {
        header: 'วันที่สร้าง',
        accessorKey: 'createdAt',
        Cell: ({ cell }) => moment(cell.getValue()).format("DD-MMM-yyyy HH:mm:ss")
      },
      {
        header: 'แก้ไขโดย',
        accessorKey: 'updatedBy',
      },
      {
        header: 'วันที่แก้ไขล่าสุด',
        accessorKey: 'updatedAt',
        Cell: ({ cell }) => moment(cell.getValue()).format("DD-MMM-yyyy HH:mm:ss")
      },
    ]

    if (productsData.length > 0) {
      return (
        <MaterialReactTable
          columns={columns}
          data={productsData}
          enableColumnOrdering
          enableStickyHeader
          enableStickyFooter
          muiTablePaperProps={{
            elevation: 0,
            sx: { borderRadius: '12px', border: '1px solid #EDF2F7' }
          }}
          muiTableHeadCellProps={{
            sx: {
              backgroundColor: '#1E2430',
              color: '#E9C070',
              fontWeight: 600,
            }
          }}
        />
      )
    }
  }

  return (
    <div className="content-wrapper resizeable" style={{ backgroundColor: '#F8F9FC', minHeight: '100vh', paddingBottom: '2rem' }}>
      <ContentHeader header="จัดการสินค้า (Product Catalog)" />
      <section className="content">
        <div className="container-fluid">
          <LoadingScreen isLoad={isLoad} />
          <div className="row" style={{ minHeight: '100%' }}>
            <div className="col-md-12">
              <div className="card shadow-sm border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <div
                  className="card-header d-flex align-items-center justify-content-between"
                  style={{ backgroundColor: '#1E2430', color: '#E9C070', padding: '16px 24px', borderBottom: '3px solid #E9C070' }}
                >
                  <h3 className="card-title m-0" style={{ fontWeight: 600, fontSize: '1.1rem', color: '#E9C070' }}>
                    <FontAwesomeIcon style={{ marginRight: 8 }} icon={iconsModule.faBoxes} />
                    รายการสินค้าคลินิก ({productsData.length} รายการ)
                  </h3>
                  <button
                    className="btn px-3"
                    style={{ backgroundColor: '#C5953A', color: '#FFFFFF', borderRadius: '10px', fontWeight: 600 }}
                    onClick={() => {
                      setisCreate(true)
                      openModal()
                    }}
                  >
                    <FontAwesomeIcon style={{ marginRight: 6 }} icon={iconsModule.faPlusCircle} />
                    เพิ่มสินค้าใหม่
                  </button>
                </div>
                <div className="card-body" style={{ padding: '24px' }}>
                  {renderModalProduct()}
                  {renderProducts()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
