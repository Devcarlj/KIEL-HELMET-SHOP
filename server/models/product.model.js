import mongoose from "mongoose";

const productSchema = new mongoose.Schema({

    name: {
        type: String,
    },

    image: {
        type: Array,
        default: []
    },

    category: {
        type: Array,
        default: []
    },

    subCategory: {
        type: Array,
        default: []
    },

    unit: {
        type: String,
        default: null
    },

    stock: {
        type: Number,
        default: null
    },

    price: {
        type: Number,
        default: null
    },

    discount: {
        type: Number,
        default: null
    },

    description: {
        type: String,
        default: ""
    },

    more_details: {
        type: Object,
        default: {}
    },

    variations: [
        {
            name: { type: String, default: "" },
            options: { type: Array, default: [] }
        }
    ],

    variationStocks: [
        {
            combinations: { type: Object, default: {} },
            stock: { type: Number, default: 0 },
            price: { type: Number, default: null }
        }
    ],

    public: {
        type: Boolean,
        default: true
    },

    badges: {
        type: Array,
        default: []
    }





}, {
    timestamps: true
})

// Performance indexes for general queries and chatbot context retrieval
productSchema.index({ public: 1, stock: -1 });
productSchema.index({ discount: -1, price: 1 });
productSchema.index({ name: 'text', description: 'text' }); // Also add text search for potential future improvements

const ProductModel = mongoose.model('product', productSchema)

export default ProductModel