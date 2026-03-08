import React, { useState } from 'react'
import { IoIosClose } from "react-icons/io";
import { FaCloudUploadAlt } from "react-icons/fa"; // You might need to install react-icons
import uploadImage from '../utils/UploadImage.js';
import SummaryApi from '../common/SummaryApi.js';
import Axios from '../utils/Axios.js';
import AxiosToastError from '../utils/AxiosToastError.js'
import toast from 'react-hot-toast';

const UploadCategoryModel = ({ close, fetchData, onAdded }) => {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState({
        name: "",
        image: null,    // Store the actual File object here
        preview: ""     // Store the local blob URL for the UI
    })

    const handleOnChange = (e) => {
        const { name, value } = e.target
        setData((prev) => ({ ...prev, [name]: value }))
    }

    // 1. This ONLY handles the selection and preview
    const handleUploadFile = (e) => {
        const file = e.target.files[0]
        if (!file) return

        const previewUrl = URL.createObjectURL(file)

        setData((prev) => ({
            ...prev,
            image: file,        // Save the raw file to upload later
            preview: previewUrl // Show it to the user immediately
        }))
    }

    // 2. This handles the actual Cloudinary + Database upload
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!data.image || !data.name) return

        try {
            setLoading(true)

            // STEP 1: Upload to Cloudinary only when button is clicked
            const uploadResponse = await uploadImage(data.image, 'kielHelmetShop/categories')
            const imageUrl = uploadResponse?.data?.url

            if (!imageUrl) {
                toast.error("Failed to get image URL")
                return
            }

            // STEP 2: Send the name and the new URL to your Category API
            const response = await Axios({
                ...SummaryApi.addCategory,
                data: {
                    name: data.name,
                    image: imageUrl
                }
            })


            if (response.data.success) {
                toast.success(response.data.message)
                close()
                if (onAdded && response.data.data) {
                    onAdded(response.data.data)
                } else if (fetchData) {
                    fetchData()
                }
            } else {
                toast.error(response.data.message)
            }

        } catch (error) {
            AxiosToastError(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className='fixed inset-0 z-50 bg-neutral-800/60 backdrop-blur-sm flex items-center justify-center p-4'>
            <div className='bg-white max-w-md w-full rounded-xl shadow-2xl overflow-hidden'>

                {/* Header */}
                <div className='flex items-center justify-between p-4 border-b bg-slate-50'>
                    <h1 className='font-bold text-slate-800 text-lg'>Add New Category</h1>
                    <button onClick={close} className='p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-600'>
                        <IoIosClose size={30} />
                    </button>
                </div>

                {/* Form */}
                <form className='p-6 grid gap-5' onSubmit={handleSubmit}>

                    {/* Category Name */}
                    <div className='grid gap-2'>
                        <label className='text-sm font-bold text-slate-700' htmlFor='categoryName'>
                            Category Name
                        </label>
                        <input
                            type="text"
                            id='categoryName'
                            name='name'
                            placeholder='e.g. Beverages'
                            value={data.name}
                            onChange={handleOnChange}
                            className='bg-slate-50 p-3 border border-slate-200 rounded-lg outline-none focus:border-cta-yellow transition-all'
                            required
                        />
                    </div>

                    {/* Image Upload Box */}
                    <div className='grid gap-2'>
                        <label className='text-sm font-bold text-slate-700'>Category Image</label>
                        <div className='flex flex-col items-center justify-center gap-3'>
                            <label htmlFor='uploadCategoryImage' className='w-full'>
                                <div className='border-2 border-dashed border-slate-200 bg-slate-50 h-36 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-cta-yellow transition-colors overflow-hidden'>
                                    {
                                        data.preview ? (
                                            <img src={data.preview} alt="preview" className='w-full h-full object-scale-down' />
                                        ) : (
                                            <div className='flex flex-col items-center text-slate-400'>
                                                <FaCloudUploadAlt size={40} />
                                                <p className='text-sm'>Click to upload image</p>
                                            </div>
                                        )
                                    }
                                </div>
                                <input
                                    type="file"
                                    id='uploadCategoryImage'
                                    className='hidden'
                                    accept='image/*'
                                    onChange={handleUploadFile}
                                />
                            </label>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex items-center gap-3 mt-4'>
                        <button
                            type="button"
                            onClick={close}
                            className='flex-1 py-3 font-semibold text-slate-500 hover:bg-slate-50 rounded-lg border border-slate-200 transition-all'
                        >
                            Cancel
                        </button>
                        <button
                            disabled={!data.name || !data.image || loading}
                            className={`flex-2 py-3 text-white font-bold rounded-lg shadow-md transition-all 
                                ${(data.name && data.image && !loading) ? 'bg-cta-green hover:bg-opacity-90' : 'bg-slate-300 cursor-not-allowed'}`}
                        >
                            {loading ? "Uploading..." : "Add Category"}
                        </button>
                    </div>

                </form>
            </div>
        </section>
    )
}

export default UploadCategoryModel