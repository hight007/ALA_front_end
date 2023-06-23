import React from 'react'

export default function ContentHeader(props) {
  return (
    <div className="content-header">
      <div className="container-fluid">
        <div className="row mb-2">
          <div className="col-sm-6">
            <h1 className="m-0">{props.header}</h1>
          </div>
          <div className="col-sm-6">
            <ol className="breadcrumb float-sm-right">

            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
