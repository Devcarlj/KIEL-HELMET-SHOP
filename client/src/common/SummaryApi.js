export const baseURL =  ""

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
    toggleFavorite: {
        url: '/api/user/toggle-favorite',
        method: 'post'
    },
    getFavorites: {
        url: '/api/user/get-favorites',
        method: 'get'
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
    },
    getUnseenOrderCount: {
        url: '/api/order/unseen-count',
        method: 'get'
    },
    markAllOrdersAsSeen: {
        url: '/api/order/mark-as-seen',
        method: 'put'
    },
    addReview: {
        url: '/api/review/add',
        method: 'post'
    },
    getProductReviews: {
        url: '/api/review/product',
        method: 'get'
    },
    editReview: {
        url: '/api/review', // + /:reviewId
        method: 'put'
    },
    deleteReview: {
        url: '/api/review', // + /:reviewId
        method: 'delete'
    },
    getUserReviews: {
        url: '/api/review/user/my-reviews',
        method: 'get'
    },
    chatMessage: {
        url: '/api/chat/message',
        method: 'post'
    },
    chatMessageStream: {
        url: '/api/chat/message/stream',
        method: 'post'
    },
    getShopInfo: {
        url: '/api/user/get-shop-info',
        method: 'get'
    },
    updateShopInfo: {
        url: '/api/user/update-shop-info',
        method: 'put'
    },

    // ── Super Admin ──────────────────────────────────────────────────
    getEmailSettings: {
        url: '/api/superadmin/email-settings',
        method: 'get'
    },
    updateEmailSettings: {
        url: '/api/superadmin/email-settings',
        method: 'put'
    },
    getAdmins: {
        url: '/api/superadmin/admins',
        method: 'get'
    },
    addAdmin: {
        url: '/api/superadmin/add-admin',
        method: 'post'
    },
    removeAdmin: {
        url: '/api/superadmin/remove-admin',
        method: 'delete'
    },
    checkUserByEmail: {
        url: '/api/superadmin/check-user',
        method: 'post'
    },

    // ── Customer Management ──────────────────────────────────────────
    getAllCustomers: {
        url: '/api/superadmin/customers',
        method: 'get'
    },
    getCustomerById: {
        url: '/api/superadmin/customers',  // + /:id
        method: 'get'
    },
    updateCustomer: {
        url: '/api/superadmin/customers',  // + /:id
        method: 'put'
    },
    deleteCustomer: {
        url: '/api/superadmin/customers',  // + /:id
        method: 'delete'
    }
}
export default SummaryApi