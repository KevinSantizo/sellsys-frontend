import {
    AssessmentRounded,
    Inventory2Rounded,
    QueryStatsRounded,
    FilterAltOffRounded, 
    PaymentsRounded,
    ReceiptLongRounded,
    ShoppingCartRounded,
    TrendingUpRounded,
    ArrowBackRounded,
    ArrowForwardRounded,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import { useQuery } from "@tanstack/react-query";

import { useState, type ReactNode } from "react";

import { useBranchStore } from "../../branches/store/branchStore";
import { useCompanyStore } from "../../companies/store/companyStore";
import { useNavigate } from "react-router-dom";

import {
  getReportDaily,
  getReportSummary,
} from "../services/reportsService";


function formatDate(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


function formatDisplayDate(value: string): string {
  const [year, month, day] = value.split("-");

  return `${day}/${month}/${year}`;
}


function formatCurrency(value: string | number): string {
  const amount = Number(value) || 0;

  return `Q${amount.toLocaleString("es-GT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}



export function ReportsPage() {

    const navigate = useNavigate();

    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

 
    const selectedCompany = useCompanyStore((state) => state.selectedCompany);
    const selectedBranch = useBranchStore((state) => state.selectedBranch);

    const today = new Date();

    const firstDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
    );

    const [dateFrom, setDateFrom] = useState(formatDate(firstDayOfMonth));
    const [dateTo, setDateTo] = useState(formatDate(today));

    const [appliedDateFrom, setAppliedDateFrom] = useState(formatDate(firstDayOfMonth));
    const [appliedDateTo, setAppliedDateTo] = useState(formatDate(today));

    const validDates =
        Boolean(dateFrom) &&
        Boolean(dateTo) &&
        dateFrom <= dateTo;

    const canLoadReports =
        Boolean(selectedCompany?.id) &&
        Boolean(selectedBranch?.id) &&
        Boolean(appliedDateFrom) &&
        Boolean(appliedDateTo);

    const summaryQuery = useQuery({
        queryKey: [
        "reports-summary",
        selectedCompany?.id,
        selectedBranch?.id,
        appliedDateFrom,
        appliedDateTo,
    ],

        queryFn: () => {
        if (!selectedCompany || !selectedBranch) {
            throw new Error("No existe una empresa o sucursal seleccionada.");
        }

        return getReportSummary({
            companyId: selectedCompany.id,
            branchId: selectedBranch.id,
            dateFrom: appliedDateFrom,
            dateTo: appliedDateTo,
        });
        },

        enabled: canLoadReports,
    });

    const dailyQuery = useQuery({
        queryKey: [
            "reports-daily",
            selectedCompany?.id,
            selectedBranch?.id,
            appliedDateFrom,
            appliedDateTo,
        ],

        queryFn: () => {
            if (!selectedCompany || !selectedBranch) {
                throw new Error("No existe una empresa o sucursal seleccionada.");
            }

            return getReportDaily({
                companyId: selectedCompany.id,
                branchId: selectedBranch.id,
                dateFrom: appliedDateFrom,
                dateTo: appliedDateTo,
            });
        },

        enabled: canLoadReports,
    });

    const handleGenerate = () => {
        if (!validDates) {
            return;
        }

        setPage(1);
        setAppliedDateFrom(dateFrom);
        setAppliedDateTo(dateTo);
    };

    const handleClearFilters = () => {
        const defaultDateFrom = formatDate(firstDayOfMonth);
        const defaultDateTo = formatDate(today);

        setDateFrom(defaultDateFrom);
        setDateTo(defaultDateTo);

        setAppliedDateFrom(defaultDateFrom);
        setAppliedDateTo(defaultDateTo);

        setPage(1);
    };

    const isLoading =
        summaryQuery.isLoading ||
        dailyQuery.isLoading;

    const isFetching =
        summaryQuery.isFetching ||
        dailyQuery.isFetching;

    const isError =
        summaryQuery.isError ||
        dailyQuery.isError;

    const summary = summaryQuery.data;
    const dailyRows = dailyQuery.data?.results ?? [];
    const totalRows = dailyRows.length;
    const totalPages = Math.max( 1, Math.ceil(totalRows / rowsPerPage), );
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalRows);
    const paginatedRows = dailyRows.slice( startIndex, endIndex,);
  return (
    <Box
      sx={{
        display: "grid",
        gap: 3,
      }}
    >
      <Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
          }}
        >
          Resumen general
        </Typography>

        <Typography
          variant="body2"
          sx={{
            mt: 0.5,
            color: "text.secondary",
          }}
        >
          Consulta ventas, compras, gastos y movimientos de caja por período.
        </Typography>
      </Box>

      {!selectedCompany || !selectedBranch ? (
        <Alert severity="warning">
          Selecciona una empresa y una sucursal para consultar los reportes.
        </Alert>
      ) : null}

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: "5px",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              md: "repeat(2, minmax(0, 1fr))",
              xl: "repeat(5, minmax(0, 1fr))",
            },
            gap: 2,
            alignItems: "center",
          }}
        >
          <TextField
            label="Empresa"
            value={ selectedCompany?.name ?? "" }
            disabled
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "5px",
              },
            }}
          />

          <TextField
            label="Sucursal"
            value={ selectedBranch?.name ?? "" }
            disabled
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "5px",
              },
            }}
          />

          <TextField
            type="date"
            label="Desde"
            value={ dateFrom }
            onChange={ (event) => setDateFrom(event.target.value) }
            fullWidth
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "5px",
              },
            }}
          />

        <TextField
            type="date"
            label="Hasta"
            value={ dateTo }
            onChange={ (event) => setDateTo(event.target.value) }
            fullWidth
            error={ Boolean(dateFrom && dateTo && dateFrom > dateTo) }
            slotProps={{
                inputLabel: {
                shrink: true,
                },
            }}
            sx={{
                "& .MuiOutlinedInput-root": {
                borderRadius: "5px",
                },
            }}
        />

          <Box
            sx={{
                display: "flex",
                flexDirection: "row",
                gap: 1,
            }}
            >
                <Button
                    type="button"
                    variant="contained"
                    fullWidth
                    disabled={ !validDates || !selectedCompany || !selectedBranch || isFetching }
                    onClick={ handleGenerate }
                    startIcon={
                    isFetching
                        ? <CircularProgress size={ 18 } color="inherit" />
                        : <AssessmentRounded />
                    }
                    sx={{
                    minHeight: 56,
                    borderRadius: "5px",
                    fontWeight: 700,
                    textTransform: "none",
                    }}
                >
                    { isFetching ? "Generando..." : "Generar" }
                </Button>

                <Button
                    type="button"
                    variant="outlined"
                    onClick={ handleClearFilters }
                    disabled={ isFetching }
                    startIcon={ <FilterAltOffRounded /> }
                    sx={{
                    minWidth: 100,
                    minHeight: 56,
                    borderRadius: "5px",
                    fontWeight: 700,
                    textTransform: "none",
                    whiteSpace: "nowrap",
                    }}
                >
                    Limpiar
                </Button>
            </Box>
        </Box>
      </Paper>

      {isError && (
        <Alert severity="error">
          No fue posible cargar la información de los reportes.
        </Alert>
      )}

      {isLoading ? (
        <Box
          sx={{
            minHeight: 220,
            display: "grid",
            placeItems: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          {summary && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "minmax(0, 1fr)",
                  sm: "repeat(2, minmax(0, 1fr))",
                  xl: "repeat(4, minmax(0, 1fr))",
                },
                gap: 2,
              }}
            >
                <ReportMetricCard
                    title="Ventas"
                    value={ formatCurrency(summary.sales.total) }
                    detail={ `${summary.sales.count} ventas completadas · Ver detalle` }                
                    icon={ <TrendingUpRounded /> }
                    onClick={ () => navigate("/reports/sales") }
                />

                <ReportMetricCard
                    title="Compras"
                    value={ formatCurrency(summary?.purchases.total ?? "0.00") }
                    detail={ `${summary?.purchases.count ?? 0} compras completadas · Ver detalle` }
                    icon={ <ShoppingCartRounded /> }
                    onClick={ () => navigate("/reports/purchases") }
                />

                <ReportMetricCard
                    title="Gastos"
                    value={ formatCurrency(summary?.expenses.total ?? "0.00") }
                    detail={ `${summary?.expenses.count ?? 0} gastos completados · Ver detalle` }
                    icon={ <ReceiptLongRounded /> }
                    onClick={ () => navigate("/reports/expenses") }
                />

                <ReportMetricCard
                    title="Flujo neto de caja"
                    value={ formatCurrency(summary?.cash.net ?? "0.00") }
                    detail={
                        `Entradas ${formatCurrency(summary?.cash.in.total ?? "0.00")} · Salidas ${formatCurrency(summary?.cash.out.total ?? "0.00")} · Ver detalle`
                    }
                    icon={ <PaymentsRounded /> }
                    onClick={ () => navigate("/reports/cash") }
                />
            </Box>
          )}

          <Box>
            <Typography
                variant="h6"
                sx={{
                mb: 1.5,
                fontWeight: 700,
                }}
            >
                Otros reportes
            </Typography>

            <Box
                sx={{
                display: "grid",
                gridTemplateColumns: {
                    xs: "minmax(0, 1fr)",
                    md: "repeat(2, minmax(0, 1fr))",
                },
                gap: 2,
                }}
            >
                <ReportAccessCard
                title="Inventario"
                description="Consulta existencias y valorización actual del inventario."
                icon={ <Inventory2Rounded /> }
                onClick={ () => navigate("/reports/inventory") }
                />

                <ReportAccessCard
                title="Rentabilidad"
                description="Analiza ventas, costos, utilidad bruta, gastos y márgenes."
                icon={ <QueryStatsRounded /> }
                onClick={ () => navigate("/reports/profitability") }
                />
            </Box>
            </Box>
          <Paper
            variant="outlined"
            sx={{
              borderRadius: "5px",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                }}
              >
                Desglose diario
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  mt: 0.25,
                  color: "text.secondary",
                }}
              >
                Operaciones completadas y flujo de caja del período seleccionado.
              </Typography>
            </Box>

            <TableContainer
              sx={{
                maxWidth: "100%",
                overflowX: "auto",
              }}
            >
              <Table
                sx={{
                    minWidth: 900, 
                    "& .MuiTableCell-root": {
                        borderBottom: "1px solid", 
                        borderColor: "divider",
                    },

                    "& .MuiTableCell-root:last-of-type": {
                        borderRight: "none",
                    },
                    "& .MuiTableHead-root .MuiTableCell-root": { 
                        fontWeight: 700,
                    },

                    "& .MuiTableBody-root .MuiTableRow-root:last-of-type .MuiTableCell-root": {
                        borderBottom: "none",
                    },
                }}
                >
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Fecha</strong>
                    </TableCell>

                    <TableCell align="right">
                      <strong>Ventas</strong>
                    </TableCell>

                    <TableCell align="right">
                      <strong>Compras</strong>
                    </TableCell>

                    <TableCell align="right">
                      <strong>Gastos</strong>
                    </TableCell>

                    <TableCell align="right">
                      <strong>Entradas caja</strong>
                    </TableCell>

                    <TableCell align="right">
                      <strong>Salidas caja</strong>
                    </TableCell>

                    <TableCell align="right">
                      <strong>Neto caja</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedRows.map((row) => (
                    <TableRow key={ row.date } hover>
                      <TableCell>
                        { formatDisplayDate(row.date) }
                      </TableCell>

                      <TableCell align="right">
                        <Typography sx={{ fontWeight: 600 }}>
                          { formatCurrency(row.sales.total) }
                        </Typography>

                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                          }}
                        >
                          { row.sales.count } operaciones
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Typography sx={{ fontWeight: 600 }}>
                          { formatCurrency(row.purchases.total) }
                        </Typography>

                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                          }}
                        >
                          { row.purchases.count } operaciones
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Typography sx={{ fontWeight: 600 }}>
                          { formatCurrency(row.expenses.total) }
                        </Typography>

                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                          }}
                        >
                          { row.expenses.count } operaciones
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        { formatCurrency(row.cash.in) }
                      </TableCell>

                      <TableCell align="right">
                        { formatCurrency(row.cash.out) }
                      </TableCell>

                      <TableCell align="right">
                        <Typography
                          sx={{
                            fontWeight: 700,
                            color:
                              Number(row.cash.net) > 0
                                ? "success.main"
                                : Number(row.cash.net) < 0
                                  ? "error.main"
                                  : "text.primary",
                          }}
                        >
                          { formatCurrency(row.cash.net) }
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}

                  {dailyRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={ 7 }>
                        <Box
                          sx={{
                            py: 5,
                            textAlign: "center",
                          }}
                        >
                          <Typography sx={{ fontWeight: 700 }}>
                            No hay información
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{
                              mt: 0.5,
                              color: "text.secondary",
                            }}
                          >
                            No existen operaciones para el período seleccionado.
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Box
                sx={{
                    width: "100%",
                    px: 2,
                    py: 1.5,
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: {
                    xs: "column",
                    md: "row",
                    },
                    alignItems: {
                    xs: "stretch",
                    md: "center",
                    },
                    justifyContent: "space-between",
                    gap: 2,
                    borderTop: "1px solid",
                    borderColor: "divider",
                }}
                >
                <Box
                    sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 2,
                    }}
                >
                    <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                    }}
                    >
                    {totalRows > 0
                        ? `Resultado ${startIndex + 1}-${endIndex} de ${totalRows}`
                        : "Resultado 0 de 0"}
                    </Typography>

                    <TextField
                    select
                    size="small"
                    value={ rowsPerPage }
                    onChange={ (event) => {
                        setRowsPerPage(Number(event.target.value));
                        setPage(1);
                    }}
                    sx={{
                        width: 90,
                        "& .MuiOutlinedInput-root": {
                        height: 40,
                        borderRadius: "5px",
                        },
                    }}
                    >
                    <MenuItem value={ 10 }>10</MenuItem>
                    <MenuItem value={ 20 }>20</MenuItem>
                    <MenuItem value={ 50 }>50</MenuItem>
                    </TextField>
                </Box>

                <Box
                    sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    gap: 1,
                    ml: {
                        xs: 0,
                        md: "auto",
                    },
                    }}
                >
                    <Button
                    variant="outlined"
                    disabled={ page === 1 || totalRows === 0 }
                    onClick={ () => setPage((current) => Math.max(1, current - 1)) }
                    startIcon={ <ArrowBackRounded /> }
                    sx={{
                        minWidth: 140,
                        height: 44,
                        borderRadius: "5px",
                        textTransform: "none",
                        fontWeight: 700,
                        fontSize: "0.875rem",
                        borderColor: "divider",
                        color: "text.primary",
                        "&:hover": {
                        borderColor: "primary.main",
                        },
                    }}
                    >
                    Anterior
                    </Button>

                    <Box
                    sx={{
                        display: {
                        xs: "none",
                        sm: "block",
                        },
                        "& .MuiPagination-ul": {
                        gap: "4px",
                        },
                        "& .MuiPaginationItem-root": {
                        minWidth: 30,
                        width: 30,
                        height: 27,
                        m: 0,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: "5px",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        },
                        "& .MuiPaginationItem-root.Mui-selected": {
                        color: "primary.main",
                        bgcolor: "transparent !important",
                        borderColor: "primary.main",
                        },
                        "& .MuiPaginationItem-root:hover": {
                        bgcolor: "action.hover",
                        },
                    }}
                    >
                    <Pagination
                        count={ totalPages }
                        page={ page }
                        onChange={ (_, value) => setPage(value) }
                        hidePrevButton
                        hideNextButton
                        siblingCount={ 1 }
                        boundaryCount={ 1 }
                    />
                    </Box>

                    <Button
                    variant="outlined"
                    disabled={ page === totalPages || totalRows === 0 }
                    onClick={ () => setPage((current) => Math.min(totalPages, current + 1)) }
                    endIcon={ <ArrowForwardRounded /> }
                    sx={{
                        minWidth: 150,
                        height: 44,
                        borderRadius: "5px",
                        textTransform: "none",
                        fontWeight: 700,
                        fontSize: "0.875rem",
                        borderColor: "primary.main",
                        color: "primary.main",
                        "&:hover": {
                        borderColor: "primary.dark",
                        },
                    }}
                    >
                    Siguiente
                    </Button>
                </Box>
            </Box>
          </Paper>
        </>
      )}
    </Box>
  );
}


type ReportMetricCardProps = {
  title: string;
  value: string;
  detail: string;
  icon: ReactNode;
  onClick?: () => void;
};


function ReportMetricCard({
  title,
  value,
  detail,
  icon,
  onClick,
}: ReportMetricCardProps) {
  return (
    <Paper
        variant="outlined"
        onClick={ onClick }
        sx={{
            p: 2,
            borderRadius: "5px",
            cursor: onClick ? "pointer" : "default",
            transition: "border-color 0.2s ease, box-shadow 0.2s ease",
            "&:hover": onClick
            ? {
                borderColor: "primary.main",
                boxShadow: 1,
                }
            : {},
        }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
            }}
          >
            { title }
          </Typography>

          <Typography
            variant="h5"
            sx={{
              mt: 0.5,
              fontWeight: 700,
            }}
          >
            { value }
          </Typography>
        </Box>

        <Box
          sx={{
            width: 42,
            height: 42,
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            borderRadius: "5px",
            bgcolor: "primary.light",
            color: "primary.main",
          }}
        >
          { icon }
        </Box>
      </Box>

      <Typography
        variant="caption"
        sx={{
          display: "block",
          mt: 1.5,
          color: "text.secondary",
        }}
      >
        { detail }
      </Typography>
    </Paper>
  );
}

type ReportAccessCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
  onClick: () => void;
};


function ReportAccessCard({
  title,
  description,
  icon,
  onClick,
}: ReportAccessCardProps) {
  return (
    <Paper
      variant="outlined"
      onClick={ onClick }
      sx={{
        p: 2,
        borderRadius: "5px",
        cursor: "pointer",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: 1,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            borderRadius: "5px",
            bgcolor: "primary.light",
            color: "primary.main",
          }}
        >
          { icon }
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 700,
            }}
          >
            { title }
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mt: 0.25,
              color: "text.secondary",
            }}
          >
            { description }
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}