import {
  ArrowBackRounded,
  ArrowForwardRounded,
  AssessmentRounded,
  FilterAltOffRounded,
  GridOnRounded,
  Inventory2Rounded,
  PaymentsRounded,
  PercentRounded,
  PictureAsPdfRounded,
  ReceiptLongRounded,
  TrendingUpRounded,
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
import {
  downloadProfitabilityExcel,
  downloadProfitabilityPdf,
  getProfitabilityReport,
} from "../services/reportsService";


function formatDate(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


function formatCurrency(value: string | number | null): string {
  if (value === null) {
    return "—";
  }

  const amount = Number(value) || 0;

  return `Q${amount.toLocaleString("es-GT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}


function formatQuantity(value: string | number): string {
  const amount = Number(value) || 0;

  return amount.toLocaleString("es-GT", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });
}


function formatPercent(value: string | number | null): string {
  if (value === null) {
    return "—";
  }

  return `${Number(value).toLocaleString("es-GT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}


export function ProfitabilityReportPage() {
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
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const validDates = Boolean(dateFrom) && Boolean(dateTo) && dateFrom <= dateTo;

  const canLoadReport =
    Boolean(selectedCompany?.id) &&
    Boolean(selectedBranch?.id) &&
    Boolean(appliedDateFrom) &&
    Boolean(appliedDateTo);

  const profitabilityReportQuery = useQuery({
    queryKey: [
      "profitability-report",
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

      return getProfitabilityReport({
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

    setDownloadError(null);
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

  const handleDownloadExcel = async () => {
    if (!selectedCompany?.id || !selectedBranch?.id || !appliedDateFrom || !appliedDateTo) {
      return;
    }

    setDownloadError(null);
    setIsDownloadingExcel(true);

    try {
      await downloadProfitabilityExcel({
        companyId: selectedCompany.id,
        branchId: selectedBranch.id,
        dateFrom: appliedDateFrom,
        dateTo: appliedDateTo,
      });
    } catch {
      setDownloadError("No fue posible descargar el reporte de rentabilidad en Excel.");
    } finally {
      setIsDownloadingExcel(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!selectedCompany?.id || !selectedBranch?.id || !appliedDateFrom || !appliedDateTo) {
      return;
    }

    setDownloadError(null);
    setIsDownloadingPdf(true);

    try {
      await downloadProfitabilityPdf({
        companyId: selectedCompany.id,
        branchId: selectedBranch.id,
        dateFrom: appliedDateFrom,
        dateTo: appliedDateTo,
      });
    } catch {
      setDownloadError("No fue posible descargar el reporte de rentabilidad en PDF.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const report = profitabilityReportQuery.data;
  const rows = report?.results ?? [];
  const totalRows = report?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rows.length, totalRows);

  const isFetching = profitabilityReportQuery.isFetching;
  const isDownloading = isDownloadingExcel || isDownloadingPdf;
  const canExport =
    Boolean(selectedCompany?.id) &&
    Boolean(selectedBranch?.id) &&
    Boolean(appliedDateFrom) &&
    Boolean(appliedDateTo) &&
    appliedDateFrom <= appliedDateTo;

  return (
    <Box sx={{ display: "grid", gap: 3 }}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Reporte de rentabilidad
        </Typography>

        <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
          Analiza ventas, costo de ventas, utilidad bruta, gastos y resultado operativo.
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
              xl: "repeat(6, minmax(0, 1fr))",
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
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 1,
              gridColumn: {
                xs: "span 1",
                md: "span 2",
                xl: "span 2",
              },
            }}
          >
            <Button
              type="button"
              variant="contained"
              fullWidth
              disabled={ !validDates || !selectedCompany || !selectedBranch || isFetching || isDownloading }
              onClick={ handleGenerate }
              startIcon={
                isFetching
                  ? <CircularProgress size={ 18 } color="inherit" />
                  : <AssessmentRounded />
              }
              sx={{
                minHeight: 56,
                borderRadius: "5px",
                fontWeight: 600,
                textTransform: "none",
              }}
            >
              { isFetching ? "Generando..." : "Generar" }
            </Button>

            <Button
              type="button"
              variant="outlined"
              onClick={ handleClearFilters }
              disabled={ isFetching || isDownloading }
              startIcon={ <FilterAltOffRounded /> }
              sx={{
                minWidth: 100,
                minHeight: 56,
                borderRadius: "5px",
                fontWeight: 600,
                textTransform: "none",
                whiteSpace: "nowrap",
              }}
            >
              Limpiar
            </Button>

            <Button
              type="button"
              variant="outlined" 
              fullWidth
              disabled={ !canExport || isDownloading }
              onClick={ handleDownloadExcel }
              startIcon={
                isDownloadingExcel
                  ? <CircularProgress size={ 18 } color="inherit" />
                  : <GridOnRounded />
              }
              sx={{
                minHeight: 56,
                borderRadius: "5px",
                fontWeight: 600,
                textTransform: "none",
              }}
            >
              { isDownloadingExcel ? "Descargando..." : "Excel" }
            </Button>

            <Button
              type="button"
              variant="outlined"
              fullWidth
              disabled={ !canExport || isDownloading }
              onClick={ handleDownloadPdf }
              startIcon={
                isDownloadingPdf
                  ? <CircularProgress size={ 18 } color="inherit" />
                  : <PictureAsPdfRounded />
              }
              sx={{
                minHeight: 56,
                borderRadius: "5px",
                fontWeight: 600,
                textTransform: "none",
              }}
            >
              { isDownloadingPdf ? "Descargando..." : "PDF" }
            </Button>
          </Box>
        </Box>
      </Paper>

      {profitabilityReportQuery.isError && (
        <Alert severity="error">
          No fue posible cargar el reporte de rentabilidad.
        </Alert>
      )}

      {downloadError && (
        <Alert severity="error">
          { downloadError }
        </Alert>
      )}

      {report && !report.summary.cost_coverage_complete && (
        <Alert severity="warning">
          Existen { report.summary.missing_cost_items } líneas de venta sin costo histórico. La rentabilidad total del período no puede calcularse con precisión.
        </Alert>
      )}

      {profitabilityReportQuery.isLoading ? (
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
                  sm: "repeat(2, minmax(0, 1fr))",
                  xl: "repeat(3, minmax(0, 1fr))",
                },
                gap: 2,
              }}
            >
              <ReportMetricCard
                title="Ventas netas"
                value={ formatCurrency(report.summary.revenue) }
                detail="Ingresos por productos vendidos"
                icon={ <TrendingUpRounded /> }
              />

              <ReportMetricCard
                title="Costo de ventas"
                value={ formatCurrency(report.summary.cost_of_sales) }
                detail="Costo histórico de productos vendidos"
                icon={ <Inventory2Rounded /> }
              />

              <ReportMetricCard
                title="Utilidad bruta"
                value={ formatCurrency(report.summary.gross_profit) }
                detail="Ventas menos costo de ventas"
                icon={ <PaymentsRounded /> }
                valueColor={getResultColor(report.summary.gross_profit)}
              />

              <ReportMetricCard
                title="Gastos"
                value={ formatCurrency(report.summary.expenses) }
                detail="Gastos completados del período"
                icon={ <ReceiptLongRounded /> }
              />

              <ReportMetricCard
                title="Resultado operativo"
                value={ formatCurrency(report.summary.operating_result) }
                detail="Utilidad bruta menos gastos"
                icon={ <AssessmentRounded /> }
                valueColor={getResultColor(report.summary.operating_result)}
              />

              <ReportMetricCard
                title="Margen bruto"
                value={ formatPercent(report.summary.gross_margin) }
                detail="Porcentaje de utilidad sobre ventas"
                icon={ <PercentRounded /> }
                valueColor={getResultColor(report.summary.gross_margin)}
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
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Rentabilidad por producto
              </Typography>

              <Typography variant="body2" sx={{ mt: 0.25, color: "text.secondary" }}>
                Ventas, costo histórico, utilidad y margen por producto.
              </Typography>
            </Box>

            <TableContainer sx={{ maxWidth: "100%", overflowX: "auto" }}>
              <Table
                sx={{
                  minWidth: 1050,
                  "& .MuiTableCell-root": {
                    borderBottom: "1px solid", 
                    borderColor: "divider",
                  },
                  "& .MuiTableCell-root:last-of-type": {
                    borderRight: "none",
                  },
                  "& .MuiTableHead-root .MuiTableCell-root": {
                    fontWeight: 600,
                  },
                  "& .MuiTableBody-root .MuiTableRow-root:last-of-type .MuiTableCell-root": {
                    borderBottom: "none",
                  },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell align="right">Ventas</TableCell>
                    <TableCell align="right">Costo</TableCell>
                    <TableCell align="right">Utilidad bruta</TableCell>
                    <TableCell align="right">Margen</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {rows.map((product) => (
                    <TableRow key={ product.product_id } hover>
                      <TableCell>
                        <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
                          { product.product_name }
                        </Typography>
                      </TableCell>

                      <TableCell>
                        { product.product_sku || "—" }
                      </TableCell>

                      <TableCell align="right">
                        { formatQuantity(product.quantity_sold) }
                      </TableCell>

                      <TableCell align="right">
                        { formatCurrency(product.revenue) }
                      </TableCell>

                      <TableCell align="right">
                        { formatCurrency(product.cost_of_sales) }
                      </TableCell>

                      <TableCell align="right">
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: getResultColor(product.gross_profit),
                          }}
                        >
                          { formatCurrency(product.gross_profit) }
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: getResultColor(product.gross_margin),
                          }}
                        >
                          { formatPercent(product.gross_margin) }
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}

                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={ 7 }>
                        <Box sx={{ py: 5, textAlign: "center" }}>
                          <Typography sx={{ fontWeight: 600 }}>
                            No hay información
                          </Typography>

                          <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
                            No existen ventas completadas para el período seleccionado.
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
              <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
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
                    fontWeight: 600,
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
                    fontWeight: 600,
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


function getResultColor(value: string | null): string {
  if (value === null) {
    return "text.primary";
  }

  const amount = Number(value);

  if (amount > 0) {
    return "success.main";
  }

  if (amount < 0) {
    return "error.main";
  }

  return "text.primary";
}


type ReportMetricCardProps = {
  title: string;
  value: string;
  detail: string;
  icon: ReactNode;
  valueColor?: string;
};


function ReportMetricCard({
  title,
  value,
  detail,
  icon,
  valueColor = "text.primary",
}: ReportMetricCardProps) {
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

          <Typography
            variant="h5"
            sx={{
              mt: 0.5,
              fontWeight: 600,
              color: valueColor,
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

      <Typography variant="caption" sx={{ display: "block", mt: 1.5, color: "text.secondary" }}>
        { detail }
      </Typography>
    </Paper>
  );
}
