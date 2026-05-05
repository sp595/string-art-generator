import React, { useEffect } from 'react'
import AppIcon from './AppIcon'
import './Toast.css'

function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-accent" />
      <div className="toast-icon">
        {type === 'success' && <AppIcon name="check" size={18} />}
        {type === 'error' && <AppIcon name="alert" size={18} />}
        {type === 'info' && <AppIcon name="info" size={18} />}
      </div>
      <div className="toast-body">
        <div className="toast-label">
          {type === 'success' && 'Confermato'}
          {type === 'error' && 'Attenzione'}
          {type === 'info' && 'Info'}
        </div>
        <div className="toast-message">{message}</div>
      </div>
      <button className="toast-close" onClick={onClose}>
        <AppIcon name="close" size={16} />
      </button>
    </div>
  )
}

export default Toast
