import React, { Component } from "react";

class Stock extends Component {
  render() {
    return (
      <div className="content-wrapper" style={{ backgroundColor: '#F8F9FC', minHeight: '100vh', paddingBottom: '2rem' }}>
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-3 align-items-center">
              <div className="col-sm-6">
                <h1 className="m-0" style={{ color: '#1E2430', fontWeight: 700, fontSize: '1.75rem' }}>
                  <i className="fas fa-warehouse mr-2" style={{ color: '#C5953A' }} />
                  รายงานสต๊อกสินค้า (Stock Report)
                </h1>
              </div>
            </div>
          </div>
        </section>
        <section className="content">
          <div className="container-fluid">
            <div className="card shadow-sm border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <div className="card-header" style={{ backgroundColor: '#1E2430', color: '#E9C070', padding: '16px 24px', borderBottom: '3px solid #E9C070' }}>
                <h3 className="card-title m-0" style={{ fontWeight: 600, fontSize: '1.1rem', color: '#E9C070' }}>
                  <i className="fas fa-boxes mr-2" /> ภาพรวมสต๊อกสินค้าคลินิก
                </h3>
              </div>
              <div className="card-body text-center py-5">
                <i className="fas fa-box-open fa-3x mb-3" style={{ color: '#E9C070' }} />
                <h5 style={{ color: '#1E2430', fontWeight: 600 }}>Stock Management Overview</h5>
                <p className="text-muted mb-0">สามารถตรวจสอบและทำรายการรับ-จ่ายสต๊อกได้ที่เมนูจัดการสต๊อกสินค้า</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

export default Stock;
