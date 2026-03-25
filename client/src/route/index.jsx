
import React, { lazy, Suspense } from 'react'
import App from '../App.jsx'
import '../index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import PageLoadingFallback from '../components/PageLoadingFallback.jsx'

// ─── Eager-loaded: Home is the landing page (above the fold) ───
import Home from '../pages/Home.jsx';

// ─── Lazy-loaded page components (code splitting) ───
const SearchPage = lazy(() => import('../pages/SearchPage.jsx'));
const Login = lazy(() => import('../pages/Login.jsx'));
const Register = lazy(() => import('../pages/Register.jsx'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword.jsx'));
const VerifyOtp = lazy(() => import('../pages/VerifyOtp.jsx'));
const ResetPassword = lazy(() => import('../pages/ResetPassword.jsx'));
const CheckEmail = lazy(() => import('../pages/CheckEmail.jsx'));
const VerifyEmail = lazy(() => import('../pages/VerifyEmail.jsx'));
const UserMenuMobile = lazy(() => import('../pages/UserMenuMobile.jsx'));
const Profile = lazy(() => import('../pages/Profile.jsx'));
const Adress = lazy(() => import('../pages/Adress.jsx'));
const MyOrders = lazy(() => import('../pages/MyOrders.jsx'));
const CategoryPage = lazy(() => import('../pages/CategoryPage.jsx'));
const SubCategoryPage = lazy(() => import('../pages/SubCategoryPage.jsx'));
const UploadProductPage = lazy(() => import('../pages/UploadProductPage.jsx'));
const AdminProducts = lazy(() => import('../pages/AdminProducts.jsx'));
const ProductListPage = lazy(() => import('../pages/ProductListPage.jsx'));
const DisplayProductPage = lazy(() => import('../pages/DisplayProductPage.jsx'));
const CheckoutPage = lazy(() => import('../pages/CheckoutPage.jsx'));
const OrderSuccessPage = lazy(() => import('../pages/OrderSuccessPage.jsx'));
const AdminOrders = lazy(() => import('../pages/AdminOrders.jsx'));
const OrderDetails = lazy(() => import('../pages/OrderDetails.jsx'));
const PrivacyPolicy = lazy(() => import('../pages/PrivacyPolicy.jsx'));
const TermsOfService = lazy(() => import('../pages/TermsOfService.jsx'));

// ─── Lazy-loaded layout components ───
const Dashboard = lazy(() => import('../layouts/Dashboard.jsx'));
const AdminPermission = lazy(() => import('../layouts/adminPermission.jsx'));

// ─── Helper: wrap element in Suspense ───
const SuspenseWrap = ({ children }) => (
  <Suspense fallback={<PageLoadingFallback />}>
    {children}
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <Home />
      },
      {
        path: "category/:categoryId",
        element: <SuspenseWrap><ProductListPage /></SuspenseWrap>
      },
      {
        path: "product/:productId",
        element: <SuspenseWrap><DisplayProductPage /></SuspenseWrap>
      },
      {
        path: "search",
        element: <SuspenseWrap><SearchPage /></SuspenseWrap>
      },
      {
        path: "login",
        element: <SuspenseWrap><Login /></SuspenseWrap>
      },
      {
        path: "register",
        element: <SuspenseWrap><Register /></SuspenseWrap>
      },
      {
        path: "forgot-password",
        element: <SuspenseWrap><ForgotPassword /></SuspenseWrap>
      },
      {
        path: "check-email",
        element: <SuspenseWrap><CheckEmail /></SuspenseWrap>
      },
      {
        path: "verify-email",
        element: <SuspenseWrap><VerifyEmail /></SuspenseWrap>
      },
      {
        path: "verify-otp",
        element: <SuspenseWrap><VerifyOtp /></SuspenseWrap>
      },
      {
        path: "reset-password",
        element: <SuspenseWrap><ResetPassword /></SuspenseWrap>
      },
      {
        path: "user-menu",
        element: <SuspenseWrap><UserMenuMobile /></SuspenseWrap>
      },
      {
        path: "checkout",
        element: <SuspenseWrap><CheckoutPage /></SuspenseWrap>
      },
      {
        path: "order-success",
        element: <SuspenseWrap><OrderSuccessPage /></SuspenseWrap>
      },
      {
        path: "privacy-policy",
        element: <SuspenseWrap><PrivacyPolicy /></SuspenseWrap>
      },
      {
        path: "terms-of-service",
        element: <SuspenseWrap><TermsOfService /></SuspenseWrap>
      },
      {
        path: "dashboard",
        element: <SuspenseWrap><Dashboard /></SuspenseWrap>,
        children: [
          {
            path: "profile",
            element: <SuspenseWrap><Profile /></SuspenseWrap>
          },
          {
            path: "my-orders",
            element: <SuspenseWrap><MyOrders /></SuspenseWrap>
          },
          {
            path: "address",
            element: <SuspenseWrap><Adress /></SuspenseWrap>
          },
          {
            path: "category",
            element: <SuspenseWrap><AdminPermission><CategoryPage /></AdminPermission></SuspenseWrap>
          },
          {
            path: "sub-category",
            element: <SuspenseWrap><AdminPermission><SubCategoryPage /></AdminPermission></SuspenseWrap>
          },
          {
            path: "upload-product",
            element: <SuspenseWrap><AdminPermission><UploadProductPage /></AdminPermission></SuspenseWrap>
          },
          {
            path: "products",
            element: <SuspenseWrap><AdminPermission><AdminProducts /></AdminPermission></SuspenseWrap>
          },
          {
            path: "all-orders",
            element: <SuspenseWrap><AdminPermission><AdminOrders /></AdminPermission></SuspenseWrap>
          },
          {
            path: "order-details/:orderId",
            element: <SuspenseWrap><OrderDetails /></SuspenseWrap>
          }
        ]
      }
    ]
  },
])

export default router;
