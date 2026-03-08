import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import UploadCategoryModel from '../components/UploadCategoryModel.jsx'
import Loading from '../components/Loading.jsx'
import Axios from '../utils/Axios.js'
import SummaryApi from '../common/SummaryApi.js'
import NoData from '../components/NoData.jsx'
import EditCategory from '../components/EditCategory.jsx'
import DeleteCategoryConfirm from '../components/DeleteCategoryConfirm.jsx'

const CategoryPage = () => {
    const [openUploadCategory, setOpenUploadCategory] = useState(false)
    const [categoryData, setCategoryData] = useState([])
    const [loading, setLoading] = useState(false)
    const [openEdit, SetOpenEdit] = useState(false)
    const [editData, setEditData] = useState({
        name: "",
        image: "",
        _id: ""
    })
    const [categoryToDelete, setCategoryToDelete] = useState(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const fetchCategory = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true) // Only show skeletons if told to

            const response = await Axios({
                ...SummaryApi.getCategory
            })

            if (response.data.success) {
                setCategoryData(response.data.data)
            }
        } catch (error) {
            console.log("Error fetching category", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCategory()
    }, [])

    const handleUpdateLocalState = (updatedData) => {
        setCategoryData((prev) => {
            // Find the specific category and swap its data
            return prev.map(item =>
                item._id === updatedData.categoryId ? { ...item, ...updatedData } : item
            )
        })
    }

    const handleDeleteCategory = async (category) => {
        // Optimistic update: remove from UI and close modal immediately
        setCategoryData((prev) => prev.filter((item) => item._id !== category._id))
        setCategoryToDelete(null)
        setDeleteLoading(false)
        toast.success('Category deleted')

        try {
            const response = await Axios({
                ...SummaryApi.deleteCategory,
                data: { categoryId: category._id }
            })
            if (!response.data.success) {
                setCategoryData((prev) => [...prev, category])
                toast.error(response.data.message || 'Delete failed')
            }
        } catch (error) {
            setCategoryData((prev) => [...prev, category])
            toast.error(error?.response?.data?.message || 'Error deleting category')
        }
    }

    return (
        <section className='bg-gray-50 min-h-screen'>
            {/* Header Section */}
            <div className='p-3 md:p-4 bg-white shadow-sm flex items-center justify-between sticky top-0 z-10'>
                <h2 className='font-bold text-base md:text-xl text-neutral-800'>Category</h2>
                <button
                    onClick={() => setOpenUploadCategory(true)}
                    className='text-xs md:text-sm font-semibold bg-primary hover:bg-orange-500 text-white px-3 md:px-5 py-2 rounded-full shadow-md transition-all active:scale-95 flex items-center gap-1'>
                    <span>+</span> <span className='hidden xs:block'>Add Category</span>
                    <span className='xs:hidden'>Add</span>
                </button>
            </div>

            <div className='px-1 py-4 md:px-6'>
                {/* Loading State */}
                {loading && (
                    <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6'>
                        {[...Array(12)].map((_, n) => (
                            <div key={n} className='bg-white rounded-2xl p-2 md:p-3 border border-gray-100 animate-pulse flex flex-col'>
                                {/* Match Image Aspect Ratio */}
                                <div className='w-full aspect-square bg-gray-200 rounded-xl'></div>

                                {/* Match Info Section Spacing */}
                                <div className='mt-2 flex flex-col items-center justify-center gap-2'>
                                    {/* Name lines */}
                                    <div className='h-3 bg-gray-200 rounded-full w-3/4'></div>
                                    <div className='h-3 bg-gray-100 rounded-full w-1/2'></div>
                                </div>

                                {/* Match Mobile Action Buttons height and border */}
                                <div className='flex items-center justify-around mt-1 pt-2 border-t border-gray-50 md:hidden'>
                                    <div className='h-4 bg-gray-100 rounded w-1/4'></div>
                                    <div className='w-[1px] h-4 bg-gray-100'></div>
                                    <div className='h-4 bg-gray-100 rounded w-1/4'></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && categoryData.length === 0 && (
                    <div className='mt-20'>
                        <NoData />
                    </div>
                )}

                {/* Data Grid - Fixed to 2 Columns for Mobile */}
                <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6'>
                    {!loading && categoryData.map((category, index) => {
                        return (
                            <div
                                key={category._id || index}
                                className='group relative bg-white rounded-2xl border border-gray-100 p-2 md:p-3 hover:border-secondary shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col'
                            >
                                {/* Category Image Wrapper */}
                                <div className='w-full aspect-square overflow-hidden rounded-xl bg-gray-50 flex items-center justify-center relative'>
                                    <img
                                        src={category.image}
                                        alt={category.name}
                                        className='w-full h-full object-scale-down group-hover:scale-110 transition-transform duration-500'
                                    />

                                    {/* Desktop ONLY Hover Overlay */}
                                    <div className='hidden md:flex absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity items-end justify-center pb-2 gap-2'>
                                        <button
                                            onClick={() => {
                                                setEditData(category)
                                                SetOpenEdit(true)
                                            }}
                                            className='bg-white text-secondary p-1.5 rounded-lg shadow-md hover:bg-secondary hover:text-white transition-colors'
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" /></svg>
                                        </button>
                                        <button
                                            onClick={() => setCategoryToDelete(category)}
                                            className='bg-white text-red-500 p-1.5 rounded-lg shadow-md hover:bg-red-500 hover:text-white transition-colors'
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" /><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" /></svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Label Section */}
                                <div className='mt-2 text-center h-10 flex items-center justify-center'>
                                    <p className='font-bold text-xs md:text-sm text-neutral-700 group-hover:text-primary transition-colors capitalize leading-tight line-clamp-2'>
                                        {category.name}
                                    </p>
                                </div>

                                {/* Mobile Action Buttons - Always visible on small screens */}
                                <div className='flex items-center justify-around mt-1 pt-2 border-t border-gray-100 md:hidden'>
                                    <button
                                        onClick={() => {
                                            setEditData(category)
                                            SetOpenEdit(true)
                                        }}
                                        className='flex-1 flex justify-center text-secondary py-1 active:bg-gray-50 rounded-l-lg'
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" /></svg>
                                    </button>
                                    <div className='w-[1px] h-4 bg-gray-100'></div>
                                    <button
                                        onClick={() => setCategoryToDelete(category)}
                                        className='flex-1 flex justify-center text-red-500 py-1 active:bg-gray-50 rounded-r-lg'
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" /><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" /></svg>
                                    </button>
                                </div>
                            </div>
                        )
                    })
                    }
                </div>
            </div>

            {/* Modals */}
            {openUploadCategory && (
                <UploadCategoryModel
                    close={() => setOpenUploadCategory(false)}
                    fetchData={fetchCategory}
                    onAdded={(newCategory) => setCategoryData((prev) => [...prev, newCategory])}
                />
            )}

            {openEdit && (
                <EditCategory
                    data={editData}
                    close={() => SetOpenEdit(false)}
                    updateLocal={handleUpdateLocalState}
                />
            )}

            {categoryToDelete && (
                <DeleteCategoryConfirm
                    category={categoryToDelete}
                    close={() => setCategoryToDelete(null)}
                    onConfirm={handleDeleteCategory}
                    loading={deleteLoading}
                />
            )}
        </section>
    )
}

export default CategoryPage