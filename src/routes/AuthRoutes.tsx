import type { ReactNode } from "react";

import {Outlet, Navigate } from "react-router-dom";
import {
  useAuthStore,
} from "../modules/auth/store/authStore";

import { useBranchStore } from "../modules/branches/store/branchStore";
import { useCompanyStore } from "../modules/companies/store/companyStore";


export function ProtectedRoute() {
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated,
  );

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return <Outlet />;
}

export function PublicOnlyRoute() {
  const user = useAuthStore(
    (state) => state.user,
  );

  const selectedCompany = useCompanyStore(
    (state) => state.selectedCompany,
  );

  const selectedBranch = useBranchStore(
    (state) => state.selectedBranch,
  );

  /*
   * No ha iniciado sesión:
   * permite renderizar la ruta pública, por ejemplo LoginPage.
   */
  if (!user) {
    return <Outlet />;
  }

  /*
   * Ya tiene usuario, empresa y sucursal:
   * entra directamente al dashboard.
   */
  if (selectedCompany && selectedBranch) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  /*
   * Tiene varias empresas o todavía no ha elegido una.
   */
  return (
    <Navigate
      to="/companies"
      replace
    />
  );
}