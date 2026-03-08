import React, { useState, useEffect } from 'react'
import { IoIosClose } from "react-icons/io";
import { FaCloudUploadAlt, FaChevronDown } from "react-icons/fa";
import uploadImage from '../utils/UploadImage'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'

const EditSubCategory = ({ close, data, updateLocal }) => {
    const [categoryList, setCategoryList] = useState([])
    const [editData, setEditData] = useState({
        subCategoryId: data._id,
        name: data.name,
        image: data.image,
        category: data.category?.[0]?._id || data.category?.[0] || ""
    })
    const [loading, setLoading] = useState(false)
    const [openSelect, setOpenSelect] = useState(false)

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await Axios({ ...SummaryApi.getCategory })
                if (response.data.success) setCategoryList(response.data.data)
            } catch (error) {
                console.log("Error fetching categories", error)
            }
        }
        fetchCategories()
    }, [])

    const handleOnChange = (e) => {
        const { name, value } = e.target
        setEditData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)
            const payload = {
                subCategoryId: editData.subCategoryId,
                name: editData.name,
                image: editData.image,
                category: editData.category ? [editData.category] : []
            }
            const response = await Axios({
                ...SummaryApi.updateSubCategory,
                data: payload
            })
            if (response.data.success) {
                updateLocal(response.data.data)
                toast.success(response.data.message)
                close()
            }
        } catch (error) {
            toast.error("Update failed")
        } finally {
            setLoading(false)
        }
    }

    const handleUploadFile = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        try {
            setLoading(true)
            const response = await uploadImage(file, 'kielHelmetShop/sub category')
            const imageUrl = response.data.url
            setEditData((prev) => ({ ...prev, image: imageUrl }))
        } catch (error) {
            console.error("Upload error", error)
            toast.error("Failed to upload image")
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className='fixed inset-0 z-50 bg-neutral-800/60 backdrop-blur-sm flex items-center justify-center p-4'>
            <div className='bg-white max-w-md w-full rounded-2xl shadow-2xl overflow-hidden'>

                {/* Header */}
                <div className='flex items-center justify-between p-4 border-b bg-green-50/30'>
                    <h1 className='font-bold text-slate-800 text-lg'>Edit Sub Category</h1>
                    <button onClick={close} className='p-1 hover:bg-red-50 rounded-full transition-colors text-slate-600 hover:text-red-500'>
                        <IoIosClose size={30} />
                    </button>
                </div>

                <form className='p-6 grid gap-5' onSubmit={handleSubmit}>
                    {/* Name Input */}
                    <div className='grid gap-2'>
                        <label className='text-sm font-bold text-slate-700' htmlFor='editSubCategoryName'>Name</label>
                        <input
                            type="text"
                            id='editSubCategoryName'
                            name='name'
                            value={editData.name}
                            onChange={handleOnChange}
                            className='bg-slate-50 p-3 border border-slate-200 rounded-lg outline-none focus:border-secondary'
                            required
                        />
                    </div>

                    {/* Category Dropdown */}
                    <div className='grid gap-2'>
                        <label className='text-sm font-bold text-slate-700' htmlFor='editSubCategoryParent'>
                            Parent Category <span className='font-bold text-red-500'>*</span>
                        </label>
                        <div className='relative'>
                            <button
                                type="button"
                                onClick={() => setOpenSelect(!openSelect)}
                                className='w-full text-center bg-white p-3.5 border border-slate-200 rounded-xl outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all text-slate-700 font-medium cursor-pointer flex items-center justify-center gap-2'
                            >
                                <span className='truncate'>
                                    {categoryList.find(c => c._id === editData.category)?.name || "Select Category"}
                                </span>
                                <FaChevronDown className={`transition-transform text-slate-400 ${openSelect ? 'rotate-180' : ''}`} size={12} />
                            </button>

                            {openSelect && (
                                <div className='absolute top-full left-0 w-full mt-2 max-h-60 overflow-y-auto bg-white border border-slate-100 rounded-xl z-50 shadow-2xl p-2 animate-in fade-in zoom-in duration-200'>
                                    {categoryList.length > 0 ? (
                                        categoryList.map((cat) => (
                                            <div
                                                key={cat._id}
                                                onClick={() => {
                                                    setEditData((prev) => ({ ...prev, category: cat._id }))
                                                    setOpenSelect(false)
                                                }}
                                                className={`p-3 text-center rounded-lg cursor-pointer transition-all mb-1 last:mb-0 ${editData.category === cat._id
                                                    ? 'bg-secondary text-white font-bold shadow-md'
                                                    : 'hover:bg-slate-50 text-slate-600 hover:text-secondary'
                                                    }`}
                                            >
                                                {cat.name}
                                            </div>
                                        ))
                                    ) : (
                                        <div className='p-4 text-center text-slate-400 text-sm'>No categories found</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Image Section */}
                    <div className='grid gap-2'>
                        <label className='text-sm font-bold text-slate-700'>Image</label>
                        <div className='flex items-center gap-3'>
                            <div className='w-20 h-20 bg-slate-100 border rounded-lg overflow-hidden flex items-center justify-center shrink-0'>
                                {editData.image ? (
                                    <img src={editData.image} alt="preview" className='w-full h-full object-scale-down' />
                                ) : (
                                    <p className='text-[10px]'>No Image</p>
                                )}
                            </div>
                            <label htmlFor='uploadEditSubImage' className='flex-1'>
                                <div className='border-2 border-dashed border-slate-200 h-20 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-secondary bg-slate-50 text-slate-400'>
                                    <FaCloudUploadAlt size={25} />
                                    <p className='text-xs'>Replace Image</p>
                                </div>
                                <input onChange={handleUploadFile} type="file" id='uploadEditSubImage' className='hidden' />
                            </label>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className='flex items-center gap-3'>
                        <button type="button" onClick={close} className='flex-1 py-3 font-semibold text-slate-500 border border-slate-200 rounded-xl'>Cancel</button>
                        <button
                            disabled={loading || !editData.name || !editData.image || !editData.category}
                            className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition-all ${loading ? 'bg-slate-400' : 'bg-secondary hover:bg-green-600'
                                }`}
                        >
                            {loading ? "Updating..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    )
}

export default EditSubCategory
