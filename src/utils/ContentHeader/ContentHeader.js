import React from 'react';

export default function ContentHeader(props) {
  return (
    <div className="ala-page-header">
      <div className="ala-page-header-inner">
        <h1 className="ala-page-title">
          <i className="fas fa-sparkles" style={{ color: '#C5953A', fontSize: '1.1rem' }} />
          <span>{props.header}</span>
        </h1>
        <span className="ala-page-badge d-none d-sm-inline-block">
          ALA Aesthetic Clinic
        </span>
      </div>
    </div>
  );
}
