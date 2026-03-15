
import App from '../App.jsx'
import '../index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from '../pages/Home.jsx';
import SearchPage from '../pages/SearchPage.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import ForgotPassword from '../pages/ForgotPassword.jsx';
import VerifyOtp from '../pages/VerifyOtp.jsx';
import ResetPassword from '../pages/ResetPassword.jsx';
import CheckEmail from '../pages/CheckEmail.jsx';
import VerifyEmail from '../pages/VerifyEmail.jsx';
import UserMenuMobile from '../pages/UserMenuMobile.jsx';
import Dashboard from '../layouts/Dashboard.jsx';
import Profile from '../pages/Profile.jsx';
import Adress from '../pages/Adress.jsx';
import MyOrders from '../pages/MyOrders.jsx';
import CategoryPage from '../pages/CategoryPage.jsx';
import SubCategoryPage from '../pages/SubCategoryPage.jsx';
import UploadProductPage from '../pages/UploadProductPage.jsx';
import AdminProducts from '../pages/AdminProducts.jsx';
import AdminPermission from '../layouts/adminPermission.jsx';
import ProductListPage from '../pages/ProductListPage.jsx';
import DisplayProductPage from '../pages/DisplayProductPage.jsx';
import CheckoutPage from '../pages/CheckoutPage.jsx';
import OrderSuccessPage from '../pages/OrderSuccessPage.jsx';
import AdminOrders from '../pages/AdminOrders.jsx';
import OrderDetails from '../pages/OrderDetails.jsx';
import PrivacyPolicy from '../pages/PrivacyPolicy.jsx';
import TermsOfService from '../pages/TermsOfService.jsx';

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
        element: <ProductListPage />
      },
      {
        path: "product/:productId",
        element: <DisplayProductPage />
      },
      {
        path: "search",
        element: <SearchPage />
      },
      {
        path: "login",
        element: <Login />
      },
      {
        path: "register",
        element: <Register />
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />
      },
      {
        path: "check-email",
        element: <CheckEmail />
      },
      {
        path: "verify-email",
        element: <VerifyEmail />
      },
      {
        path: "verify-otp",
        element: <VerifyOtp />
      },
      {
        path: "reset-password",
        element: <ResetPassword />
      },
      {
        path: "user-menu",
        element: <UserMenuMobile />
      },
      {
        path: "checkout",
        element: <CheckoutPage />
      },
      {
        path: "order-success",
        element: <OrderSuccessPage />
      },
      {
        path: "privacy-policy",
        element: <PrivacyPolicy />
      },
      {
        path: "terms-of-service",
        element: <TermsOfService />
      },
      {
        path: "dashboard",
        element: <Dashboard />,
        children: [
          {
            path: "profile",
            element: <Profile />
          },
          {
            path: "my-orders",
            element: <MyOrders />
          },
          {
            path: "address",
            element: <Adress />
          },
          {
            path: "category",
            element: <AdminPermission><CategoryPage /></AdminPermission>
          },
          {
            path: "sub-category",
            element: <AdminPermission><SubCategoryPage /></AdminPermission>
          },
          {
            path: "upload-product",
            element: <AdminPermission><UploadProductPage /></AdminPermission>
          },
          {
            path: "products",
            element: <AdminPermission><AdminProducts /></AdminPermission>
          },
          {
            path: "all-orders",
            element: <AdminPermission><AdminOrders /></AdminPermission>
          },
          {
            path: "order-details/:orderId",
            element: <OrderDetails />
          }
        ]
      }
    ]
  },
])

export default router;
