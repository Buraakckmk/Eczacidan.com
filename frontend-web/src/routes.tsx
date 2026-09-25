import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import AccountDashboard from '../pages/AccountDashboard';
import AdminPanel from '../pages/AdminPanel';
import CorporateRegister from '../pages/CorporateRegister';
import LandingPage from '../pages/LandingPage';
import LegalPage from '../pages/LegalPage';
import Login from '../pages/Login';
import ProductPanel from '../pages/ProductPanel';
import Register from '../pages/Register';
import CheckoutPage from '../pages/CheckoutPage';
import { RequireAuth } from './components/AuthContext';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <Layout />
      </RequireAuth>
    ),
    children: [
      { path: 'products', element: <ProductPanel /> },
      { path: 'kategori/:categorySlug', element: <ProductPanel /> },
      { path: 'magaza/:sellerSlug', element: <ProductPanel /> },
      { path: 'account', element: <AccountDashboard /> },
      { path: 'checkout', element: <CheckoutPage /> },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/corporate-register',
    element: <CorporateRegister />,
  },
  {
    path: '/legal',
    element: <LegalPage />,
  },
  {
    path: '/legal/:docType',
    element: <LegalPage />,
  },
  {
    path: '/admin-portal',
    element: <AdminPanel />,
  },
  {
    path: '/sys-admin',
    element: <AdminPanel />,
  },
]);
