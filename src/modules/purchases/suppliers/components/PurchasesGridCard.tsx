import {
  ArrowBackRounded,
  ArrowForwardRounded,
  CancelRounded,
  CheckCircleRounded,
  ClearRounded,
  EditRounded,
  FilterAltOffRounded,
  MoreVertRounded,
  RefreshRounded,
  SearchRounded,
  ShoppingCartRounded,
  VisibilityRounded,
} from "@mui/icons-material";

import {
  Box,
  Chip,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Button,

} from "@mui/material";

import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
} from "@mui/x-data-grid";

import {
  useMemo,
  useState,
  type MouseEvent,
} from "react";

import type {
  Purchase,
  PurchasePaymentMethodFilter,
  PurchaseStatus,
  PurchaseStatusFilter,
} from "../types/purchase";

import { esES } from "@mui/x-data-grid/locales";


type PurchasesGridCardProps = {
  purchases: Purchase[];
  totalPurchases: number;
  loading: boolean;
  search: string;
  paginationModel: GridPaginationModel;
  statusFilter: PurchaseStatusFilter;
  paymentMethodFilter: PurchasePaymentMethodFilter;
  hasActiveFilters: boolean;
  onStatusFilterChange: (value: PurchaseStatusFilter) => void;
  onPaymentMethodFilterChange: (value: PurchasePaymentMethodFilter) => void;
  onClearFilters: () => void;
  onSearchChange: (value: string) => void;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  onRefresh: () => void;
  onEdit: (purchase: Purchase) => void;
  onComplete: (purchase: Purchase) => void;
  onCancel: (purchase: Purchase) => void;
  formatCurrency: (value: string) => string;
  onView: (purchase: Purchase) => void;
};


export function PurchasesGridCard({
  purchases,
  totalPurchases,
  loading,
  search,
  statusFilter,
  paymentMethodFilter,
  hasActiveFilters,
  paginationModel,
  onSearchChange,
  onStatusFilterChange,
  onPaymentMethodFilterChange,
  onClearFilters,
  onPaginationModelChange,
  onRefresh,
  onView,
  onEdit,
  onComplete,
  onCancel,
  formatCurrency,
}: PurchasesGridCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);

  const menuOpen = Boolean(anchorEl);

  const handleView = () => {
    if (!selectedPurchase) return;

    const purchase = selectedPurchase;

    handleCloseMenu();
    onView(purchase);
  };

  const handleOpenMenu = (event: MouseEvent<HTMLElement>, purchase: Purchase) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedPurchase(purchase);
  };


  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedPurchase(null);
  };


  const handleEdit = () => {
    if (!selectedPurchase) return;

    const purchase = selectedPurchase;

    handleCloseMenu();
    onEdit(purchase);
  };


  const handleComplete = () => {
    if (!selectedPurchase) return;

    const purchase = selectedPurchase;

    handleCloseMenu();
    onComplete(purchase);
  };


  const handleCancel = () => {
    if (!selectedPurchase) return;

    const purchase = selectedPurchase;

    handleCloseMenu();
    onCancel(purchase);
  };


  const columns = useMemo<GridColDef<Purchase>[]>(() => [
    {
      field: "purchase_number",
      headerName: "Compra",
      minWidth: 150,
      flex: 1.3,
      sortable: false,
      renderCell: (params) => {
        const purchase = params.row;

        return (
          <Stack 
            
            direction="row"
            spacing={1.25}
            sx={{
              width: "100%",
              alignItems: "center",
            }}
            >
            <Box
              sx={{
                width: 34,
                height: 34,
                flexShrink: 0,
                borderRadius: "5px",
                bgcolor: "primary.light",
                color: "primary.main",
                display: "grid",
                placeItems: "center",
              }}
            >
              <ShoppingCartRounded sx={{ fontSize: 19 }} />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  overflow: "hidden",
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                { purchase.purchase_number }
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontSize: "0.75rem",
                }}
              >
                { purchase.supplier_invoice_number
                  ? `Factura: ${purchase.supplier_invoice_number}`
                  : "Sin número de factura" }
              </Typography>
            </Box>
          </Stack>
        );
      },
    },

    {
      field: "supplier_name",
      headerName: "Proveedor",
      minWidth: 120,
      flex: 0.7,
      sortable: false,
      renderCell: (params) => (
        <Typography
          sx={{
            fontSize: "0.82rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          { params.row.supplier_name }
        </Typography>
      ),
    },

    {
      field: "purchase_date",
      headerName: "Fecha",
      width: 90,
      sortable: false,
      renderCell: (params) => (
        <Typography sx={{ fontSize: "0.82rem" }}>
          { formatDate(params.row.purchase_date) }
        </Typography>
      ),
    },

    {
      field: "payment_method",
      headerName: "Método",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Chip
          label={ params.row.payment_method_display }
          size="small"
          variant="outlined"
          sx={{
            height: 26,
            borderRadius: "5px",
            fontSize: "0.72rem",
            fontWeight: 600,
          }}
        />
      ),
    },

    {
      field: "total",
      headerName: "Total",
      width: 130,
      align: "right",
      headerAlign: "right",
      sortable: false,
      renderCell: (params) => (
        <Typography sx={{ fontSize: "0.84rem", fontWeight: 700 }}>
          { formatCurrency(params.row.total) }
        </Typography>
      ),
    },

    {
      field: "status",
      headerName: "Estado",
      width: 130,
      sortable: false,
      renderCell: (params) => (
        <PurchaseStatusChip status={ params.row.status } label={ params.row.status_display } />
      ),
    },

    {
      field: "actions",
      headerName: "",
      width: 60,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      align: "center",
      renderCell: (params) => { 
        return (
          <Tooltip title="Acciones">
            <IconButton
              size="small"
              onClick={ (event) => handleOpenMenu(event, params.row) }
              sx={{
                width: 34,
                height: 34,
                borderRadius: "5px",
              }}
            >
              <MoreVertRounded fontSize="small" />
            </IconButton>
          </Tooltip>
        );
      },
    },
  ], [formatCurrency]);


  const totalPages = Math.max(
    1,
    Math.ceil(
      totalPurchases /
        paginationModel.pageSize,
    ),
  );


  const firstVisibleSupplier =
    totalPurchases === 0
      ? 0
      : paginationModel.page *
          paginationModel.pageSize +
        1;


  const lastVisibleSupplier =
    totalPurchases === 0
      ? 0
      : Math.min(
          firstVisibleSupplier +
            purchases.length -
            1,
          totalPurchases,
        );


  const noRowsMessage =
    search.trim()
      ? "No se encontraron proveedores con esa búsqueda."
      : "Todavía no hay proveedores registrados.";


  const handlePageChange = (_event: unknown, page: number) => {
    onPaginationModelChange({
      ...paginationModel,
      page: page - 1,
    });
  };


  const handlePageSizeChange = (pageSize: number) => {
    onPaginationModelChange({
      page: 0,
      pageSize,
    });
  };


  return (
    <>
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          bgcolor: "#FFFFFF",
          borderRadius: "15px",
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.8,
            display: "flex",
            alignItems: {
              xs: "stretch",
              sm: "center",
            },
            flexDirection: {
              xs: "column",
              sm: "row",
            },
            gap: 1.5,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <TextField
            value={ search }
            onChange={ (event) => onSearchChange(event.target.value) }
            placeholder="Buscar compra, factura o proveedor"
            size="small"
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded sx={{ color: "text.secondary", fontSize: 21 }} />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={ () => onSearchChange("") }>
                      <ClearRounded sx={{ fontSize: 19 }} />
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
              },
            }}
            sx={{
              maxWidth: {
                xs: "100%",
                sm: 430,
              },
              "& .MuiOutlinedInput-root": {
                minHeight: 40,
                borderRadius: "15px",
                bgcolor: "#FFFFFF",
              },
            }}
          />

          <TextField
            select
            size="small"
            label="Estado"
            value={ statusFilter }
            onChange={ (event) => onStatusFilterChange(event.target.value as PurchaseStatusFilter) }
            sx={{
              width: {
                xs: "100%",
                sm: 150,
              },
              "& .MuiOutlinedInput-root": {
                minHeight: 40,
                borderRadius: "15px",
                bgcolor: "#FFFFFF",
              },
            }}
          >
            <MenuItem value="ALL">Todos</MenuItem>
            <MenuItem value="DRAFT">Borrador</MenuItem>
            <MenuItem value="COMPLETED">Completada</MenuItem>
            <MenuItem value="CANCELLED">Cancelada</MenuItem>
          </TextField>

          <TextField
            select
            size="small"
            label="Método de pago"
            value={ paymentMethodFilter }
            onChange={ (event) => onPaymentMethodFilterChange(event.target.value as PurchasePaymentMethodFilter) }
            sx={{
              width: {
                xs: "100%",
                sm: 180,
              },
              "& .MuiOutlinedInput-root": {
                minHeight: 40,
                borderRadius: "15px",
                bgcolor: "#FFFFFF",
              },
            }}
          >
            <MenuItem value="ALL">Todos</MenuItem>
            <MenuItem value="CASH">Efectivo</MenuItem>
            <MenuItem value="TRANSFER">Transferencia</MenuItem>
            <MenuItem value="CARD">Tarjeta</MenuItem>
            <MenuItem value="SUPPLIER_CREDIT">Crédito proveedor</MenuItem>
            <MenuItem value="OTHER">Otro</MenuItem>
          </TextField>

          {hasActiveFilters && (
            <Tooltip title="Limpiar filtros">
              <IconButton
                onClick={ onClearFilters }
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "15px",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <FilterAltOffRounded fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          <Box sx={{ flex: 1 }} />

          <Tooltip title="Actualizar">
            <span>
              <IconButton
                onClick={ onRefresh }
                disabled={ loading }
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "15px",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <RefreshRounded fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>


        <DataGrid
            rows={ purchases }
            columns={ columns }
            loading={ loading }
            rowCount={ totalPurchases }
            paginationMode="server"
            paginationModel={ paginationModel }
            onPaginationModelChange={ onPaginationModelChange }
            pageSizeOptions={ [5, 10, 20, 50, 100] }
            checkboxSelection
            disableRowSelectionOnClick
            disableColumnSorting
            disableColumnFilter
            disableColumnMenu
            hideFooter
            rowHeight={ 62 }
            columnHeaderHeight={ 46 }
            localeText={{
              ...esES.components
                .MuiDataGrid
                .defaultProps
                .localeText,
    
              noRowsLabel:
                noRowsMessage,
    
              noResultsOverlayLabel:
                noRowsMessage,
            }}
            sx={{
            border: 0,

            "& .MuiDataGrid-columnHeaders":
                {
                bgcolor:
                    "#F7F8F6",

                borderBottom:
                    "1px solid",

                borderColor:
                    "divider",
                },

            "& .MuiDataGrid-columnHeaderTitle":
                {
                fontSize:
                    "0.78rem",

                fontWeight: 700,
                },

            "& .MuiDataGrid-cell":
                {
                display: "flex",

                alignItems:
                    "center",

                borderColor:
                    "divider",

                fontSize:
                    "0.82rem",
                },

            "& .MuiDataGrid-row:hover":
                {
                bgcolor:
                    "action.hover",
                },

            "& .MuiDataGrid-columnSeparator":
                {
                display: "none",
                },

            "& .MuiCheckbox-root":
                {
                p: 0.75,
                },

            "& .MuiDataGrid-overlay":
                {
                minHeight: 180,

                color:
                    "text.secondary",

                fontSize:
                    "0.9rem",
                },
            }}
            slots={{
              noRowsOverlay: EmptyPurchases,
            }}
        />

        {/* PAGINACIÓN */}
        <Stack
            direction={{
                xs: "column",
                md: "row",
            }}
            spacing={1.5}
            sx={{
                px: 2,
                py: 1.5,

                alignItems: {
                    xs: "stretch",
                    md: "center",
                },

                justifyContent: "space-between",

                borderTop: "1px solid",

                borderColor: "divider",
            }}
        >
            <Stack
                direction="row"
                spacing={1.25}
                sx={{
                    alignItems: "center",
                }}
            >
            <Typography
                variant="body2"
                sx={{
                fontWeight: 700,
                }}
            >
                Resultado{" "}
                {firstVisibleSupplier}-
                {lastVisibleSupplier} de{" "}
                {totalPurchases}
            </Typography>

            <TextField
                select
                size="small"

                value={
                paginationModel.pageSize
                }

                onChange={(event) => {
                onPaginationModelChange(
                    {
                    page: 0,

                    pageSize:
                        Number(
                        event.target
                            .value,
                        ),
                    },
                );
                }}

                sx={{
                width: 76,

                "& .MuiOutlinedInput-root":
                    {
                    height: 34,

                    borderRadius:
                        "5px",
                    },
                }}
            >
                {[
                5,
                10,
                20,
                50,
                100,
                ].map(
                (option) => (
                    <MenuItem
                    key={option}
                    value={option}
                    >
                    {option}
                    </MenuItem>
                ),
                )}
            </TextField>
            </Stack>


            <Stack
            direction="row"
            spacing={0.75}
            sx={{
                alignItems: "center",

                justifyContent: {
                xs: "space-between",
                md: "flex-end",
                },
            }}
            >
            <Button
                type="button"
                variant="outlined"
                size="small"

                startIcon={
                <ArrowBackRounded />
                }

                disabled={
                paginationModel.page ===
                    0 ||
                loading
                }

                onClick={() => {
                onPaginationModelChange(
                    {
                    ...paginationModel,

                    page:
                        paginationModel.page -
                        1,
                    },
                );
                }}

                sx={{
                borderRadius:
                    "5px",
                }}
            >
                Anterior
            </Button>


            <Pagination
                count={totalPages}

                page={
                paginationModel.page +
                1
                }

                onChange={(
                _event,
                newPage,
                ) => {
                onPaginationModelChange(
                    {
                    ...paginationModel,

                    page:
                        newPage -
                        1,
                    },
                );
                }}

                disabled={loading}

                shape="rounded"

                size="small"

                siblingCount={1}

                boundaryCount={1}

                hidePrevButton

                hideNextButton

                sx={{
                display: {
                    xs: "none",
                    sm: "block",
                },

                "& .MuiPaginationItem-root":
                    {
                    border:
                        "1px solid",

                    borderColor:
                        "divider",

                    borderRadius:
                        "5px",
                    },

                "& .Mui-selected":
                    {
                    color:
                        "primary.main",

                    bgcolor:
                        "transparent !important",

                    borderColor:
                        "primary.main",
                    },
                }}
            />


            <Button
                type="button"
                variant="outlined"
                size="small"

                endIcon={
                <ArrowForwardRounded />
                }

                disabled={
                paginationModel.page >=
                    totalPages - 1 ||
                loading
                }

                onClick={() => {
                onPaginationModelChange(
                    {
                    ...paginationModel,

                    page:
                        paginationModel.page +
                        1,
                    },
                );
                }}

                sx={{
                borderRadius:
                    "5px",
                }}
            >
                Siguiente
            </Button>
            </Stack>
        </Stack>
        
      </Paper>


      <Menu
        anchorEl={ anchorEl }
        open={ menuOpen }
        onClose={ handleCloseMenu }
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 190,
              borderRadius: "5px",
              mt: 0.5,
            },
          },
        }}
      >

        <MenuItem onClick={ handleView } sx={{ gap: 1.2, fontSize: "0.84rem" }}>
          <VisibilityRounded sx={{ fontSize: 19 }} />
          Ver detalle
        </MenuItem>
        { selectedPurchase?.status === "DRAFT" && (
          <MenuItem onClick={ handleEdit } sx={{ gap: 1.2, fontSize: "0.84rem" }}>
            <EditRounded sx={{ fontSize: 19 }} />
            Editar compra
          </MenuItem>
        ) }


        { selectedPurchase?.status === "DRAFT" && (
          <MenuItem onClick={ handleComplete } sx={{ gap: 1.2, fontSize: "0.84rem" }}>
            <CheckCircleRounded sx={{ fontSize: 19 }} />
            Completar compra
          </MenuItem>
        ) }


        { selectedPurchase && selectedPurchase.status !== "CANCELLED" && (
          <MenuItem
            onClick={ handleCancel }
            sx={{
              gap: 1.2,
              fontSize: "0.84rem",
              color: "error.main",
            }}
          >
            <CancelRounded sx={{ fontSize: 19 }} />
            Cancelar compra
          </MenuItem>
        ) }
      </Menu>
    </>
  );
}


type PurchaseStatusChipProps = {
  status: PurchaseStatus;
  label: string;
};


function PurchaseStatusChip({ status, label }: PurchaseStatusChipProps) {
  if (status === "COMPLETED") {
    return (
      <Chip
        label={ label }
        size="small"
        sx={{
          height: 26,
          borderRadius: "14px",
          bgcolor: "rgba(16, 126, 64, 0.10)",
          color: "#107E40",
          fontSize: "0.72rem",
          fontWeight: 700,
        }}
      />
    );
  }

  if (status === "CANCELLED") {
    return (
      <Chip
        label={ label }
        size="small"
        sx={{
          height: 26,
          borderRadius: "14px",
          bgcolor: "rgba(211, 47, 47, 0.10)",
          color: "#991B1B",
          fontSize: "0.72rem",
          fontWeight: 700,
        }}
      />
    );
  }

  return (
    <Chip
      label={ label }
      size="small"
      sx={{
        height: 26,
        borderRadius: "14px",
        bgcolor: "rgba(237, 108, 2, 0.10)",
        color: "warning.dark",
        fontSize: "0.72rem",
        fontWeight: 700,
      }}
    />
  );
}


function formatDate(value: string) {
  if (!value) return "-";

  const parts = value.split("-");

  if (parts.length !== 3) return value;

  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}


function getPaginationLabel(page: number, pageSize: number, total: number) {
  if (total === 0) {
    return "0 de 0";
  }

  const from = page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, total);

  return `${from}-${to} de ${total}`;
}


function EmptyPurchases() {
  return (
    <Stack 
      sx={{
        height: "100%",
        minHeight: 160,
        alignItems: "center",
        justifyContent: "center",
        spacing: 0.6,
      }}
    >
      <ShoppingCartRounded sx={{ fontSize: 32, color: "text.disabled" }} />

      <Typography sx={{ fontSize: "0.86rem", fontWeight: 700 }}>
        No hay compras
      </Typography>

      <Typography color="text.secondary" sx={{ fontSize: "0.76rem" }}>
        No se encontraron compras para mostrar.
      </Typography>
    </Stack>
  );
}