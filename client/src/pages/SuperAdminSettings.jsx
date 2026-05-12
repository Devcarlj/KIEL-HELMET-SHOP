import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import {
    FiShield,
    FiMail,
    FiUserPlus,
    FiUserX,
    FiUsers,
    FiToggleLeft,
    FiToggleRight,
    FiSearch,
    FiTrash2,
    FiCheckCircle,
    FiAlertCircle,
    FiLoader,
    FiSettings
} from 'react-icons/fi'
import { MdAdminPanelSettings } from 'react-icons/md'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import defaultUserAvatar from '../assets/default_user_profiles.png'
import AdminActionModal from '../components/AdminActionModal'
import CustomerManagement from '../components/CustomerManagement'
import isSuperAdmin from '../utils/isSuperAdmin'

// ─── Reusable Toggle Component ────────────────────────────────────────────────
const EmailToggle = ({ label, description, icon, checked, onChange, loading }) => (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-slate-100 last:border-0">
        <div className="flex items-start gap-3 flex-1">
            <div className="mt-0.5 p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                {icon}
            </div>
            <div>
                <p className="font-semibold text-slate-800 text-sm">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{description}</p>
            </div>
        </div>
        <button
            onClick={() => !loading && onChange(!checked)}
            disabled={loading}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none shrink-0 mt-1 ${
                loading ? 'opacity-50 cursor-not-allowed' :
                checked ? 'bg-green-500' : 'bg-slate-300'
            }`}
            title={checked ? 'Click to disable' : 'Click to enable'}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    checked ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
        </button>
    </div>
)

// ─── Admin Card ───────────────────────────────────────────────────────────────
const AdminCard = ({ admin, onRemove, isRemoving }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'Never'
        return new Date(dateString).toLocaleDateString('en-PH', {
            year: 'numeric', month: 'short', day: 'numeric'
        })
    }

    return (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 group hover:border-blue-200 hover:bg-blue-50/30 transition-all">
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-white shadow">
                <img
                    src={admin.avatar || defaultUserAvatar}
                    alt={admin.name}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm truncate">{admin.name}</p>
                <p className="text-xs text-slate-500 truncate">{admin.email}</p>
                <p className="text-xs text-slate-400 mt-0.5">Last login: {formatDate(admin.last_login_date)}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    admin.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                }`}>
                    {admin.status}
                </span>
                <button
                    onClick={() => onRemove(admin.email)}
                    disabled={isRemoving}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    title="Remove admin"
                >
                    {isRemoving ? <FiLoader className="animate-spin" size={14} /> : <FiTrash2 size={14} />}
                </button>
            </div>
        </div>
    )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const SuperAdminSettings = () => {
    const user = useSelector((state) => state.user)

    // ── Admin Management State
    const [admins, setAdmins] = useState([])
    const [adminsLoading, setAdminsLoading] = useState(true)
    const [addEmail, setAddEmail] = useState('')
    const [removeEmail, setRemoveEmail] = useState('')
    const [addLoading, setAddLoading] = useState(false)
    const [removeLoading, setRemoveLoading] = useState(false)
    const [previewUser, setPreviewUser] = useState(null)
    const [previewLoading, setPreviewLoading] = useState(false)
    const [activeTab, setActiveTab] = useState(isSuperAdmin(user.role) ? 'admins' : 'customers')

    // ── Modal State
    const [modalConfig, setModalConfig] = useState({
        show: false,
        type: 'promote', // 'promote' or 'demote'
        user: null
    })

    // ── Email Settings State
    const [emailSettings, setEmailSettings] = useState({
        registration: true,
        emailVerification: true,
        forgotPassword: true,
        orderCheckout: true,
        orderStatusUpdate: true,
        orderCancellation: true,
        newOrderAdminAlert: true
    })
    const [emailSettingsLoading, setEmailSettingsLoading] = useState(true)
    const [togglingKey, setTogglingKey] = useState(null)

    // ── Fetch Admins ────────────────────────────────────────────────────────
    const fetchAdmins = useCallback(async () => {
        setAdminsLoading(true)
        try {
            const res = await Axios({ ...SummaryApi.getAdmins })
            if (res.data.success) {
                setAdmins(res.data.data)
            }
        } catch (error) {
            toast.error('Failed to fetch admins')
        } finally {
            setAdminsLoading(false)
        }
    }, [])

    // ── Fetch Email Settings ─────────────────────────────────────────────────
    const fetchEmailSettings = useCallback(async () => {
        setEmailSettingsLoading(true)
        try {
            const res = await Axios({ ...SummaryApi.getEmailSettings })
            if (res.data.success) {
                setEmailSettings(prev => ({ ...prev, ...res.data.data }))
            }
        } catch (error) {
            toast.error('Failed to fetch email settings')
        } finally {
            setEmailSettingsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchAdmins()
        fetchEmailSettings()
    }, [fetchAdmins, fetchEmailSettings])

    // ── Preview user by email ────────────────────────────────────────────────
    const handlePreviewUser = async (email) => {
        if (!email || !email.includes('@')) {
            setPreviewUser(null)
            return
        }
        setPreviewLoading(true)
        setPreviewUser(null)
        try {
            const res = await Axios({
                ...SummaryApi.checkUserByEmail,
                data: { email }
            })
            if (res.data.success) {
                setPreviewUser(res.data.data)
            }
        } catch {
            setPreviewUser(null)
        } finally {
            setPreviewLoading(false)
        }
    }

    // ── Add Admin (Trigger Modal) ─────────────────────────────────────────────
    const handleAddAdminClick = (e) => {
        e.preventDefault()
        if (!addEmail.trim() || !previewUser) return
        
        setModalConfig({
            show: true,
            type: 'promote',
            user: previewUser
        })
    }

    // ── Actual Add Admin Logic ───────────────────────────────────────────────
    const handleConfirmAddAdmin = async () => {
        if (!modalConfig.user) return

        setAddLoading(true)
        try {
            const res = await Axios({
                ...SummaryApi.addAdmin,
                data: { email: modalConfig.user.email }
            })
            if (res.data.success) {
                toast.success(res.data.message)
                setAddEmail('')
                setPreviewUser(null)
                fetchAdmins()
                setModalConfig({ show: false, type: 'promote', user: null })
            } else {
                toast.error(res.data.message)
            }
        } catch (error) {
            const msg = error?.response?.data?.message || 'Failed to add admin'
            toast.error(msg)
        } finally {
            setAddLoading(false)
        }
    }

    // ── Remove Admin (Trigger Modal) ──────────────────────────────────────────
    const handleRemoveAdminClick = async (emailOrUser) => {
        let userToDemote = null
        
        if (typeof emailOrUser === 'string') {
            // Manual input email - try to find in current admins or fetch
            const existing = admins.find(a => a.email === emailOrUser)
            if (existing) {
                userToDemote = existing
            } else {
                // Not in current list, maybe fetch preview? 
                // For simplicity, if not in list, we can just use the email as name/email
                userToDemote = { email: emailOrUser, name: emailOrUser }
            }
        } else {
            // Full user object from AdminCard
            userToDemote = emailOrUser
        }

        setModalConfig({
            show: true,
            type: 'demote',
            user: userToDemote
        })
    }

    // ── Actual Remove Admin Logic ─────────────────────────────────────────────
    const handleConfirmRemoveAdmin = async () => {
        if (!modalConfig.user) return
        
        setRemoveLoading(true)
        try {
            const res = await Axios({
                ...SummaryApi.removeAdmin,
                data: { email: modalConfig.user.email }
            })
            if (res.data.success) {
                toast.success(res.data.message)
                setRemoveEmail('')
                fetchAdmins()
                setModalConfig({ show: false, type: 'demote', user: null })
            } else {
                toast.error(res.data.message)
            }
        } catch (error) {
            const msg = error?.response?.data?.message || 'Failed to remove admin'
            toast.error(msg)
        } finally {
            setRemoveLoading(false)
        }
    }

    // ── Toggle Email Setting ─────────────────────────────────────────────────
    const handleToggleEmail = async (key, value) => {
        setTogglingKey(key)
        const prev = emailSettings[key]
        setEmailSettings(s => ({ ...s, [key]: value })) // optimistic update

        try {
            const res = await Axios({
                ...SummaryApi.updateEmailSettings,
                data: { [key]: value }
            })
            if (!res.data.success) {
                setEmailSettings(s => ({ ...s, [key]: prev })) // revert
                toast.error(res.data.message)
            } else {
                toast.success(`${value ? 'Enabled' : 'Disabled'} successfully`)
            }
        } catch {
            setEmailSettings(s => ({ ...s, [key]: prev }))
            toast.error('Failed to update setting')
        } finally {
            setTogglingKey(null)
        }
    }

    // ── Email settings config ────────────────────────────────────────────────
    const emailCategories = [
        {
            key: 'registration',
            label: 'Registration Email',
            description: 'Send verification email when a new user registers',
            icon: <FiUserPlus size={14} />
        },
        {
            key: 'forgotPassword',
            label: 'Forgot Password OTP',
            description: 'Send OTP email when a user requests password reset',
            icon: <FiMail size={14} />
        },
        {
            key: 'orderCheckout',
            label: 'Order Confirmation (Customer)',
            description: 'Send receipt email to the customer after placing an order',
            icon: <FiCheckCircle size={14} />
        },
        {
            key: 'orderStatusUpdate',
            label: 'Order Status Updates (Customer)',
            description: 'Notify customer when the order status is updated by admin',
            icon: <FiMail size={14} />
        },
        {
            key: 'orderCancellation',
            label: 'Order Cancellation (Admin Alert)',
            description: 'Notify admins when a customer cancels an order',
            icon: <FiAlertCircle size={14} />
        },
        {
            key: 'newOrderAdminAlert',
            label: 'New Order Alert (Admin)',
            description: 'Notify all admins when a new order is placed',
            icon: <FiMail size={14} />
        }
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl text-white shadow ${isSuperAdmin(user.role) ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'}`}>
                    <FiShield size={20} />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-slate-800">{isSuperAdmin(user.role) ? 'Super Admin Settings' : 'Settings'}</h1>
                    <p className="text-sm text-slate-500">
                        {isSuperAdmin(user.role)
                            ? 'Manage admins, customers, and system-wide email notifications'
                            : 'Manage customer profiles for support purposes'}
                    </p>
                </div>
            </div>

            {/* Logged in as badge */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg w-fit ${isSuperAdmin(user.role) ? 'bg-purple-50 border border-purple-200' : 'bg-blue-50 border border-blue-200'}`}>
                <FiShield size={14} className={isSuperAdmin(user.role) ? 'text-purple-600' : 'text-blue-600'} />
                <span className={`text-xs font-semibold ${isSuperAdmin(user.role) ? 'text-purple-700' : 'text-blue-700'}`}>
                    Logged in as {isSuperAdmin(user.role) ? 'Super Admin' : 'Admin'}: {user.email}
                </span>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
                {[
                    { id: 'customers', label: 'Customer Management', icon: <FiUsers size={14} /> },
                    ...(isSuperAdmin(user.role) ? [
                        { id: 'admins', label: 'Admin Management', icon: <FiUsers size={14} /> },
                        { id: 'email',  label: 'Email Notifications', icon: <FiMail size={14} /> }
                    ] : [])
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px whitespace-nowrap ${
                            activeTab === tab.id
                                ? 'border-purple-500 text-purple-700'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ── ADMIN MANAGEMENT TAB ── */}
            {activeTab === 'admins' && (
                <div className="space-y-5">
                    {/* Add Admin */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-green-50 to-emerald-50 flex items-center gap-2">
                            <FiUserPlus className="text-green-600" size={16} />
                            <h2 className="font-bold text-slate-800 text-sm">Promote User to Admin</h2>
                        </div>
                        <div className="p-5">
                            <form onSubmit={handleAddAdminClick} className="space-y-3">
                                <div className="relative">
                                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                                    <input
                                        type="email"
                                        value={addEmail}
                                        onChange={(e) => {
                                            setAddEmail(e.target.value)
                                            handlePreviewUser(e.target.value)
                                        }}
                                        placeholder="Enter user email address..."
                                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition"
                                    />
                                </div>

                                {/* Preview user card */}
                                {previewLoading && (
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <FiLoader className="animate-spin" size={12} /> Checking user...
                                    </div>
                                )}
                                {previewUser && !previewLoading && (
                                    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm ${
                                        previewUser.role === 'ADMIN'
                                            ? 'bg-amber-50 border-amber-200'
                                            : previewUser.role === 'SUPERADMIN'
                                            ? 'bg-purple-50 border-purple-200'
                                            : 'bg-green-50 border-green-200'
                                    }`}>
                                        <img
                                            src={previewUser.avatar || defaultUserAvatar}
                                            alt={previewUser.name}
                                            className="w-8 h-8 rounded-full object-cover border border-white shadow-sm shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-slate-800 truncate">{previewUser.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{previewUser.email}</p>
                                        </div>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                            previewUser.role === 'ADMIN'
                                                ? 'bg-amber-200 text-amber-800'
                                                : previewUser.role === 'SUPERADMIN'
                                                ? 'bg-purple-200 text-purple-800'
                                                : 'bg-green-200 text-green-800'
                                        }`}>
                                            {previewUser.role}
                                        </span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={addLoading || !addEmail.trim()}
                                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold text-sm rounded-xl shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {addLoading ? (
                                        <><FiLoader className="animate-spin" size={14} /> Promoting...</>
                                    ) : (
                                        <><FiUserPlus size={14} /> Promote to Admin</>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Current Admins List */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <MdAdminPanelSettings className="text-blue-600" size={18} />
                                <h2 className="font-bold text-slate-800 text-sm">Current Admins</h2>
                            </div>
                            <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full">
                                {admins.length} admin{admins.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <div className="p-4">
                            {adminsLoading ? (
                                <div className="flex items-center justify-center py-8 text-slate-400 gap-2 text-sm">
                                    <FiLoader className="animate-spin" size={16} /> Loading admins...
                                </div>
                            ) : admins.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 text-sm">
                                    No admins found. Promote a user above.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {admins.map(admin => (
                                        <AdminCard
                                            key={admin._id}
                                            admin={admin}
                                            onRemove={() => handleRemoveAdminClick(admin)}
                                            isRemoving={removeLoading}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Remove Admin by Email (manual input) */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-red-50 to-rose-50 flex items-center gap-2">
                            <FiUserX className="text-red-500" size={16} />
                            <h2 className="font-bold text-slate-800 text-sm">Remove Admin by Email</h2>
                        </div>
                        <div className="p-5">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                                    <input
                                        type="email"
                                        value={removeEmail}
                                        onChange={(e) => setRemoveEmail(e.target.value)}
                                        placeholder="Enter admin email to remove..."
                                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && removeEmail.trim()) {
                                                e.preventDefault()
                                                handleRemoveAdmin(removeEmail.trim())
                                            }
                                        }}
                                    />
                                </div>
                                <button
                                    onClick={() => removeEmail.trim() && handleRemoveAdminClick(removeEmail.trim())}
                                    disabled={removeLoading || !removeEmail.trim()}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm rounded-xl shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {removeLoading ? <FiLoader className="animate-spin" size={14} /> : <FiUserX size={14} />}
                                    Remove
                                </button>
                            </div>
                            <p className="text-xs text-slate-400 mt-2">
                                This will demote the user back to a regular user. The account is not deleted.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ── CUSTOMER MANAGEMENT TAB ── */}
            {activeTab === 'customers' && (
                <CustomerManagement />
            )}

            {/* ── EMAIL NOTIFICATIONS TAB ── */}
            {activeTab === 'email' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-indigo-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FiSettings className="text-purple-600" size={16} />
                            <h2 className="font-bold text-slate-800 text-sm">Email Notification Controls</h2>
                        </div>
                        <span className="text-xs text-slate-500">
                            {emailCategories.filter(c => emailSettings[c.key]).length}/{emailCategories.length} enabled
                        </span>
                    </div>

                    {emailSettingsLoading ? (
                        <div className="flex items-center justify-center py-12 text-slate-400 gap-2 text-sm">
                            <FiLoader className="animate-spin" size={16} /> Loading settings...
                        </div>
                    ) : (
                        <div className="px-5 py-2">
                            {emailCategories.map(({ key, label, description, icon }) => (
                                <EmailToggle
                                    key={key}
                                    label={label}
                                    description={description}
                                    icon={icon}
                                    checked={emailSettings[key] !== false}
                                    onChange={(val) => handleToggleEmail(key, val)}
                                    loading={togglingKey === key}
                                />
                            ))}
                        </div>
                    )}

                    <div className="px-5 py-4 bg-amber-50 border-t border-amber-100">
                        <div className="flex items-start gap-2 text-xs text-amber-700">
                            <FiAlertCircle size={13} className="shrink-0 mt-0.5" />
                            <p>
                                <strong>Warning:</strong> Disabling emails like "Order Confirmation" means customers won't receive purchase receipts.
                                Disabling "Forgot Password OTP" will prevent users from resetting their password via email.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Admin Action Modal */}
            {modalConfig.show && (
                <AdminActionModal
                    type={modalConfig.type}
                    user={modalConfig.user}
                    loading={modalConfig.type === 'promote' ? addLoading : removeLoading}
                    onConfirm={modalConfig.type === 'promote' ? handleConfirmAddAdmin : handleConfirmRemoveAdmin}
                    onClose={() => setModalConfig({ ...modalConfig, show: false })}
                />
            )}
        </div>
    )
}

export default SuperAdminSettings
