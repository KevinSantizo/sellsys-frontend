import {
  BusinessRounded,
  CategoryRounded,
  ChevronLeftRounded,
  DashboardRounded,
  Inventory2Rounded,
  LogoutRounded,
  MenuRounded,
  ScaleRounded,
  ShoppingBagRounded,
  StoreRounded,
  SwapHorizRounded,
} from "@mui/icons-material";

import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  Stack,
  Typography,
} from "@mui/material";

import { useState, type ReactNode } from "react";

import {
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuthStore } from "../modules/auth/store/authStore";
import { useCompanyStore } from "../modules/companies/store/companyStore";

const SIDEBAR_WIDTH = 280;

type NavigationItem = {
  label: string;
  path: string;
  icon: ReactNode;
};

const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <DashboardRounded />,
  },
  {
    label: "Productos",
    path: "/catalog/products",
    icon: <Inventory2Rounded />,
  },
  {
    label: "Categorías",
    path: "/catalog/categories",
    icon: <CategoryRounded />,
  },
  {
    label: "Marcas",
    path: "/catalog/brands",
    icon: <ShoppingBagRounded />,
  },
  {
    label: "Unidades de medida",
    path: "/catalog/units",
    icon: <ScaleRounded />,
  },
  {
    label: "Sucursales",
    path: "/branches",
    icon: <StoreRounded />,
  },
];

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);

  const user = useAuthStore(
    (state) => state.user,
  );

  const logout = useAuthStore(
    (state) => state.logout,
  );

  const selectedCompany = useCompanyStore(
    (state) => state.selectedCompany,
  );

  const clearSelectedCompany = useCompanyStore(
    (state) => state.clearSelectedCompany,
  );

  if (!selectedCompany) {
    return (
      <Navigate
        to="/companies"
        replace
      />
    );
  }

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleChangeCompany = () => {
    clearSelectedCompany();

    navigate("/companies", {
      replace: true,
    });
  };

  const handleLogout = () => {
    logout();
    clearSelectedCompany();

    navigate("/login", {
      replace: true,
    });
  };

  const drawerContent = (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
        bgcolor: "#F5F6F3",
        borderRadius: "15px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          flexShrink: 0,
          px: 2.25,
          py: 1.75,
        }}
      >
        <Stack
          direction="row"
          spacing={1.25}
          sx={{
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              flexShrink: 0,
              borderRadius: "15px",
              bgcolor: "primary.light",
              color: "primary.main",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Inventory2Rounded />
          </Box>

          <Typography
            variant="h6"
            sx={{
              flex: 1,
              fontWeight: 800,
            }}
          >
            SellSys
          </Typography>

          <IconButton
            type="button"
            onClick={() => {
              setMobileOpen(false);
            }}
            sx={{
              display: {
                xs: "inline-flex",
                md: "none",
              },
            }}
          >
            <ChevronLeftRounded />
          </IconButton>
        </Stack>
      </Box>

      {/* Empresa */}
      <Box
        sx={{
          flexShrink: 0,
          px: 2.25,
          pt: 1,
          pb: 2,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
          }}
        >
          Empresa activa
        </Typography>

        <Stack
          direction="row"
          spacing={1.25}
          sx={{
            alignItems: "center",
            mt: 1.25,
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              flexShrink: 0,
              borderRadius: "15px",
              bgcolor: "primary.light",
              color: "primary.main",
              display: "grid",
              placeItems: "center",
            }}
          >
            <BusinessRounded fontSize="small" />
          </Box>

          <Box
            sx={{
              minWidth: 0,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.92rem",
                fontWeight: 700,
                lineHeight: 1.2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {selectedCompany.name}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontSize: "0.8rem",
                lineHeight: 1.3,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {selectedCompany.business_type_display}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Divider />

      {/* Menú */}
      <Box
        sx={{
          flexShrink: 0,
          px: 2.25,
          pt: 1.75,
          pb: 0.5,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
          }}
        >
          Menú
        </Typography>
      </Box>

      <List
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          px: 1.5,
          py: 0.5,
        }}
      >
        {navigationItems.map((item) => {
          const isSelected =
            location.pathname === item.path;

          return (
            <ListItemButton
              key={item.path}
              selected={isSelected}
              onClick={() => {
                handleNavigate(item.path);
              }}
              sx={{
                minHeight: 42,
                mb: 0.35,
                px: 1.25,
                borderRadius: "15px",
                color: isSelected
                  ? "primary.main"
                  : "text.secondary",

                "& .MuiListItemIcon-root": {
                  minWidth: 38,
                  color: "inherit",
                },

                "& .MuiSvgIcon-root": {
                  fontSize: 21,
                },

                "&.Mui-selected": {
                  bgcolor: "primary.light",
                  color: "primary.main",
                },

                "&.Mui-selected:hover": {
                  bgcolor: "primary.light",
                },

                "&:hover": {
                  bgcolor: "#EAEDE9",
                  color: "text.primary",
                },
              }}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>

              <Typography
                sx={{
                  fontSize: "0.9rem",
                  fontWeight: isSelected ? 700 : 500,
                }}
              >
                {item.label}
              </Typography>
            </ListItemButton>
          );
        })}
      </List>

      {/* Acciones inferiores */}
      <Box
        sx={{
          flexShrink: 0,
        }}
      >
        <Divider />

        <Stack
          spacing={0.25}
          sx={{
            p: 1.5,
          }}
        >
          <Button
            type="button"
            variant="text"
            fullWidth
            startIcon={<SwapHorizRounded />}
            onClick={handleChangeCompany}
            sx={{
              minHeight: 40,
              borderRadius: "15px",
              justifyContent: "flex-start",
              color: "text.secondary",
              fontSize: "0.86rem",

              "&:hover": {
                bgcolor: "#EAEDE9",
                color: "text.primary",
              },
            }}
          >
            Cambiar empresa
          </Button>

          <Button
            type="button"
            variant="text"
            fullWidth
            startIcon={<LogoutRounded />}
            onClick={handleLogout}
            sx={{
              minHeight: 40,
              borderRadius: "15px",
              justifyContent: "flex-start",
              color: "text.secondary",
              fontSize: "0.86rem",

              "&:hover": {
                bgcolor: "#EAEDE9",
                color: "text.primary",
              },
            }}
          >
            Cerrar sesión
          </Button>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100dvh",
        bgcolor: "#FFFFFF",
        display: "flex",
      }}
    >
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{
          width: {
            md: SIDEBAR_WIDTH,
          },
          flexShrink: {
            md: 0,
          },
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => {
            setMobileOpen(false);
          }}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: {
              xs: "block",
              md: "none",
            },

            "& .MuiDrawer-paper": {
              width: SIDEBAR_WIDTH,
              height: "100dvh",
              p: "12px",
              border: 0,
              bgcolor: "#FFFFFF",
              boxSizing: "border-box",
              overflow: "hidden",
            },
          }}
        >
          {drawerContent}
        </Drawer>

        <Drawer
          variant="permanent"
          open
          sx={{
            display: {
              xs: "none",
              md: "block",
            },

            "& .MuiDrawer-paper": {
              width: SIDEBAR_WIDTH,
              height: "100dvh",
              p: "12px",
              border: 0,
              bgcolor: "#FFFFFF",
              boxSizing: "border-box",
              overflow: "hidden",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Área derecha */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          height: "100dvh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          p: {
            xs: "12px",
            md: "12px 12px 12px 0",
          },
          bgcolor: "#FFFFFF",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            minHeight: 72,
            flexShrink: 0,
            px: 2.5,
            py: 1.5,
            borderRadius: "15px",
            bgcolor: "#F5F6F3",
            display: "flex",
            alignItems: "center",
          }}
        >
          <IconButton
            type="button"
            onClick={() => {
              setMobileOpen(true);
            }}
            sx={{
              display: {
                xs: "inline-flex",
                md: "none",
              },
              mr: 1.5,
            }}
          >
            <MenuRounded />
          </IconButton>

          <Box
            sx={{
              minWidth: 0,
              flex: 1,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontSize: "0.82rem",
              }}
            >
              {selectedCompany.name}
            </Typography>

            <Typography
              sx={{
                fontSize: "0.95rem",
                fontWeight: 700,
              }}
            >
              Hola, {user?.first_name || user?.email}
            </Typography>
          </Box>
        </Box>

        {/* Contenido */}
        <Box
          component="main"
          sx={{
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            overflowY: "auto",
            bgcolor: "#F5F6F3",
            borderRadius: "15px",
            p: {
              xs: 2,
              sm: 2.5,
              lg: 3,
            },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}