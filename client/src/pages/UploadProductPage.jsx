import React, { useState, useEffect } from 'react'
import { FaCloudUploadAlt, FaChevronDown } from "react-icons/fa"
import { IoIosClose } from "react-icons/io"
import uploadImage from '../utils/UploadImage.js'
import SummaryApi from '../common/SummaryApi.js'
import Axios from '../utils/Axios.js'
import AxiosToastError from '../utils/AxiosToastError.js'
import toast from 'react-hot-toast'

const UploadProductPage = () => {
  const [loading, setLoading] = useState(false)
  const [openSelect, setOpenSelect] = useState(false)
  const [openSubSelect, setOpenSubSelect] = useState(false)
  const [categoryList, setCategoryList] = useState([])
  const [subCategoryList, setSubCategoryList] = useState([])
  const [data, setData] = useState({
    name: "",
    description: "",
    image: [],
    category: [],
    subCategory: [],
    unit: "",
    stock: "",
    price: "",
    discount: "",
    more_details: {},
    variations: []
  })

  const [fieldName, setFieldName] = useState("")
  const [fieldValue, setFieldValue] = useState("")
  const [openMoreDetails, setOpenMoreDetails] = useState(false)
  const [variationName, setVariationName] = useState("")
  const [variationOptions, setVariationOptions] = useState("")
  const [openVariations, setOpenVariations] = useState(false)

  // Fetch all categories and subCategories
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

  // Filter subCategories based on selected category
  const filteredSubCategories = subCategoryList.filter(
    (subCat) => subCat.category.some(c => data.category.some(dc => dc._id === (c._id || c)))
  )

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
    if (data.image.length === 0 || !data.name || data.category.length === 0 || !data.description) {
      toast.error("Please fill all required fields")
      return
    }

    try {
      setLoading(true)

      // Upload all images
      const uploadPromises = data.image.map(file => uploadImage(file, 'kielHelmetShop/product'))
      const uploadResponses = await Promise.all(uploadPromises)
      const imageUrls = uploadResponses.map(res => res?.data?.url).filter(url => url)

      if (imageUrls.length === 0) {
        toast.error("Failed to upload images")
        return
      }

      const response = await Axios({
        ...SummaryApi.addProduct,
        data: {
          name: data.name,
          description: data.description,
          image: imageUrls,
          category: data.category,
          subCategory: data.subCategory,
          unit: data.unit,
          stock: data.stock,
          price: data.price,
          discount: data.discount,
          more_details: data.more_details,
          variations: data.variations
        }
      })

      if (response.data.success) {
        toast.success(response.data.message)
        setData({
          name: "",
          description: "",
          image: [],
          category: [],
          subCategory: [],
          unit: "",
          stock: "",
          price: "",
          discount: "",
          more_details: {},
          variations: []
        })
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
    <section className='bg-gray-50 min-h-screen'>
      {/* Header Section */}
      <div className='p-3 md:p-4 bg-white shadow-sm flex items-center justify-between sticky top-0 z-10'>
        <h2 className='font-bold text-base md:text-xl text-neutral-800'>Upload New Product</h2>
        <p className='text-xs md:text-sm text-slate-500 hidden md:block'>Fill in the details below to add a product to the store.</p>
      </div>

      <div className='px-2 py-4 md:px-6 flex justify-center'>
        <div className='bg-white w-full max-w-3xl rounded-2xl shadow-sm border border-slate-100 overflow-hidden'>
          {/* Form */}
          <form className='p-4 md:p-8 grid gap-6' onSubmit={handleSubmit}>

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
                  <div className='absolute top-full left-0 w-full mt-2 max-h-60 overflow-y-auto bg-white border border-slate-100 rounded-xl z-50 shadow-xl p-2 animate-in fade-in zoom-in duration-200'>
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

            {/* Sub Category Dropdown */}
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
                  <div className='absolute top-full left-0 w-full mt-2 max-h-60 overflow-y-auto bg-white border border-slate-100 rounded-xl z-50 shadow-xl p-2 animate-in fade-in zoom-in duration-200'>
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

            {/* Unit and Stock */}
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
                  className='bg-slate-50 p-3.5 border border-slate-200 rounded-xl outline-none focus:border-cta-yellow focus:ring-4 focus:ring-cta-yellow/10 transition-all text-slate-700'
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
                  value={data.stock}
                  onChange={handleOnChange}
                  onKeyDown={(e) => {
                    if (e.key === '.' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
                      e.preventDefault();
                    }
                  }}
                  className='bg-slate-50 p-3.5 border border-slate-200 rounded-xl outline-none focus:border-cta-yellow focus:ring-4 focus:ring-cta-yellow/10 transition-all text-slate-700'
                />
              </div>
            </div>

            {/* Price and Discount */}
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
                  value={data.price}
                  onChange={handleOnChange}
                  onKeyDown={(e) => {
                    if (e.key === '.' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
                      e.preventDefault();
                    }
                  }}
                  className='bg-slate-50 p-3.5 border border-slate-200 rounded-xl outline-none focus:border-cta-yellow focus:ring-4 focus:ring-cta-yellow/10 transition-all text-slate-700'
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
                  value={data.discount}
                  onChange={handleOnChange}
                  onKeyDown={(e) => {
                    if (e.key === '.' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
                      e.preventDefault();
                    }
                  }}
                  className='bg-slate-50 p-3.5 border border-slate-200 rounded-xl outline-none focus:border-cta-yellow focus:ring-4 focus:ring-cta-yellow/10 transition-all text-slate-700'
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
                  {Object.keys(data.more_details).length > 0 && (
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
                                setData(prev => ({ ...prev, variations: updated }))
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
                          setData(prev => ({
                            ...prev,
                            variations: [
                              ...prev.variations,
                              { name: variationName, options: optionsArray }
                            ]
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
                </>
              )}
            </div>

            {/* Product Image */}
            <div className='grid gap-2'>
              <label className='text-sm font-bold text-slate-700'>
                Product Image <span className='text-red-500'>*</span>
              </label>

              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'>
                {/* Previews */}
                {data.image.map((file, index) => {
                  const previewUrl = URL.createObjectURL(file)
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
              <p className='text-[11px] text-slate-400 mt-1'>You can upload multiple images. PNG, JPG up to 5MB each.</p>
            </div>

            {/* Submit Button */}
            <div className='pt-4'>
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
                {loading ? "Uploading Product..." : "Upload Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

export default UploadProductPage