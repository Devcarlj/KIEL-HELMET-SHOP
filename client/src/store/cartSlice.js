import { createSlice } from '@reduxjs/toolkit';

const loadCartFromStorage = () => {
    try {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
        return [];
    }
};

const initialState = {
    cart: loadCartFromStorage(),   // Array of { _id, productId: { ...productData }, quantity, userId }
    loading: false,
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        setCart: (state, action) => {
            state.cart = action.payload;
            localStorage.setItem('cart', JSON.stringify(state.cart));
        },

        addCartItem: (state, action) => {
            // action.payload = full cart item { _id, productId: {...}, quantity }
            const existing = state.cart.find(
                (item) =>
                    item.productId?._id === action.payload.productId?._id &&
                    JSON.stringify(item.variations) === JSON.stringify(action.payload.variations)
            );
            if (existing) {
                existing.quantity += action.payload.quantity;
            } else {
                state.cart.push({ ...action.payload, selected: true });
            }
            localStorage.setItem('cart', JSON.stringify(state.cart));
        },

        updateCartItemQty: (state, action) => {
            // action.payload = { _id, quantity }
            const item = state.cart.find((i) => i._id === action.payload._id);
            if (item) {
                item.quantity = action.payload.quantity;
            }
            localStorage.setItem('cart', JSON.stringify(state.cart));
        },

        removeCartItem: (state, action) => {
            // action.payload = _id of cart item
            state.cart = state.cart.filter((item) => item._id !== action.payload);
            localStorage.setItem('cart', JSON.stringify(state.cart));
        },

        clearCart: (state) => {
            state.cart = [];
            localStorage.removeItem('cart');
        },

        removeSelectedItems: (state) => {
            state.cart = state.cart.filter(item => item.selected === false);
            localStorage.setItem('cart', JSON.stringify(state.cart));
        },

        setCartLoading: (state, action) => {
            state.loading = action.payload;
        },

        toggleSelectItem: (state, action) => {
            const item = state.cart.find(i => i._id === action.payload);
            if (item) {
                item.selected = !item.selected;
            }
            localStorage.setItem('cart', JSON.stringify(state.cart));
        },

        toggleSelectAll: (state, action) => {
            const allSelected = state.cart.every(item => item.selected);
            state.cart.forEach(item => {
                item.selected = !allSelected;
            });
            localStorage.setItem('cart', JSON.stringify(state.cart));
        }
    }
});

export const {
    setCart,
    addCartItem,
    updateCartItemQty,
    removeCartItem,
    clearCart,
    setCartLoading,
    toggleSelectItem,
    toggleSelectAll,
    removeSelectedItems
} = cartSlice.actions;

export default cartSlice.reducer;

// Selectors
export const selectCart = (state) => state.cart.cart;
export const selectCartLoading = (state) => state.cart.loading;

export const selectCartItemCount = (state) => {
    return state.cart.cart.reduce((total, item) => total + item.quantity, 0);
};

export const selectCartTotal = (state) => {
    return state.cart.cart
        .filter(item => item.selected !== false) // Handle existing items without selected property
        .reduce((total, item) => {
            const product = item.productId;
            if (!product) return total;
            const price = product.price || 0;
            const discount = product.discount || 0;
            const effectivePrice = Math.round(price * (1 - discount / 100));
            return total + (effectivePrice * item.quantity);
        }, 0);
};

export const selectCartTotalSavings = (state) => {
    return state.cart.cart
        .filter(item => item.selected !== false)
        .reduce((total, item) => {
            const product = item.productId;
            if (!product || !(product.discount > 0)) return total;
            const price = product.price || 0;
            const discount = product.discount || 0;
            const effectivePrice = Math.round(price * (1 - discount / 100));
            const savingsPerItem = price - effectivePrice;
            return total + (savingsPerItem * item.quantity);
        }, 0);
};

export const selectCartOriginalTotal = (state) => {
    return state.cart.cart
        .filter(item => item.selected !== false)
        .reduce((total, item) => {
            const product = item.productId;
            if (!product) return total;
            return total + ((product.price || 0) * item.quantity);
        }, 0);
};

export const selectSelectedCartItems = (state) => {
    return state.cart.cart.filter(item => item.selected !== false);
};

export const selectIsAllSelected = (state) => {
    return state.cart.cart.length > 0 && state.cart.cart.every(item => item.selected !== false);
};

// Get quantity of a specific product in cart
export const selectProductQtyInCart = (productId, variations = []) => (state) => {
    const cartItem = state.cart.cart.find(
        (item) =>
            item.productId?._id === productId &&
            JSON.stringify(item.variations) === JSON.stringify(variations)
    );
    return cartItem ? { qty: cartItem.quantity, cartItemId: cartItem._id } : null;
};
