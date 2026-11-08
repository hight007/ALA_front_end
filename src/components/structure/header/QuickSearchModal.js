import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { httpClient } from '../../../utils/HttpClient';
import { server, OK } from '../../../constants';

export default function QuickSearchModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
    } else {
      setSearchTerm('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!searchTerm || searchTerm.trim().length === 0) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const keyword = searchTerm.trim();
        const res = await httpClient.get(`${server.FIND_PATIENT_DATA_URL}/${encodeURIComponent(keyword)}`);
        if (res.data && res.data.api_result === OK) {
          setResults(res.data.result.slice(0, 8)); // Top 8 results
        } else {
          setResults([]);
        }
      } catch (err) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  if (!isOpen) return null;

  const handleSelectPatient = (patientId) => {
    onClose();
    navigate(`/patient/patient_history/${patientId}`);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(20, 24, 33, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '8vh 1rem 2rem 1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '640px',
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.28)',
          border: '1.5px solid #E5D5B5',
          overflow: 'hidden',
          animation: 'fadeInDown 0.2s ease-out',
        }}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #EAE4D7',
            backgroundColor: '#FAF8F4',
            gap: '0.85rem',
          }}
        >
          <i className="fas fa-search" style={{ color: '#C5953A', fontSize: '1.2rem' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="ค้นหาคนไข้ด่วน (ชื่อ, นามสกุล, เบอร์โทรศัพท์, รหัส OPD)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
            }}
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: '1.05rem',
              fontWeight: 500,
              color: '#1E2430',
              outline: 'none',
            }}
          />
          {loading && <i className="fas fa-circle-notch fa-spin text-muted" />}
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                border: 'none',
                background: '#EAE4D7',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748B',
                fontSize: '0.75rem',
              }}
            >
              <i className="fas fa-times" />
            </button>
          )}
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#64748B',
              backgroundColor: '#EAE4D7',
              padding: '0.2rem 0.55rem',
              borderRadius: '6px',
            }}
          >
            ESC
          </span>
        </div>

        {/* Search Results Body */}
        <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '0.65rem' }}>
          {results.length > 0 ? (
            results.map((patient) => (
              <div
                key={patient.patient_id}
                onClick={() => handleSelectPatient(patient.patient_id)}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  borderBottom: '1px solid #F7F5F0',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FAF3E3';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: '#1E2430',
                      color: '#E9C070',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                    }}
                  >
                    {patient.first_name ? patient.first_name.charAt(0) : 'P'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1E2430', fontSize: '0.98rem' }}>
                      {patient.first_name} {patient.last_name}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px' }}>
                      <span className="mr-3">
                        <i className="fas fa-id-badge text-muted mr-1" />
                        HN: <b>#{patient.patient_id}</b>
                      </span>
                      <span>
                        <i className="fas fa-phone-alt text-muted mr-1" />
                        {patient.telephone_number}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span
                    className={`ala-status-badge ala-status-${patient.status || 'open'}`}
                    style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}
                  >
                    {patient.status || 'open'}
                  </span>
                  <i className="fas fa-chevron-right text-muted" style={{ fontSize: '0.8rem' }} />
                </div>
              </div>
            ))
          ) : searchTerm.trim().length > 0 && !loading ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748B' }}>
              <i className="fas fa-user-slash fa-2x mb-2" style={{ color: '#D4A24C' }} />
              <div style={{ fontWeight: 500 }}>ไม่พบข้อมูลคนไข้ที่ค้นหา</div>
              <small>ลองตรวจสอบชื่อ เบอร์โทรศัพท์ หรือเลขรหัส OPD อีกครั้ง</small>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94A3B8' }}>
              <i className="fas fa-keyboard fa-2x mb-2" style={{ color: '#E5D5B5' }} />
              <div>พิมพ์ค้นหาเพื่อดูประวัติคนไข้ทันที</div>
              <small>รองรับการค้นหาด้วย ชื่อ-นามสกุล, เบอร์โทรศัพท์ หรือรหัสคนไข้</small>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '0.65rem 1.25rem',
            backgroundColor: '#FAF8F4',
            borderTop: '1px solid #EAE4D7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.78rem',
            color: '#64748B',
          }}
        >
          <span>
            <i className="fas fa-mouse-pointer mr-1" /> คลิกเพื่อเปิดประวัติการรักษา
          </span>
          <span>
            ทางลัด: กดปุ่ม <b>Ctrl + K</b> เพื่อเปิด/ปิดหน้าต่างนี้
          </span>
        </div>
      </div>
    </div>
  );
}
