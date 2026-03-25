import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import UploadSubCategoryModel from '../components/UploadSubCategoryModel.jsx'
import Axios from '../utils/Axios.js'
import SummaryApi from '../common/SummaryApi.js'
import NoData from '../components/NoData.jsx'
import EditSubCategory from '../components/EditSubCategory.jsx'
import DeleteSubCategoryConfirm from '../components/DeleteSubCategoryConfirm.jsx'

// Icons
const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
    <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
  </svg>
)

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
  </svg>
)

const SubCategoryPage = () => {
  const [openUploadSubCategory, setOpenUploadSubCategory] = useState(false)
  const [subCategoryData, setSubCategoryData] = useState([])
  const [loading, setLoading] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [editData, setEditData] = useState({ name: "", image: "", _id: "", category: [] })
  const [subCategoryToDelete, setSubCategoryToDelete] = useState(null)
  const [newlyAddedId, setNewlyAddedId] = useState(null) // Added for highlighting

  const fetchSubCategory = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      const response = await Axios({ ...SummaryApi.getSubCategory })
      if (response.data.success) {
        setSubCategoryData(response.data.data)
      }
    } catch (error) {
      console.log("Error fetching sub categories", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubCategory()
  }, [])

  const handleOnAdded = (newSub) => {
    setSubCategoryData((prev) => [newSub, ...prev])
    setNewlyAddedId(newSub._id)

    // Remove highlight after 5 seconds
    setTimeout(() => {
      setNewlyAddedId(null)
    }, 5000)
  }

  const handleUpdateLocalState = (updatedData) => {
    setSubCategoryData((prev) =>
      prev.map(item =>
        item._id === updatedData._id
          ? { ...item, ...updatedData }
          : item
      )
    )
  }

  const handleDeleteSubCategory = async (subCategory) => {
    setSubCategoryData((prev) => prev.filter((item) => item._id !== subCategory._id))
    setSubCategoryToDelete(null)
    toast.success('Sub category deleted')
    try {
      const response = await Axios({
        ...SummaryApi.deleteSubCategory,
        data: { subCategoryId: subCategory._id }
      })
      if (!response.data.success) {
        setSubCategoryData((prev) => [subCategory, ...prev])
        toast.error(response.data.message || 'Delete failed')
      }
    } catch (error) {
      setSubCategoryData((prev) => [subCategory, ...prev])
      toast.error(error?.response?.data?.message || 'Error deleting sub category')
    }
  }

  const getCategoryNames = (categoryArr) => {
    if (!categoryArr || categoryArr.length === 0) return <span className='text-slate-400 italic text-xs'>None</span>
    return categoryArr.map((cat, i) => (
      <span key={i} className='inline-flex items-center bg-slate-50 text-slate-600 text-[11px] font-bold px-2 py-1 rounded-md border border-slate-200 uppercase tracking-tight'>
        {cat.name || cat}
      </span>
    ))
  }

  return (
    <section className='bg-gray-50 min-h-screen'>
      {/* Header */}
      <div className='p-3 md:p-4 bg-white shadow-sm flex items-center justify-between sticky top-0 z-10'>
        <h2 className='font-bold text-base md:text-xl text-neutral-800'>Sub Category</h2>
        <button
          onClick={() => setOpenUploadSubCategory(true)}
          className='text-xs md:text-sm font-semibold bg-primary hover:bg-orange-500 text-white px-3 md:px-5 py-2 rounded-full shadow-md transition-all active:scale-95 flex items-center gap-1'
        >
          <span>+</span>
          <span className='hidden xs:block'>Add Sub Category</span>
          <span className='xs:hidden'>Add</span>
        </button>
      </div>

      <div className='p-3 md:p-6'>
        {loading && (
          <div className='space-y-6'>
            {/* --- Desktop Table Skeleton --- */}
            <div className='hidden md:block bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-pulse'>
              <div className='bg-slate-50 border-b border-slate-200 h-14 w-full'></div>
              {[...Array(6)].map((_, i) => (
                <div key={i} className='flex items-center gap-4 px-6 py-5 border-b border-slate-100'>
                  <div className='h-4 w-8 bg-gray-200 rounded'></div> {/* # */}
                  <div className='h-5 w-48 bg-gray-200 rounded ml-4'></div> {/* Name */}
                  <div className='h-14 w-14 bg-gray-100 rounded-2xl ml-8'></div> {/* Image */}
                  <div className='flex gap-2 ml-10'> {/* Categories */}
                    <div className='h-6 w-16 bg-gray-100 rounded-md'></div>
                    <div className='h-6 w-16 bg-gray-100 rounded-md'></div>
                  </div>
                  <div className='flex gap-3 ml-auto'> {/* Actions */}
                    <div className='h-10 w-10 bg-gray-100 rounded-xl'></div>
                    <div className='h-10 w-10 bg-gray-100 rounded-xl'></div>
                  </div>
                </div>
              ))}
            </div>

            {/* --- Mobile Card Skeleton --- */}
            <div className='md:hidden space-y-4 px-1 animate-pulse'>
              {[...Array(4)].map((_, i) => (
                <div key={i} className='p-4 rounded-[2rem] bg-white border border-slate-100 flex flex-col gap-4'>
                  <div className='flex justify-between items-center'>
                    <div className='h-6 w-12 bg-gray-100 rounded-full'></div>
                    <div className='flex gap-2'>
                      <div className='h-10 w-10 bg-gray-100 rounded-2xl'></div>
                      <div className='h-10 w-10 bg-gray-100 rounded-2xl'></div>
                    </div>
                  </div>
                  <div className='flex gap-5'>
                    <div className='w-24 h-24 bg-gray-200 rounded-3xl shrink-0'></div>
                    <div className='flex flex-col justify-center space-y-3 w-full'>
                      <div className='h-5 w-3/4 bg-gray-200 rounded'></div>
                      <div className='h-3 w-1/2 bg-gray-100 rounded'></div>
                      <div className='flex gap-2 mt-2'>
                        <div className='h-6 w-14 bg-gray-100 rounded-md'></div>
                        <div className='h-6 w-14 bg-gray-100 rounded-md'></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && subCategoryData.length === 0 && <NoData />}

        {!loading && subCategoryData.length > 0 && (
          <div className='space-y-6'>
            {/* Desktop Table View */}
            <div className='hidden md:block bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden'>
              <div className='overflow-x-auto'>
                <table className='w-full min-w-[700px] border-collapse'>
                  <thead>
                    <tr className='bg-slate-50 border-b border-slate-200'>
                      <th className='px-6 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] w-16'>#</th>
                      <th className='px-6 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.1em]'>Sub Category Name</th>
                      <th className='px-6 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] w-28'>Image</th>
                      <th className='px-6 py-4 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.1em]'>Parent Category</th>
                      <th className='px-6 py-4 text-center text-[11px] font-black text-slate-500 uppercase tracking-[0.1em] w-32'>Actions</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-slate-100'>
                    {subCategoryData.map((subCategory, index) => (
                      <tr
                        key={subCategory._id}
                        className={`transition-all duration-700 group ${newlyAddedId === subCategory._id
                            ? 'bg-green-50/60 ring-1 ring-inset ring-green-200'
                            : 'hover:bg-blue-50/40'
                          }`}
                      >
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-bold'>
                          {String(index + 1).padStart(2, '0')}
                        </td>
                        <td className='px-6 py-4'>
                          <div className='flex items-center gap-2'>
                            <span className='font-extrabold text-slate-800 capitalize text-[15px]'>
                              {subCategory.name}
                            </span>
                            {newlyAddedId === subCategory._id && (
                              <span className='bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-bounce shadow-sm font-black uppercase'>
                                New
                              </span>
                            )}
                          </div>
                        </td>
                        <td className='px-6 py-4'>
                          <div className='w-14 h-14 rounded-2xl overflow-hidden bg-white border border-slate-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500 p-1'>
                            <img src={subCategory.image} alt={subCategory.name} loading='lazy' className='w-full h-full object-scale-down' />
                          </div>
                        </td>
                        <td className='px-6 py-4 font-medium'>
                          <div className='flex flex-wrap gap-1.5'>{getCategoryNames(subCategory.category)}</div>
                        </td>
                        <td className='px-6 py-4'>
                          <div className='flex items-center justify-center gap-3'>
                            <button
                              onClick={() => { setEditData(subCategory); setOpenEdit(true) }}
                              className='w-10 h-10 flex items-center justify-center rounded-xl text-secondary bg-green-50 hover:bg-secondary hover:text-white transition-all shadow-sm border border-green-100 active:scale-90'
                            >
                              <EditIcon />
                            </button>
                            <button
                              onClick={() => setSubCategoryToDelete(subCategory)}
                              className='w-10 h-10 flex items-center justify-center rounded-xl text-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100 active:scale-90'
                            >
                              <DeleteIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card Layout */}
            <div className='md:hidden space-y-4 px-1'>
              {subCategoryData.map((subCategory, index) => (
                <div
                  key={subCategory._id}
                  className={`p-4 rounded-[2rem] shadow-sm border transition-all duration-500 flex flex-col gap-4 active:scale-[0.98] ${newlyAddedId === subCategory._id
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-slate-100'
                    }`}
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <span className='px-3 py-1 bg-slate-50 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100'>
                        #{String(index + 1).padStart(2, '0')}
                      </span>
                      {newlyAddedId === subCategory._id && (
                        <span className='text-green-600 text-[10px] font-black uppercase tracking-tighter animate-pulse'>
                          • Just Added
                        </span>
                      )}
                    </div>
                    <div className='flex gap-2.5'>
                      <button onClick={() => { setEditData(subCategory); setOpenEdit(true) }} className='w-10 h-10 flex items-center justify-center rounded-2xl text-secondary bg-green-50 active:bg-secondary active:text-white border border-green-100 transition-colors'><EditIcon /></button>
                      <button onClick={() => setSubCategoryToDelete(subCategory)} className='w-10 h-10 flex items-center justify-center rounded-2xl text-red-600 bg-red-50 active:bg-red-600 active:text-white border border-red-100 transition-colors'><DeleteIcon /></button>
                    </div>
                  </div>
                  <div className='flex gap-5'>
                    <div className='w-24 h-24 flex-shrink-0 bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 p-2 shadow-inner'><img src={subCategory.image} alt={subCategory.name} loading='lazy' className='w-full h-full object-scale-down' /></div>
                    <div className='flex flex-col justify-center space-y-3'>
                      <div>
                        <h3 className='font-black text-slate-800 capitalize text-lg leading-tight tracking-tight'>{subCategory.name}</h3>
                        <div className='flex items-center gap-1.5 mt-1'><div className='w-1.5 h-1.5 rounded-full bg-secondary'></div><p className='text-[10px] text-slate-400 font-bold uppercase tracking-widest'>Sub Category</p></div>
                      </div>
                      <div className='space-y-1.5'><span className='text-[9px] uppercase font-black text-slate-400 tracking-wider'>Parent Categories:</span><div className='flex flex-wrap gap-1.5'>{getCategoryNames(subCategory.category)}</div></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className='px-6 py-5 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between'>
              <p className='text-xs font-bold text-slate-400'>Showing <span className='text-slate-900 font-black'>{subCategoryData.length}</span> entries total</p>
              <div className='flex gap-1.5'>{[...Array(3)].map((_, i) => (<div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-secondary animate-pulse' : 'bg-slate-200'}`}></div>))}</div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {openUploadSubCategory && (
        <UploadSubCategoryModel
          close={() => setOpenUploadSubCategory(false)}
          onAdded={handleOnAdded}
        />
      )}

      {openEdit && (
        <EditSubCategory
          data={editData}
          close={() => setOpenEdit(false)}
          updateLocal={handleUpdateLocalState}
        />
      )}

      {subCategoryToDelete && (
        <DeleteSubCategoryConfirm
          subCategory={subCategoryToDelete}
          close={() => setSubCategoryToDelete(null)}
          onConfirm={handleDeleteSubCategory}
        />
      )}
    </section>
  )
}

export default SubCategoryPage