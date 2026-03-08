import React, { useState } from 'react'
import { IoIosClose } from "react-icons/io";
import { FaCloudUploadAlt } from "react-icons/fa";
import uploadImage from '../utils/UploadImage' // Your cloudinary/upload utility
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'

const EditCategory = ({ close, data, updateLocal }) => {
    // Initialize state with the data passed from CategoryPage
    const [editCategoryData, setEditCategoryData] = useState({
        categoryId: data._id,
        name: data.name,
        image: data.image
    })
    const [loading, setLoading] = useState(false)

    const handleOnChange = (e) => {
        const { name, value } = e.target
        setEditCategoryData((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            setLoading(true)
            const response = await Axios({
                ...SummaryApi.updateCategory,
                data: editCategoryData
            })

            if (response.data.success) {
                // 1. Tell the parent to update the UI immediately

                updateLocal(editCategoryData)

                // 2. Show success and close modal
                toast.success(response.data.message)
                close()
            }
            // eslint-disable-next-line no-unused-vars
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
            const response = await uploadImage(file, 'kielHelmetShop/categories')
            const imageUrl = response.data.url
            setEditCategoryData((prev) => ({ ...prev, image: imageUrl }))
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
                    <h1 className='font-bold text-slate-800 text-lg'>Edit Category</h1>
                    <button onClick={close} className='p-1 hover:bg-red-50 rounded-full transition-colors text-slate-600 hover:text-red-500'>
                        <IoIosClose size={30} />
                    </button>
                </div>

                <form className='p-6 grid gap-5' onSubmit={handleSubmit}>
                    {/* Name Input */}
                    <div className='grid gap-2'>
                        <label className='text-sm font-bold text-slate-700' htmlFor='categoryName'>Name</label>
                        <input
                            type="text"
                            id='categoryName'
                            name='name'
                            value={editCategoryData.name}
                            onChange={handleOnChange}
                            className='bg-slate-50 p-3 border border-slate-200 rounded-lg outline-none focus:border-secondary'
                            required
                        />
                    </div>

                    {/* Image Section */}
                    <div className='grid gap-2'>
                        <label className='text-sm font-bold text-slate-700'>Image</label>
                        <div className='flex items-center gap-3'>
                            <div className='w-20 h-20 bg-slate-100 border rounded-lg overflow-hidden flex items-center justify-center'>
                                {editCategoryData.image ? (
                                    <img src={editCategoryData.image} alt="preview" className='w-full h-full object-scale-down' />
                                ) : (
                                    <p className='text-[10px]'>No Image</p>
                                )}
                            </div>
                            <label htmlFor='uploadEditImage' className='flex-1'>
                                <div className='border-2 border-dashed border-slate-200 h-20 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-secondary bg-slate-50 text-slate-400'>
                                    <FaCloudUploadAlt size={25} />
                                    <p className='text-xs'>Replace Image</p>
                                </div>
                                <input onChange={handleUploadFile} type="file" id='uploadEditImage' className='hidden' />
                            </label>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className='flex items-center gap-3'>
                        <button type="button" onClick={close} className='flex-1 py-3 font-semibold text-slate-500'>Cancel</button>
                        <button
                            disabled={loading || !editCategoryData.name || !editCategoryData.image}
                            className={`flex-2 py-3 text-white font-bold rounded-xl shadow-lg transition-all ${loading ? 'bg-slate-400' : 'bg-secondary hover:bg-green-600'}`}
                        >
                            {loading ? "Updating..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </section>
    )
}

export default EditCategory