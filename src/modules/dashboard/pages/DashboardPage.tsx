import {
  Area,
  AreaChart,
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
  ShoppingBagRounded, 
} from "@mui/icons-material";

import {
  Box,
  Card,
  CardContent,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";

import { useCompanyStore } from "../../companies/store/companyStore";
import { useQuery } from "@tanstack/react-query";

import { useBranchStore } from "../../branches/store/branchStore";

import { getYearlySales  } from "../services/dashboardService";

import {
  getCashReport,
  getInventoryReport,
  getProfitabilityReport,
  getReportDaily,
  getReportSummary,
} from "../../reports/services/reportsService";

/** 
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
*/

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

/** 

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
*/

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

  const formatApiDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const currentDate = new Date();

  const today = formatApiDate(currentDate);

  const monthStart = formatApiDate(
    new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    ),
  );

  const todaySummaryQuery = useQuery({
    queryKey: [
      "dashboard-today-summary",
      selectedCompany?.id,
      selectedBranch?.id,
      today,
    ],

    queryFn: () => {
      if (!selectedCompany || !selectedBranch) {
        throw new Error(
          "Empresa o sucursal no seleccionada.",
        );
      }

      return getReportSummary({
        companyId: selectedCompany.id,
        branchId: selectedBranch.id,
        dateFrom: today,
        dateTo: today,
      });
    },

    enabled:
      Boolean(selectedCompany?.id) &&
      Boolean(selectedBranch?.id),
  });

  const todaySummary = todaySummaryQuery.data;

  const monthSummaryQuery = useQuery({
    queryKey: [
      "dashboard-month-summary",
      selectedCompany?.id,
      selectedBranch?.id,
      monthStart,
      today,
    ],

    queryFn: () => {
      if (!selectedCompany || !selectedBranch) {
        throw new Error(
          "Empresa o sucursal no seleccionada.",
        );
      }

      return getReportSummary({
        companyId: selectedCompany.id,
        branchId: selectedBranch.id,
        dateFrom: monthStart,
        dateTo: today,
      });
    },

    enabled:
      Boolean(selectedCompany?.id) &&
      Boolean(selectedBranch?.id),
  });

  const monthSummary = monthSummaryQuery.data;

  monthSummary?.sales.total
  monthSummary?.sales.count

  monthSummary?.expenses.total
  monthSummary?.expenses.count

  monthSummary?.purchases.total

  monthSummary?.cash.in.total
  monthSummary?.cash.out.total
  monthSummary?.cash.net

  const profitabilityQuery = useQuery({
    queryKey: [
      "dashboard-profitability",
      selectedCompany?.id,
      selectedBranch?.id,
      monthStart,
      today,
    ],

    queryFn: () => {
      if (!selectedCompany || !selectedBranch) {
        throw new Error(
          "Empresa o sucursal no seleccionada.",
        );
      }

      return getProfitabilityReport({
        companyId: selectedCompany.id,
        branchId: selectedBranch.id,
        dateFrom: monthStart,
        dateTo: today,
        page: 1,
        pageSize: 5,
      });
    },

    enabled:
      Boolean(selectedCompany?.id) &&
      Boolean(selectedBranch?.id),
  });

  const profitability = profitabilityQuery.data;

  

  const last30DaysStart = formatApiDate(
    new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() - 29,
    ),
  );

  const dailyReportQuery = useQuery({
    queryKey: [
      "dashboard-daily-report",
      selectedCompany?.id,
      selectedBranch?.id,
      last30DaysStart,
      today,
    ],

    queryFn: () => {
      if (!selectedCompany || !selectedBranch) {
        throw new Error(
          "Empresa o sucursal no seleccionada.",
        );
      }

      return getReportDaily({
        companyId: selectedCompany.id,
        branchId: selectedBranch.id,
        dateFrom: last30DaysStart,
        dateTo: today,
      });
    },

    enabled:
      Boolean(selectedCompany?.id) &&
      Boolean(selectedBranch?.id),
  });

  const dailyReport = dailyReportQuery.data;

  const monthlySalesChartData = dailyReport?.results.map((item) => ({
    date: item.date,
    salesCount: item.sales.count,
    total: Number(item.sales.total),
  })) ?? [];

 

  const last30DaysSalesCount =
    dailyReport?.results.reduce(
      (total, item) => total + item.sales.count,
      0,
    ) ?? 0;

  const last30DaysSalesTotal =
    dailyReport?.results.reduce(
      (total, item) => total + Number(item.sales.total),
      0,
    ) ?? 0;

  /**  
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
 */
  //const weeklySales = weeklySalesQuery.data;

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

/** 
  const weeklySalesChartData =
  weeklySales?.days.map((item) => ({
    day: item.day,
    date: item.date,
    salesCount: item.sales_count,
    total: Number(item.total),
  })) ?? [];
*/
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

  const hasLast30DaysSales = monthlySalesChartData.some(
    (item) => item.total > 0 || item.salesCount > 0,
  );

  const hasYearlySales = yearlySalesChartData.some(
    (item) => item.total > 0 || item.salesCount > 0,
  );

  /**
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
  */

  const inventoryQuery = useQuery({
    queryKey: [
      "dashboard-inventory",
      selectedCompany?.id,
      selectedBranch?.id,
    ],

    queryFn: () => {
      if (!selectedCompany || !selectedBranch) {
        throw new Error(
          "Empresa o sucursal no seleccionada.",
        );
      }

      return getInventoryReport({
        companyId: selectedCompany.id,
        branchId: selectedBranch.id,
        page: 1,
        pageSize: 100,
      });
    },

    enabled:
      Boolean(selectedCompany?.id) &&
      Boolean(selectedBranch?.id),
  });

  const inventory = inventoryQuery.data;

  const lowStockProducts = [
    ...(inventory?.results ?? []),
  ].sort((a, b) => Number(a.quantity) - Number(b.quantity)).slice(0, 5);

    const cashQuery = useQuery({
      queryKey: [
        "dashboard-cash",
        selectedCompany?.id,
        selectedBranch?.id,
        monthStart,
        today,
      ],

      queryFn: () => {
        if (!selectedCompany || !selectedBranch) {
          throw new Error(
            "Empresa o sucursal no seleccionada.",
          );
        }

        return getCashReport({
          companyId: selectedCompany.id,
          branchId: selectedBranch.id,
          dateFrom: monthStart,
          dateTo: today,
          page: 1,
          pageSize: 5,
        });
      },

      enabled:
        Boolean(selectedCompany?.id) &&
        Boolean(selectedBranch?.id),
    });

    const cashReport = cashQuery.data;
 
  const currency = selectedCompany?.currency ?? "GTQ";

  const formatCurrency = (value: string | number | null | undefined) => {
    return new Intl.NumberFormat("es-GT", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(Number(value ?? 0));
  };

  const profitabilityComplete = profitability?.summary.cost_coverage_complete ?? true; 
  const grossMargin = profitability?.summary.gross_margin;

  const statistics = [
    {
      label: "Ventas hoy",
      value: formatCurrency(
        todaySummary?.sales.total,
      ),
      subtitle: `${todaySummary?.sales.count ?? 0} ventas`,
      icon: <ShoppingBagRounded />,
      highlighted: false,
      loading: todaySummaryQuery.isFetching,
    },
    {
      label: "Ventas del mes",
      value: formatCurrency(
        monthSummary?.sales.total,
      ),
      subtitle: `${monthSummary?.sales.count ?? 0} ventas`,
      icon: <AttachMoney />,
      highlighted: true,
      loading: todaySummaryQuery.isFetching,
    },
    {
      label: "Utilidad bruta",
      value: profitabilityComplete
        ? formatCurrency(
            profitability?.summary.gross_profit,
          )
        : "—",
      subtitle: profitabilityComplete
        ? grossMargin
          ? `${Number(grossMargin).toFixed(2)}% de margen`
          : "Sin margen disponible"
        : "Costos incompletos",
      icon: <AttachMoney />,
      highlighted: false,
      loading: todaySummaryQuery.isFetching,
    },
    {
      label: "Gastos del mes",
      value: formatCurrency(
        monthSummary?.expenses.total,
      ),
      subtitle: `${monthSummary?.expenses.count ?? 0} gastos`,
      icon: <AttachMoney />,
      highlighted: false,
      loading: todaySummaryQuery.isFetching,
    },
    {
      label: "Caja neta",
      value: formatCurrency(
        monthSummary?.cash.net,
      ),
      subtitle: `${monthSummary?.cash.in.count ?? 0} entradas · ${monthSummary?.cash.out.count ?? 0} salidas`,
      icon: <AttachMoney />,
      highlighted: false,
      loading: todaySummaryQuery.isFetching,
    },
  ];

  const formatDate = (date: string) => {
    const [year, month, day] = date.split("-");

    return `${day}/${month}/${year}`;
  };

  const formatChartDate = (value: string) => {
    return new Intl.DateTimeFormat("es-GT", {
      day: "2-digit",
      month: "short",
    }).format(new Date(`${value}T00:00:00`));
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
            fontWeight: 700,
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
              minWidth: 0,
              height: "100%",
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
                      overflowWrap: "anywhere",
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
                  { statistic.loading ? (
                    <Skeleton
                      variant="text"
                      width={ 140 }
                      height={ 42 }
                    />
                  ) : (
                    <Typography
                      sx={{
                        maxWidth: "100%",
                        fontSize:
                          statistic.label === "Empresa"
                            ? "1rem"
                            : "1.75rem",
                        lineHeight: 1.1,
                        fontWeight: 700,
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
                  )}
                 
                  { statistic.loading ? (
                    <Skeleton
                      variant="text"
                      width={ 100 }
                      height={ 24 }
                    />
                  ) : (
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
                      {statistic.subtitle}
                    </Typography>
                  ) }
                  
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box
        sx={{
          mt: 3,
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "repeat(2, minmax(0, 1fr))",
          },
          gap: 2,
        }}
      >
        <Card
          variant="outlined"
          sx={{
            minWidth: 0, 
            height: "100%",
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
                { dailyReportQuery.isFetching ? (
                  <>
                    <Skeleton width={ 220 } height={ 28 } />
                    <Skeleton width={ 160 } height={ 22 } />
                  </>
                ) : (
                  <>
                    <Box
                    sx={{ 
                    }}
                    > 
                      <Typography
                        sx={{
                          fontSize: "1rem",
                          fontWeight: 600,
                        }}
                      >
                        Ventas últimos 30 días ({ last30DaysSalesCount }) { formatCurrency(last30DaysSalesTotal) }
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.3,
                          color: "text.secondary",
                          fontSize: "0.8rem",
                        }}
                      >
                        { formatDate(last30DaysStart) } - { formatDate(today) }
                      </Typography>
                    </Box>
                  </>
                ) }
              </Box>

              <Box
                sx={{
                  width: "100%", 
                  height: {
                    xs: 260,
                    sm: 300,
                    lg: 250,
                  },
                }}
              >
                { dailyReportQuery.isFetching ? (
                  <Skeleton
                    variant="rounded"
                    width="100%"
                    height={ 300 }
                    sx={{ borderRadius: "5px" }}
                  />
                ) 
                : dailyReportQuery.isError ? (
                  <Box
                    sx={{
                      width: "100%",
                      height: 300,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Box sx={{ textAlign: "center" }}>
                      <Typography sx={{ fontSize: "0.9rem", fontWeight: 600 }}>
                        No fue posible cargar las ventas
                      </Typography>

                      <Typography
                        color="text.secondary"
                        sx={{ mt: 0.5, fontSize: "0.8rem" }}
                      >
                        Intenta actualizar la información nuevamente.
                      </Typography>
                    </Box>
                  </Box>
                  ) : !hasLast30DaysSales ?  (
                  <Box
                    sx={{
                      minHeight: 320,
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Box
                      sx={{
                        minHeight: 320,
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Box sx={{ textAlign: "center" }}>
                        <Typography
                          sx={{
                            fontSize: "0.9rem", fontWeight: 600
                          }}
                        >
                          No hay ventas en los últimos 30 días
                        </Typography>

                        <Typography
                          sx={{
                            mt: 0.5,
                            color: "text.secondary",
                            fontSize: "0.9rem",
                          }}
                        >
                          Las ventas registradas aparecerán aquí.
                        </Typography>
                      </Box> 
                    </Box>
                  </Box>
                ) :(
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <AreaChart data={ monthlySalesChartData }>
                    <CartesianGrid strokeDasharray="3 3" vertical={ false } />

                    <XAxis
                      dataKey="date"
                      tick={ false }
                      tickLine={ false }
                      axisLine={ false }
                    />

                    <YAxis
                      tickLine={ false }
                      axisLine={ false }
                    />

                    <Tooltip
                      labelFormatter={(label) => formatChartDate(String(label))}
                      formatter={(value) => [
                        formatCurrency(Number(value)),
                        "Ventas",
                      ]}
                      contentStyle={{
                        borderRadius: "5px",
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#064A57"
                      strokeWidth={ 3 }
                      fill="#064A57"
                      fillOpacity={ 0.12 }
                      dot={ true }
                      activeDot={{ r: 5 }}
                    />
                  </AreaChart>
                  {/**  
                  <BarChart data={weeklySalesChartData} >
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
                  */}
                </ResponsiveContainer>
                ) }
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
                    fontWeight: 700,
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
                { yearlySalesQuery.isFetching ? (
                  <Skeleton
                    variant="rounded"
                    width="100%"
                    height={ 300 }
                    sx={{ borderRadius: "5px" }}
                  />
                ) : 
                 yearlySalesQuery.isError ? (
                  <Box
                    sx={{
                      width: "100%",
                      height: 300,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Box sx={{ textAlign: "center" }}>
                      <Typography sx={{ fontSize: "0.9rem", fontWeight: 600 }}>
                        No fue posible cargar las ventas del año
                      </Typography>

                      <Typography
                        color="text.secondary"
                        sx={{ mt: 0.5, fontSize: "0.8rem" }}
                      >
                        Intenta actualizar la información nuevamente.
                      </Typography>
                    </Box>
                  </Box>
                ) : !hasYearlySales ? (
                  <Box
                    sx={{
                      minHeight: 320,
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Box sx={{ textAlign: "center" }}>
                      <Typography sx={{ fontSize: "0.9rem", fontWeight: 600 }}>
                        No hay ventas registradas este año
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.5,
                          color: "text.secondary",
                          fontSize: "0.9rem",
                        }}
                      >
                        El resumen mensual aparecerá cuando existan ventas.
                      </Typography>
                    </Box>
                  </Box>
                ) : (
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
                ) }
              </Box>
            </Stack>
            
          </CardContent>
        </Card>
        
      </Box> 
      <Box
          sx={{
            width: "100%",
            mt: 3,
            mb: 5,
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              xl: "repeat(2, minmax(0, 1fr))",
            },
            alignItems: "stretch",
            gap: 2,
          }}
>
          <Card
            variant="outlined"
            elevation={ 0 }
            sx={{ 
              borderRadius: "5px",
              borderColor: "#E2E7E5",
              bgcolor: "#FFFFFF",
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box>
                <Box>
                  <Typography sx={{ fontSize: "1rem", fontWeight: 700 }}>
                    Inventario
                  </Typography>

                  <Typography color="text.secondary" sx={{ mb:2, fontSize: "0.8rem" }}>
                    Resumen de existencias de la sucursal.
                  </Typography>
                </Box>
 
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns:{
                    xs: "repeat(3, minmax(0, 1fr))",
                    sm: "repeat(4, minmax(0, 1fr))",
                    md: "repeat(4, minmax(0, 1fr))",
                  }, 
                  gap: 1
                }}
              >
                <Box>
                  <Typography color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                    Productos
                  </Typography>

                  { inventoryQuery.isFetching ? (
                    <Skeleton width={ 60 } height={ 34 } />
                  ) : (
                    <Typography sx={{fontSize: { xs: "1rem", sm: "1.2rem", }, fontWeight: 700, whiteSpace: "nowrap" }}>
                      { inventory?.summary.products ?? 0 }
                    </Typography>
                  ) }
                </Box>

                <Box>
                  <Typography color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                    Unidades
                  </Typography>

                  { inventoryQuery.isFetching ? (
                    <Skeleton width={ 70 } height={ 34 } />
                  ) : (
                    <Typography sx={{ fontSize: { xs: "1rem", sm: "1.2rem", }, fontWeight: 700, whiteSpace: "nowrap" }}>
                      { Number(inventory?.summary.total_units ?? 0).toLocaleString("es-GT") }
                    </Typography>
                  ) }
                </Box>

                <Box>
                  <Typography color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                    Costo de inventario
                  </Typography>

                  { inventoryQuery.isFetching ? (
                    <Skeleton width={ 120 } height={ 34 } />
                  ) : (
                    <Typography sx={{fontSize: { xs: "1rem", sm: "1.2rem", }, fontWeight: 700, whiteSpace: "nowrap" }}>
                      { formatCurrency(inventory?.summary.total_cost_value) }
                    </Typography>
                  ) }
                </Box>

                <Box>
                  <Typography color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                    Valor de venta
                  </Typography>

                  { inventoryQuery.isFetching ? (
                    <Skeleton width={ 120 } height={ 34 } />
                  ) : (
                    <Typography sx={{fontSize: { xs: "1rem", sm: "1.2rem", }, fontWeight: 700, whiteSpace: "nowrap" }}>
                      { formatCurrency(inventory?.summary.total_sale_value) }
                    </Typography>
                  ) }
                </Box>
              </Box>

             { inventoryQuery.isFetching ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5,  }}>
                {[1, 2, 3].map((item) => (
                  <Box
                    key={ item }
                    sx={{
                      display: "flex",
                      alignItems: {
                        xs: "flex-start",
                        sm: "center",
                      },
                      justifyContent: "space-between",
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Skeleton width={ 160 } height={ 24 } />
                      <Skeleton width={ 90 } height={ 20 } />
                    </Box>

                    <Skeleton width={ 80 } height={ 24 } />
                  </Box>
                ))}
              </Box>
            ) : inventoryQuery.isError ? (
                <Box
                  sx={{
                    width: "100%",
                    minHeight: 120,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Box sx={{ textAlign: "center" }}>
                    <Typography sx={{ fontSize: "0.9rem", fontWeight: 600 }}>
                      No fue posible cargar el inventario
                    </Typography>

                    <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: "0.8rem" }}>
                      Intenta actualizar la información nuevamente.
                    </Typography>
                  </Box>
                </Box>
              ) : lowStockProducts.length === 0 ? (
              <Box
                sx={{
                  minHeight: 120,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  mt: 2,
                  pt: 2.5,
                  borderTop: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: "0.9rem", fontWeight: 600 }}>
                    No hay inventario registrado
                  </Typography>

                  <Typography sx={{ mt: 0.5, color: "text.secondary", fontSize: "0.8rem" }}>
                    Los productos con existencias aparecerán aquí.
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box 
              sx={{ 
                display: "flex", 
                flexDirection: "column", 
                gap: 1,  
                borderTop: "1px solid",
                borderColor: "divider", 
                mt:1}}>
                  <Box sx={{mt:1}}>
                    { lowStockProducts.map((product) => (
                      <Box
                        key={ product.product_id }
                        sx={{
                          display: "flex",
                          alignItems: {
                            xs: "flex-start",
                            sm: "center",
                          },
                          justifyContent: "space-between",
                          gap: 2,
                        }}
                      >
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography noWrap sx={{ fontSize: "0.84rem", fontWeight: 600 }}>
                            { product.name }
                          </Typography>

                          <Typography color="text.secondary" sx={{ fontSize: "0.72rem" }}>
                            { product.sku }
                          </Typography>
                        </Box>

                        <Typography sx={{flexShrink: 0, fontSize: "0.84rem", fontWeight: 600, whiteSpace: "nowrap" }}>
                          { Number(product.quantity).toLocaleString("es-GT") } unidades
                        </Typography>
                      </Box>
                    )) }
                 </Box>
              </Box>
            ) }
            </CardContent>
          </Card>
          <Card
            elevation={ 0 }
            sx={{ 
              borderRadius: "5px",
              borderColor: "#E2E7E5",
              bgcolor: "#FFFFFF",
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box>
                <Box>
                  <Typography sx={{ fontSize: "1rem", fontWeight: 700 }}>
                    Movimientos recientes
                  </Typography>

                  <Typography color="text.secondary" sx={{mb: 2,fontSize: "0.8rem" }}>
                    Resumen de movimientos de caja del mes.
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 1,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                    Entradas
                  </Typography>
                  { cashQuery.isFetching ? (
                    <Skeleton width={ 110 } height={ 34 } />
                  ) : (
                    <Typography
                      sx={{
                        fontSize: {
                          xs: "1rem",
                          sm: "1.2rem",
                        },
                        fontWeight: 700,
                        color: "success.main",
                        whiteSpace: "nowrap",
                      }}
                    >
                      { formatCurrency(cashReport?.summary.in.total) }
                    </Typography>
                  ) }
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                    Salidas
                  </Typography>

                  { cashQuery.isFetching ? (
                    <Skeleton width={ 110 } height={ 34 } />
                  ) : (
                    <Typography
                      sx={{
                        fontSize: {
                          xs: "1rem",
                          sm: "1.2rem",
                        },
                        fontWeight: 700,
                        color: "error.main",
                        whiteSpace: "nowrap",
                      }}
                    >
                      { formatCurrency(cashReport?.summary.out.total) }
                    </Typography>
                  ) }
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Typography color="text.secondary"  sx={{ fontSize: "0.75rem" }} >
                    Neto
                  </Typography>

                  { cashQuery.isFetching ? (
                    <Skeleton width={ 110 } height={ 34 } />
                  ) : (
                    <Typography sx={{
                      fontSize: {
                        xs: "1rem",
                        sm: "1.2rem",
                      },
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}>
                      { formatCurrency(cashReport?.summary.net) }
                    </Typography>
                  ) }
                </Box>
              </Box>

              <Box
               
              >
                {cashQuery.isFetching ? (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {[1, 2, 3, 4, 5].map((item) => (
                      <Box
                        key={ item }
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 2,
                        }}
                      >
                        <Box>
                          <Skeleton width={ 110 } height={ 24 } />
                          <Skeleton width={ 160 } height={ 20 } />
                        </Box>

                        <Skeleton width={ 90 } height={ 24 } />
                      </Box>
                    ))}
                  </Box>
                ) : cashQuery.isError ? (
                    <Box
                      sx={{
                        width: "100%",
                        minHeight: 120,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Box sx={{ textAlign: "center" }}>
                        <Typography sx={{ fontSize: "0.9rem", fontWeight: 600 }}>
                          No fue posible cargar los movimientos
                        </Typography>

                        <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: "0.8rem" }}>
                          Intenta actualizar la información nuevamente.
                        </Typography>
                      </Box>
                    </Box>
                  ) : (cashReport?.results ?? []).length === 0 ? (
                  <Box
                    sx={{
                      minHeight: 120,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      mt: 2,
                      pt: 2.5,
                      borderTop: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontSize: "0.9rem", fontWeight: 600 }}>
                        No hay movimientos registrados
                      </Typography>

                      <Typography  sx={{ mt: 0.5, color: "text.secondary", fontSize: "0.8rem" }}>
                        Las entradas y salidas de caja aparecerán aquí.
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box 
                    sx={{ 
                      display: "flex",
                      flexDirection: "column", 
                      gap: 1, 
                      borderTop: "1px solid",
                      borderColor: "divider", 
                      mt:1  
                      }}>
                      <Box sx={{mt:1}}>
                        { (cashReport?.results ?? []).map((movement) => {
                          const isEntry = movement.direction === "IN";

                          return (
                            <Box
                              key={ movement.id }
                              sx={{ 
                                display: "flex",
                                alignItems: {
                                  xs: "flex-start",
                                  sm: "center",
                                },
                                justifyContent: "space-between",
                                gap: 2,
                              }}
                            >
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography noWrap sx={{ fontSize: "0.84rem", fontWeight: 600 }}>
                                  { movement.movement_type_display }
                                </Typography>

                                <Typography
                                  noWrap
                                  color="text.secondary"
                                  sx={{ fontSize: "0.72rem" }}
                                >
                                  { movement.reference || movement.notes || "Sin referencia" }
                                </Typography>
                              </Box>

                              <Typography
                                sx={{
                                  flexShrink: 0, 
                                  fontSize: "0.84rem",
                                  fontWeight: 600,
                                  whiteSpace: "nowrap",
                                  color: isEntry ? "success.main" : "error.main",
                                }}
                              >
                                { isEntry ? "+" : "-" } { formatCurrency(movement.amount) }
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box> 
    </Stack>
  );
}