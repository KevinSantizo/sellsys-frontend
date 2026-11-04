import {
  ArrowBackRounded,
  ArrowForwardRounded,
  CleaningServicesOutlined,
  ClearRounded,
  PaymentsRounded,
  ReceiptLongRounded,
  RefreshRounded,
  SearchRounded,
  VisibilityRounded,
} from "@mui/icons-material";

import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
  type GridPaginationModel,
} from "@mui/x-data-grid";

import { esES } from "@mui/x-data-grid/locales";

import { useMemo } from "react";

import type {
  AccountsReceivableItem,
} from "../types/sales.types";

type AccountsReceivableGridCardProps = {
    receivables: AccountsReceivableItem[];
    totalReceivables: number;
    loading: boolean;

    search: string;
    paginationModel: GridPaginationModel;
    hasActiveFilters: boolean;

    onSearchChange: (value: string) => void;

    onPaginationModelChange: (
    model: GridPaginationModel,
    ) => void;

    onClearFilters: () => void;
    onRefresh: () => void;
    onAddPayment: ( receivable: AccountsReceivableItem,) => void;
    onView: ( receivable: AccountsReceivableItem,) => void;

    formatCurrency: (
    value: string | number,
    ) => string;

    formatDateTime: (
    value: string | null | undefined,
    ) => string;
};

export function AccountsReceivableGridCard({
  receivables,
  totalReceivables,
  loading,
  search,
  paginationModel,
  hasActiveFilters,
  onSearchChange,
  onPaginationModelChange,
  onClearFilters,
  onRefresh,
  onView,
  onAddPayment,
  formatCurrency,
  formatDateTime,
}: AccountsReceivableGridCardProps) {
  const columns = useMemo<
    GridColDef<AccountsReceivableItem>[]
  >(
    () => [
      {
        field: "sale_number",
        headerName: "Venta",
        minWidth: 210,
        flex: 1.1,
        renderCell: ({ row }) => (
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
              <ReceiptLongRounded
                sx={{ fontSize: 18 }}
              />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  overflow: "hidden",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {row.sale_number}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontSize: "0.75rem",
                }}
              >
                {row.payment_count}{" "}
                {row.payment_count === 1
                  ? "abono"
                  : "abonos"}
              </Typography>
            </Box>
          </Stack>
        ),
      },

      {
        field: "completed_at",
        headerName: "Fecha",
        minWidth: 170,
        flex: 0.85,
        renderCell: ({ row }) => (
          <Typography
            sx={{
              fontSize: "0.82rem",
              whiteSpace: "nowrap",
            }}
          >
            {formatDateTime(
              row.completed_at ?? row.created_at,
            )}
          </Typography>
        ),
      },

      {
        field: "customer_name",
        headerName: "Cliente",
        minWidth: 190,
        flex: 1,
        renderCell: ({ row }) => (
          <Typography
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: "0.82rem",
            }}
          >
            {row.customer_name}
          </Typography>
        ),
      },

      {
        field: "total",
        headerName: "Total",
        width: 135,
        align: "right",
        headerAlign: "right",
        renderCell: ({ row }) => (
          <Typography
            sx={{
              width: "100%",
              textAlign: "right",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {formatCurrency(row.total)}
          </Typography>
        ),
      },

      {
        field: "paid_total",
        headerName: "Pagado",
        width: 135,
        align: "right",
        headerAlign: "right",
        renderCell: ({ row }) => (
          <Typography
            sx={{
              width: "100%",
              textAlign: "right",
              fontWeight: 600,
              whiteSpace: "nowrap",
              color: "#166534",
            }}
          >
            {formatCurrency(row.paid_total)}
          </Typography>
        ),
      },

      {
        field: "balance_due",
        headerName: "Pendiente",
        width: 145,
        align: "right",
        headerAlign: "right",
        renderCell: ({ row }) => (
          <Typography
            sx={{
              width: "100%",
              textAlign: "right",
              fontWeight: 600,
              whiteSpace: "nowrap",
              color: "#B91C1C",
            }}
          >
            {formatCurrency(row.balance_due)}
          </Typography>
        ),
      },

      {
        field: "payment_count",
        headerName: "Abonos",
        width: 105,
        align: "center",
        headerAlign: "center",
        renderCell: ({ row }) => (
          <Chip
            label={row.payment_count}
            size="small"
            sx={{
              height: 26,
              minWidth: 34,
              borderRadius: "14px",
              fontSize: "0.76rem",
              fontWeight: 600,
              color: "#854D0E",
              bgcolor: "#FEF3C7",
            }}
          />
        ),
      },

      {
        field: "actions",
        type: "actions",
        headerName: "Acción",
        width: 85,
        align: "center",
        headerAlign: "center",
        getActions: ({ row }) => [
        <GridActionsCellItem
            key="view"
            icon={<VisibilityRounded />}
            label="Ver detalle"
            showInMenu
            onClick={() => onView(row)}
        />,

        <GridActionsCellItem
            key="payment"
            icon={<PaymentsRounded />}
            label="Registrar abono"
            showInMenu
            onClick={() => onAddPayment(row)}
        />,
        ],
      },
    ],
    [
      formatCurrency,
      formatDateTime,
      onView,
      onAddPayment,
    ],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalReceivables /
        paginationModel.pageSize,
    ),
  );

  const firstVisible =
    totalReceivables === 0
      ? 0
      : paginationModel.page *
          paginationModel.pageSize +
        1;

  const lastVisible =
    totalReceivables === 0
      ? 0
      : Math.min(
          firstVisible +
            receivables.length -
            1,
          totalReceivables,
        );

  const noRowsMessage = search.trim()
    ? "No se encontraron cuentas por cobrar."
    : "No hay cuentas por cobrar registradas.";

  return (
    <Paper
      variant="outlined"
      sx={{
        bgcolor: "#FFFFFF",
        borderRadius: "15px",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      <Stack
        spacing={{
          xs: 2,
          sm: 1.5,
        }}
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <TextField
          value={search}
          onChange={(event) => {
            onSearchChange(
              event.target.value,
            );
          }}
          placeholder="Buscar venta o cliente"
          size="small"
          fullWidth
          sx={{
            maxWidth: {
              xs: "100%",
              sm: 360,
            },
            "& .MuiOutlinedInput-root": {
              borderRadius: "15px",
              bgcolor: "#FFFFFF",
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded
                    fontSize="small"
                    sx={{
                      color: "text.secondary",
                    }}
                  />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton
                    type="button"
                    size="small"
                    aria-label="Limpiar búsqueda"
                    onClick={() => {
                      onSearchChange("");
                    }}
                  >
                    <ClearRounded fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            },
          }}
        />

        <Stack
          direction="row"
          spacing={1}
          sx={{
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <Tooltip title="Limpiar filtros">
            <span>
              <IconButton
                type="button"
                disabled={
                  !hasActiveFilters || loading
                }
                onClick={onClearFilters}
                sx={{
                  width: 40,
                  height: 40,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: "10px",
                  bgcolor: "#FFFFFF",
                }}
              >
                <CleaningServicesOutlined
                  fontSize="small"
                />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Actualizar cuentas por cobrar">
            <span>
              <IconButton
                type="button"
                disabled={loading}
                onClick={onRefresh}
                sx={{
                  width: 40,
                  height: 40,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: "10px",
                  bgcolor: "#FFFFFF",
                }}
              >
                {loading ? (
                  <CircularProgress size={16} />
                ) : (
                  <RefreshRounded fontSize="small" />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>

      <DataGrid
        autoHeight
        rows={receivables}
        columns={columns}
        rowCount={totalReceivables}
        loading={loading}
        pagination
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={
          onPaginationModelChange
        }
        pageSizeOptions={[5, 10, 20, 50, 100]}
        checkboxSelection
        disableRowSelectionOnClick
        disableColumnSorting
        disableColumnFilter
        hideFooter
        getRowId={(row) => row.id}
        rowHeight={62}
        columnHeaderHeight={46}
        localeText={{
          ...esES.components.MuiDataGrid
            .defaultProps.localeText,
          noRowsLabel: noRowsMessage,
          noResultsOverlayLabel: noRowsMessage,
        }}
        slots={{
          noRowsOverlay: EmptyAccountsReceivable,
        }}
        sx={{
          border: 0,

          "& .MuiDataGrid-columnHeaders": {
            bgcolor: "#F7F8F6",
            borderBottom: "1px solid",
            borderColor: "divider",
          },

          "& .MuiDataGrid-columnHeaderTitle": {
            fontSize: "0.78rem",
            fontWeight: 600,
          },

          "& .MuiDataGrid-cell": {
            display: "flex",
            alignItems: "center",
            borderColor: "divider",
            fontSize: "0.82rem",
          },

          "& .MuiDataGrid-row:hover": {
            bgcolor: "action.hover",
          },

          "& .MuiDataGrid-columnSeparator": {
            display: "none",
          },

          "& .MuiCheckbox-root": {
            p: 0.75,
          },

          "& .MuiDataGrid-overlay": {
            minHeight: 180,
            color: "text.secondary",
            fontSize: "0.9rem",
          },
        }}
      />

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
            sx={{ fontWeight: 600 }}
          >
            Resultado {firstVisible}-
            {lastVisible} de {totalReceivables}
          </Typography>

          <TextField
            select
            size="small"
            value={paginationModel.pageSize}
            onChange={(event) => {
              onPaginationModelChange({
                page: 0,
                pageSize: Number(
                  event.target.value,
                ),
              });
            }}
            sx={{
              width: 76,
              "& .MuiOutlinedInput-root": {
                height: 34,
                borderRadius: "5px",
              },
            }}
          >
            {[5, 10, 20, 50, 100].map(
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
            startIcon={<ArrowBackRounded />}
            disabled={
              paginationModel.page === 0 ||
              loading
            }
            onClick={() => {
              onPaginationModelChange({
                ...paginationModel,
                page: paginationModel.page - 1,
              });
            }}
            sx={{ borderRadius: "5px" }}
          >
            Anterior
          </Button>

          <Pagination
            count={totalPages}
            page={paginationModel.page + 1}
            onChange={(_event, newPage) => {
              onPaginationModelChange({
                ...paginationModel,
                page: newPage - 1,
              });
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
              "& .MuiPaginationItem-root": {
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "5px",
              },
              "& .Mui-selected": {
                color: "primary.main",
                bgcolor:
                  "transparent !important",
                borderColor: "primary.main",
              },
            }}
          />

          <Button
            type="button"
            variant="outlined"
            size="small"
            endIcon={<ArrowForwardRounded />}
            disabled={
              paginationModel.page >=
                totalPages - 1 ||
              loading
            }
            onClick={() => {
              onPaginationModelChange({
                ...paginationModel,
                page: paginationModel.page + 1,
              });
            }}
            sx={{ borderRadius: "5px" }}
          >
            Siguiente
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

function EmptyAccountsReceivable() {
  return (
    <Stack
      sx={{
        height: "100%",
        minHeight: 160,
        alignItems: "center",
        justifyContent: "center",
        gap: 0.6,
      }}
    >
      <ReceiptLongRounded
        sx={{
          fontSize: 32,
          color: "text.disabled",
        }}
      />

      <Typography
        sx={{
          fontSize: "0.86rem",
          fontWeight: 600,
        }}
      >
        No hay cuentas por cobrar
      </Typography>

      <Typography
        color="text.secondary"
        sx={{ fontSize: "0.76rem" }}
      >
        No se encontraron ventas pendientes.
      </Typography>
    </Stack>
  );
}