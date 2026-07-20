import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// ─── Layouts (loaded eagerly — small files, always needed) ────────────────────
import PublicLayout from './components/layouts/PublicLayout';
import FarmerLayout from './components/layouts/FarmerLayout';
import BuyerLayout from './components/layouts/BuyerLayout';
import AdminLayout from './components/layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Toast from './components/ui/Toast';
import ChatWidget from './components/ChatWidget';

// ─── Public Pages ─────────────────────────────────────────────────────────────
const LandingPage = lazy(() => import('./pages/public/LandingPage'));
const MarketplacePage = lazy(() => import('./pages/public/MarketplacePage'));
const ProductDetailPage = lazy(() => import('./pages/public/ProductDetailPage'));

// ─── Auth Pages ───────────────────────────────────────────────────────────────
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));

// ─── Farmer Pages ─────────────────────────────────────────────────────────────
const FarmerDashboard = lazy(() => import('./pages/farmer/FarmerDashboard'));
const MyProducts = lazy(() => import('./pages/farmer/MyProducts'));
const AddProduct = lazy(() => import('./pages/farmer/AddProduct'));
const EditProduct = lazy(() => import('./pages/farmer/EditProduct'));
const FarmerOrders = lazy(() => import('./pages/farmer/FarmerOrders'));
const PricePrediction = lazy(() => import('./pages/farmer/PricePrediction'));
const DemandForecast = lazy(() => import('./pages/farmer/DemandForecast'));
const DiseaseDetection = lazy(() => import('./pages/farmer/DiseaseDetection'));
const ColdStorage = lazy(() => import('./pages/farmer/ColdStorage'));
const DryingPlant = lazy(() => import('./pages/farmer/DryingPlant'));
const WeatherDashboard = lazy(() => import('./pages/farmer/WeatherDashboard'));
const FarmerProfile = lazy(() => import('./pages/farmer/FarmerProfile'));

// ─── Buyer Pages ──────────────────────────────────────────────────────────────
const BuyerDashboard = lazy(() => import('./pages/buyer/BuyerDashboard'));
const BuyerOrders = lazy(() => import('./pages/buyer/BuyerOrders'));
const CartPage = lazy(() => import('./pages/buyer/CartPage'));
const CheckoutPage = lazy(() => import('./pages/buyer/CheckoutPage'));
const WishlistPage = lazy(() => import('./pages/buyer/WishlistPage'));
const BuyerProfile = lazy(() => import('./pages/buyer/BuyerProfile'));

// ─── Admin Pages ──────────────────────────────────────────────────────────────
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminFarmers = lazy(() => import('./pages/admin/AdminFarmers'));
const AdminBuyers = lazy(() => import('./pages/admin/AdminBuyers'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminColdStorages = lazy(() => import('./pages/admin/AdminColdStorages'));
const AdminDryingPlants = lazy(() => import('./pages/admin/AdminDryingPlants'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));

// ─── 404 ──────────────────────────────────────────────────────────────────────
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// ─── Fallback loader ─────────────────────────────────────────────────────────
const PageLoader = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      flexDirection: 'column',
      gap: '1rem',
    }}
  >
    <div className="spinner-border text-success" role="status" style={{ width: '3rem', height: '3rem' }} />
    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading...</span>
  </div>
);

// ─── Role → path map ─────────────────────────────────────────────────────────
const getDashboardPath = (role) => {
  if (role === 'FARMER') return '/farmer';
  if (role === 'ADMIN') return '/admin';
  return '/buyer';
};

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  const { fetchMe, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <BrowserRouter>
      <Toast />
      {isAuthenticated && <ChatWidget />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Public ───────────────────────────────────────────────────── */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/marketplace/:id" element={<ProductDetailPage />} />
            <Route
              path="/login"
              element={
                !isAuthenticated
                  ? <LoginPage />
                  : <Navigate to={getDashboardPath(user?.role)} replace />
              }
            />
            <Route
              path="/register"
              element={
                !isAuthenticated
                  ? <RegisterPage />
                  : <Navigate to={getDashboardPath(user?.role)} replace />
              }
            />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          </Route>

          {/* ── Farmer ───────────────────────────────────────────────────── */}
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

          {/* ── Buyer ────────────────────────────────────────────────────── */}
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

          {/* ── Admin ────────────────────────────────────────────────────── */}
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

          {/* ── 404 ──────────────────────────────────────────────────────── */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
