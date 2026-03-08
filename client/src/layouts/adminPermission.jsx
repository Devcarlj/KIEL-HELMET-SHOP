import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import isAdmin from '../utils/isAdmin'

const AdminPermission = ({ children }) => {
    const user = useSelector((state) => state.user)

    if (!isAdmin(user.role)) {
        return <Navigate to="/" replace />
    }

    return children
}

export default AdminPermission