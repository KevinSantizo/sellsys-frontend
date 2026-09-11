import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { 
  AttachMoney,
  CategoryRounded,
  Inventory2Rounded,
  ShoppingBagRounded, 

} from "@mui/icons-material";

import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";

import { useCompanyStore } from "../../companies/store/companyStore";
import { useQuery } from "@tanstack/react-query";

import {
  getProducts,
} from "../../catalog/products/services/productService";

import {
  getBrandOptions,
  getCategoryOptions,
} from "../../catalog/products/services/catalogReferenceService";
 
import { useBranchStore } from "../../branches/store/branchStore";

import { getWeeklySales, getYearlySales  } from "../services/dashboardService";


type WeeklySalesTooltipProps = {
  active?: boolean;
  payload?: Array<{
    payload: {
      day: string;
      date: string;
      salesCount: number;
      total: number;
    };
  }>;
};

type YearlySalesTooltipProps = {
  active?: boolean;
  payload?: Array<{
    payload: {
      month: string;
      monthNumber: number;
      year: number;
      salesCount: number;
      total: number;
      currency: string;
    };
  }>;
};

function WeeklySalesTooltip({
  active,
  payload,
}: WeeklySalesTooltipProps) {
  if (
    !active ||
    !payload ||
    payload.length === 0
  ) {
    return null;
  }

  const data = payload[0].payload;

  const [year, month, day] =
    data.date.split("-");

  const formattedDate =
    `${day}/${month}/${year}`;

  const formattedTotal =
    new Intl.NumberFormat("es-GT", {
      style: "currency",
      currency: "GTQ",
      minimumFractionDigits: 2,
    }).format(data.total);

  return (
    <Box
      sx={{
        bgcolor: "#FFFFFF",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "5px",
        p: 1.5,
        boxShadow:
          "0 4px 14px rgba(0,0,0,0.08)",
      }}
    >
      <Typography
        sx={{
          fontSize: "0.8rem",
          fontWeight: 700,
        }}
      >
        {data.day} · {formattedDate}
      </Typography>

      <Typography
        sx={{
          mt: 0.5,
          fontSize: "0.8rem",
        }}
      >
        Ventas: {data.salesCount}
      </Typography>

      <Typography
        sx={{
          fontSize: "0.8rem",
          color: "text.secondary",
        }}
      >
        Total: {formattedTotal}
      </Typography>
    </Box>
  );
}

function YearlySalesTooltip({
  active,
  payload,
}: YearlySalesTooltipProps) {
  if (
    !active ||
    !payload ||
    payload.length === 0
  ) {
    return null;
  }

  const data = payload[0].payload;

  const formattedTotal =
    new Intl.NumberFormat("es-GT", {
      style: "currency",
      currency: data.currency,
      minimumFractionDigits: 2,
    }).format(data.total);

  return (
    <Box
      sx={{
        bgcolor: "#FFFFFF",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "5px",
        p: 1.5,
        boxShadow:
          "0 4px 14px rgba(0,0,0,0.08)",
      }}
    >
      <Typography
        sx={{
          fontSize: "0.8rem",
          fontWeight: 700,
        }}
      >
        {data.month} {data.year}
      </Typography>

      <Typography
        sx={{
          mt: 0.5,
          fontSize: "0.8rem",
        }}
      >
        Ventas: {data.salesCount}
      </Typography>

      <Typography
        sx={{
          fontSize: "0.8rem",
          color: "text.secondary",
        }}
      >
        Total: {formattedTotal}
      </Typography>
    </Box>
  );
}


export function DashboardPage() {
  const selectedCompany = useCompanyStore(
    (state) => state.selectedCompany,
  );

  const selectedBranch = useBranchStore(
    (state) => state.selectedBranch,
  );

  const weeklySalesQuery = useQuery({
    queryKey: [
      "dashboard-weekly-sales",
      selectedCompany?.id,
      selectedBranch?.id,
    ],

    queryFn: () => {
      if (
        !selectedCompany ||
        !selectedBranch
      ) {
        throw new Error(
          "Empresa o sucursal no seleccionada.",
        );
      }

      return getWeeklySales({
        companyId: selectedCompany.id,
        branchId: selectedBranch.id,
      });
    },

    enabled:
      Boolean(selectedCompany?.id) &&
      Boolean(selectedBranch?.id),
  });

  const weeklySales = weeklySalesQuery.data;

  const yearlySalesQuery = useQuery({
    queryKey: [
      "dashboard-yearly-sales",
      selectedCompany?.id,
      selectedBranch?.id,
    ],

    queryFn: () => {
      if (
        !selectedCompany ||
        !selectedBranch
      ) {
        throw new Error(
          "Empresa o sucursal no seleccionada.",
        );
      }

      return getYearlySales({
        companyId: selectedCompany.id,
        branchId: selectedBranch.id,
      });
    },

    enabled:
      Boolean(selectedCompany?.id) &&
      Boolean(selectedBranch?.id),
  });

  const yearlySales = yearlySalesQuery.data;


  const weeklySalesChartData =
  weeklySales?.days.map((item) => ({
    day: item.day,
    date: item.date,
    salesCount: item.sales_count,
    total: Number(item.total),
  })) ?? [];

  const yearlySalesChartData =
  yearlySales?.months.map((item) => ({
    month: item.month,
    monthNumber: item.month_number,
    year: yearlySales.year,
    salesCount: item.sales_count,
    total: Number(item.total),
    currency:
      selectedCompany?.currency ?? "GTQ",
  })) ?? [];


  const productsQuery = useQuery({
    queryKey: [
      "dashboard-products-count",
      selectedCompany?.id,
    ],

    queryFn: () => {
      if (!selectedCompany) {
        throw new Error(
          "No existe una empresa seleccionada.",
        );
      }

      return getProducts({
        companyId: selectedCompany.id,
        page: 1,
        pageSize: 1,
      });
    },

    enabled: Boolean(selectedCompany?.id),
  });

  const brandsQuery = useQuery({
    queryKey: [
      "dashboard-brands-count",
      selectedCompany?.id,
    ],

    queryFn: () => {
      if (!selectedCompany) {
        throw new Error(
          "No existe una empresa seleccionada.",
        );
      }

      return getBrandOptions(
        selectedCompany.id,
      );
    },

    enabled: Boolean(selectedCompany?.id),
  });

  const categoriesQuery = useQuery({
    queryKey: [
      "dashboard-categories-count",
      selectedCompany?.id,
    ],

    queryFn: () => {
      if (!selectedCompany) {
        throw new Error(
          "No existe una empresa seleccionada.",
        );
      }

      return getCategoryOptions(
        selectedCompany.id,
      );
    },

    enabled: Boolean(selectedCompany?.id),
  });

  const totalProducts = productsQuery.data?.count ?? 0;

  const totalBrands = brandsQuery.data?.length ?? 0;

  const totalCategories = categoriesQuery.data?.length ?? 0;

  const statistics = [
    {
      label: "Productos",
      value: totalProducts.toString(),
      icon: <Inventory2Rounded />,
      highlighted: false,
    },
 
 
    
    {
      label: "Total ventas",
      value: totalCategories.toString(),
      icon: <AttachMoney />,
      highlighted: false,
    },
    {
      label: "Gastos",
      value: totalBrands.toString(),
      icon: <AttachMoney />,
      highlighted: false,
    },
  ];

  const formatDate = (date: string) => {
  const [year, month, day] = date.split("-");

  return `${day}/${month}/${year}`;
};



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
          Resumen general.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(5, minmax(0, 1fr))",
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

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, minmax(0, 1fr))",
          },
          gap: 1.5,
          alignItems: "stretch",
        }}
      >
        <Card
          variant="outlined"
          sx={{
            borderRadius: "5px",
            borderColor: "#E2E7E5",
            bgcolor: "#FFFFFF",
          }}
        >
          <CardContent
            sx={{
              p: 2,
              "&:last-child": {
                pb: 2,
              },
            }}
          >
            <Stack spacing={2}>
              <Box>
                <Typography
                  sx={{
                    fontSize: "1rem",
                    fontWeight: 600,
                  }}
                >
                  Ventas de la semana ({weeklySales?.sales_count ?? 0}) Q{weeklySales?.total}
                </Typography>

                <Typography
                  sx={{
                    mt: 0.3,
                    color: "text.secondary",
                    fontSize: "0.8rem",
                  }}
                >
                  {weeklySales
                    ? `${formatDate(
                        weeklySales.week_start,
                      )} - ${formatDate(
                        weeklySales.week_end,
                      )}`
                    : "Cargando semana..."}
                </Typography>
              </Box>

              <Box
                sx={{
                  width: "100%",
                  height: 200,
                }}
              >
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={weeklySalesChartData}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                    />

                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />

                    <Tooltip
                      content={
                        <WeeklySalesTooltip />
                      }
                    />

                    <Bar
                      dataKey="salesCount"
                      fill="#064A57"
                      radius={[5, 5, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Stack>
          </CardContent>
        </Card>
        <Card
          variant="outlined"
          sx={{
            borderRadius: "5px",
            borderColor: "#E2E7E5",
            bgcolor: "#FFFFFF",
          }}
        >
          <CardContent
            sx={{
              p: 2,
              "&:last-child": {
                pb: 2,
              },
            }}
          >
            <Stack spacing={2}>
              <Box>
                <Typography
                  sx={{
                    fontSize: "1rem",
                    fontWeight: 800,
                  }}
                >
                  Ventas del año (
                  {yearlySales?.sales_count ?? 0}) Q{yearlySales?.total}
                </Typography>

                <Typography
                  sx={{
                    mt: 0.3,
                    color: "text.secondary",
                    fontSize: "0.8rem",
                  }}
                >
                  {yearlySales
                    ? yearlySales.year
                    : "Cargando año..."}
                </Typography>
              </Box>

              <Box
                sx={{
                  width: "100%",
                  height: 200,
                }}
              >
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={yearlySalesChartData}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                    />

                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />

                    <Tooltip
                      content={
                        <YearlySalesTooltip />
                      }
                    />

                    <Bar
                      dataKey="salesCount"
                      fill="#064A57"
                      radius={[5, 5, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>
     
    </Stack>
  );
}