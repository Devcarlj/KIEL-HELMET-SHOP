import React, { useEffect, useState } from 'react'
import { IoIosClose } from 'react-icons/io'
import { HiOutlineDocumentDownload, HiOutlineClipboardList, HiOutlineExclamation, HiOutlineCreditCard, HiOutlineHashtag } from 'react-icons/hi'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'

/**
 * Auto-generate a tracking number from the order ID.
 * Produces a 13-digit number prefixed with 770 (J&T style).
 * The seller can override this in the modal.
 */
const autoGenerateTracking = (orderId) => {
    if (!orderId) return ''
    let hash = 0
    for (let i = 0; i < orderId.length; i++) {
        hash = ((hash << 5) - hash) + orderId.charCodeAt(i)
        hash = hash & hash // Convert to 32-bit int
    }
    const absHash = Math.abs(hash)
    // Build a 13-digit tracking number: 770 + 10 digits from hash
    const suffix = String(absHash).padStart(10, '0').slice(0, 10)
    return `770${suffix}`
}

/**
 * Modal that lets the admin review/edit buyer & seller info before
 * downloading an Order Summary or Waybill.
 *
 * Props:
 *   close        – function to close the modal
 *   order        – the full order object
 *   downloadType – 'summary' | 'waybill'
 *   onConfirm    – function(buyerInfo, sellerInfo, shipmentInfo) called when admin clicks Download
 */
const DownloadPreviewModal = ({ close, order, downloadType, onConfirm }) => {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // ── Seller Info (from backend, editable) ───────────────────────
    const [sellerInfo, setSellerInfo] = useState({
        name: '',
        phone: '',
        addressLine: '',
        city: '',
        region: '',
        barangay: '',
        sortCode: ''
    })

    // ── Buyer Info (from order, editable) ──────────────────────────
    const [buyerInfo, setBuyerInfo] = useState({
        name: '',
        phone: '',
        addressLine: '',
        city: '',
        state: '',
        country: '',
        pincode: ''
    })

    // ── Shipment Info (tracking + payment) ─────────────────────────
    const [trackingNumber, setTrackingNumber] = useState('')
    const [paymentMethod, setPaymentMethod] = useState('cod')

    // Track if seller info has never been saved (all empty)
    const [isSellerEmpty, setIsSellerEmpty] = useState(false)

    // Fetch seller shop info on mount
    useEffect(() => {
        fetchShopInfo()
        initBuyerInfo()
        initShipmentInfo()
    }, [])

    const fetchShopInfo = async () => {
        try {
            setLoading(true)
            const response = await Axios({ ...SummaryApi.getShopInfo })
            if (response.data.success) {
                const info = response.data.data
                const isEmpty = !info.name && !info.phone && !info.addressLine
                setIsSellerEmpty(isEmpty)
                setSellerInfo({
                    name: info.name || '',
                    phone: info.phone || '',
                    addressLine: info.addressLine || '',
                    city: info.city || '',
                    region: info.region || '',
                    barangay: info.barangay || '',
                    sortCode: info.sortCode || ''
                })
            }
        } catch (error) {
            console.error('Failed to fetch shop info:', error)
        } finally {
            setLoading(false)
        }
    }

    const initBuyerInfo = () => {
        const addr = order.deliveryAddress || {}
        setBuyerInfo({
            name: order.userId?.name || '',
            phone: addr.mobile ? String(addr.mobile) : (order.userId?.mobile ? String(order.userId.mobile) : ''),
            addressLine: addr.adress_line || '',
            city: addr.city || '',
            state: addr.state || '',
            country: addr.country || '',
            pincode: addr.pincode || ''
        })
    }

    const initShipmentInfo = () => {
        // Use existing tracking number if set, otherwise auto-generate one
        const existing = order.trackingNumber
        setTrackingNumber(existing || autoGenerateTracking(order.orderId))
        setPaymentMethod(order.paymentMethod || 'cod')
    }

    const handleSellerChange = (field, value) => {
        setSellerInfo(prev => ({ ...prev, [field]: value }))
    }

    const handleBuyerChange = (field, value) => {
        setBuyerInfo(prev => ({ ...prev, [field]: value }))
    }

    const handleDownload = async () => {
        // Save seller info to backend so it persists
        try {
            setSaving(true)
            await Axios({
                ...SummaryApi.updateShopInfo,
                data: sellerInfo
            })
            toast.success('Shop info saved for future use')
        } catch (error) {
            console.error('Failed to save shop info:', error)
            // Continue with download even if save fails
        } finally {
            setSaving(false)
        }

        // Call the download handler with all reviewed data
        onConfirm(buyerInfo, sellerInfo, {
            trackingNumber,
            paymentMethod
        })
        close()
    }

    const isWaybill = downloadType === 'waybill'
    const titleLabel = isWaybill ? 'Waybill' : 'Order Summary'
    const Icon = isWaybill ? HiOutlineDocumentDownload : HiOutlineClipboardList
    const accentColor = isWaybill ? 'rose' : 'indigo'

    const inputClass = `w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg outline-none focus:ring-2 focus:ring-${accentColor}-200 focus:border-${accentColor}-400 transition-all font-medium`
    const labelClass = 'block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1'

    if (loading) {
        return (
            <section className='fixed inset-0 z-[60] bg-neutral-800/60 backdrop-blur-sm flex items-center justify-center p-4'>
                <div className='bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-12 flex flex-col items-center gap-4'>
                    <div className='w-8 h-8 border-3 border-neutral-200 border-t-neutral-600 rounded-full animate-spin' />
                    <p className='text-sm text-neutral-500 font-medium'>Loading shop information...</p>
                </div>
            </section>
        )
    }

    return (
        <section className='fixed inset-0 z-[60] bg-neutral-800/60 backdrop-blur-sm flex items-center justify-center p-4'>
            <div className='bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col'>
                {/* Header */}
                <div className={`flex items-center justify-between p-4 border-b bg-${accentColor}-50/50 flex-shrink-0`}>
                    <div className='flex items-center gap-2'>
                        <div className={`w-8 h-8 rounded-full bg-${accentColor}-100 flex items-center justify-center text-${accentColor}-600`}>
                            <Icon size={18} />
                        </div>
                        <div>
                            <h1 className='font-bold text-neutral-800 text-lg leading-tight'>Download {titleLabel}</h1>
                            <p className='text-[11px] text-neutral-400 font-medium'>Review details before generating — {order.orderId}</p>
                        </div>
                    </div>
                    <button
                        onClick={close}
                        className={`p-1 hover:bg-${accentColor}-100 rounded-full transition-colors text-neutral-400 hover:text-${accentColor}-500`}
                    >
                        <IoIosClose size={28} />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className='overflow-y-auto flex-1 p-6 space-y-6'>

                    {/* Warning if seller info is empty */}
                    {isSellerEmpty && (
                        <div className='flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4'>
                            <HiOutlineExclamation className='w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5' />
                            <div>
                                <p className='text-sm font-bold text-amber-800'>Shop info not set up yet</p>
                                <p className='text-xs text-amber-600 mt-1'>Please fill in your shop details below. They will be saved and used as defaults for future downloads.</p>
                            </div>
                        </div>
                    )}

                    {/* ─── SHIPMENT / ORDER INFO ─── */}
                    <div>
                        <div className='flex items-center gap-2 mb-4'>
                            <div className='w-1 h-5 bg-emerald-500 rounded-full' />
                            <h3 className='font-bold text-neutral-800 text-sm uppercase tracking-wide'>Shipment Details</h3>
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                            <div>
                                <label className={labelClass}>
                                    <HiOutlineHashtag className='inline w-3 h-3 mr-1' />
                                    Tracking Number
                                </label>
                                <input type='text' className={inputClass} placeholder='Auto-generated'
                                    value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} />
                                <p className='text-[9px] text-neutral-400 mt-1 font-medium'>Auto-generated from Order ID. You can edit it.</p>
                            </div>
                            <div>
                                <label className={labelClass}>
                                    <HiOutlineCreditCard className='inline w-3 h-3 mr-1' />
                                    Payment Method
                                </label>
                                <div className='flex gap-2'>
                                    <button
                                        type='button'
                                        onClick={() => setPaymentMethod('cod')}
                                        className={`flex-1 py-2.5 rounded-lg text-xs font-bold border-2 transition-all ${
                                            paymentMethod === 'cod'
                                                ? 'border-amber-400 bg-amber-50 text-amber-700 shadow-sm'
                                                : 'border-neutral-200 bg-neutral-50 text-neutral-400 hover:border-neutral-300'
                                        }`}
                                    >
                                        💵 COD
                                    </button>
                                    <button
                                        type='button'
                                        onClick={() => setPaymentMethod('online')}
                                        className={`flex-1 py-2.5 rounded-lg text-xs font-bold border-2 transition-all ${
                                            paymentMethod === 'online'
                                                ? 'border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm'
                                                : 'border-neutral-200 bg-neutral-50 text-neutral-400 hover:border-neutral-300'
                                        }`}
                                    >
                                        💳 Online (Paid)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ─── SELLER INFORMATION ─── */}
                    <div>
                        <div className='flex items-center gap-2 mb-4'>
                            <div className='w-1 h-5 bg-rose-500 rounded-full' />
                            <h3 className='font-bold text-neutral-800 text-sm uppercase tracking-wide'>Seller / Shop Information</h3>
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                            <div>
                                <label className={labelClass}>Shop Name</label>
                                <input type='text' className={inputClass} placeholder='Kiel Helmet Shop'
                                    value={sellerInfo.name} onChange={e => handleSellerChange('name', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>Phone</label>
                                <input type='text' className={inputClass} placeholder='639XXXXXXXXX'
                                    value={sellerInfo.phone} onChange={e => handleSellerChange('phone', e.target.value)} />
                            </div>
                            <div className='md:col-span-2'>
                                <label className={labelClass}>Address Line</label>
                                <input type='text' className={inputClass} placeholder='Street, Building, etc.'
                                    value={sellerInfo.addressLine} onChange={e => handleSellerChange('addressLine', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>City</label>
                                <input type='text' className={inputClass} placeholder='City'
                                    value={sellerInfo.city} onChange={e => handleSellerChange('city', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>Region</label>
                                <input type='text' className={inputClass} placeholder='Region'
                                    value={sellerInfo.region} onChange={e => handleSellerChange('region', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>Barangay</label>
                                <input type='text' className={inputClass} placeholder='Barangay'
                                    value={sellerInfo.barangay} onChange={e => handleSellerChange('barangay', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>Sort Code</label>
                                <input type='text' className={inputClass} placeholder='0000'
                                    value={sellerInfo.sortCode} onChange={e => handleSellerChange('sortCode', e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* ─── BUYER / CUSTOMER INFORMATION ─── */}
                    <div>
                        <div className='flex items-center gap-2 mb-4'>
                            <div className='w-1 h-5 bg-indigo-500 rounded-full' />
                            <h3 className='font-bold text-neutral-800 text-sm uppercase tracking-wide'>Customer / Buyer Information</h3>
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                            <div>
                                <label className={labelClass}>Full Name</label>
                                <input type='text' className={inputClass}
                                    value={buyerInfo.name} onChange={e => handleBuyerChange('name', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>Phone</label>
                                <input type='text' className={inputClass}
                                    value={buyerInfo.phone} onChange={e => handleBuyerChange('phone', e.target.value)} />
                            </div>
                            <div className='md:col-span-2'>
                                <label className={labelClass}>Address Line</label>
                                <input type='text' className={inputClass}
                                    value={buyerInfo.addressLine} onChange={e => handleBuyerChange('addressLine', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>City</label>
                                <input type='text' className={inputClass}
                                    value={buyerInfo.city} onChange={e => handleBuyerChange('city', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>State / Province</label>
                                <input type='text' className={inputClass}
                                    value={buyerInfo.state} onChange={e => handleBuyerChange('state', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>Country</label>
                                <input type='text' className={inputClass}
                                    value={buyerInfo.country} onChange={e => handleBuyerChange('country', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>Postal / Zip Code</label>
                                <input type='text' className={inputClass}
                                    value={buyerInfo.pincode} onChange={e => handleBuyerChange('pincode', e.target.value)} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer / Actions */}
                <div className='p-4 bg-neutral-50/80 border-t border-neutral-100 flex items-center gap-3 flex-shrink-0'>
                    <button
                        type='button'
                        onClick={close}
                        className='flex-1 py-3 font-bold text-neutral-500 hover:bg-white rounded-xl border border-neutral-200 transition-all text-sm'
                    >
                        Cancel
                    </button>
                    <button
                        type='button'
                        onClick={handleDownload}
                        disabled={saving || !sellerInfo.name}
                        className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2 ${
                            saving || !sellerInfo.name
                                ? 'bg-neutral-300 cursor-not-allowed shadow-none'
                                : isWaybill
                                    ? 'bg-rose-600 hover:bg-rose-700 active:scale-[0.98] shadow-rose-100'
                                    : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] shadow-indigo-100'
                        }`}
                    >
                        <Icon className='w-4 h-4' />
                        {saving ? 'Saving...' : `Download ${titleLabel}`}
                    </button>
                </div>
            </div>
        </section>
    )
}

export default DownloadPreviewModal
