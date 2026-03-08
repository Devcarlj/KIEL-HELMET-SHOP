import React, { useState, useEffect } from 'react'
import { IoIosClose } from "react-icons/io";
import { FaCloudUploadAlt, FaChevronDown } from "react-icons/fa";
import uploadImage from '../utils/UploadImage.js';
import SummaryApi from '../common/SummaryApi.js';
import Axios from '../utils/Axios.js';
import AxiosToastError from '../utils/AxiosToastError.js'
import toast from 'react-hot-toast';

const UploadSubCategoryModel = ({ close, onAdded }) => {
    const [loading, setLoading] = useState(false)
    const [openSelect, setOpenSelect] = useState(false)
    const [categoryList, setCategoryList] = useState([])
    const [data, setData] = useState({
        name: "",
        image: null,
        preview: "",
        category: ""   // selected category _id
    })

    // Fetch all categories for the dropdown
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
        setData((prev) => ({ ...prev, [name]: value }))
    }

    const handleUploadFile = (e) => {
        const file = e.target.files[0]
        if (!file) return
        const previewUrl = URL.createObjectURL(file)
        setData((prev) => ({ ...prev, image: file, preview: previewUrl }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!data.image || !data.name || !data.category) {
            toast.error("Please fill all required fields")
            return
        }

        try {
            setLoading(true)
            const uploadResponse = await uploadImage(data.image, 'kielHelmetShop/sub category')
            const imageUrl = uploadResponse?.data?.url

            if (!imageUrl) {
                toast.error("Failed to get image URL")
                return
            }

            const response = await Axios({
                ...SummaryApi.addSubCategory,
                data: {
                    name: data.name,
                    image: imageUrl,
                    category: data.category ? [data.category] : []
                }
            })

            if (response.data.success) {
                toast.success(response.data.message)
                close()
                if (onAdded && response.data.data) {
                    onAdded(response.data.data)
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

    const isFormValid = data.name && data.image && data.category && !loading

    return (
        <section className='fixed inset-0 z-50 bg-neutral-800/60 backdrop-blur-sm flex items-center justify-center p-4'>
            <div className='bg-white max-w-md w-full rounded-xl shadow-2xl overflow-hidden'>

                {/* Header */}
                <div className='flex items-center justify-between p-4 border-b bg-slate-50'>
                    <h1 className='font-bold text-slate-800 text-lg'>Add New Sub Category</h1>
                    <button onClick={close} className='p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-600'>
                        <IoIosClose size={30} />
                    </button>
                </div>

                {/* Form */}
                <form className='p-6 grid gap-5' onSubmit={handleSubmit}>

                    {/* Sub Category Name */}
                    <div className='grid gap-2'>
                        <label className='text-sm font-bold text-slate-700' htmlFor='subCategoryName'>
                            Sub Category Name
                        </label>
                        <input
                            type="text"
                            id='subCategoryName'
                            name='name'
                            placeholder='e.g. Soft Drinks'
                            value={data.name}
                            onChange={handleOnChange}
                            className='bg-slate-50 p-3 border border-slate-200 rounded-lg outline-none focus:border-cta-yellow transition-all'
                            required
                        />
                    </div>

                    {/* Category Dropdown */}
                    <div className='grid gap-2'>
                        <label className='text-sm font-bold text-slate-700' htmlFor='subCategoryParent'>
                            Parent Category <span className='font-bold text-red-500'>*</span>
                        </label>
                        <div className='relative'>
                            <button
                                type="button"
                                onClick={() => setOpenSelect(!openSelect)}
                                className='w-full text-center bg-white p-3.5 border border-slate-200 rounded-xl outline-none focus:border-cta-yellow focus:ring-4 focus:ring-cta-yellow/10 transition-all text-slate-700 font-medium cursor-pointer flex items-center justify-center gap-2'
                            >
                                <span className='truncate'>
                                    {categoryList.find(c => c._id === data.category)?.name || "Select Category"}
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
                                                    setData((prev) => ({ ...prev, category: cat._id }))
                                                    setOpenSelect(false)
                                                }}
                                                className={`p-3 text-center rounded-lg cursor-pointer transition-all mb-1 last:mb-0 ${data.category === cat._id
                                                    ? 'bg-cta-yellow text-white font-bold shadow-md'
                                                    : 'hover:bg-slate-50 text-slate-600 hover:text-cta-yellow'
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

                    {/* Image Upload Box */}
                    <div className='grid gap-2'>
                        <label className='text-sm font-bold text-slate-700'>Sub Category Image</label>
                        <label htmlFor='uploadSubCategoryImage' className='w-full'>
                            <div className='border-2 border-dashed border-slate-200 bg-slate-50 h-36 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-cta-yellow transition-colors overflow-hidden'>
                                {data.preview ? (
                                    <img src={data.preview} alt="preview" className='w-full h-full object-scale-down' />
                                ) : (
                                    <div className='flex flex-col items-center text-slate-400'>
                                        <FaCloudUploadAlt size={40} />
                                        <p className='text-sm'>Click to upload image</p>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                id='uploadSubCategoryImage'
                                className='hidden'
                                accept='image/*'
                                onChange={handleUploadFile}
                            />
                        </label>
                    </div>

                    {/* Action Buttons */}
                    <div className='flex items-center gap-3 mt-2'>
                        <button
                            type="button"
                            onClick={close}
                            className='flex-1 py-3 font-semibold text-slate-500 hover:bg-slate-50 rounded-lg border border-slate-200 transition-all'
                        >
                            Cancel
                        </button>
                        <button
                            type='submit'
                            disabled={!isFormValid}
                            className={`flex-1 py-3 text-white font-bold rounded-lg shadow-md transition-all 
                                ${isFormValid ? 'bg-cta-green hover:bg-opacity-90' : 'bg-slate-300 cursor-not-allowed'}`}
                        >
                            {loading ? "Uploading..." : "Add Sub Category"}
                        </button>
                    </div>

                </form>
            </div>
        </section>
    )
}

export default UploadSubCategoryModel
