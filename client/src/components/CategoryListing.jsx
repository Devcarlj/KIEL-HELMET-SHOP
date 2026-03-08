import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'

const CategoryListing = () => {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchCategories = async () => {
        try {
            setLoading(true)
            const response = await Axios({
                ...SummaryApi.getCategory
            })
            if (response.data.success) {
                setCategories(response.data.data)
            }
        } catch (error) {
            console.error("Error fetching categories:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    return (
        <section className="container mx-auto px-4 mt-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-neutral-800">Shop by Categories</h2>
            </div>

            <div className="grid grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 md:gap-6">
                {loading ? (
                    // Skeleton Loaders
                    [...Array(10)].map((_, index) => (
                        <div key={"skeleton" + index} className="flex flex-col items-center animate-pulse">
                            <div className="w-14 h-14 md:w-24 md:h-24 bg-slate-200 rounded-2xl mb-2"></div>
                            <div className="h-3 bg-slate-200 rounded-full w-3/4"></div>
                        </div>
                    ))
                ) : (
                    categories.map((category) => (
                        <Link
                            key={category._id}
                            to={`/category/${category._id}`}
                            className="group flex flex-col items-center cursor-pointer transition-all duration-300"
                        >
                            <div className="w-14 h-14 md:w-24 md:h-24 bg-slate-50 rounded-2xl overflow-hidden mb-2 border border-blue-50 group-hover:border-secondary shadow-sm group-hover:shadow-md transition-all duration-300 flex items-center justify-center p-2">
                                <img
                                    src={category.image}
                                    alt={category.name}
                                    className="w-full h-full object-scale-down group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            <p className="text-[10px] md:text-sm font-semibold text-neutral-600 group-hover:text-primary transition-colors text-center truncate w-full px-1">
                                {category.name}
                            </p>
                        </Link>
                    ))
                )}
            </div>
        </section>
    )
}

export default CategoryListing
