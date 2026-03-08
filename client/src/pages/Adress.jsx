import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { MdOutlineLocationOn, MdEdit, MdDeleteOutline, MdAdd, MdClose } from "react-icons/md";
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import { setUserDetails, deleteAddressAction } from '../store/userSlice';

const Adress = () => {
  const user = useSelector(state => state.user);
  const addresses = user.adress_details || [];
  const dispatch = useDispatch();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    adress_line: '',
    city: '',
    state: '',
    pincode: '',
    country: 'Philippines',
    mobile: ''
  });

  const refreshUserData = async () => {
    try {
      const response = await Axios({ ...SummaryApi.userDetails });
      if (response.data.success) {
        dispatch(setUserDetails(response.data.data));
      }
    } catch (error) {
      console.error("Failed to refresh user data", error);
    }
  };

  const handleOpenForm = (addr = null) => {
    if (addr) {
      setEditingAddress(addr);
      setFormData({
        adress_line: addr.adress_line,
        city: addr.city,
        state: addr.state,
        pincode: addr.pincode,
        country: addr.country || 'Philippines',
        mobile: addr.mobile
      });
    } else {
      setEditingAddress(null);
      setFormData({
        adress_line: '',
        city: '',
        state: '',
        pincode: '',
        country: 'Philippines',
        mobile: ''
      });
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let response;
      if (editingAddress) {
        response = await Axios({
          ...SummaryApi.updateAddress,
          data: { ...formData, _id: editingAddress._id }
        });
      } else {
        response = await Axios({
          ...SummaryApi.addAddress,
          data: formData
        });
      }

      if (response.data.success) {
        toast.success(response.data.message);
        await refreshUserData();
        setIsFormOpen(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      const response = await Axios({
        ...SummaryApi.deleteAddress,
        data: { _id: id }
      });
      if (response.data.success) {
        toast.success(response.data.message);
        dispatch(deleteAddressAction(id));
        await refreshUserData();
      }
    } catch (error) {
      toast.error("Failed to delete address");
    }
  };

  return (
    <div className='p-4 max-w-4xl mx-auto'>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h2 className='font-black text-xl text-slate-800 uppercase tracking-tight'>Saved Addresses</h2>
          <p className='text-xs font-bold text-slate-400 uppercase tracking-widest'>Manage your delivery locations</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className='flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-200'
        >
          <MdAdd className='text-lg' /> Add New
        </button>
      </div>

      {addresses.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {addresses.map((addr) => (
            <div key={addr._id} className='bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden'>
              <div className='absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity'></div>

              <div className='flex justify-between items-start mb-3'>
                <div className='p-2 bg-slate-50 rounded-lg text-primary'>
                  <MdOutlineLocationOn className='text-xl' />
                </div>
                <div className='flex gap-1'>
                  <button
                    onClick={() => handleOpenForm(addr)}
                    className='p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all'
                  >
                    <MdEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(addr._id)}
                    className='p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all'
                  >
                    <MdDeleteOutline />
                  </button>
                </div>
              </div>

              <h3 className='font-black text-sm text-slate-800 mb-1 leading-tight'>{addr.adress_line}</h3>
              <p className='text-xs font-bold text-slate-500 mb-3 uppercase tracking-tighter'>
                {addr.city}, {addr.state} {addr.pincode}
              </p>

              <div className='pt-3 border-t border-slate-50 flex items-center gap-2'>
                <span className='text-[10px] font-black text-slate-300 uppercase'>Mobile:</span>
                <span className='text-[10px] font-black text-slate-700'>{addr.mobile || 'N/A'}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='py-20 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200'>
          <div className='w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4'>
            <MdOutlineLocationOn className='text-3xl text-slate-200' />
          </div>
          <h3 className='font-black text-slate-800 uppercase tracking-tight'>No Addresses Yet</h3>
          <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1'>Add a delivery address to get started</p>
          <button
            onClick={() => handleOpenForm()}
            className='mt-6 bg-primary/10 text-primary px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all'
          >
            + Add First Address
          </button>
        </div>
      )}

      {/* Address Form Modal */}
      {isFormOpen && (
        <div className='fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200'>
          <div className='bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200'>
            <div className='px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50'>
              <h3 className='font-black text-xs uppercase tracking-widest text-slate-800'>
                {editingAddress ? 'Update Address' : 'New Address'}
              </h3>
              <button onClick={() => setIsFormOpen(false)} className='text-slate-400 hover:text-slate-600'><MdClose className='text-xl' /></button>
            </div>

            <form onSubmit={handleSubmit} className='p-6 space-y-4'>
              <div className='space-y-1'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>Address Line</label>
                <input
                  type="text"
                  required
                  placeholder="Street, Barangay, etc."
                  className='w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all'
                  value={formData.adress_line}
                  onChange={e => setFormData({ ...formData, adress_line: e.target.value })}
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-1'>
                  <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>City</label>
                  <input
                    type="text"
                    required
                    placeholder="City"
                    className='w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all'
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className='space-y-1'>
                  <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>Province/State</label>
                  <input
                    type="text"
                    required
                    placeholder="Province"
                    className='w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all'
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-1'>
                  <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>Pincode / ZIP</label>
                  <input
                    type="text"
                    required
                    placeholder="Zip code"
                    className='w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all'
                    value={formData.pincode}
                    onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                  />
                </div>
                <div className='space-y-1'>
                  <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>Country</label>
                  <input
                    type="text"
                    required
                    placeholder="Philippines"
                    className='w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all'
                    value={formData.country}
                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>
              </div>

              <div className='space-y-1'>
                <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1'>Mobile Number</label>
                <input
                  type="text"
                  required
                  placeholder="09XXXXXXXXX"
                  className='w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all'
                  value={formData.mobile}
                  onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                />
              </div>

              <div className='pt-4'>
                <button
                  type="submit"
                  disabled={loading}
                  className='w-full bg-slate-900 text-white py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-black transition-all active:scale-[0.98] disabled:bg-slate-300'
                >
                  {loading ? 'Processing...' : (editingAddress ? 'Update Saved Address' : 'Save Address')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Adress
