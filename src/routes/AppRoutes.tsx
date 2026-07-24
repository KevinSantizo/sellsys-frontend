import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AppLayout } from "../layouts/AppLayout";

import { LoginPage } from "../modules/auth/pages/LoginPage";
import { CompanySelectionPage } from "../modules/companies/pages/CompanySelectionPage";
import { DashboardPage } from "../modules/dashboard/pages/DashboardPage";
import { Box, Typography } from "@mui/material";
import {
  ProtectedRoute,
  PublicOnlyRoute,
} from "./AuthRoutes";

import { ProductsPage } from "../modules/catalog/products/pages/ProductsPage";

function PendingPage({
  title,
}: {
  title: string;
}) {
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 4,
        bgcolor: "background.paper",
        p: 4,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 1,
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          color: "text.secondary",
        }}
      >
        Pantalla pendiente de construcción.
      </Typography>
    </Box>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route
          path="/login"
          element={<LoginPage />}
        />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route
          path="/companies"
          element={<CompanySelectionPage />}
        />

        <Route element={<AppLayout />}>
          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />

          <Route
            path="/catalog/products"
            element={<ProductsPage />}
          />

          <Route
            path="/catalog/categories"
            element={
              <PendingPage title="Categorías" />
            }
          />

          <Route
            path="/catalog/brands"
            element={
              <PendingPage title="Marcas" />
            }
          />

          <Route
            path="/catalog/units"
            element={
              <PendingPage title="Unidades de medida" />
            }
          />

          <Route
            path="/branches"
            element={
              <PendingPage title="Sucursales" />
            }
          />
        </Route>
      </Route>

      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
}