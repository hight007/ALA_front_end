import React from 'react';
import './LoadingScreen.css';

export default function LoadingScreen(props) {
  if (!props.isLoad) return null;
  return (
    <div
      className="overlay-wrapper"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(24, 29, 39, 0.45)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          padding: '1.75rem 2.5rem',
          borderRadius: '20px',
          border: '1px solid #EAE4D7',
          boxShadow: '0 20px 45px rgba(0,0,0,0.18)',
          textAlign: 'center',
        }}
      >
        <i
          className="fas fa-3x fa-circle-notch fa-spin"
          style={{ color: '#D4A24C' }}
        />
        <div
          style={{ marginTop: 12, fontWeight: 600, color: '#1E2430' }}
          className="loading"
        >
          กำลังประมวลผลข้อมูล
        </div>
      </div>
    </div>
  );
}
