import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import {
    FiSearch, FiUsers, FiEdit2, FiTrash2, FiX, FiLoader,
    FiChevronLeft, FiChevronRight, FiUser, FiPhone,
    FiCalendar, FiShield, FiCheckCircle, FiAlertCircle, FiSlash,
    FiRefreshCw, FiFilter, FiSave, FiMail
} from 'react-icons/fi'
import { MdVerified } from 'react-icons/md'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import isSuperAdmin from '../utils/isSuperAdmin'
import defaultUserAvatar from '../assets/default_user_profiles.png'

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const cfg = {
        Active:    { cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <FiCheckCircle size={10}/> },
        Inactive:  { cls: 'bg-slate-100 text-slate-500 border-slate-200',       icon: <FiSlash size={10}/> },
        Suspended: { cls: 'bg-red-100 text-red-600 border-red-200',             icon: <FiAlertCircle size={10}/> }
    }
    const { cls, icon } = cfg[status] || cfg.Active
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
            {icon}{status}
        </span>
    )
}

// ─── Role Badge ───────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
    const map = {
        ADMIN: 'bg-amber-100 text-amber-700 border-amber-200',
        USER:  'bg-blue-100 text-blue-600 border-blue-200'
    }
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${map[role] || map.USER}`}>
            {role === 'ADMIN' && <FiShield size={10}/>}
            {role}
        </span>
    )
}

// ─── Edit User Modal ──────────────────────────────────────────────────────────
const EditUserModal = ({ user, onClose, onSave, saving }) => {
    const [form, setForm] = useState({
        name:   user.name   || '',
        mobile: user.mobile || '',
        status: user.status || 'Active'
    })
    const set = (field, val) => setForm(p => ({ ...p, [field]: val }))

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-blue-600 text-white"><FiEdit2 size={14}/></div>
                        <div>
                            <p className="font-bold text-slate-800 text-sm">Edit Profile</p>
                            <p className="text-xs text-slate-500 truncate max-w-[200px]">{user.email}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                        <FiX size={16}/>
                    </button>
                </div>

                {/* Avatar */}
                <div className="flex items-center gap-3 px-5 pt-4 pb-2">
                    <img src={user.avatar || defaultUserAvatar} alt={user.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"/>
                    <div>
                        <p className="font-semibold text-slate-800 text-sm">{user.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <RoleBadge role={user.role}/>
                            {user.verify_email && <MdVerified className="text-blue-500" size={14} title="Email verified"/>}
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="px-5 pb-4 space-y-3">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                        <div className="relative">
                            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
                            <input type="text" value={form.name}
                                onChange={e => set('name', e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                                placeholder="Full name"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Mobile Number</label>
                        <div className="relative">
                            <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
                            <input type="tel" value={form.mobile}
                                onChange={e => set('mobile', e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                                placeholder="Mobile number"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Account Status</label>
                        <select value={form.status} onChange={e => set('status', e.target.value)}
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white">
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Suspended">Suspended</option>
                        </select>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 px-5 pb-5">
                    <button onClick={onClose}
                        className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                        Cancel
                    </button>
                    <button onClick={() => onSave(form)} disabled={saving || !form.name.trim()}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm rounded-xl shadow transition disabled:opacity-60 disabled:cursor-not-allowed">
                        {saving ? <><FiLoader className="animate-spin" size={14}/> Saving...</> : <><FiSave size={14}/> Save Changes</>}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
const DeleteConfirmModal = ({ user, onClose, onConfirm, deleting }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                    <FiTrash2 className="text-red-500" size={24}/>
                </div>
                <h3 className="font-bold text-slate-800 text-base mb-1">Delete Account?</h3>
                <p className="text-sm text-slate-500 mb-1">Permanently delete the account for:</p>
                <p className="font-semibold text-slate-700 text-sm">{user.name}</p>
                <p className="text-xs text-slate-400 mb-4">{user.email}</p>
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-left">
                    <p className="text-xs text-red-700 font-medium">⚠ This action cannot be undone. All user data will be permanently removed.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={onClose}
                        className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={deleting}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm rounded-xl transition disabled:opacity-60">
                        {deleting ? <><FiLoader className="animate-spin" size={14}/> Deleting...</> : <><FiTrash2 size={14}/> Delete</>}
                    </button>
                </div>
            </div>
        </div>
    </div>
)

// ─── Main Component ───────────────────────────────────────────────────────────
const CustomerManagement = () => {
    const user = useSelector(state => state.user)
    const isSA = isSuperAdmin(user.role)

    const [users, setUsers]           = useState([])
    const [total, setTotal]           = useState(0)
    const [totalPages, setTotalPages] = useState(1)
    const [page, setPage]             = useState(1)
    const [loading, setLoading]       = useState(true)
    const [search, setSearch]         = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [editUser, setEditUser]     = useState(null)
    const [deleteUser, setDeleteUser] = useState(null)
    const [saving, setSaving]         = useState(false)
    const [deleting, setDeleting]     = useState(false)

    const searchTimer = useRef(null)
    const LIMIT = 10

    const formatDate = (d) => {
        if (!d) return '—'
        return new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
    }

    const fetchUsers = useCallback(async (pg = 1, q = '', st = '') => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: pg, limit: LIMIT })
            if (q)  params.append('search', q)
            if (st) params.append('status', st)

            const res = await Axios({
                ...SummaryApi.getAllCustomers,
                url: `${SummaryApi.getAllCustomers.url}?${params.toString()}`
            })
            if (res.data.success) {
                setUsers(res.data.data.users)
                setTotal(res.data.data.total)
                setTotalPages(res.data.data.totalPages)
                setPage(pg)
            }
        } catch {
            toast.error('Failed to load customers')
        } finally {
            setLoading(false)
        }
    }, [])

    // Fetch on mount and whenever statusFilter changes
    useEffect(() => { fetchUsers(1, search, statusFilter) }, [statusFilter]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleSearchChange = (val) => {
        setSearch(val)
        clearTimeout(searchTimer.current)
        searchTimer.current = setTimeout(() => fetchUsers(1, val, statusFilter), 400)
    }

    const handleSaveEdit = async (form) => {
        setSaving(true)
        try {
            const res = await Axios({
                ...SummaryApi.updateCustomer,
                url: `${SummaryApi.updateCustomer.url}/${editUser._id}`,
                data: { name: form.name, mobile: form.mobile, status: form.status }
            })
            if (res.data.success) {
                toast.success(res.data.message)
                setEditUser(null)
                fetchUsers(page, search, statusFilter)
            } else {
                toast.error(res.data.message)
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to update user')
        } finally {
            setSaving(false)
        }
    }

    const handleConfirmDelete = async () => {
        setDeleting(true)
        try {
            const res = await Axios({
                ...SummaryApi.deleteCustomer,
                url: `${SummaryApi.deleteCustomer.url}/${deleteUser._id}`
            })
            if (res.data.success) {
                toast.success(res.data.message)
                setDeleteUser(null)
                fetchUsers(page, search, statusFilter)
            } else {
                toast.error(res.data.message)
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to delete user')
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-teal-600 text-white"><FiUsers size={15}/></div>
                    <div>
                        <p className="font-bold text-slate-800 text-sm">All Customers</p>
                        <p className="text-xs text-slate-400">{total} registered {total === 1 ? 'user' : 'users'}</p>
                    </div>
                </div>
                <button onClick={() => fetchUsers(page, search, statusFilter)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                    <FiRefreshCw size={12}/> Refresh
                </button>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
                    <input type="text" value={search}
                        onChange={e => handleSearchChange(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-full pl-9 pr-9 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition"/>
                    {search && (
                        <button onClick={() => { setSearch(''); fetchUsers(1, '', statusFilter) }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            <FiX size={14}/>
                        </button>
                    )}
                </div>
                <div className="relative">
                    <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13}/>
                    <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
                        className="pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 transition bg-white cursor-pointer">
                        <option value="">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Suspended">Suspended</option>
                    </select>
                </div>
            </div>

            {/* Table card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16 text-slate-400 gap-2 text-sm">
                        <FiLoader className="animate-spin" size={18}/> Loading customers...
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <FiUsers size={32} className="mb-3 opacity-40"/>
                        <p className="text-sm font-medium">No customers found</p>
                        <p className="text-xs mt-1">Try adjusting your search or filter</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                                        <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {users.map(u => (
                                        <tr key={u._id} className="hover:bg-slate-50/60 transition-colors group">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="relative shrink-0">
                                                        <img src={u.avatar || defaultUserAvatar} alt={u.name}
                                                            className="w-8 h-8 rounded-full object-cover border border-slate-200"/>
                                                        {u.verify_email && (
                                                            <MdVerified className="absolute -bottom-0.5 -right-0.5 text-blue-500 bg-white rounded-full" size={12} title="Email verified"/>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-slate-800 truncate leading-tight">{u.name}</p>
                                                        {u.mobile && (
                                                            <p className="text-xs text-slate-400 flex items-center gap-1">
                                                                <FiPhone size={9}/>{u.mobile}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5 text-slate-600">
                                                    <FiMail size={12} className="text-slate-400 shrink-0"/>
                                                    <span className="text-xs truncate max-w-[180px]">{u.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                    <FiCalendar size={11}/>{formatDate(u.createdAt)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3"><StatusBadge status={u.status}/></td>
                                            <td className="px-4 py-3"><RoleBadge role={u.role}/></td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button onClick={() => setEditUser(u)}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100"
                                                        title="Edit profile">
                                                        <FiEdit2 size={14}/>
                                                    </button>
                                                    {isSA && (
                                                        <button onClick={() => setDeleteUser(u)}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                                            title="Delete account">
                                                            <FiTrash2 size={14}/>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="md:hidden divide-y divide-slate-100">
                            {users.map(u => (
                                <div key={u._id} className="p-4 flex items-start gap-3">
                                    <div className="relative shrink-0">
                                        <img src={u.avatar || defaultUserAvatar} alt={u.name}
                                            className="w-10 h-10 rounded-full object-cover border border-slate-200"/>
                                        {u.verify_email && (
                                            <MdVerified className="absolute -bottom-0.5 -right-0.5 text-blue-500 bg-white rounded-full" size={13}/>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="font-semibold text-slate-800 text-sm truncate">{u.name}</p>
                                                <p className="text-xs text-slate-500 truncate">{u.email}</p>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <button onClick={() => setEditUser(u)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                                                    <FiEdit2 size={13}/>
                                                </button>
                                                {isSA && (
                                                    <button onClick={() => setDeleteUser(u)}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                                                        <FiTrash2 size={13}/>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                            <StatusBadge status={u.status}/>
                                            <RoleBadge role={u.role}/>
                                            <span className="text-xs text-slate-400">{formatDate(u.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
                                <p className="text-xs text-slate-500">
                                    Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
                                </p>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => fetchUsers(page - 1, search, statusFilter)} disabled={page <= 1}
                                        className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-600">
                                        <FiChevronLeft size={15}/>
                                    </button>
                                    <span className="px-3 py-1 text-xs font-semibold text-slate-700">
                                        {page} / {totalPages}
                                    </span>
                                    <button onClick={() => fetchUsers(page + 1, search, statusFilter)} disabled={page >= totalPages}
                                        className="p-1.5 rounded-lg hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-600">
                                        <FiChevronRight size={15}/>
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Permission note for regular Admins */}
            {!isSA && (
                <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700">
                    <FiShield size={13} className="shrink-0 mt-0.5"/>
                    <p>
                        <strong>Note:</strong> You can view and edit customer profiles for support purposes.
                        Only the Super Admin can delete accounts or modify admin permissions.
                    </p>
                </div>
            )}

            {/* Modals */}
            {editUser   && <EditUserModal      user={editUser}   onClose={() => setEditUser(null)}   onSave={handleSaveEdit}      saving={saving}/>}
            {deleteUser && <DeleteConfirmModal user={deleteUser} onClose={() => setDeleteUser(null)} onConfirm={handleConfirmDelete} deleting={deleting}/>}
        </div>
    )
}

export default CustomerManagement
