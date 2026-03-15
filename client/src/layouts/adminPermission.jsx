import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import isAdmin from '../utils/isAdmin'

const AdminPermission = ({ children }) => {
    const user = useSelector((state) => state.user)

    // ⏳ Wait for user data to finish loading
    if (user.loading) {
        return <div>Loading...</div>  // or your spinner
    }

    // ✅ Now safely check role
    if (!isAdmin(user.role)) {
        return <Navigate to="/" replace />
    }

    return children
}

export default AdminPermission