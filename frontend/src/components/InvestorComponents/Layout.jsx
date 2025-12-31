import React from 'react'
import Navbar from '../Navbar'
import { Outlet } from 'react-router-dom'

const Layout = () => {
  return (
    <>
    <Navbar />
      <div className="content-container">
        <Outlet />
      </div>
    </>
  )
}

export default Layout;