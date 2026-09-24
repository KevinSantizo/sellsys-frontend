import {
  ArrowBackRounded,
  ArrowForwardRounded,
  AssessmentRounded,
  FilterAltOffRounded,
  LocalShippingRounded,
  ReceiptLongRounded,
  ShoppingCartRounded,
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

import { getPurchasesReport } from "../services/reportsService";


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


export function PurchasesReportPage() {
  const selectedCompany = useCompanyStore((state) => state.selectedCompany);
  const selectedBranch = useBranchStore((state) => state.selectedBranch);

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const [dateFrom, setDateFrom] = useState(formatDate(firstDayOfMonth));
  const [dateTo, setDateTo] = useState(formatDate(today));

  const [appliedDateFrom, setAppliedDateFrom] = useState(formatDate(firstDayOfMonth));
  const [appliedDateTo, setAppliedDateTo] = useState(formatDate(today));

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const validDates = Boolean(dateFrom) && Boolean(dateTo) && dateFrom <= dateTo;

  const canLoadReport =
    Boolean(selectedCompany?.id) &&
    Boolean(selectedBranch?.id) &&
    Boolean(appliedDateFrom) &&
    Boolean(appliedDateTo);

  const purchasesReportQuery = useQuery({
    queryKey: [
      "purchases-report",
      selectedCompany?.id,
      selectedBranch?.id,
      appliedDateFrom,
      appliedDateTo,
      page,
      rowsPerPage,
    ],

    queryFn: () => {
      if (!selectedCompany || !selectedBranch) {
        throw new Error("No existe una empresa o sucursal seleccionada.");
      }

      return getPurchasesReport({
        companyId: selectedCompany.id,
        branchId: selectedBranch.id,
        dateFrom: appliedDateFrom,
        dateTo: appliedDateTo,
        page,
        pageSize: rowsPerPage,
      });
    },

    enabled: canLoadReport,
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

  const report = purchasesReportQuery.data;
  const rows = report?.results ?? [];
  const totalRows = report?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rows.length, totalRows);

  return (
    <Box
      sx={{
        display: "grid",
        gap: 3,
      }}
    >
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Reporte de compras
        </Typography>

        <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
          Consulta las compras completadas de la sucursal en un período específico.
        </Typography>
      </Box>

      {!selectedCompany || !selectedBranch ? (
        <Alert severity="warning">
          Selecciona una empresa y una sucursal para consultar el reporte.
        </Alert>
      ) : null}

      <Paper variant="outlined" sx={{ p: 2, borderRadius: "5px" }}>
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
                variant="contained"
                fullWidth
                disabled={ !validDates || !selectedCompany || !selectedBranch || purchasesReportQuery.isFetching }
                onClick={ handleGenerate }
                startIcon={
                purchasesReportQuery.isFetching
                    ? <CircularProgress size={ 18 } color="inherit" />
                    : <AssessmentRounded />
                }
                sx={{
                height: 56,
                borderRadius: "5px",
                textTransform: "none",
                fontWeight: 700,
                }}
            >
                { purchasesReportQuery.isFetching ? "Generando..." : "Generar" }
            </Button>

            <Button
                variant="outlined"
                onClick={ handleClearFilters }
                disabled={ purchasesReportQuery.isFetching }
                startIcon={ <FilterAltOffRounded /> }
                sx={{
                minWidth: 100,
                height: 56,
                borderRadius: "5px",
                textTransform: "none",
                fontWeight: 700,
                whiteSpace: "nowrap",
                }}
            >
                Limpiar
            </Button>
            </Box>
        </Box>
      </Paper>

      {purchasesReportQuery.isError && (
        <Alert severity="error">
          No fue posible cargar el reporte de compras.
        </Alert>
      )}

      {purchasesReportQuery.isLoading ? (
        <Box sx={{ minHeight: 250, display: "grid", placeItems: "center" }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {report && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "minmax(0, 1fr)",
                  md: "repeat(3, minmax(0, 1fr))",
                },
                gap: 2,
              }}
            >
              <ReportMetricCard
                title="Total comprado"
                value={ formatCurrency(report.summary.total) }
                detail="Monto total de compras"
                icon={ <ShoppingCartRounded /> }
              />

              <ReportMetricCard
                title="Compras completadas"
                value={ report.summary.count.toString() }
                detail="Operaciones completadas"
                icon={ <ReceiptLongRounded /> }
              />

              <ReportMetricCard
                title="Compra promedio"
                value={ formatCurrency(report.summary.average_purchase) }
                detail="Promedio por compra"
                icon={ <LocalShippingRounded /> }
              />
            </Box>
          )}

          <Paper variant="outlined" sx={{ borderRadius: "5px", overflow: "hidden" }}>
            <Box
              sx={{
                px: 2,
                py: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Detalle de compras
              </Typography>

              <Typography variant="body2" sx={{ mt: 0.25, color: "text.secondary" }}>
                Compras completadas durante el período seleccionado.
              </Typography>
            </Box>

            <TableContainer sx={{ maxWidth: "100%", overflowX: "auto" }}>
              <Table
                sx={{
                  minWidth: 1200,

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
                    <TableCell>Fecha</TableCell>
                    <TableCell>Compra</TableCell>
                    <TableCell>Proveedor</TableCell>
                    <TableCell>Factura proveedor</TableCell>
                    <TableCell>Método de pago</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                    <TableCell align="right">Descuento</TableCell>
                    <TableCell align="right">Impuesto</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {rows.map((purchase) => (
                    <TableRow key={ purchase.id } hover>
                      <TableCell>
                        { formatDisplayDate(purchase.purchase_date) }
                      </TableCell>

                      <TableCell>
                        <Typography sx={{ fontSize: "0.875rem", fontWeight: 700 }}>
                          { purchase.purchase_number }
                        </Typography>
                      </TableCell>

                      <TableCell>
                        { purchase.supplier_name }
                      </TableCell>

                      <TableCell>
                        { purchase.supplier_invoice_number || "—" }
                      </TableCell>

                      <TableCell>
                        { purchase.payment_method_display }
                      </TableCell>

                      <TableCell align="right">
                        { formatCurrency(purchase.subtotal) }
                      </TableCell>

                      <TableCell align="right">
                        { formatCurrency(purchase.discount_total) }
                      </TableCell>

                      <TableCell align="right">
                        { formatCurrency(purchase.tax_total) }
                      </TableCell>

                      <TableCell align="right">
                        <Typography sx={{ fontWeight: 700 }}>
                          { formatCurrency(purchase.total) }
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}

                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={ 9 }>
                        <Box sx={{ py: 5, textAlign: "center" }}>
                          <Typography sx={{ fontWeight: 700 }}>
                            No hay compras
                          </Typography>

                          <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
                            No existen compras completadas para el período seleccionado.
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
                <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
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
};


function ReportMetricCard({ title, value, detail, icon }: ReportMetricCardProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: "5px" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            { title }
          </Typography>

          <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 800 }}>
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