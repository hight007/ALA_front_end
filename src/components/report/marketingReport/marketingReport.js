import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import CurrencyFormat from 'react-currency-format';
import moment from 'moment';
import Swal from 'sweetalert2';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

import { httpClient } from '../../../utils/HttpClient';
import { OK, server, themeColor1, themeColor2 } from '../../../constants';

export default function MarketingReport() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'churn';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Tab 1: Inactive / Churn
  const [inactiveDays, setInactiveDays] = useState(60);
  const [inactiveList, setInactiveList] = useState([]);
  const [searchInactive, setSearchInactive] = useState('');

  // Tab 2: Birthday & Anniversary
  const currentMonth = new Date().getMonth() + 1;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [birthdayList, setBirthdayList] = useState([]);
  const [searchBirthday, setSearchBirthday] = useState('');

  // Tab 3: VIP & RFM Tiering
  const [vipList, setVipList] = useState([]);
  const [vipSummary, setVipSummary] = useState({
    diamond: 0,
    gold: 0,
    silver: 0,
    standard: 0,
    totalRevenue: 0,
  });
  const [selectedTier, setSelectedTier] = useState('ALL');
  const [searchVip, setSearchVip] = useState('');

  // Loading state
  const [isLoad, setIsLoad] = useState(false);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === 'churn') {
      fetchInactiveCustomers(inactiveDays);
    } else if (activeTab === 'birthday') {
      fetchBirthdayCustomers(selectedMonth);
    } else if (activeTab === 'vip') {
      fetchVipTiers();
    }
  }, [activeTab]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // ----------------------------------------------------------------
  // Fetch Functions
  // ----------------------------------------------------------------
  const fetchInactiveCustomers = async (days) => {
    setIsLoad(true);
    try {
      const res = await httpClient.get(`${server.REPORT_MARKETING_INACTIVE_URL}/${days}`);
      if (res.data.api_result === OK) {
        setInactiveList(res.data.result || []);
      }
    } catch (err) {
      console.error(err);
      Swal.fire('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลลูกค้าขาดการติดต่อได้', 'error');
    } finally {
      setIsLoad(false);
    }
  };

  const fetchBirthdayCustomers = async (month) => {
    setIsLoad(true);
    try {
      const res = await httpClient.get(`${server.REPORT_MARKETING_BIRTHDAYS_URL}/${month}`);
      if (res.data.api_result === OK) {
        setBirthdayList(res.data.result || []);
      }
    } catch (err) {
      console.error(err);
      Swal.fire('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลวันเกิด/สมาชิกได้', 'error');
    } finally {
      setIsLoad(false);
    }
  };

  const fetchVipTiers = async () => {
    setIsLoad(true);
    try {
      const res = await httpClient.get(server.REPORT_MARKETING_VIP_URL);
      if (res.data.api_result === OK) {
        setVipList(res.data.result || []);
        if (res.data.summary) {
          setVipSummary(res.data.summary);
        }
      }
    } catch (err) {
      console.error(err);
      Swal.fire('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลเกรดลูกค้า VIP ได้', 'error');
    } finally {
      setIsLoad(false);
    }
  };

  // ----------------------------------------------------------------
  // Excel Export
  // ----------------------------------------------------------------
  const exportToExcel = (data, fileName) => {
    if (!data || data.length === 0) {
      Swal.fire('ไม่มีข้อมูล', 'ไม่มีข้อมูลสำหรับส่งออก', 'info');
      return;
    }
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(blob, `${fileName}_${moment().format('YYYYMMDD_HHmm')}.xlsx`);
  };

  const monthsTh = [
    { value: 1, label: 'มกราคม' },
    { value: 2, label: 'กุมภาพันธ์' },
    { value: 3, label: 'มีนาคม' },
    { value: 4, label: 'เมษายน' },
    { value: 5, label: 'พฤษภาคม' },
    { value: 6, label: 'มิถุนายน' },
    { value: 7, label: 'กรกฎาคม' },
    { value: 8, label: 'สิงหาคม' },
    { value: 9, label: 'กันยายน' },
    { value: 10, label: 'ตุลาคม' },
    { value: 11, label: 'พฤศจิกายน' },
    { value: 12, label: 'ธันวาคม' },
  ];

  // ----------------------------------------------------------------
  // Tab 1: Render Churn
  // ----------------------------------------------------------------
  const renderChurnTab = () => {
    const filtered = inactiveList.filter((item) => {
      const q = searchInactive.trim().toLowerCase();
      if (!q) return true;
      const fullName = `${item.first_name || ''} ${item.last_name || ''}`.toLowerCase();
      const phone = (item.telephone_number || '').toLowerCase();
      const id = (item.patient_id || '').toLowerCase();
      return fullName.includes(q) || phone.includes(q) || id.includes(q);
    });

    const totalLostSpend = filtered.reduce((acc, c) => acc + parseFloat(c.total_spent || 0), 0);

    return (
      <div>
        {/* Controls & Quick Filter */}
        <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '14px', background: '#ffffff' }}>
          <div className="card-body py-3">
            <div className="d-flex flex-wrap align-items-center justify-content-between">
              <div className="d-flex flex-wrap align-items-center mb-2 mb-md-0">
                <span className="mr-3 font-weight-bold" style={{ color: '#1E2430' }}>
                  <i className="fas fa-filter mr-1" style={{ color: '#C5953A' }} /> ระยะเวลาที่ไม่ได้มา:
                </span>
                <div className="btn-group btn-group-toggle mr-3 mb-2 mb-sm-0">
                  {[30, 60, 90, 180].map((days) => (
                    <button
                      key={days}
                      type="button"
                      className={`btn btn-sm ${inactiveDays === days ? 'btn-primary' : 'btn-outline-secondary'}`}
                      style={{
                        backgroundColor: inactiveDays === days ? '#1E2430' : 'transparent',
                        borderColor: '#1E2430',
                        color: inactiveDays === days ? '#E9C070' : '#495057',
                        fontWeight: 600,
                      }}
                      onClick={() => {
                        setInactiveDays(days);
                        fetchInactiveCustomers(days);
                      }}
                    >
                      {days} วัน+
                    </button>
                  ))}
                </div>
              </div>

              {/* Search & Export */}
              <div className="d-flex align-items-center">
                <div className="input-group input-group-sm mr-2" style={{ width: '220px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ค้นหาชื่อ / เบอร์ / HN..."
                    value={searchInactive}
                    onChange={(e) => setSearchInactive(e.target.value)}
                  />
                  {searchInactive && (
                    <div className="input-group-append">
                      <button className="btn btn-outline-secondary" onClick={() => setSearchInactive('')}>
                        <i className="fas fa-times" />
                      </button>
                    </div>
                  )}
                </div>
                <button
                  className="btn btn-sm btn-outline-success font-weight-bold"
                  onClick={() => exportToExcel(filtered, `Inactive_Customers_${inactiveDays}days`)}
                >
                  <i className="fas fa-file-excel mr-1" /> Excel
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="row mb-3">
          <div className="col-md-4 col-sm-6 mb-2">
            <div className="p-3 bg-white shadow-sm d-flex align-items-center" style={{ borderRadius: '12px', borderLeft: '4px solid #E9C070' }}>
              <div className="mr-3 p-3 text-white rounded-circle" style={{ backgroundColor: '#1E2430' }}>
                <i className="fas fa-user-clock fa-lg" style={{ color: '#E9C070' }} />
              </div>
              <div>
                <small className="text-muted d-block font-weight-bold">ลูกค้าขาดการติดต่อ ({inactiveDays} วันขึ้นไป)</small>
                <h4 className="mb-0 font-weight-bold" style={{ color: '#1E2430' }}>{filtered.length.toLocaleString()} คน</h4>
              </div>
            </div>
          </div>
          <div className="col-md-4 col-sm-6 mb-2">
            <div className="p-3 bg-white shadow-sm d-flex align-items-center" style={{ borderRadius: '12px', borderLeft: '4px solid #55C5D9' }}>
              <div className="mr-3 p-3 text-white rounded-circle" style={{ backgroundColor: '#55C5D9' }}>
                <i className="fas fa-coins fa-lg" />
              </div>
              <div>
                <small className="text-muted d-block font-weight-bold">ยอดใช้จ่ายสะสมของกลุ่มนี้</small>
                <h4 className="mb-0 font-weight-bold" style={{ color: '#1E2430' }}>
                  <CurrencyFormat value={totalLostSpend} displayType="text" thousandSeparator decimalScale={0} /> บาท
                </h4>
              </div>
            </div>
          </div>
          <div className="col-md-4 col-sm-12 mb-2">
            <div className="p-3 bg-white shadow-sm d-flex align-items-center" style={{ borderRadius: '12px', borderLeft: '4px solid #f39c12' }}>
              <div className="mr-3 p-3 text-white rounded-circle" style={{ backgroundColor: '#f39c12' }}>
                <i className="fas fa-bullhorn fa-lg" />
              </div>
              <div>
                <small className="text-muted d-block font-weight-bold">ข้อเสนอแนะการตลาด (Win-Back)</small>
                <span className="small text-muted">โทรติดต่อ / ส่ง SMS บัตรของขวัญ ดึงลูกค้ากลับมาใช้บริการ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card shadow-sm border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table table-hover mb-0 text-center">
              <thead style={{ backgroundColor: '#1E2430', color: '#E9C070' }}>
                <tr>
                  <th style={{ padding: '14px' }}>รหัสคนไข้</th>
                  <th style={{ padding: '14px', textAlign: 'left' }}>ชื่อ - สกุล</th>
                  <th style={{ padding: '14px' }}>เบอร์โทรศัพท์</th>
                  <th style={{ padding: '14px' }}>อายุ / อาชีพ</th>
                  <th style={{ padding: '14px' }}>มาบริการล่าสุด</th>
                  <th style={{ padding: '14px' }}>ไม่ได้มา (วัน)</th>
                  <th style={{ padding: '14px', textAlign: 'right' }}>ยอดใช้จ่ายรวม</th>
                  <th style={{ padding: '14px' }}>ครั้ง</th>
                  <th style={{ padding: '14px' }}>การติดต่อ</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-5 text-muted">
                      <i className="fas fa-check-circle fa-2x mb-2 text-success d-block" />
                      ไม่พบข้อมูลลูกค้าที่ขาดการติดต่อในเกณฑ์นี้
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, idx) => (
                    <tr key={idx} style={{ verticalAlign: 'middle' }}>
                      <td className="font-weight-bold">
                        <Link to={`/patient/patient_history/${item.patient_id}`} style={{ color: '#1E2430', textDecoration: 'underline' }}>
                          {item.patient_id}
                        </Link>
                      </td>
                      <td style={{ textAlign: 'left', fontWeight: 600 }}>
                        {item.first_name} {item.last_name}
                      </td>
                      <td>
                        <a href={`tel:${item.telephone_number}`} className="badge badge-light border px-2 py-1 font-weight-bold text-dark">
                          <i className="fas fa-phone-alt mr-1 text-success" />
                          {item.telephone_number || '-'}
                        </a>
                      </td>
                      <td>
                        <span className="badge badge-secondary mr-1">{item.age ? `${item.age} ปี` : '-'}</span>
                        <small className="text-muted">{item.job || ''}</small>
                      </td>
                      <td className="text-muted">
                        {item.last_operate_date ? moment(item.last_operate_date).format('DD/MM/YYYY') : '-'}
                      </td>
                      <td>
                        <span
                          className="badge badge-pill px-3 py-1 font-weight-bold"
                          style={{
                            backgroundColor: item.days_inactive >= 90 ? '#ffebe9' : '#fff8e6',
                            color: item.days_inactive >= 90 ? '#d93025' : '#b06000',
                          }}
                        >
                          <i className="far fa-clock mr-1" />
                          {item.days_inactive} วัน
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#C5953A' }}>
                        <CurrencyFormat value={item.total_spent || 0} displayType="text" thousandSeparator decimalScale={0} /> ฿
                      </td>
                      <td>
                        <span className="badge badge-info">{item.total_visits || 0}</span>
                      </td>
                      <td>
                        <Link
                          to={`/patient/patient_history/${item.patient_id}`}
                          className="btn btn-xs btn-outline-primary mr-1"
                          title="ดูประวัติการรักษา"
                        >
                          <i className="fas fa-folder-open mr-1" /> ประวัติ
                        </Link>
                        <a
                          href={`tel:${item.telephone_number}`}
                          className="btn btn-xs btn-success"
                          title="โทรติดต่อ"
                        >
                          <i className="fas fa-phone" />
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------------------
  // Tab 2: Render Birthday
  // ----------------------------------------------------------------
  const renderBirthdayTab = () => {
    const filtered = birthdayList.filter((item) => {
      const q = searchBirthday.trim().toLowerCase();
      if (!q) return true;
      const fullName = `${item.first_name || ''} ${item.last_name || ''}`.toLowerCase();
      const phone = (item.telephone_number || '').toLowerCase();
      const id = (item.patient_id || '').toLowerCase();
      return fullName.includes(q) || phone.includes(q) || id.includes(q);
    });

    const monthLabel = monthsTh.find((m) => m.value === parseInt(selectedMonth))?.label || '';
    const totalMonthSpend = filtered.reduce((acc, c) => acc + parseFloat(c.total_spent || 0), 0);

    return (
      <div>
        {/* Controls */}
        <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '14px', background: '#ffffff' }}>
          <div className="card-body py-3">
            <div className="d-flex flex-wrap align-items-center justify-content-between">
              <div className="d-flex flex-wrap align-items-center mb-2 mb-md-0">
                <span className="mr-3 font-weight-bold" style={{ color: '#1E2430' }}>
                  <i className="fas fa-birthday-cake mr-1" style={{ color: '#E9C070' }} /> เลือกเดือนเกิด/สมัครสมาชิก:
                </span>
                <select
                  className="form-control form-control-sm"
                  style={{ width: '160px', fontWeight: 600, borderColor: '#C5953A' }}
                  value={selectedMonth}
                  onChange={(e) => {
                    const m = parseInt(e.target.value);
                    setSelectedMonth(m);
                    fetchBirthdayCustomers(m);
                  }}
                >
                  {monthsTh.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search & Export */}
              <div className="d-flex align-items-center">
                <div className="input-group input-group-sm mr-2" style={{ width: '220px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ค้นหาชื่อ / เบอร์ / HN..."
                    value={searchBirthday}
                    onChange={(e) => setSearchBirthday(e.target.value)}
                  />
                  {searchBirthday && (
                    <div className="input-group-append">
                      <button className="btn btn-outline-secondary" onClick={() => setSearchBirthday('')}>
                        <i className="fas fa-times" />
                      </button>
                    </div>
                  )}
                </div>
                <button
                  className="btn btn-sm btn-outline-success font-weight-bold"
                  onClick={() => exportToExcel(filtered, `Birthday_Customers_Month_${selectedMonth}`)}
                >
                  <i className="fas fa-file-excel mr-1" /> Excel
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="row mb-3">
          <div className="col-md-4 col-sm-6 mb-2">
            <div className="p-3 bg-white shadow-sm d-flex align-items-center" style={{ borderRadius: '12px', borderLeft: '4px solid #E9C070' }}>
              <div className="mr-3 p-3 text-white rounded-circle" style={{ backgroundColor: '#E9C070' }}>
                <i className="fas fa-gift fa-lg" style={{ color: '#1E2430' }} />
              </div>
              <div>
                <small className="text-muted d-block font-weight-bold">ลูกค้าประจำเดือน{monthLabel}</small>
                <h4 className="mb-0 font-weight-bold" style={{ color: '#1E2430' }}>{filtered.length.toLocaleString()} คน</h4>
              </div>
            </div>
          </div>
          <div className="col-md-4 col-sm-6 mb-2">
            <div className="p-3 bg-white shadow-sm d-flex align-items-center" style={{ borderRadius: '12px', borderLeft: '4px solid #55C5D9' }}>
              <div className="mr-3 p-3 text-white rounded-circle" style={{ backgroundColor: '#55C5D9' }}>
                <i className="fas fa-wallet fa-lg" />
              </div>
              <div>
                <small className="text-muted d-block font-weight-bold">ยอดใช้จ่ายสะสมของกลุ่มนี้</small>
                <h4 className="mb-0 font-weight-bold" style={{ color: '#1E2430' }}>
                  <CurrencyFormat value={totalMonthSpend} displayType="text" thousandSeparator decimalScale={0} /> บาท
                </h4>
              </div>
            </div>
          </div>
          <div className="col-md-4 col-sm-12 mb-2">
            <div className="p-3 bg-white shadow-sm d-flex align-items-center" style={{ borderRadius: '12px', borderLeft: '4px solid #28a745' }}>
              <div className="mr-3 p-3 text-white rounded-circle" style={{ backgroundColor: '#28a745' }}>
                <i className="fas fa-tag fa-lg" />
              </div>
              <div>
                <small className="text-muted d-block font-weight-bold">แคมเปญแนะนำ (Birthday Campaign)</small>
                <span className="small text-muted">มอบส่วนลดพิเศษ หรือ Complimentary Treatment ประจำเดือนเกิด</span>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card shadow-sm border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table table-hover mb-0 text-center">
              <thead style={{ backgroundColor: '#1E2430', color: '#E9C070' }}>
                <tr>
                  <th style={{ padding: '14px' }}>รหัสคนไข้</th>
                  <th style={{ padding: '14px', textAlign: 'left' }}>ชื่อ - สกุล</th>
                  <th style={{ padding: '14px' }}>เบอร์โทรศัพท์</th>
                  <th style={{ padding: '14px' }}>เพศ / อายุ</th>
                  <th style={{ padding: '14px' }}>เป็นสมาชิกตั้งแต่</th>
                  <th style={{ padding: '14px', textAlign: 'right' }}>ยอดใช้จ่ายรวม</th>
                  <th style={{ padding: '14px' }}>ครั้ง</th>
                  <th style={{ padding: '14px' }}>มาบริการล่าสุด</th>
                  <th style={{ padding: '14px' }}>แคมเปญ</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-5 text-muted">
                      <i className="fas fa-user-slash fa-2x mb-2 text-warning d-block" />
                      ไม่พบข้อมูลลูกค้าสำหรับเดือน{monthLabel}
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, idx) => (
                    <tr key={idx} style={{ verticalAlign: 'middle' }}>
                      <td className="font-weight-bold">
                        <Link to={`/patient/patient_history/${item.patient_id}`} style={{ color: '#1E2430', textDecoration: 'underline' }}>
                          {item.patient_id}
                        </Link>
                      </td>
                      <td style={{ textAlign: 'left', fontWeight: 600 }}>
                        {item.first_name} {item.last_name}
                      </td>
                      <td>
                        <a href={`tel:${item.telephone_number}`} className="badge badge-light border px-2 py-1 font-weight-bold text-dark">
                          <i className="fas fa-phone-alt mr-1 text-success" />
                          {item.telephone_number || '-'}
                        </a>
                      </td>
                      <td>
                        <span className="badge badge-secondary mr-1">{item.sex || '-'}</span>
                        <small className="text-muted">{item.age ? `${item.age} ปี` : ''}</small>
                      </td>
                      <td className="text-muted">
                        {item.member_since ? moment(item.member_since).format('DD/MM/YYYY') : '-'}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#C5953A' }}>
                        <CurrencyFormat value={item.total_spent || 0} displayType="text" thousandSeparator decimalScale={0} /> ฿
                      </td>
                      <td>
                        <span className="badge badge-info">{item.total_visits || 0}</span>
                      </td>
                      <td className="text-muted">
                        {item.last_operate_date ? moment(item.last_operate_date).format('DD/MM/YYYY') : '-'}
                      </td>
                      <td>
                        <a
                          href={`tel:${item.telephone_number}`}
                          className="btn btn-xs btn-outline-warning mr-1 font-weight-bold"
                          title="ส่งคำอวยพร / มอบสิทธิ์"
                        >
                          <i className="fas fa-gift mr-1" /> อวยพร
                        </a>
                        <Link
                          to={`/patient/patient_history/${item.patient_id}`}
                          className="btn btn-xs btn-outline-primary"
                          title="ดูประวัติ"
                        >
                          <i className="fas fa-folder-open" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------------------
  // Tab 3: Render VIP Tiers
  // ----------------------------------------------------------------
  const renderVipTab = () => {
    const filtered = vipList.filter((item) => {
      const matchTier = selectedTier === 'ALL' || item.tier === selectedTier;
      if (!matchTier) return false;
      const q = searchVip.trim().toLowerCase();
      if (!q) return true;
      const fullName = `${item.first_name || ''} ${item.last_name || ''}`.toLowerCase();
      const phone = (item.telephone_number || '').toLowerCase();
      const id = (item.patient_id || '').toLowerCase();
      return fullName.includes(q) || phone.includes(q) || id.includes(q);
    });

    const getTierBadge = (tier) => {
      switch (tier) {
        case 'Diamond VIP':
          return (
            <span
              className="badge px-2 py-1 font-weight-bold"
              style={{
                background: 'linear-gradient(135deg, #1E2430 0%, #343a40 100%)',
                color: '#E9C070',
                border: '1px solid #E9C070',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              }}
            >
              💎 Diamond VIP
            </span>
          );
        case 'Gold VIP':
          return (
            <span
              className="badge px-2 py-1 font-weight-bold"
              style={{
                backgroundColor: '#FFF4D6',
                color: '#B07D1C',
                border: '1px solid #E9C070',
              }}
            >
              🥇 Gold VIP
            </span>
          );
        case 'Silver':
          return (
            <span
              className="badge px-2 py-1 font-weight-bold"
              style={{
                backgroundColor: '#EAEFF5',
                color: '#495057',
                border: '1px solid #CED4DA',
              }}
            >
              🥈 Silver
            </span>
          );
        default:
          return (
            <span className="badge badge-light border text-muted px-2 py-1">
              Standard
            </span>
          );
      }
    };

    return (
      <div>
        {/* VIP Summary Cards */}
        <div className="row mb-4">
          <div className="col-lg-3 col-sm-6 mb-3">
            <div
              className={`p-3 bg-white shadow-sm h-100 ${selectedTier === 'Diamond VIP' ? 'border-primary' : ''}`}
              style={{
                borderRadius: '16px',
                borderTop: '4px solid #1E2430',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: selectedTier === 'Diamond VIP' ? '#F8F9FA' : '#ffffff',
              }}
              onClick={() => setSelectedTier(selectedTier === 'Diamond VIP' ? 'ALL' : 'Diamond VIP')}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted font-weight-bold">💎 Diamond VIP (≥ 50,000฿)</small>
                  <h3 className="font-weight-bold mb-0 mt-1" style={{ color: '#1E2430' }}>
                    {vipSummary.diamond.toLocaleString()} <span className="small font-weight-normal">คน</span>
                  </h3>
                </div>
                <div className="p-3 rounded-circle text-white" style={{ backgroundColor: '#1E2430' }}>
                  <i className="fas fa-gem fa-lg" style={{ color: '#E9C070' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-sm-6 mb-3">
            <div
              className={`p-3 bg-white shadow-sm h-100 ${selectedTier === 'Gold VIP' ? 'border-primary' : ''}`}
              style={{
                borderRadius: '16px',
                borderTop: '4px solid #C5953A',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: selectedTier === 'Gold VIP' ? '#F8F9FA' : '#ffffff',
              }}
              onClick={() => setSelectedTier(selectedTier === 'Gold VIP' ? 'ALL' : 'Gold VIP')}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted font-weight-bold">🥇 Gold VIP (≥ 20,000฿)</small>
                  <h3 className="font-weight-bold mb-0 mt-1" style={{ color: '#C5953A' }}>
                    {vipSummary.gold.toLocaleString()} <span className="small font-weight-normal">คน</span>
                  </h3>
                </div>
                <div className="p-3 rounded-circle text-white" style={{ backgroundColor: '#E9C070' }}>
                  <i className="fas fa-crown fa-lg" style={{ color: '#1E2430' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-sm-6 mb-3">
            <div
              className={`p-3 bg-white shadow-sm h-100 ${selectedTier === 'Silver' ? 'border-primary' : ''}`}
              style={{
                borderRadius: '16px',
                borderTop: '4px solid #55C5D9',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: selectedTier === 'Silver' ? '#F8F9FA' : '#ffffff',
              }}
              onClick={() => setSelectedTier(selectedTier === 'Silver' ? 'ALL' : 'Silver')}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted font-weight-bold">🥈 Silver (≥ 10,000฿)</small>
                  <h3 className="font-weight-bold mb-0 mt-1" style={{ color: '#55C5D9' }}>
                    {vipSummary.silver.toLocaleString()} <span className="small font-weight-normal">คน</span>
                  </h3>
                </div>
                <div className="p-3 rounded-circle text-white" style={{ backgroundColor: '#55C5D9' }}>
                  <i className="fas fa-award fa-lg" />
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-3 col-sm-6 mb-3">
            <div
              className={`p-3 bg-white shadow-sm h-100 ${selectedTier === 'Standard' ? 'border-primary' : ''}`}
              style={{
                borderRadius: '16px',
                borderTop: '4px solid #6c757d',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: selectedTier === 'Standard' ? '#F8F9FA' : '#ffffff',
              }}
              onClick={() => setSelectedTier(selectedTier === 'Standard' ? 'ALL' : 'Standard')}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted font-weight-bold">🥉 Standard (&lt; 10,000฿)</small>
                  <h3 className="font-weight-bold mb-0 mt-1" style={{ color: '#6c757d' }}>
                    {vipSummary.standard.toLocaleString()} <span className="small font-weight-normal">คน</span>
                  </h3>
                </div>
                <div className="p-3 rounded-circle text-white" style={{ backgroundColor: '#6c757d' }}>
                  <i className="fas fa-user-friends fa-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: '14px', background: '#ffffff' }}>
          <div className="card-body py-3">
            <div className="d-flex flex-wrap align-items-center justify-content-between">
              <div className="d-flex flex-wrap align-items-center mb-2 mb-md-0">
                <span className="mr-3 font-weight-bold" style={{ color: '#1E2430' }}>
                  <i className="fas fa-layer-group mr-1" style={{ color: '#C5953A' }} /> แสดงระดับ:
                </span>
                <div className="btn-group btn-group-sm btn-group-toggle mr-3 mb-2 mb-sm-0">
                  {['ALL', 'Diamond VIP', 'Gold VIP', 'Silver', 'Standard'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`btn ${selectedTier === t ? 'btn-dark font-weight-bold' : 'btn-outline-secondary'}`}
                      onClick={() => setSelectedTier(t)}
                    >
                      {t === 'ALL' ? 'ทั้งหมด' : t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search & Export */}
              <div className="d-flex align-items-center">
                <div className="input-group input-group-sm mr-2" style={{ width: '220px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="ค้นหาชื่อ / เบอร์ / HN..."
                    value={searchVip}
                    onChange={(e) => setSearchVip(e.target.value)}
                  />
                  {searchVip && (
                    <div className="input-group-append">
                      <button className="btn btn-outline-secondary" onClick={() => setSearchVip('')}>
                        <i className="fas fa-times" />
                      </button>
                    </div>
                  )}
                </div>
                <button
                  className="btn btn-sm btn-outline-success font-weight-bold"
                  onClick={() => exportToExcel(filtered, `Customer_VIP_Tiers_${selectedTier}`)}
                >
                  <i className="fas fa-file-excel mr-1" /> Excel
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card shadow-sm border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table table-hover mb-0 text-center">
              <thead style={{ backgroundColor: '#1E2430', color: '#E9C070' }}>
                <tr>
                  <th style={{ padding: '14px' }}>รหัสคนไข้</th>
                  <th style={{ padding: '14px', textAlign: 'left' }}>ชื่อ - สกุล</th>
                  <th style={{ padding: '14px' }}>ระดับสมาชิก</th>
                  <th style={{ padding: '14px' }}>เบอร์โทรศัพท์</th>
                  <th style={{ padding: '14px' }}>อาชีพ</th>
                  <th style={{ padding: '14px', textAlign: 'right' }}>ยอดใช้จ่ายรวม</th>
                  <th style={{ padding: '14px' }}>จำนวนครั้ง</th>
                  <th style={{ padding: '14px', textAlign: 'right' }}>เฉลี่ย/ครั้ง</th>
                  <th style={{ padding: '14px' }}>มาบริการล่าสุด</th>
                  <th style={{ padding: '14px' }}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="py-5 text-muted">
                      <i className="fas fa-search fa-2x mb-2 text-muted d-block" />
                      ไม่พบข้อมูลลูกค้าในระดับที่เลือก
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, idx) => {
                    const avgSpend = item.total_visits > 0 ? (item.total_spent / item.total_visits) : 0;
                    return (
                      <tr key={idx} style={{ verticalAlign: 'middle' }}>
                        <td className="font-weight-bold">
                          <Link to={`/patient/patient_history/${item.patient_id}`} style={{ color: '#1E2430', textDecoration: 'underline' }}>
                            {item.patient_id}
                          </Link>
                        </td>
                        <td style={{ textAlign: 'left', fontWeight: 600 }}>
                          {item.first_name} {item.last_name}
                        </td>
                        <td>{getTierBadge(item.tier)}</td>
                        <td>
                          <a href={`tel:${item.telephone_number}`} className="badge badge-light border px-2 py-1 font-weight-bold text-dark">
                            <i className="fas fa-phone-alt mr-1 text-success" />
                            {item.telephone_number || '-'}
                          </a>
                        </td>
                        <td className="text-muted small">{item.job || '-'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#C5953A' }}>
                          <CurrencyFormat value={item.total_spent || 0} displayType="text" thousandSeparator decimalScale={0} /> ฿
                        </td>
                        <td>
                          <span className="badge badge-info">{item.total_visits || 0}</span>
                        </td>
                        <td style={{ textAlign: 'right', color: '#55C5D9', fontWeight: 600 }}>
                          <CurrencyFormat value={avgSpend} displayType="text" thousandSeparator decimalScale={0} /> ฿
                        </td>
                        <td className="text-muted">
                          {item.last_visit ? moment(item.last_visit).format('DD/MM/YYYY') : '-'}
                        </td>
                        <td>
                          <Link
                            to={`/patient/patient_history/${item.patient_id}`}
                            className="btn btn-xs btn-outline-primary"
                            title="ดูประวัติ"
                          >
                            <i className="fas fa-folder-open mr-1" /> ประวัติ
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="content-wrapper" style={{ backgroundColor: '#F4F6F9', minHeight: '100vh' }}>
      {/* Header Banner */}
      <div className="content-header pt-4 pb-3">
        <div className="container-fluid">
          <div className="row align-items-center mb-3">
            <div className="col-sm-6">
              <h1 className="m-0 font-weight-bold" style={{ color: '#1E2430' }}>
                <i className="fas fa-bullhorn mr-2" style={{ color: '#C5953A' }} />
                รายงานการตลาด &amp; วิเคราะห์กลุ่มลูกค้า (Marketing CRM)
              </h1>
              <small className="text-muted">
                เครื่องมือจัดกลุ่มลูกค้า วิเคราะห์โอกาสการขาย และดึงลูกค้ากลับมาใช้บริการซ้ำ
              </small>
            </div>
            <div className="col-sm-6 text-sm-right mt-2 mt-sm-0">
              <span className="badge badge-light border p-2 text-muted">
                <i className="fas fa-sync-alt mr-1" /> ข้อมูลอัปเดตแบบ Realtime
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="card shadow-sm border-0 mb-3" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <div className="card-body p-2" style={{ backgroundColor: '#ffffff' }}>
              <ul className="nav nav-pills nav-fill">
                <li className="nav-item">
                  <button
                    className={`nav-link text-center font-weight-bold py-2 ${activeTab === 'churn' ? 'active' : ''}`}
                    style={{
                      borderRadius: '12px',
                      backgroundColor: activeTab === 'churn' ? '#1E2430' : 'transparent',
                      color: activeTab === 'churn' ? '#E9C070' : '#495057',
                      transition: 'all 0.3s ease',
                      border: 'none',
                    }}
                    onClick={() => switchTab('churn')}
                  >
                    <i className="fas fa-user-clock mr-2" />
                    1. ลูกค้าขาดการติดต่อ / ลูกค้าหลุด (Churn Risk)
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link text-center font-weight-bold py-2 ${activeTab === 'birthday' ? 'active' : ''}`}
                    style={{
                      borderRadius: '12px',
                      backgroundColor: activeTab === 'birthday' ? '#1E2430' : 'transparent',
                      color: activeTab === 'birthday' ? '#E9C070' : '#495057',
                      transition: 'all 0.3s ease',
                      border: 'none',
                    }}
                    onClick={() => switchTab('birthday')}
                  >
                    <i className="fas fa-birthday-cake mr-2" />
                    2. ลูกค้าเดือนเกิด / สมาชิก (Birthday &amp; Member)
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link text-center font-weight-bold py-2 ${activeTab === 'vip' ? 'active' : ''}`}
                    style={{
                      borderRadius: '12px',
                      backgroundColor: activeTab === 'vip' ? '#1E2430' : 'transparent',
                      color: activeTab === 'vip' ? '#E9C070' : '#495057',
                      transition: 'all 0.3s ease',
                      border: 'none',
                    }}
                    onClick={() => switchTab('vip')}
                  >
                    <i className="fas fa-crown mr-2" />
                    3. จัดกลุ่มลูกค้า VIP (VIP &amp; RFM Tiering)
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <section className="content">
        <div className="container-fluid pb-5">
          {isLoad ? (
            <div className="text-center py-5">
              <div className="spinner-border text-warning" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="sr-only">กำลังโหลดข้อมูล...</span>
              </div>
              <p className="mt-3 text-muted font-weight-bold">กำลังประมวลผลข้อมูลการตลาด...</p>
            </div>
          ) : (
            <>
              {activeTab === 'churn' && renderChurnTab()}
              {activeTab === 'birthday' && renderBirthdayTab()}
              {activeTab === 'vip' && renderVipTab()}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
