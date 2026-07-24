import {
  ArrowForwardRounded,
  BusinessRounded,
  LogoutRounded,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuthStore,
} from "../../auth/store/authStore";

import {
  getCompanies,
} from "../services/companyService";

import {
  useCompanyStore,
} from "../store/companyStore";

import type {
  Company,
} from "../types/company";

export function CompanySelectionPage() {
  const navigate = useNavigate();

  const user = useAuthStore(
    (state) => state.user,
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

  const {
    data: companies = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["companies"],
    queryFn: getCompanies,
  });

  const handleSelectCompany = (
    company: Company,
  ) => {
    setSelectedCompany(company);

    navigate(
      "/dashboard",
      {
        replace: true,
      },
    );
  };

  const handleLogout = () => {
    logout();
    clearSelectedCompany();

    navigate(
      "/login",
      {
        replace: true,
      },
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100dvh",
        bgcolor: "background.default",
        py: {
          xs: 4,
          md: 8,
        },
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={5}>
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={2}
            sx={{
              alignItems: {
                xs: "flex-start",
                sm: "center",
              },
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  mb: 1,
                }}
              >
                Selecciona una empresa
              </Typography>

              <Typography
                sx={{
                  color: "text.secondary",
                }}
              >
                Bienvenido,{" "}
                {user?.first_name || user?.email}.
                Selecciona la empresa con la que
                trabajarás.
              </Typography>
            </Box>

            <Button
              variant="outlined"
              startIcon={<LogoutRounded />}
              onClick={handleLogout}
            >
              Cerrar sesión
            </Button>
          </Stack>

          {isLoading && (
            <Box
              sx={{
                py: 8,
                display: "grid",
                placeItems: "center",
              }}
            >
              <CircularProgress />
            </Box>
          )}

          {isError && (
            <Alert severity="error">
              No fue posible cargar las empresas.
            </Alert>
          )}

          {!isLoading &&
            !isError &&
            companies.length === 0 && (
              <Alert severity="warning">
                No tienes empresas asignadas.
              </Alert>
            )}

          {!isLoading &&
            !isError &&
            companies.length > 0 && (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                    lg: "repeat(3, minmax(0, 1fr))",
                  },
                  gap: 3,
                }}
              >
                {companies.map((company) => (
                  <Card
                    key={company.id}
                    variant="outlined"
                    sx={{
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <CardActionArea
                      onClick={() => {
                        handleSelectCompany(
                          company,
                        );
                      }}
                      sx={{
                        minHeight: 210,
                        p: 3,
                      }}
                    >
                      <Stack
                        spacing={3}
                        sx={{
                          height: "100%",
                        }}
                      >
                        <Box
                          sx={{
                            width: 52,
                            height: 52,
                            borderRadius: 2,
                            display: "grid",
                            placeItems: "center",
                            bgcolor: "primary.main",
                            color:
                              "primary.contrastText",
                          }}
                        >
                          <BusinessRounded />
                        </Box>

                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 800,
                              mb: 0.75,
                            }}
                          >
                            {company.name}
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{
                              color:
                                "text.secondary",
                            }}
                          >
                            {
                              company.business_type_display
                            }
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{
                              color:
                                "text.secondary",
                            }}
                          >
                            Moneda: {company.currency}
                          </Typography>
                        </Box>

                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{
                            alignItems: "center",
                            color: "primary.main",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                            }}
                          >
                            Ingresar
                          </Typography>

                          <ArrowForwardRounded
                            fontSize="small"
                          />
                        </Stack>
                      </Stack>
                    </CardActionArea>
                  </Card>
                ))}
              </Box>
            )}
        </Stack>
      </Container>
    </Box>
  );
}