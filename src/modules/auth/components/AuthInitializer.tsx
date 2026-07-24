import {
  Box,
  CircularProgress,
} from "@mui/material";

import {
  type ReactNode,
  useEffect,
  useState,
} from "react";

import {
  getCurrentUser,
} from "../services/authService";

import {
  useAuthStore,
} from "../store/authStore";

type AuthInitializerProps = {
  children: ReactNode;
};

export function AuthInitializer({
  children,
}: AuthInitializerProps) {
  const accessToken = useAuthStore(
    (state) => state.accessToken,
  );

  const user = useAuthStore(
    (state) => state.user,
  );

  const setUser = useAuthStore(
    (state) => state.setUser,
  );

  const logout = useAuthStore(
    (state) => state.logout,
  );

  const [isInitializing, setIsInitializing] =
    useState(
      Boolean(accessToken && !user),
    );

  useEffect(() => {
    let isMounted = true;

    if (!accessToken || user) {
      setIsInitializing(false);
      return;
    }

    setIsInitializing(true);

    getCurrentUser()
      .then((currentUser) => {
        if (isMounted) {
          setUser(currentUser);
        }
      })
      .catch(() => {
        if (isMounted) {
          logout();
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsInitializing(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [
    accessToken,
    user,
    setUser,
    logout,
  ]);

  if (isInitializing) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "100dvh",
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