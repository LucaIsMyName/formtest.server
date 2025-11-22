import React, { useState, useEffect } from 'react'
import TrafficLights from './TrafficLights'

const CustomTitleBar: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    // Check initial maximized state
    const checkMaximized = async () => {
      if (window.api?.windowControls) {
        const maximized = await window.api.windowControls.isMaximized()
        setIsMaximized(maximized)
      }
    }
    checkMaximized()
  }, [])

  const handleClose = async () => {
    if (window.api?.windowControls) {
      await window.api.windowControls.close()
    }
  }

  const handleMinimize = async () => {
    if (window.api?.windowControls) {
      await window.api.windowControls.minimize()
    }
  }

  const handleMaximize = async () => {
    if (window.api?.windowControls) {
      await window.api.windowControls.maximize()
      // Update state after maximize/restore
      const maximized = await window.api.windowControls.isMaximized()
      setIsMaximized(maximized)
    }
  }

  return (
    <div className="custom-title-bar">
      <TrafficLights
        onClose={handleClose}
        onMinimize={handleMinimize}
        onMaximize={handleMaximize}
        isMaximized={isMaximized}
      />
      <div className="title-bar-title text-left">
        Formtest.Server
      </div>
      <div className="title-bar-spacer" />
    </div>
  )
}

export default CustomTitleBar
