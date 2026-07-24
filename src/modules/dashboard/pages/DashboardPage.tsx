import {
  BusinessRounded,
  Inventory2Rounded,
  StoreRounded,
} from "@mui/icons-material";

import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";

import { useCompanyStore } from "../../companies/store/companyStore";

export function DashboardPage() {
  const selectedCompany = useCompanyStore(
    (state) => state.selectedCompany,
  );

  const statistics = [
    {
      label: "Productos",
      value: "1",
      icon: <Inventory2Rounded />,
      highlighted: true,
    },
    {
      label: "Sucursales",
      value: "1",
      icon: <StoreRounded />,
      highlighted: false,
    },
    {
      label: "Empresa",
      value: selectedCompany?.name ?? "-",
      icon: <BusinessRounded />,
      highlighted: false,
    },
  ];

  return (
    <Stack spacing={2.25}>
      <Box>
        <Typography
          variant="h4"
          sx={{
            fontSize: {
              xs: "1.65rem",
              sm: "1.85rem",
            },
            fontWeight: 800,
            mb: 0.4,
          }}
        >
          Dashboard
        </Typography>

        <Typography
          sx={{
            color: "text.secondary",
            fontSize: "0.9rem",
          }}
        >
          Resumen general de la empresa seleccionada.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(3, minmax(0, 1fr))",
          },
          gap: 1.5,
        }}
      >
        {statistics.map((statistic) => (
          <Card
            key={statistic.label}
            variant="outlined"
            sx={{
              height: 118,
              borderRadius: "15px",
              borderColor: statistic.highlighted
                ? "primary.main"
                : "#E2E7E5",
              bgcolor: statistic.highlighted
                ? "primary.main"
                : "#FFFFFF",
              color: statistic.highlighted
                ? "primary.contrastText"
                : "text.primary",
            }}
          >
            <CardContent
              sx={{
                height: "100%",
                p: 2,

                "&:last-child": {
                  pb: 2,
                },
              }}
            >
              <Stack
                sx={{
                  height: "100%",
                  justifyContent: "space-between",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: statistic.highlighted
                        ? "rgba(255,255,255,0.92)"
                        : "text.primary",
                    }}
                  >
                    {statistic.label}
                  </Typography>

                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      flexShrink: 0,
                      borderRadius: "15px",
                      display: "grid",
                      placeItems: "center",
                      bgcolor: statistic.highlighted
                        ? "rgba(255,255,255,0.16)"
                        : "primary.light",
                      color: statistic.highlighted
                        ? "common.white"
                        : "primary.main",

                      "& svg": {
                        fontSize: 18,
                      },
                    }}
                  >
                    {statistic.icon}
                  </Box>
                </Stack>

                <Box>
                  <Typography
                    sx={{
                      maxWidth: "100%",
                      fontSize:
                        statistic.label === "Empresa"
                          ? "1rem"
                          : "1.75rem",
                      lineHeight: 1.1,
                      fontWeight: 800,
                      color: statistic.highlighted
                        ? "common.white"
                        : "text.primary",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {statistic.value}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.4,
                      fontSize: "0.75rem",
                      color: statistic.highlighted
                        ? "rgba(255,255,255,0.7)"
                        : "text.secondary",
                    }}
                  >
                    Información general
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Stack>
  );
}