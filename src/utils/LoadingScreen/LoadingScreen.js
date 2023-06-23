import React from 'react'
import './LoadingScreen.css'

export default function LoadingScreen(props) {
  return (
    <div className="overlay-wrapper" style={{ visibility: props.isLoad ? 'visible' : 'hidden'  }}>
      <div className="overlay">
        <i className="fas fa-3x fa-sync-alt fa-spin">
        </i>
        <div style={{ margin: 10 }} className="text-bold pt-2 loading">Loading</div>
      </div>
    </div>
  )
}
