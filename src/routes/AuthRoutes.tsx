import {
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  useAuthStore,
} from "../modules/auth/store/authStore";

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
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated,
  );

  if (isAuthenticated) {
    return (
      <Navigate
        to="/companies"
        replace
      />
    );
  }

  return <Outlet />;
}