import React, { useState, useEffect } from 'react'
import { FaCloudUploadAlt, FaChevronDown } from "react-icons/fa"
import { IoIosClose } from "react-icons/io"
import uploadImage from '../utils/UploadImage.js'
import SummaryApi from '../common/SummaryApi.js'
import Axios from '../utils/Axios.js'
import AxiosToastError from '../utils/AxiosToastError.js'
import toast from 'react-hot-toast'

const EditProductAdmin = ({ close, productData, fetchProducts }) => {
    const [loading, setLoading] = useState(false)
    const [openSelect, setOpenSelect] = useState(false)
    const [openSubSelect, setOpenSubSelect] = useState(false)
    const [categoryList, setCategoryList] = useState([])
    const [subCategoryList, setSubCategoryList] = useState([])
    const [data, setData] = useState({
        _id: productData._id,
        name: productData.name,
        description: productData.description,
        image: Array.isArray(productData.image) ? productData.image : (productData.image ? [productData.image] : []),
        category: Array.isArray(productData.category)
            ? productData.category
            : (productData.category ? [productData.category] : []),
        subCategory: Array.isArray(productData.subCategory)
            ? productData.subCategory
            : (productData.subCategory ? [productData.subCategory] : []),
        unit: productData.unit || "",
        stock: productData.stock || "",
        price: productData.price || "",
        discount: productData.discount || "",
        more_details: productData.more_details || {},
        variations: productData.variations || [],
        variationStocks: productData.variationStocks || []
    })

    const [fieldName, setFieldName] = useState("")
    const [fieldValue, setFieldValue] = useState("")
    const [openMoreDetails, setOpenMoreDetails] = useState(false)
    const [variationName, setVariationName] = useState("")
    const [variationOptions, setVariationOptions] = useState("")
    const [openVariations, setOpenVariations] = useState(productData.variations?.length > 0)

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await Axios({ ...SummaryApi.getCategory })
                if (response.data.success) setCategoryList(response.data.data)
            } catch (error) {
                console.log("Error fetching categories", error)
            }
        }
        const fetchSubCategories = async () => {
            try {
                const response = await Axios({ ...SummaryApi.getSubCategory })
                if (response.data.success) setSubCategoryList(response.data.data)
            } catch (error) {
                console.log("Error fetching sub-categories", error)
            }
        }
        fetchCategories()
        fetchSubCategories()
    }, [])

    useEffect(() => {
        // Lock body scroll when modal is open
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

    useEffect(() => {
        if (data.variationStocks.length > 0) {
            const totalStock = data.variationStocks.reduce((sum, vs) => sum + (Number(vs.stock) || 0), 0)
            setData(prev => ({
                ...prev,
                stock: totalStock.toString()
            }))
        }
    }, [data.variationStocks])

    const filteredSubCategories = subCategoryList.filter(
        (subCat) => subCat.category.some(c => data.category.some(dc => dc._id === (c._id || c)))
    )

    const generateCombinations = (variations, defaultPrice = 0) => {
        if (variations.length === 0) return []
        const results = []
        const helper = (currentCombination, index) => {
            if (index === variations.length) {
                results.push({ combinations: currentCombination, stock: 0, price: defaultPrice })
                return
            }
            const { name, options } = variations[index]
            options.forEach(option => {
                helper({ ...currentCombination, [name]: option }, index + 1)
            })
        }
        helper({}, 0)
        return results
    }

    const handleOnChange = (e) => {
        const { name, value } = e.target

        // For numeric fields, only allow positive integers
        if (["stock", "price", "discount"].includes(name)) {
            if (value !== "" && !/^\d*$/.test(value)) {
                return;
            }
        }

        setData((prev) => ({ ...prev, [name]: value }))
    }

    const handleUploadFile = (e) => {
        const files = Array.from(e.target.files)
        if (files.length === 0) return
        setData((prev) => ({
            ...prev,
            image: [...prev.image, ...files]
        }))
    }

    const handleRemoveImage = (index) => {
        setData((prev) => {
            const updatedImage = prev.image.filter((_, i) => i !== index)
            return {
                ...prev,
                image: updatedImage
            }
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (data.image.length === 0 || !data.name || !data.category || !data.description) {
            toast.error("Please fill all required fields")
            return
        }

        try {
            setLoading(true)

            // Handle both existing URLs and new Files
            const uploadPromises = data.image.map(async (img) => {
                if (img instanceof File) {
                    const uploadResponse = await uploadImage(img, 'kielHelmetShop/product')
                    return uploadResponse?.data?.url
                }
                return img // It's already a URL string
            })

            const imageUrls = await Promise.all(uploadPromises)
            const filteredImageUrls = imageUrls.filter(url => url)

            if (filteredImageUrls.length === 0) {
                toast.error("Failed to upload images")
                return
            }

            const response = await Axios({
                ...SummaryApi.updateProduct,
                data: {
                    _id: data._id,
                    name: data.name,
                    description: data.description,
                    image: filteredImageUrls,
                    category: data.category,
                    subCategory: data.subCategory,
                    unit: data.unit,
                    stock: data.stock,
                    price: data.price,
                    discount: data.discount,
                    more_details: data.more_details,
                    variations: data.variations,
                    variationStocks: data.variationStocks
                }
            })

            if (response.data.success) {
                toast.success(response.data.message)
                fetchProducts()
                close()
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            AxiosToastError(error)
        } finally {
            setLoading(false)
        }
    }

    const isFormValid = data.name && data.description && data.image.length > 0 && data.category.length > 0 && !loading

    return (
        <section className='fixed inset-0 z-[100] bg-neutral-900/70 backdrop-blur-sm flex flex-col items-center justify-center p-0 md:p-4 overscroll-none'>
            <div className='bg-white w-full h-full md:h-auto md:max-h-[90vh] md:max-w-2xl md:rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col relative animate-in fade-in zoom-in duration-200'>
                <form 
                    onSubmit={handleSubmit}
                    className='flex flex-col h-full'
                >
                    {/* Header */}
                    <div className='p-4 md:p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0'>
                    <div>
                        <h2 className='font-bold text-xl text-slate-800'>Edit Product</h2>
                        <p className='text-sm text-slate-500 mt-1'>Update the product details below.</p>
                    </div>
                    <button onClick={close} className='p-2 hover:bg-slate-200 rounded-full transition-colors'>
                        <IoIosClose size={24} />
                    </button>
                </div>

                {/* Form Content */}
                <div className='overflow-y-auto flex-1 p-4 md:p-6 overscroll-contain pb-32'>
                    <div className='grid gap-6'>
                        {/* Product Name */}
                        <div className='grid gap-2'>
                            <label className='text-sm font-bold text-slate-700' htmlFor='productName'>
                                Product Name <span className='text-red-500'>*</span>
                            </label>
                            <input
                                type="text"
                                id='productName'
                                name='name'
                                placeholder='e.g. Fresh Apples'
                                value={data.name}
                                onChange={handleOnChange}
                                className='bg-slate-50 p-3.5 border border-slate-200 rounded-xl outline-none focus:border-cta-yellow focus:ring-4 focus:ring-cta-yellow/10 transition-all text-slate-700'
                                required
                            />
                        </div>

                        {/* Product Description */}
                        <div className='grid gap-2'>
                            <label className='text-sm font-bold text-slate-700' htmlFor='productDescription'>
                                Description <span className='text-red-500'>*</span>
                            </label>
                            <textarea
                                id='productDescription'
                                name='description'
                                placeholder='Enter product description...'
                                value={data.description}
                                onChange={handleOnChange}
                                rows="4"
                                className='bg-slate-50 p-3.5 border border-slate-200 rounded-xl outline-none focus:border-cta-yellow focus:ring-4 focus:ring-cta-yellow/10 transition-all text-slate-700 resize-y'
                                required
                            />
                        </div>

                        {/* Category Dropdown */}
                        <div className='grid gap-2'>
                            <label className='text-sm font-bold text-slate-700' htmlFor='productCategory'>
                                Category <span className='text-red-500'>*</span>
                            </label>
                            <div className='relative'>
                                <button
                                    type="button"
                                    onClick={() => setOpenSelect(!openSelect)}
                                    className='w-full bg-slate-50 p-3.5 border border-slate-200 rounded-xl outline-none focus:border-cta-yellow focus:ring-4 focus:ring-cta-yellow/10 transition-all text-slate-700 font-medium cursor-pointer flex items-center justify-between'
                                >
                                    <span className={data.category.length > 0 ? 'text-slate-800' : 'text-slate-400'}>
                                        {data.category.length > 0
                                            ? `${data.category.length} Categories Selected`
                                            : "Select Category"}
                                    </span>
                                    <FaChevronDown className={`transition-transform text-slate-400 ${openSelect ? 'rotate-180' : ''}`} size={14} />
                                </button>

                                {openSelect && (
                                    <div className='absolute bottom-full left-0 w-full mb-2 max-h-60 overflow-y-auto bg-white border border-slate-100 rounded-xl z-50 shadow-xl p-2 animate-in fade-in zoom-in duration-200'>
                                        {categoryList.length > 0 ? (
                                            categoryList.map((cat) => {
                                                const isSelected = data.category.some(c => c._id === cat._id)
                                                return (
                                                    <div
                                                        key={cat._id}
                                                        onClick={() => {
                                                            setData((prev) => {
                                                                const isAlreadySelected = prev.category.some(c => c._id === cat._id)
                                                                let updatedCategory = []
                                                                if (isAlreadySelected) {
                                                                    updatedCategory = prev.category.filter(c => c._id !== cat._id)
                                                                } else {
                                                                    updatedCategory = [...prev.category, cat]
                                                                }

                                                                // Filter sub-categories to keep only those that belong to at least one selected category
                                                                const updatedSubCategory = prev.subCategory.filter(subCat =>
                                                                    subCat.category.some(c => updatedCategory.some(dc => dc._id === (c._id || c)))
                                                                )

                                                                return {
                                                                    ...prev,
                                                                    category: updatedCategory,
                                                                    subCategory: updatedSubCategory
                                                                }
                                                            })
                                                        }}
                                                        className={`p-3 rounded-lg cursor-pointer transition-all mb-1 last:mb-0 flex items-center justify-between ${isSelected
                                                            ? 'bg-cta-yellow/10 text-cta-yellow font-bold'
                                                            : 'hover:bg-slate-50 text-slate-600 hover:text-cta-yellow'
                                                            }`}
                                                    >
                                                        <span>{cat.name}</span>
                                                        {isSelected && (
                                                            <div className='w-4 h-4 bg-cta-yellow rounded-full flex items-center justify-center'>
                                                                <span className='text-[10px] text-white'>✓</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })
                                        ) : (
                                            <div className='p-4 text-center text-slate-400 text-sm'>No categories found</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Selected Categories Display */}
                            {data.category.length > 0 && (
                                <div className='flex flex-wrap gap-2 mt-2'>
                                    {data.category.map((cat) => {
                                        return (
                                            <div key={cat._id} className='flex items-center gap-1 bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200'>
                                                {cat.name}
                                                <button
                                                    type="button"
                                                    onClick={() => setData(prev => {
                                                        const updatedCategory = prev.category.filter(c => c._id !== cat._id)
                                                        const updatedSubCategory = prev.subCategory.filter(subCat =>
                                                            subCat.category.some(c => updatedCategory.some(dc => dc._id === (c._id || c)))
                                                        )
                                                        return {
                                                            ...prev,
                                                            category: updatedCategory,
                                                            subCategory: updatedSubCategory
                                                        }
                                                    })}
                                                    className='p-0.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-red-500'
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        <div className='grid gap-2'>
                            <label className='text-sm font-bold text-slate-700' htmlFor='productSubCategory'>
                                Sub Category <span className='text-red-500'>*</span>
                            </label>
                            <div className='relative'>
                                <button
                                    type="button"
                                    onClick={() => setOpenSubSelect(!openSubSelect)}
                                    disabled={data.category.length === 0}
                                    className='w-full bg-slate-50 p-3.5 border border-slate-200 rounded-xl outline-none focus:border-cta-yellow focus:ring-4 focus:ring-cta-yellow/10 transition-all text-slate-700 font-medium cursor-pointer flex items-center justify-between disabled:cursor-not-allowed disabled:bg-slate-100'
                                >
                                    <span className={data.subCategory.length > 0 ? 'text-slate-800' : 'text-slate-400'}>
                                        {data.subCategory.length > 0
                                            ? `${data.subCategory.length} Sub Categories Selected`
                                            : "Select Sub Category"}
                                    </span>
                                    <FaChevronDown className={`transition-transform text-slate-400 ${openSubSelect ? 'rotate-180' : ''}`} size={14} />
                                </button>

                                {openSubSelect && (
                                    <div className='absolute bottom-full left-0 w-full mb-2 max-h-60 overflow-y-auto bg-white border border-slate-100 rounded-xl z-50 shadow-xl p-2 animate-in fade-in zoom-in duration-200'>
                                        {filteredSubCategories.length > 0 ? (
                                            filteredSubCategories.map((subCat) => {
                                                const isSelected = data.subCategory.some(s => s._id === subCat._id)
                                                return (
                                                    <div
                                                        key={subCat._id}
                                                        onClick={() => {
                                                            setData((prev) => {
                                                                const isAlreadySelected = prev.subCategory.some(s => s._id === subCat._id)
                                                                if (isAlreadySelected) {
                                                                    return {
                                                                        ...prev,
                                                                        subCategory: prev.subCategory.filter(s => s._id !== subCat._id)
                                                                    }
                                                                } else {
                                                                    return {
                                                                        ...prev,
                                                                        subCategory: [...prev.subCategory, subCat]
                                                                    }
                                                                }
                                                            })
                                                        }}
                                                        className={`p-3 rounded-lg cursor-pointer transition-all mb-1 last:mb-0 flex items-center justify-between ${isSelected
                                                            ? 'bg-cta-yellow/10 text-cta-yellow font-bold'
                                                            : 'hover:bg-slate-50 text-slate-600 hover:text-cta-yellow'
                                                            }`}
                                                    >
                                                        <span>{subCat.name}</span>
                                                        {isSelected && (
                                                            <div className='w-4 h-4 bg-cta-yellow rounded-full flex items-center justify-center'>
                                                                <span className='text-[10px] text-white'>✓</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })
                                        ) : (
                                            <div className='p-4 text-center text-slate-400 text-sm'>No sub categories found</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Selected Sub Categories Display */}
                            {data.subCategory.length > 0 && (
                                <div className='flex flex-wrap gap-2 mt-2'>
                                    {data.subCategory.map((subCat) => {
                                        return (
                                            <div key={subCat._id} className='flex items-center gap-1 bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-200'>
                                                {subCat.name}
                                                <button
                                                    type="button"
                                                    onClick={() => setData(prev => ({
                                                        ...prev,
                                                        subCategory: prev.subCategory.filter(s => s._id !== subCat._id)
                                                    }))}
                                                    className='p-0.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-red-500'
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Row 1: Unit and Stock */}
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            {/* Unit */}
                            <div className='grid gap-2'>
                                <label className='text-sm font-bold text-slate-700' htmlFor='productUnit'>
                                    Unit
                                </label>
                                <input
                                    type="text"
                                    id='productUnit'
                                    name='unit'
                                    placeholder='e.g. 1kg, 500g, 1 piece'
                                    value={data.unit}
                                    onChange={handleOnChange}
                                    className='w-full bg-slate-50 p-3.5 border border-slate-200 rounded-xl outline-none focus:border-cta-yellow focus:ring-4 focus:ring-cta-yellow/10 transition-all text-slate-700'
                                />
                            </div>

                            {/* Stock */}
                            <div className='grid gap-2'>
                                <label className='text-sm font-bold text-slate-700' htmlFor='productStock'>
                                    Stock
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    id='productStock'
                                    name='stock'
                                    placeholder='e.g. 100'
                                    value={data.stock ?? ""}
                                    onChange={handleOnChange}
                                    onKeyDown={(e) => {
                                        if (e.key === '.' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
                                            e.preventDefault();
                                        }
                                    }}
                                    readOnly={data.variationStocks.length > 0}
                                    className={`w-full bg-slate-50 p-3.5 border border-slate-200 rounded-xl outline-none focus:border-cta-yellow focus:ring-4 focus:ring-cta-yellow/10 transition-all text-slate-700 ${data.variationStocks.length > 0 ? 'bg-slate-50 cursor-not-allowed opacity-80 font-bold' : ''}`}
                                />
                                {data.variationStocks.length > 0 && (
                                    <p className='text-[10px] text-cta-yellow font-bold mt-1 uppercase tracking-wider'>Calculated from variations</p>
                                )}
                            </div>
                        </div>

                        {/* Row 2: Price and Discount */}
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            {/* Price */}
                            <div className='grid gap-2'>
                                <label className='text-sm font-bold text-slate-700' htmlFor='productPrice'>
                                    Price
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    id='productPrice'
                                    name='price'
                                    placeholder='e.g. 1500'
                                    value={data.price ?? ""}
                                    onChange={handleOnChange}
                                    onKeyDown={(e) => {
                                        if (e.key === '.' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
                                            e.preventDefault();
                                        }
                                    }}
                                    className='w-full bg-slate-50 p-3.5 border border-slate-200 rounded-xl outline-none focus:border-cta-yellow focus:ring-4 focus:ring-cta-yellow/10 transition-all text-slate-700'
                                />
                            </div>

                            {/* Discount */}
                            <div className='grid gap-2'>
                                <label className='text-sm font-bold text-slate-700' htmlFor='productDiscount'>
                                    Discount
                                </label>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    id='productDiscount'
                                    name='discount'
                                    placeholder='e.g. 10'
                                    value={data.discount ?? ""}
                                    onChange={handleOnChange}
                                    onKeyDown={(e) => {
                                        if (e.key === '.' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
                                            e.preventDefault();
                                        }
                                    }}
                                    className='w-full bg-slate-50 p-3.5 border border-slate-200 rounded-xl outline-none focus:border-cta-yellow focus:ring-4 focus:ring-cta-yellow/10 transition-all text-slate-700'
                                />
                            </div>
                        </div>

                        {/* More Details Section */}
                        <div className='grid gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50/50'>
                            <button
                                type="button"
                                onClick={() => setOpenMoreDetails(!openMoreDetails)}
                                className='flex items-center justify-between w-full hover:opacity-80 transition-opacity'
                            >
                                <div className='flex items-center gap-2'>
                                    <h3 className='text-sm font-bold text-slate-700'>Extra Details</h3>
                                    <span className='text-[10px] uppercase tracking-wider text-slate-400 font-bold'>Optional</span>
                                </div>
                                <FaChevronDown className={`transition-transform text-slate-400 ${openMoreDetails ? 'rotate-180' : ''}`} size={12} />
                            </button>

                            {openMoreDetails && (
                                <>
                                    {/* Added Fields */}
                                    {data.more_details && Object.keys(data.more_details).length > 0 && (
                                        <div className='grid gap-2'>
                                            {Object.entries(data.more_details).map(([key, value]) => (
                                                <div key={key} className='flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-100 shadow-sm'>
                                                    <div className='flex-1 grid grid-cols-2 gap-2'>
                                                        <div className='text-xs font-bold text-slate-500 truncate'>{key}</div>
                                                        <div className='text-xs text-slate-700 truncate'>{value}</div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const updated = { ...data.more_details }
                                                            delete updated[key]
                                                            setData(prev => ({ ...prev, more_details: updated }))
                                                        }}
                                                        className='p-1 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-md transition-colors'
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Add New Field Inputs */}
                                    <div className='grid grid-cols-1 md:grid-cols-[1fr,1.5fr,auto] gap-3 items-end'>
                                        <div className='grid gap-1.5'>
                                            <label className='text-[11px] font-bold text-slate-500 uppercase ml-1'>Field Name</label>
                                            <input
                                                type="text"
                                                placeholder='e.g. Color'
                                                value={fieldName}
                                                onChange={(e) => setFieldName(e.target.value)}
                                                className='bg-white p-2.5 border border-slate-200 rounded-lg outline-none focus:border-cta-yellow text-sm'
                                            />
                                        </div>
                                        <div className='grid gap-1.5'>
                                            <label className='text-[11px] font-bold text-slate-500 uppercase ml-1'>Value</label>
                                            <input
                                                type="text"
                                                placeholder='e.g. Space Gray'
                                                value={fieldValue}
                                                onChange={(e) => setFieldValue(e.target.value)}
                                                className='bg-white p-2.5 border border-slate-200 rounded-lg outline-none focus:border-cta-yellow text-sm'
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (fieldName && fieldValue) {
                                                    setData(prev => ({
                                                        ...prev,
                                                        more_details: {
                                                            ...prev.more_details,
                                                            [fieldName]: fieldValue
                                                        }
                                                    }))
                                                    setFieldName("")
                                                    setFieldValue("")
                                                } else {
                                                    toast.error("Please enter both name and value")
                                                }
                                            }}
                                            className='bg-cta-yellow hover:bg-opacity-90 text-white font-bold py-2.5 px-4 rounded-lg transition-all text-sm h-[42px]'
                                        >
                                            Add Field
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Product Variations Section */}
                        <div className='grid gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50/50'>
                            <button
                                type="button"
                                onClick={() => setOpenVariations(!openVariations)}
                                className='flex items-center justify-between w-full hover:opacity-80 transition-opacity'
                            >
                                <div className='flex items-center gap-2'>
                                    <h3 className='text-sm font-bold text-slate-700'>Product Variations</h3>
                                    <span className='text-[10px] uppercase tracking-wider text-slate-400 font-bold'>Optional</span>
                                </div>
                                <FaChevronDown className={`transition-transform text-slate-400 ${openVariations ? 'rotate-180' : ''}`} size={12} />
                            </button>

                            {openVariations && (
                                <>
                                    <p className='text-[11px] text-slate-500 -mt-2'>Add options like Size, Color, etc. that buyers can choose from.</p>

                                    {/* List of Added Variations */}
                                    {data.variations.length > 0 && (
                                        <div className='grid gap-3'>
                                            {data.variations.map((v, index) => (
                                                <div key={index} className='bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex flex-col gap-1.5'>
                                                    <div className='flex items-center justify-between'>
                                                        <span className='text-xs font-bold text-cta-yellow uppercase tracking-wider'>{v.name}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const updated = data.variations.filter((_, i) => i !== index)
                                                                const newCombinations = generateCombinations(updated)
                                                                setData(prev => ({ 
                                                                  ...prev, 
                                                                  variations: updated,
                                                                  variationStocks: newCombinations
                                                                }))
                                                            }}
                                                            className='text-slate-300 hover:text-red-500 transition-colors'
                                                        >
                                                            <IoIosClose size={20} />
                                                        </button>
                                                    </div>
                                                    <div className='flex flex-wrap gap-1.5'>
                                                        {v.options.map((opt, i) => (
                                                            <span key={i} className='bg-slate-50 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded border border-slate-100'>
                                                                {opt}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Add New Variation Inputs */}
                                    <div className='grid grid-cols-1 md:grid-cols-[1fr,1.5fr,auto] gap-3 items-end'>
                                        <div className='grid gap-1.5'>
                                            <label className='text-[11px] font-bold text-slate-500 uppercase ml-1'>Variation Name</label>
                                            <input
                                                type="text"
                                                placeholder='e.g. Size'
                                                value={variationName}
                                                onChange={(e) => setVariationName(e.target.value)}
                                                className='bg-white p-2.5 border border-slate-200 rounded-lg outline-none focus:border-cta-yellow text-sm'
                                            />
                                        </div>
                                        <div className='grid gap-1.5'>
                                            <label className='text-[11px] font-bold text-slate-500 uppercase ml-1'>Options (Comma separated)</label>
                                            <input
                                                type="text"
                                                placeholder='e.g. Small, Medium, Large'
                                                value={variationOptions}
                                                onChange={(e) => setVariationOptions(e.target.value)}
                                                className='bg-white p-2.5 border border-slate-200 rounded-lg outline-none focus:border-cta-yellow text-sm'
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (variationName && variationOptions) {
                                                    const optionsArray = variationOptions.split(',').map(o => o.trim()).filter(o => o)
                                                    if (optionsArray.length === 0) {
                                                        toast.error("Please enter at least one option")
                                                        return
                                                    }
                                                    const newVariations = [
                                                        ...data.variations,
                                                        { name: variationName, options: optionsArray }
                                                    ]
                                                    const newCombinations = generateCombinations(newVariations, data.price)
                                                    
                                                    setData(prev => ({
                                                        ...prev,
                                                        variations: newVariations,
                                                        variationStocks: newCombinations
                                                    }))
                                                    setVariationName("")
                                                    setVariationOptions("")
                                                } else {
                                                    toast.error("Enter variation name and options")
                                                }
                                            }}
                                            className='bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-4 rounded-lg transition-all text-sm h-[42px]'
                                        >
                                            Add
                                        </button>
                                    </div>

                                    {/* Variation Stocks Table */}
                                    {data.variationStocks.length > 0 && (
                                        <div className='mt-6 border-t border-slate-200 pt-4'>
                                            <h4 className='text-xs font-bold text-slate-700 mb-3 tracking-wide text-center'>SET STOCK PER VARIATION</h4>
                                            <div className='grid gap-3'>
                                                {data.variationStocks.map((vs, idx) => (
                                                    <div key={idx} className='flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-100 shadow-sm'>
                                                        <div className='flex-1 min-w-0'>
                                                            <div className='flex flex-wrap gap-1.5'>
                                                                {Object.entries(vs.combinations).map(([key, value]) => (
                                                                    <span key={key} className='text-[10px] font-bold bg-slate-50 text-slate-500 px-2 py-0.5 rounded border border-slate-100 truncate'>
                                                                        {key}: <span className='text-slate-900'>{value}</span>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className='flex items-center gap-2 shrink-0'>
                                                            <div className='w-20'>
                                                                <label className='text-[9px] font-bold text-slate-400 block mb-0.5 uppercase tracking-tighter'>STOCK</label>
                                                                <input
                                                                    type="text"
                                                                    inputMode="numeric"
                                                                    placeholder="Stock"
                                                                    value={vs.stock ?? ""}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value
                                                                        if (val !== "" && !/^\d*$/.test(val)) return
                                                                        const updatedStocks = [...data.variationStocks]
                                                                        updatedStocks[idx].stock = val
                                                                        setData(prev => ({ ...prev, variationStocks: updatedStocks }))
                                                                    }}
                                                                    className='w-full bg-slate-50 p-1.5 border border-slate-200 rounded-lg outline-none focus:border-cta-yellow text-xs text-center font-bold'
                                                                />
                                                            </div>
                                                            <div className='w-24'>
                                                                <label className='text-[9px] font-bold text-slate-400 block mb-0.5 uppercase tracking-tighter'>PRICE</label>
                                                                <input
                                                                    type="text"
                                                                    inputMode="numeric"
                                                                    placeholder={data.price || "Price"}
                                                                    value={vs.price ?? ""}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value
                                                                        if (val !== "" && !/^\d*$/.test(val)) return
                                                                        const updatedStocks = [...data.variationStocks]
                                                                        updatedStocks[idx].price = val
                                                                        setData(prev => ({ ...prev, variationStocks: updatedStocks }))
                                                                    }}
                                                                    className='w-full bg-slate-50 p-1.5 border border-slate-200 rounded-lg outline-none focus:border-cta-yellow text-xs text-center font-bold text-cta-yellow'
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Image Upload Box */}
                        <div className='grid gap-2'>
                            <label className='text-sm font-bold text-slate-700'>
                                Product Images <span className='text-red-500'>*</span>
                            </label>

                            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3'>
                                {/* Previews */}
                                {data.image.map((img, index) => {
                                    const previewUrl = img instanceof File ? URL.createObjectURL(img) : img
                                    return (
                                        <div key={index} className='group relative aspect-square bg-slate-50 rounded-xl overflow-hidden border border-slate-200'>
                                            <img src={previewUrl} alt={`preview-${index}`} className='w-full h-full object-cover' />
                                            <button
                                                type='button'
                                                onClick={() => handleRemoveImage(index)}
                                                className='absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg'
                                            >
                                                <IoIosClose size={20} />
                                            </button>
                                        </div>
                                    )
                                })}

                                {/* Upload Button */}
                                <label
                                    htmlFor='uploadProductImage'
                                    className='aspect-square border-2 border-dashed border-slate-300 bg-slate-50 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-cta-yellow hover:bg-cta-yellow/5 hover:text-cta-yellow transition-all text-slate-400 group'
                                >
                                    <div className='p-2 bg-white rounded-full shadow-sm mb-1 group-hover:scale-110 transition-transform'>
                                        <FaCloudUploadAlt size={20} />
                                    </div>
                                    <span className='text-[10px] font-bold uppercase tracking-wider'>Add Image</span>
                                    <input
                                        type="file"
                                        id='uploadProductImage'
                                        className='hidden'
                                        accept='image/*'
                                        multiple
                                        onChange={handleUploadFile}
                                    />
                                </label>
                            </div>
                            <p className='text-[11px] text-slate-400 mt-1'>Upload multiple product images. PNG, JPG up to 5MB each.</p>
                        </div>

                        {/* Submit Button Inside Scroll Area */}
                        <div className='mt-8 pb-40'>
                            <button
                                type='submit'
                                disabled={!isFormValid}
                                className={`w-full py-4 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all 
                                ${isFormValid ? 'bg-cta-green hover:bg-opacity-90 active:scale-[0.98]' : 'bg-slate-300 cursor-not-allowed text-slate-500 shadow-none'}`}
                            >
                                {loading && (
                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                {loading ? "Updating Product..." : "Update Product"}
                            </button>
                        </div>
                    </div>
                </div>

                </form>
            </div>
        </section>
    )
}

export default EditProductAdmin
