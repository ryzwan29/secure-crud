import { createBrowserRouter } from "react-router-dom";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { SetupPage } from "../pages/SetupPage";
import { DashboardPage } from "../pages/DashboardPage";
import { ProductsPage } from "../pages/ProductsPage";
import { UsersPage } from "../pages/UsersPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { RootRedirect } from "../components/RootRedirect";

export const router = createBrowserRouter([
  { path: "/", element: <RootRedirect /> },
  { path: "/setup", element: <SetupPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "products", element: <ProductsPage /> },
      {
        path: "users",
        element: (
          <ProtectedRoute requiredRole="admin">
            <UsersPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);