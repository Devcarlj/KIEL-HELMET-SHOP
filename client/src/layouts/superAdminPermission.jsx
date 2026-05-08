import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import isSuperAdmin from '../utils/isSuperAdmin'

const SuperAdminPermission = ({ children }) => {
    const user = useSelector((state) => state.user)

    if (user.loading) {
        return <div>Loading...</div>
    }

    if (!isSuperAdmin(user.role)) {
        return <Navigate to="/" replace />
    }

    return children
}

export default SuperAdminPermission
