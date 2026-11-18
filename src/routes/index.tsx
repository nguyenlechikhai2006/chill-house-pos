import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';

import { LoginPage } from '../pages/Auth/Login';
import { POSPage } from '../pages/POS';
import { KitchenPage } from '../pages/Kitchen';
import { DashboardPage } from '../pages/Dashboard';
import { OrdersPage } from '../pages/Orders';
import { ProductsPage } from '../pages/Products';
import { CategoriesPage } from '../pages/Categories';
import { RecipesPage } from '../pages/Recipes';
import { InventoryPage } from '../pages/Inventory';
import { PurchasesPage } from '../pages/Purchases';
import { SuppliersPage } from '../pages/Suppliers';
import { CustomersPage } from '../pages/Customers';
import { EmployeesPage } from '../pages/Employees';
import { ShiftsPage } from '../pages/Shifts';
import { ExpensesPage } from '../pages/Expenses';
import { PromotionsPage } from '../pages/Promotions';
import { ReportsPage } from '../pages/Reports';
import { SettingsPage } from '../pages/Settings';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <Navigate to="/pos" replace /> },
          { path: 'pos', element: <POSPage /> },
          { path: 'kitchen', element: <KitchenPage /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'orders', element: <OrdersPage /> },
          { path: 'products', element: <ProductsPage /> },
          { path: 'categories', element: <CategoriesPage /> },
          { path: 'recipes', element: <RecipesPage /> },
          { path: 'inventory', element: <InventoryPage /> },
          { path: 'purchases', element: <PurchasesPage /> },
          { path: 'suppliers', element: <SuppliersPage /> },
          { path: 'customers', element: <CustomersPage /> },
          { path: 'employees', element: <EmployeesPage /> },
          { path: 'shifts', element: <ShiftsPage /> },
          { path: 'expenses', element: <ExpensesPage /> },
          { path: 'promotions', element: <PromotionsPage /> },
          { path: 'reports', element: <ReportsPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/pos" replace />,
  },
]);
