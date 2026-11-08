import React, { Component } from "react";
import { key, server, OK } from '../../../constants';
import { httpClient } from '../../../utils/HttpClient';
import _ from "lodash";
import Swal from 'sweetalert2';
import moment from 'moment';

class User extends Component {
  constructor(props) {
    super(props)

    this.state = {
      tableHeader: [],
      tableData: [],
    }
  }

  componentDidMount = async () => {
    this.doGetUser()
    this.debounceSearch = _.debounce(this.findUserByKey, 500);
  }

  findUserByKey = async (e) => {
    if (e.target.value != '') {
      let result = await httpClient.get(server.FIND_USER_URL + '/' + e.target.value)
      if (result.data.result.length > 0) {
        this.setState({
          tableData: result.data.result,
        })
      } else {
        this.setState({
          tableData: [],
        })
      }
    } else {
      this.doGetUser()
    }
  }

  searchChanged = (e) => {
    e.persist();
    this.debounceSearch(e);
  };

  doGetUser = async () => {
    let result = await httpClient.get(server.USER_URL)
    if (result.data.result.length > 0) {
      let tableHeader = Object.keys(result.data.result[0])
      tableHeader.push('Action')
      this.setState({
        tableData: result.data.result,
        tableHeader,
      })
    }
  }

  doDeleteUser = async (username) => {
    Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: "ต้องการลบผู้ใช้งาน : " + username + ", ลบแล้วจะไม่สามารถนำผู้ใช้งานคืนมาได้",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#C5953A',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const data = {
          updater: localStorage.getItem(key.USER_NAME),
          username
        }
        let response = await httpClient.delete(server.USER_URL, { data })
        Swal.fire(
          'ลบข้อผู้ใช้งานสำเร็จ!',
          'ผู้ใช้งาน ' + username + ' ถูกลบสำเร็จ',
          'success'
        ).then(() => this.doGetUser())
      }
    })
  }

  renderTableRow = () => {
    const generateTableData = (data) => {
      return this.state.tableHeader.map((header, idx) => (
        <td key={idx} className="align-middle" style={{ padding: '14px 16px' }}>
          {renderRow(data, header)}
        </td>
      ))
    }

    const renderRow = (data, header) => {
      if (header == 'lastLogOn') {
        return (
          <span className="text-muted">
            <i className="far fa-clock mr-1" style={{ color: '#C5953A' }} />
            {moment(data[header]).format('DD-MMM-YYYY HH:mm:ss')}
          </span>
        )
      } else {
        switch (header) {
          case 'levelUser':
            return renderOptions(data[header], data['username'])
          case 'Action':
            return (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  this.doDeleteUser(data.username)
                }}
                className="btn btn-sm btn-outline-danger px-3"
                style={{ borderRadius: '8px', fontWeight: 500 }}
              >
                <i className="fas fa-trash-alt mr-1" /> Delete
              </button>
            )

          default:
            return <span style={{ fontWeight: header === 'username' ? 600 : 400, color: '#1E2430' }}>{data[header]}</span>
        }
      }
    }

    const renderOptions = (levelUser, username) => {
      return (
        <select
          className="form-control form-control-sm"
          style={{
            borderRadius: '8px',
            borderColor: '#E9C070',
            minWidth: '120px',
            fontWeight: 500,
            color: '#1E2430'
          }}
          onChange={(e) => {
            this.doChangeLevel(e.target.value, username)
          }}
        >
          <option selected={levelUser == 'admin' ? true : false}>
            admin
          </option>
          <option selected={levelUser == 'power' ? true : false}>
            power
          </option>
          <option selected={levelUser == 'doctor' ? true : false}>
            doctor
          </option>
          <option selected={levelUser == 'user' ? true : false}>
            user
          </option>
          <option selected={levelUser == 'guest' ? true : false}>
            guest
          </option>
        </select>
      )
    }

    if (this.state.tableData.length === 0) {
      return (
        <tr>
          <td colSpan={this.state.tableHeader.length || 5} className="text-center py-5 text-muted">
            <i className="fas fa-users-slash fa-2x mb-2 d-block" style={{ color: '#E9C070' }} />
            ไม่พบข้อมูลผู้ใช้งาน
          </td>
        </tr>
      )
    }

    return this.state.tableData.map((item, idx) => (
      <tr key={idx}>{generateTableData(item)}</tr>
    ))
  }

  renderTableHeader = () => {
    return this.state.tableHeader.map((item, idx) => (
      <th
        key={idx}
        className="sorting"
        rowSpan={1}
        colSpan={1}
        style={{
          backgroundColor: '#1E2430',
          color: '#E9C070',
          borderBottom: '2px solid #C5953A',
          padding: '14px 16px',
          fontWeight: 600,
          textTransform: 'capitalize'
        }}
      >
        {item}
      </th>
    ))
  }

  doChangeLevel = (levelUser, username) => {
    Swal.fire({
      title: 'ต้องการเปลี่ยนระดับข้อมผู้ใช้งานหรือไม่?',
      showCancelButton: true,
      confirmButtonColor: '#C5953A',
      confirmButtonText: `Change`,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const changedData = {
          levelUser,
          username,
          updater: localStorage.getItem(key.USER_NAME)
        }
        let response = await httpClient.put(server.CHANGE_LV_URL, changedData)
        if (response.data.api_result === OK) {
          Swal.fire('สำเร็จ!', 'เปลี่ยนระดับผู้ใช้งานเรียบร้อย', 'success').then(() => this.doGetUser())
        } else {
          Swal.fire('Error!', response.data.error, 'error').then(() => this.doGetUser())
        }
      }
    })
  }

  render() {
    return (
      <div className="content-wrapper" style={{ backgroundColor: '#F8F9FC', minHeight: '100vh', paddingBottom: '2rem' }}>
        <section className="content-header">
          <div className="container-fluid">
            <div className="row mb-3 align-items-center">
              <div className="col-sm-6">
                <h1 className="m-0" style={{ color: '#1E2430', fontWeight: 700, fontSize: '1.75rem' }}>
                  <i className="fas fa-users-cog mr-2" style={{ color: '#C5953A' }} />
                  จัดการผู้ใช้งาน (User Management)
                </h1>
              </div>
              <div className="col-sm-6 text-sm-right">
                <span className="badge px-3 py-2" style={{ backgroundColor: '#1E2430', color: '#E9C070', borderRadius: '20px', fontSize: '0.9rem' }}>
                  <i className="fas fa-user-check mr-1" /> ทั้งหมด {this.state.tableData.length} บัญชี
                </span>
              </div>
            </div>
          </div>
        </section>
        <section className="content">
          <div className="container-fluid">
            <div className="row">
              <div className="col-12">
                <div className="card shadow-sm border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                  <div className="card-header d-flex align-items-center justify-content-between" style={{ backgroundColor: '#1E2430', color: '#FFFFFF', padding: '16px 24px', borderBottom: '3px solid #E9C070' }}>
                    <h3 className="card-title m-0" style={{ fontWeight: 600, fontSize: '1.1rem', color: '#E9C070' }}>
                      <i className="fas fa-id-badge mr-2" /> รายชื่อผู้ใช้งานในระบบ
                    </h3>
                  </div>
                  <div className="card-body" style={{ padding: '24px' }}>
                    <div className="row mb-4">
                      <div className="col-md-6 col-lg-5">
                        <div className="input-group">
                          <div className="input-group-prepend">
                            <span className="input-group-text" style={{ backgroundColor: '#1E2430', color: '#E9C070', border: '1px solid #1E2430', borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px' }}>
                              <i className="fas fa-search" />
                            </span>
                          </div>
                          <input
                            onChange={(e) => this.searchChanged(e)}
                            type="search"
                            className="form-control"
                            placeholder="ค้นหาชื่อผู้ใช้งาน (Search username)..."
                            style={{ borderTopRightRadius: '10px', borderBottomRightRadius: '10px', height: '42px' }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="table-responsive" style={{ borderRadius: '12px', border: '1px solid #EDF2F7' }}>
                      <table
                        id="example2"
                        className="table table-hover text-nowrap mb-0"
                        role="grid"
                        aria-describedby="example2_info"
                      >
                        <thead>
                          <tr role="row">
                            {this.renderTableHeader()}
                          </tr>
                        </thead>
                        <tbody>
                          {this.renderTableRow()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

export default User;
