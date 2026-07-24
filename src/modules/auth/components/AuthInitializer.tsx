import {
  Box,
  CircularProgress,
} from "@mui/material";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  getCurrentUser,
} from "../services/authService";

import {
  useAuthStore,
} from "../store/authStore";

import {
  getCompanies,
} from "../../companies/services/companyService";

import {
  useCompanyStore,
} from "../../companies/store/companyStore";

import {
  getSessionContext,
} from "../services/sessionContextService";

import {
  useBranchStore,
} from "../../branches/store/branchStore";

type AuthInitializerProps = {
  children: ReactNode;
};

export function AuthInitializer({
  children,
}: AuthInitializerProps) {
  const setUser = useAuthStore(
    (state) => state.setUser,
  );

  const logout = useAuthStore(
    (state) => state.logout,
  );

  const setSelectedCompany = useCompanyStore(
    (state) => state.setSelectedCompany,
  );

  const clearSelectedCompany = useCompanyStore(
    (state) => state.clearSelectedCompany,
  );

  const setBranchContext = useBranchStore(
    (state) => state.setBranchContext,
  );

  const clearBranchContext = useBranchStore(
    (state) => state.clearBranchContext,
  );

  /*
   * Guardamos únicamente el estado de autenticación que
   * existía cuando la aplicación arrancó.
   *
   * Cuando LoginPage llame setTokens(), este valor no
   * cambiará y AuthInitializer no volverá a ejecutarse.
   */
  const shouldRestoreSession = useRef(
    useAuthStore.getState().isAuthenticated,
  );

  const [isInitializing, setIsInitializing] =
    useState(shouldRestoreSession.current);

  useEffect(() => {
    let isMounted = true;

    const initializeSession = async () => {
      /*
       * La aplicación arrancó sin una sesión guardada.
       * LoginPage se encargará completamente del inicio.
       */
      if (!shouldRestoreSession.current) {
        if (isMounted) {
          setIsInitializing(false);
        }

        return;
      }

      try {
        const currentUser = await getCurrentUser();

        const currentCompany =
          useCompanyStore.getState().selectedCompany;

        const currentBranch =
          useBranchStore.getState().selectedBranch;

        /*
         * Si la empresa y la sucursal ya están guardadas,
         * no necesitamos consultarlas otra vez.
         */
        if (!currentCompany || !currentBranch) {
          const companies = await getCompanies();

          if (companies.length === 1) {
            const company = companies[0];

            const context = await getSessionContext(
              company.id,
            );

            if (!isMounted) {
              return;
            }

            setSelectedCompany(company);

            setBranchContext(
              context.branches,
              context.default_branch,
              context.membership.role,
            );
          } else {
            /*
             * Con varias empresas dejamos el contexto vacío
             * para que el usuario vaya a /companies.
             */
            clearSelectedCompany();
            clearBranchContext();
          }
        }

        if (!isMounted) {
          return;
        }

        /*
         * El usuario se guarda al final, cuando el contexto
         * inicial ya está preparado.
         */
        setUser(currentUser);
      } catch {
        if (!isMounted) {
          return;
        }

        logout();
        clearSelectedCompany();
        clearBranchContext();
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    void initializeSession();

    return () => {
      isMounted = false;
    };
  }, [
    clearBranchContext,
    clearSelectedCompany,
    logout,
    setBranchContext,
    setSelectedCompany,
    setUser,
  ]);

  if (isInitializing) {
    return (
      <Box
        sx={{
          width: "100%",
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return children;
}