import {
  ArrowForwardRounded,
  Inventory2Rounded,
  VisibilityOffRounded,
  VisibilityRounded,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import axios from "axios";
import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getCurrentUser,
  login,
} from "../services/authService";

import { useAuthStore } from "../store/authStore";

import { getCompanies } from "../../companies/services/companyService";
import { useCompanyStore } from "../../companies/store/companyStore";

import { getSessionContext } from "../services/sessionContextService";
import { useBranchStore } from "../../branches/store/branchStore";


export function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(
    null,
  );

  const setTokens = useAuthStore(
    (state) => state.setTokens,
  );

  const setUser = useAuthStore(
    (state) => state.setUser,
  );

  const logout = useAuthStore(
    (state) => state.logout,
  );

  const clearSelectedCompany = useCompanyStore(
    (state) => state.clearSelectedCompany,
  );

  const clearBranchContext = useBranchStore(
    (state) => state.clearBranchContext,
  );


  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setLoginError(null);
    setIsSubmitting(true);

    try {
      const tokens = await login({
        email: email.trim(),
        password,
      });

      setTokens(
        tokens.access,
        tokens.refresh,
        rememberMe,
      );

      const currentUser = await getCurrentUser();
      const companies = await getCompanies();

      /*
      * El usuario no tiene ninguna empresa asignada.
      */
      if (companies.length === 0) {
        logout();
        clearSelectedCompany();
        clearBranchContext();

        setLoginError(
          "Tu usuario no tiene ninguna empresa activa asignada.",
        );

        return;
      }

      /*
      * Si solamente tiene una empresa, resolvemos primero
      * toda la información de empresa y sucursal.
      */
      if (companies.length === 1) {
        const company = companies[0];

        const context = await getSessionContext(
          company.id,
        );

        setSelectedCompany(company);

        setBranchContext(
          context.branches,
          context.default_branch,
          context.membership.role,
        );

        /*
        * Marcamos al usuario como autenticado hasta que
        * empresa y sucursal ya estén listas.
        */
        setUser(currentUser);

        navigate("/dashboard", {
          replace: true,
        });

        return;
      }

      /*
      * Si tiene varias empresas, limpiamos cualquier
      * selección anterior y mostramos la selección.
      */
      clearSelectedCompany();
      clearBranchContext();

      setUser(currentUser);

      navigate("/companies", {
        replace: true,
      });
    } catch (error: unknown) {
      logout();
      clearSelectedCompany();
      clearBranchContext();

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setLoginError(
            "El correo electrónico o la contraseña son incorrectos.",
          );
        } else if (!error.response) {
          setLoginError(
            "No fue posible conectarse con el servidor. Verifica que Django esté funcionando.",
          );
        } else if (error.response?.status === 400) {
          setLoginError(
            "No fue posible determinar la empresa o sucursal asignada.",
          );
        } else {
          setLoginError(
            "No fue posible iniciar sesión. Inténtalo nuevamente.",
          );
        }
      } else {
        setLoginError(
          "Ocurrió un error inesperado.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const setSelectedCompany = useCompanyStore(
    (state) => state.setSelectedCompany,
  );

  const setBranchContext = useBranchStore(
    (state) => state.setBranchContext,
  );


  return (
    <Box
      sx={{
        width: "100%",
        height: "100dvh",
        bgcolor: "background.paper",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr",
          },
          overflow: "hidden",
        }}
      >
        {/* Panel izquierdo */}
        <Box
          sx={{
            width: "100%",
            height: "100%",
            minHeight: 0,
            bgcolor: "background.paper",
            display: "flex",
            flexDirection: "column",
            overflowY: {
              xs: "auto",
              md: "hidden",
            },
            px: {
              xs: 3,
              sm: 6,
              md: 6,
              lg: 9,
              xl: 12,
            },
            py: {
              xs: 3,
              sm: 4,
              md: 4,
            },
          }}
        >
          {/* Logo */}
          <Stack
            direction="row"
            spacing={1.25}
            sx={{
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Inventory2Rounded />
            </Box>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.5px",
              }}
            >
              SellSys
            </Typography>
          </Stack>

          {/* Formulario */}
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              py: {
                xs: 5,
                sm: 4,
                md: 2,
              },
            }}
          >
            <Box
              component="form"
              onSubmit={handleSubmit}
              noValidate
              sx={{
                width: "100%",
                maxWidth: 500,
              }}
            >
              <Stack spacing={3}>
                <Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontSize: {
                        xs: "2rem",
                        sm: "2.35rem",
                      },
                      fontWeight: 800,
                      letterSpacing: "-1px",
                      lineHeight: 1.15,
                      mb: 1.25,
                    }}
                  >
                    ¡Bienvenido de nuevo!
                  </Typography>

                  <Typography
                    sx={{
                      color: "text.secondary",
                      fontSize: {
                        xs: "0.95rem",
                        sm: "1rem",
                      },
                    }}
                  >
                    Ingresa tus credenciales para acceder a
                    SellSys.
                  </Typography>
                </Box>

                {loginError && (
                  <Alert
                    severity="error"
                    onClose={() => {
                      setLoginError(null);
                    }}
                  >
                    {loginError}
                  </Alert>
                )}

                <Stack spacing={2.25}>
                  <TextField
                    label="Correo electrónico"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                    }}
                    placeholder="correo@empresa.com"
                    autoComplete="email"
                    autoFocus
                    required
                    fullWidth
                    size="medium"
                    disabled={isSubmitting}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        minHeight: 58,
                        borderRadius: 2,
                      },

                      "& .MuiOutlinedInput-input": {
                        px: 2,
                        py: 1.75,
                        fontSize: "1rem",
                      },
                    }}
                  />

                  <TextField
                    label="Contraseña"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                    }}
                    placeholder="Ingresa tu contraseña"
                    autoComplete="current-password"
                    required
                    fullWidth
                    size="medium"
                    disabled={isSubmitting}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        minHeight: 58,
                        borderRadius: 2,
                      },

                      "& .MuiOutlinedInput-input": {
                        px: 2,
                        py: 1.75,
                        fontSize: "1rem",
                      },
                    }}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              type="button"
                              edge="end"
                              disabled={isSubmitting}
                              aria-label={
                                showPassword
                                  ? "Ocultar contraseña"
                                  : "Mostrar contraseña"
                              }
                              aria-pressed={
                                showPassword
                              }
                              onMouseDown={(event) => {
                                event.preventDefault();
                              }}
                              onClick={() => {
                                setShowPassword(
                                  (current) => !current,
                                );
                              }}
                            >
                              {showPassword ? (
                                <VisibilityOffRounded />
                              ) : (
                                <VisibilityRounded />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Stack>

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        sx={{
                            color: "#064A57",
                            '&.Mui-checked': {
                                color:  "#064A57",
                            },
                        }}
                        size="small"
                        checked={rememberMe}
                        disabled={isSubmitting}
                        onChange={(event) => {
                          setRememberMe(
                            event.target.checked,
                          );
                        }}
                      />
                    }
                    label={
                      <Typography
                        variant="body2"
                        sx={{
                          whiteSpace: "nowrap",
                        }}
                      >
                        Recordarme
                      </Typography>
                    }
                    sx={{
                      m: 0,
                    }}
                  />

                </Stack>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={
                    isSubmitting ||
                    !email.trim() ||
                    !password
                  }
                  endIcon={
                    isSubmitting
                      ? undefined
                      : <ArrowForwardRounded />
                  }
                 sx={{
                        minHeight: 54,
                        borderRadius: 2,
                        fontSize: "1rem",
                        fontWeight: 700,
                        backgroundColor: "#064A57"
                    }}
                >
                  {isSubmitting ? (
                    <CircularProgress
                      size={24}
                      color="inherit"
                    />
                  ) : (
                    "Iniciar sesión"
                  )}
                </Button>

                <Divider>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      px: 1,
                    }}
                  >
                    SellSys
                  </Typography>
                </Divider>

                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{
                    alignItems: "center",
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                    }}
                  >
                    ¿Todavía no tienes una cuenta?
                  </Typography>

                  <Button
                    type="button"
                    variant="text"
                    size="small"
                    disabled={isSubmitting}
                    onClick={() => {
                      console.log(
                        "Registro pendiente.",
                      );
                    }}
                    sx={{
                      minWidth: 0,
                      p: 0,
                      fontSize: "0.875rem",
                      fontWeight: 700,
                      textTransform: "none",
                    }}
                  >
                    Crear cuenta
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Box>

          {/* Footer */}
          <Typography
            variant="caption"
            sx={{
              flexShrink: 0,
              color: "text.secondary",
              textAlign: "center",
            }}
          >
            © {new Date().getFullYear()} SellSys
          </Typography>
        </Box>

        {/* Panel derecho */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "100%",
            minHeight: 0,
            display: {
              xs: "none",
              md: "block",
            },
            overflow: "hidden",
            bgcolor: "#064A57",
            color: "common.white",
            px: {
              md: 6,
              lg: 8,
            },
            py: {
              md: 6,
              lg: 7,
            },

            "&::after": {
              content: '""',
              position: "absolute",
              zIndex: 1,
              left: -120,
              right: -120,
              bottom: -205,
              height: 375,
              bgcolor: "#FFFFFF",
              transform: "rotate(-10deg)",
              transformOrigin: "center",
            },
          }}
        >
          <DecorativeSquares />

          <Box
            sx={{
              position: "relative",
              zIndex: 3,
              maxWidth: 520,
              mt: {
                md: 8,
                lg: 11,
              },
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontSize: {
                  md: "2.3rem",
                  lg: "2.75rem",
                },
                fontWeight: 800,
                letterSpacing: "-1px",
                lineHeight: 1.15,
                mb: 2,
              }}
            >
              Administra tu negocio
            </Typography>

            <Typography
              sx={{
                maxWidth: 500,
                color: "rgba(255,255,255,0.78)",
                fontSize: {
                  md: "1rem",
                  lg: "1.05rem",
                },
                lineHeight: 1.75,
              }}
            >
              Controla productos, inventario, sucursales y
              ventas desde una plataforma moderna y
              multiempresa.
            </Typography>
          </Box>

          <DashboardPreview />
        </Box>
      </Box>
    </Box>
  );
}

type DecorativeSquare = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  size: number;
  opacity: number;
};

function DecorativeSquares() {
  const squares: DecorativeSquare[] = [
    {
      top: 28,
      right: 140,
      size: 22,
      opacity: 0.1,
    },
    {
      top: 22,
      right: 42,
      size: 48,
      opacity: 0.14,
    },
    {
      top: 105,
      right: 85,
      size: 22,
      opacity: 0.15,
    },
    {
      top: 160,
      right: 160,
      size: 17,
      opacity: 0.08,
    },
    {
      bottom: 34,
      left: 34,
      size: 30,
      opacity: 0.14,
    },
    {
      bottom: 92,
      left: 100,
      size: 18,
      opacity: 0.08,
    },
  ];

  return (
    <>
      {squares.map((square, index) => (
        <Box
          key={`${square.size}-${index}`}
          sx={{
            position: "absolute",
            zIndex: 2,
            top: square.top,
            right: square.right,
            bottom: square.bottom,
            left: square.left,
            width: square.size,
            height: square.size,
            borderRadius: 1,
            bgcolor: `rgba(255,255,255,${square.opacity})`,
          }}
        />
      ))}
    </>
  );
}

function DashboardPreview() {
  return (
    <Paper
      elevation={14}
      sx={{
        position: "absolute",
        zIndex: 4,
        width: {
          md: 620,
          lg: 700,
          xl: 760,
        },
        height: {
          md: 440,
          lg: 500,
        },
        right: {
          md: -210,
          lg: -160,
          xl: -120,
        },
        bottom: {
          md: -100,
          lg: -110,
        },
        bgcolor: "#F8FAFC",
        borderRadius: 4,
        transform: "rotate(-9deg)",
        transformOrigin: "center",
        p: {
          md: 2.5,
          lg: 3,
        },
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            bgcolor: "#064A57",
            color: "common.white",
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
          }}
        >
          <Inventory2Rounded fontSize="small" />
        </Box>

        <Typography
          sx={{
            color: "text.primary",
            fontWeight: 800,
          }}
        >
          SellSys Dashboard
        </Typography>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns:
            "175px minmax(0, 1fr)",
          gap: 2,
        }}
      >
        <Stack spacing={1.5}>
          <Box
            sx={{
              height: 40,
              bgcolor: "#064A57",
              borderRadius: 2,
            }}
          />

          {[1, 2, 3, 4].map((item) => (
            <Box
              key={item}
              sx={{
                height: 34,
                bgcolor: "#E2E8F0",
                borderRadius: 2,
              }}
            />
          ))}
        </Stack>

        <Stack spacing={2}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",
              gap: 1.5,
            }}
          >
            {[1, 2, 3].map((item) => (
              <Paper
                key={item}
                variant="outlined"
                sx={{
                  height: 88,
                  borderRadius: 2,
                  p: 1.5,
                }}
              >
                <Box
                  sx={{
                    width: "45%",
                    height: 8,
                    bgcolor: "#CBD5E1",
                    borderRadius: 10,
                    mb: 1.5,
                  }}
                />

                <Box
                  sx={{
                    width: "70%",
                    height: 18,
                    bgcolor: "#E2E8F0",
                    borderRadius: 10,
                  }}
                />
              </Paper>
            ))}
          </Box>

          <Paper
            variant="outlined"
            sx={{
              height: 235,
              borderRadius: 2,
              p: 2,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                color: "text.primary",
                fontWeight: 700,
                mb: 1,
              }}
            >
              Resumen de ventas
            </Typography>

            <Box
              component="svg"
              viewBox="0 0 500 170"
              sx={{
                width: "100%",
                height: 170,
              }}
            >
              <polyline
                points="10,145 80,115 150,125 220,65 290,80 360,35 430,55 490,25"
                fill="none"
                stroke="#064A57"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <polyline
                points="10,155 80,135 150,105 220,120 290,70 360,90 430,48 490,60"
                fill="none"
                stroke="#94A3B8"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Box>
          </Paper>
        </Stack>
      </Box>
    </Paper>
  );
}