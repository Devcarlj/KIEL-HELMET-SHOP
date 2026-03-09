export const baseURL = import.meta.env.VITE_API_URL

const SummaryApi = {
    register: {
        url: '/api/user/register',
        method: "post"
    },
    login: {
        url: '/api/user/login',
        method: "post"
    },
    verifyEmail: {
        url: '/api/user/verify-email',
        method: "post"
    },
    forgotPassword: {
        url: '/api/user/forgot-password',
        method: "put"
    },
    verify_otp: {
        url: '/api/user/verify-forgot-password-otp',
        method: "put"
    },
    resetPassword: {
        url: '/api/user/reset-password',
        method: "put"
    },
    refreshToken: {
        url: '/api/user/refresh-token',
        method: 'post'
    },
    userDetails: {
        url: '/api/user/user-details',
        method: 'get'
    },
    uploadAvatar: {
        url: '/api/user/upload-avatar',
        method: 'put'
    },
    deleteAvatar: {
        url: '/api/user/delete-avatar',
        method: 'delete'
    },
    updateUser: {
        url: '/api/user/update-user',
        method: 'put'
    },
    addCategory: {
        url: '/api/category/add-category',
        method: 'post'
    },
    uploadImage: {
        url: '/api/file/upload',
        method: 'post'
    },
    getCategory: {
        url: '/api/category/get',
        method: 'get'
    },
    updateCategory: {
        url: '/api/category/update',
        method: 'put'
    },
    deleteCategory: {
        url: '/api/category/delete',
        method: 'delete'
    },
    addSubCategory: {
        url: '/api/sub-category/add',
        method: 'post'
    },
    getSubCategory: {
        url: '/api/sub-category/get',
        method: 'post'
    },
    updateSubCategory: {
        url: '/api/sub-category/update',
        method: 'put'
    },
    deleteSubCategory: {
        url: '/api/sub-category/delete',
        method: 'delete'
    },
    addProduct: {
        url: '/api/product/create',
        method: 'post'
    },
    getProduct: {
        url: '/api/product/get',
        method: 'get'
    },
    updateProduct: {
        url: '/api/product/update',
        method: 'put'
    },
    deleteProduct: {
        url: '/api/product/delete',
        method: 'delete'
    },
    getProductsByCategory: {
        url: '/api/product/get-products-by-category',
        method: 'post'
    },
    addToCart: {
        url: '/api/cart/add',
        method: 'post'
    },
    getCartItems: {
        url: '/api/cart/get',
        method: 'get'
    },
    updateCartItem: {
        url: '/api/cart/update',
        method: 'put'
    },
    deleteCartItem: {
        url: '/api/cart/delete',
        method: 'delete'
    },
    addAddress: {
        url: '/api/user/add-address',
        method: 'post'
    },
    getAddress: {
        url: '/api/user/get-address',
        method: 'get'
    },
    updateAddress: {
        url: '/api/user/update-address',
        method: 'put'
    },
    deleteAddress: {
        url: '/api/user/delete-address',
        method: 'delete'
    },
    placeOrder: {
        url: '/api/order/place',
        method: 'post'
    },
    createPaymentIntent: {
        url: '/api/order/create-payment-intent',
        method: 'post'
    },
    getOrderHistory: {
        url: '/api/order/order-list',
        method: 'get'
    },
    getOrderProductItems: {
        url: '/api/order/order-product',
        method: 'post'
    },
    getAllOrders: {
        url: '/api/order/all-orders',
        method: 'get'
    },
    updateOrderStatus: {
        url: '/api/order/update-status',
        method: 'put'
    },
    getOrderDetails: {
        url: '/api/order/order-details',
        method: 'get'
    },
    cancelOrder: {
        url: '/api/order/cancel-order',
        method: 'put'
    },
    deleteOrder: {
        url: '/api/order/delete-order',
        method: 'delete'
    }
}
export default SummaryApi