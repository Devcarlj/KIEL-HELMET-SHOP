import { createSlice } from '@reduxjs/toolkit';

const initialValue = {
    _id: "",
    name: "",
    email: "",
    avatar: "",
    mobile: "",
    last_login_date: "",
    status: "",
    adress_details: "",
    shopping_cart: [],
    orderHistory: [],
    forgot_password_otp: "",
    forgot_password_expiry: "",
    role: "",
    favorites: [],
    loading: true,
    isLoggedIn: false

}

const userSlice = createSlice({
    name: 'user',
    initialState: initialValue,
    reducers: {
        setUserDetails: (state, action) => {
            // This copies every property from the payload directly into the state
            // It's much safer and shorter!
            Object.assign(state, action.payload);
        },

        setLoading: (state, action) => {
            state.loading = action.payload
        },

        updateAvatar: (state, action) => {
            state.avatar = action.payload
        },

        deleteAddressAction: (state, action) => {
            if (Array.isArray(state.adress_details)) {
                state.adress_details = state.adress_details.filter(addr => addr._id !== action.payload);
            }
        },

        setFavorites: (state, action) => {
            state.favorites = action.payload
        },

        logout: () => {
            return { ...initialValue, loading: false };
        }

    }
})


export const { setUserDetails, logout, updateAvatar, deleteAddressAction, setLoading, setFavorites } = userSlice.actions


export default userSlice.reducer
export const selectUser = (state) => state.user;
// Usage in a component: const user = useSelector(selectUser);