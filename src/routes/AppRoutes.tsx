import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AppLayout } from "../layouts/AppLayout";
import { SalesPosPage } from "../modules/sales/pages/SalesPosPage";
import { LoginPage } from "../modules/auth/pages/LoginPage";
import { CompanySelectionPage } from "../modules/companies/pages/CompanySelectionPage";
import { DashboardPage } from "../modules/dashboard/pages/DashboardPage";
import { Box, Typography } from "@mui/material";
import { ProtectedRoute, PublicOnlyRoute,} from "./AuthRoutes";

import { ProductsPage } from "../modules/catalog/products/pages/ProductsPage";
import { SuppliersPage } from "../modules/purchases/suppliers/pages/SuppliersPage";
import { ExpensesPage, } from "../modules/expenses/pages/ExpensesPage";
import { PurchasesPage } from "../modules/purchases/pages/PurchasesPage";
import { CashPage } from "../modules/cash/pages/CashPage";
import { ReportsPage } from "../modules/reports/pages/ReportsPage";
import { SalesReportPage } from "../modules/reports/pages/SalesReportPage";
import { PurchasesReportPage } from "../modules/reports/pages/PurchasesReportPage";
import { ExpensesReportPage } from "../modules/reports/pages/ExpensesReportPage";
import { CashReportPage } from "../modules/reports/pages/CashReportPage";
import { InventoryReportPage } from "../modules/reports/pages/InventoryReportPage";
import { ProfitabilityReportPage } from "../modules/reports/pages/ProfitabilityReportPage";
import { CategoriesPage } from "../modules/catalog/categories/pages/CategoriesPage";
import { BrandsPage } from "../modules/catalog/brands/pages/BrandsPage"; 
import { UnitsOfMeasurePage } from "../modules/catalog/units/pages/UnitsOfMeasurePage";

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
        <Route path="/login" element={<LoginPage />}/>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/companies"  element={<CompanySelectionPage />}/>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />}/>
          <Route path="/sales/pos"  element={<SalesPosPage />}/>
          <Route path="/catalog/products" element={<ProductsPage/>}/>
          <Route path="/purchases/suppliers" element={<SuppliersPage/>}/>
          <Route path="/catalog/categories" element={ <CategoriesPage/> }/>
          <Route path="/catalog/brands" element={ <BrandsPage/> }/>
          <Route path="/catalog/units" element={ <UnitsOfMeasurePage /> }/>
          <Route path="/branches"  element={ <PendingPage title="Sucursales" /> } />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/purchases"  element={<PurchasesPage />} />
          <Route path="/cash" element={<CashPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reports/sales" element={<SalesReportPage />} />
          <Route path="/reports/purchases" element={<PurchasesReportPage />} />
          <Route path="/reports/expenses" element={<ExpensesReportPage />} />
          <Route path="/reports/cash" element={<CashReportPage />} />
          <Route path="/reports/inventory" element={<InventoryReportPage />} />
          <Route path="/reports/profitability" element={<ProfitabilityReportPage />} />
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