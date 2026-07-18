import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Layouts
import PublicLayout from './components/layouts/PublicLayout';
import FarmerLayout from './components/layouts/FarmerLayout';
import BuyerLayout from './components/layouts/BuyerLayout';
import AdminLayout from './components/layouts/AdminLayout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import MarketplacePage from './pages/public/MarketplacePage';
import ProductDetailPage from './pages/public/ProductDetailPage';
import NotFoundPage from './pages/NotFoundPage';

// Farmer Pages
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import MyProducts from './pages/farmer/MyProducts';
import AddProduct from './pages/farmer/AddProduct';
import EditProduct from './pages/farmer/EditProduct';
import FarmerOrders from './pages/farmer/FarmerOrders';
import PricePrediction from './pages/farmer/PricePrediction';
import DiseaseDetection from './pages/farmer/DiseaseDetection';
import ColdStorage from './pages/farmer/ColdStorage';
import DryingPlant from './pages/farmer/DryingPlant';
import WeatherDashboard from './pages/farmer/WeatherDashboard';
import FarmerProfile from './pages/farmer/FarmerProfile';
import DemandForecast from './pages/farmer/DemandForecast';

// Buyer Pages
import BuyerDashboard from './pages/buyer/BuyerDashboard';
import BuyerOrders from './pages/buyer/BuyerOrders';
import CartPage from './pages/buyer/CartPage';
import CheckoutPage from './pages/buyer/CheckoutPage';
import WishlistPage from './pages/buyer/WishlistPage';
import BuyerProfile from './pages/buyer/BuyerProfile';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminFarmers from './pages/admin/AdminFarmers';
import AdminBuyers from './pages/admin/AdminBuyers';
import AdminOrders from './pages/admin/AdminOrders';
import AdminColdStorages from './pages/admin/AdminColdStorages';
import AdminDryingPlants from './pages/admin/AdminDryingPlants';
import AdminReports from './pages/admin/AdminReports';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Toast from './components/ui/Toast';
import ChatWidget from './components/ChatWidget';

function App() {
  const { fetchMe, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <BrowserRouter>
      <Toast />
      {isAuthenticated && <ChatWidget />}
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/marketplace/:id" element={<ProductDetailPage />} />
          <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to={getDashboardPath(user?.role)} />} />
          <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to={getDashboardPath(user?.role)} />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Farmer Routes */}
        <Route element={<ProtectedRoute role="FARMER" />}>
          <Route element={<FarmerLayout />}>
            <Route path="/farmer" element={<FarmerDashboard />} />
            <Route path="/farmer/products" element={<MyProducts />} />
            <Route path="/farmer/products/add" element={<AddProduct />} />
            <Route path="/farmer/products/edit/:id" element={<EditProduct />} />
            <Route path="/farmer/orders" element={<FarmerOrders />} />
            <Route path="/farmer/price-prediction" element={<PricePrediction />} />
            <Route path="/farmer/demand-forecast" element={<DemandForecast />} />
            <Route path="/farmer/disease-detection" element={<DiseaseDetection />} />
            <Route path="/farmer/cold-storage" element={<ColdStorage />} />
            <Route path="/farmer/drying-plant" element={<DryingPlant />} />
            <Route path="/farmer/weather" element={<WeatherDashboard />} />
            <Route path="/farmer/profile" element={<FarmerProfile />} />
          </Route>
        </Route>

        {/* Buyer Routes */}
        <Route element={<ProtectedRoute role="BUYER" />}>
          <Route element={<BuyerLayout />}>
            <Route path="/buyer" element={<BuyerDashboard />} />
            <Route path="/buyer/orders" element={<BuyerOrders />} />
            <Route path="/buyer/cart" element={<CartPage />} />
            <Route path="/buyer/checkout" element={<CheckoutPage />} />
            <Route path="/buyer/wishlist" element={<WishlistPage />} />
            <Route path="/buyer/profile" element={<BuyerProfile />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute role="ADMIN" />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/farmers" element={<AdminFarmers />} />
            <Route path="/admin/buyers" element={<AdminBuyers />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/cold-storages" element={<AdminColdStorages />} />
            <Route path="/admin/drying-plants" element={<AdminDryingPlants />} />
            <Route path="/admin/reports" element={<AdminReports />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

const getDashboardPath = (role) => {
  if (role === 'FARMER') return '/farmer';
  if (role === 'ADMIN') return '/admin';
  return '/buyer';
};

export default App;
