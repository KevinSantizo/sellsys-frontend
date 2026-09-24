import {
  ArrowBackRounded,
  ArrowForwardRounded,
  AttachMoneyRounded,
  Inventory2Rounded,
  PointOfSaleRounded,
  WidgetsRounded,
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
import { getInventoryReport } from "../services/reportsService";


function formatCurrency(value: string | number): string {
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


export function InventoryReportPage() {
  const selectedCompany = useCompanyStore((state) => state.selectedCompany);
  const selectedBranch = useBranchStore((state) => state.selectedBranch);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const canLoadReport =
    Boolean(selectedCompany?.id) &&
    Boolean(selectedBranch?.id);

  const inventoryReportQuery = useQuery({
    queryKey: [
      "inventory-report",
      selectedCompany?.id,
      selectedBranch?.id,
      page,
      rowsPerPage,
    ],

    queryFn: () => {
      if (!selectedCompany || !selectedBranch) {
        throw new Error("No existe una empresa o sucursal seleccionada.");
      }

      return getInventoryReport({
        companyId: selectedCompany.id,
        branchId: selectedBranch.id,
        page,
        pageSize: rowsPerPage,
      });
    },

    enabled: canLoadReport,
  });

  const report = inventoryReportQuery.data;
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
          Reporte de inventario
        </Typography>

        <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
          Consulta las existencias y valorización actual del inventario de la sucursal.
        </Typography>
      </Box>

      {!selectedCompany || !selectedBranch ? (
        <Alert severity="warning">
          Selecciona una empresa y una sucursal para consultar el inventario.
        </Alert>
      ) : null}

      <Paper variant="outlined" sx={{ p: 2, borderRadius: "5px" }}>
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
        </Box>
      </Paper>

      {inventoryReportQuery.isError && (
        <Alert severity="error">
          No fue posible cargar el reporte de inventario.
        </Alert>
      )}

      {inventoryReportQuery.isLoading ? (
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
                  xl: "repeat(4, minmax(0, 1fr))",
                },
                gap: 2,
              }}
            >
              <ReportMetricCard
                title="Productos"
                value={ report.summary.products.toString() }
                detail="Productos con control de inventario"
                icon={ <Inventory2Rounded /> }
              />

              <ReportMetricCard
                title="Existencia total"
                value={ formatQuantity(report.summary.total_units) }
                detail="Unidades actualmente disponibles"
                icon={ <WidgetsRounded /> }
              />

              <ReportMetricCard
                title="Valor al costo"
                value={ formatCurrency(report.summary.total_cost_value) }
                detail="Valor del inventario según costo"
                icon={ <AttachMoneyRounded /> }
              />

              <ReportMetricCard
                title="Valor de venta"
                value={ formatCurrency(report.summary.total_sale_value) }
                detail="Valor según precio de venta actual"
                icon={ <PointOfSaleRounded /> }
              />
            </Box>
          )}

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
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Existencias
              </Typography>

              <Typography variant="body2" sx={{ mt: 0.25, color: "text.secondary" }}>
                Estado actual del inventario de la sucursal seleccionada.
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
                    <TableCell>Producto</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell>Código de barras</TableCell>
                    <TableCell align="right">Existencia</TableCell>
                    <TableCell align="right">Costo</TableCell>
                    <TableCell align="right">Precio venta</TableCell>
                    <TableCell align="right">Valor costo</TableCell>
                    <TableCell align="right">Valor venta</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {rows.map((product) => (
                    <TableRow key={ product.product_id } hover>
                      <TableCell>
                        <Typography sx={{ fontSize: "0.875rem", fontWeight: 700 }}>
                          { product.name }
                        </Typography>
                      </TableCell>

                      <TableCell>
                        { product.sku || "—" }
                      </TableCell>

                      <TableCell>
                        { product.barcode || "—" }
                      </TableCell>

                      <TableCell align="right">
                        <Typography sx={{ fontWeight: 700 }}>
                          { formatQuantity(product.quantity) }
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        { formatCurrency(product.cost_price) }
                      </TableCell>

                      <TableCell align="right">
                        { formatCurrency(product.sale_price) }
                      </TableCell>

                      <TableCell align="right">
                        { formatCurrency(product.cost_value) }
                      </TableCell>

                      <TableCell align="right">
                        <Typography sx={{ fontWeight: 700 }}>
                          { formatCurrency(product.sale_value) }
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}

                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={ 8 }>
                        <Box sx={{ py: 5, textAlign: "center" }}>
                          <Typography sx={{ fontWeight: 700 }}>
                            No hay inventario
                          </Typography>

                          <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
                            No existen productos con existencias para mostrar.
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


function ReportMetricCard({
  title,
  value,
  detail,
  icon,
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

      <Typography variant="caption" sx={{ display: "block", mt: 1.5, color: "text.secondary" }}>
        { detail }
      </Typography>
    </Paper>
  );
}