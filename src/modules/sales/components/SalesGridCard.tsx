import {
  ArrowBackRounded,
  ArrowForwardRounded,
  CleaningServicesOutlined,
  ClearRounded,
  PrintRounded,
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

import {
  useMemo,
} from "react";

import type {
  SaleListItem,
  SaleStatus,
} from "../types/sales.types";

export type SaleStatusFilter =
  | "ALL"
  | "COMPLETED"
  | "CANCELLED";

type SalesGridCardProps = {
  sales: SaleListItem[];

  totalSales: number;

  loading: boolean;

  search: string;

  statusFilter:
    SaleStatusFilter;

  paginationModel:
    GridPaginationModel;

  hasActiveFilters: boolean;

  onSearchChange: (
    value: string,
  ) => void;

  onStatusFilterChange: (
    value: SaleStatusFilter,
  ) => void;

  onPaginationModelChange: (
    model: GridPaginationModel,
  ) => void;

  onClearFilters: () => void;

  onRefresh: () => void;

  onView: (
    sale: SaleListItem,
  ) => void;

  onPrint: (
    sale: SaleListItem,
  ) => void;

  formatCurrency: (
    value: string | number,
  ) => string;

  formatDateTime: (
    value:
      | string
      | null
      | undefined,
  ) => string;
};

export function SalesGridCard({
  sales,
  totalSales,
  loading,
  search,
  statusFilter,
  paginationModel,
  hasActiveFilters,
  onSearchChange,
  onStatusFilterChange,
  onPaginationModelChange,
  onClearFilters,
  onRefresh,
  onView,
  onPrint,
  formatCurrency,
  formatDateTime,
}: SalesGridCardProps) {

  const columns =
    useMemo<
      GridColDef<SaleListItem>[]
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
                  bgcolor:
                    "primary.light",
                  color:
                    "primary.main",
                  display: "grid",
                  placeItems:
                    "center",
                }}
              >
                <ReceiptLongRounded
                  sx={{
                    fontSize: 18,
                  }}
                />
              </Box>

              <Box
                sx={{
                  minWidth: 0,
                }}
              >
                <Typography
                  sx={{
                    overflow:
                      "hidden",
                    fontSize:
                      "0.88rem",
                    fontWeight: 700,
                    textOverflow:
                      "ellipsis",
                    whiteSpace:
                      "nowrap",
                  }}
                >
                  {row.sale_number}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color:
                      "text.secondary",
                    fontSize:
                      "0.75rem",
                  }}
                >
                  {row.item_count}{" "}
                  {row.item_count === 1
                    ? "producto"
                    : "productos"}
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

          renderCell: ({
            row,
          }) => (
            <Typography
              sx={{
                fontSize:
                  "0.82rem",
                whiteSpace:
                  "nowrap",
              }}
            >
              {formatDateTime(
                row.completed_at ??
                  row.created_at,
              )}
            </Typography>
          ),
        },

        {
          field: "customer_name",
          headerName: "Cliente",
          minWidth: 180,
          flex: 0.95,

          renderCell: ({
            row,
          }) => (
            <Typography
              sx={{
                overflow:
                  "hidden",
                textOverflow:
                  "ellipsis",
                whiteSpace:
                  "nowrap",
                fontSize:
                  "0.82rem",
              }}
            >
              {row.customer_name ||
                "Consumidor final"}
            </Typography>
          ),
        },

        {
          field: "created_by_name",
          headerName: "Vendedor",
          minWidth: 160,
          flex: 0.85,

          renderCell: ({
            row,
          }) => (
            <Typography
              sx={{
                overflow:
                  "hidden",
                textOverflow:
                  "ellipsis",
                whiteSpace:
                  "nowrap",
                fontSize:
                  "0.82rem",
              }}
            >
              {row.created_by_name ??
                "-"}
            </Typography>
          ),
        },

        {
          field: "subtotal",
          headerName: "Subtotal",
          width: 130,
          align: "right",
          headerAlign:
            "right",

          renderCell: ({
            row,
          }) => (
            <Typography
              variant="body2"
              sx={{
                width: "100%",
                fontWeight: 600,
                textAlign:
                  "right",
                whiteSpace:
                  "nowrap",
              }}
            >
              {formatCurrency(
                row.subtotal,
              )}
            </Typography>
          ),
        },

        {
          field: "discount_total",
          headerName:
            "Descuento",
          width: 130,
          align: "right",
          headerAlign:
            "right",

          renderCell: ({
            row,
          }) => (
            <Typography
              variant="body2"
              sx={{
                width: "100%",
                fontWeight: 600,
                textAlign:
                  "right",
                whiteSpace:
                  "nowrap",
              }}
            >
              {formatCurrency(
                row.discount_total,
              )}
            </Typography>
          ),
        },

        {
          field: "total",
          headerName: "Total",
          width: 135,
          align: "right",
          headerAlign:
            "right",

          renderCell: ({
            row,
          }) => (
            <Typography
              variant="body2"
              sx={{
                width: "100%",
                fontWeight: 700,
                textAlign:
                  "right",
                whiteSpace:
                  "nowrap",
              }}
            >
              {formatCurrency(
                row.total,
              )}
            </Typography>
          ),
        },

        {
          field: "status",
          headerName: "Estado",
          width: 130,
          align: "center",
          headerAlign:
            "center",

          renderCell: ({
            row,
          }) => {
            const status =
              row.status as SaleStatus;

            const completed =
              status ===
              "COMPLETED";

            const cancelled =
              status ===
              "CANCELLED";

            return (
              <Chip
                label={
                  row.status_display
                }
                size="small"
                sx={{
                  height: 26,
                  borderRadius:
                    "14px",
                  fontSize:
                    "0.76rem",
                  fontWeight: 600,

                  color:
                    completed
                      ? "#166534"
                      : cancelled
                        ? "#991B1B"
                        : "#854D0E",

                  bgcolor:
                    completed
                      ? "#DCFCE7"
                      : cancelled
                        ? "#FEE2E2"
                        : "#FEF9C3",
                }}
              />
            );
          },
        },

        {
          field: "actions",
          type: "actions",
          headerName: "Acción",
          width: 85,
          align: "center",
          headerAlign:
            "center",

          getActions: ({
            row,
          }) => [
            <GridActionsCellItem
              key="view"
              icon={
                <VisibilityRounded />
              }
              label="Ver detalle"
              showInMenu
              onClick={() => {
                onView(row);
              }}
            />,

            <GridActionsCellItem
              key="print"
              icon={
                <PrintRounded />
              }
              label="Imprimir recibo"
              showInMenu
              disabled={
                row.status !==
                "COMPLETED"
              }
              onClick={() => {
                onPrint(row);
              }}
            />,
          ],
        },
      ],
      [
        formatCurrency,
        formatDateTime,
        onPrint,
        onView,
      ],
    );

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalSales /
          paginationModel.pageSize,
      ),
    );

  const firstVisibleSale =
    totalSales === 0
      ? 0
      : paginationModel.page *
          paginationModel.pageSize +
        1;

  const lastVisibleSale =
    totalSales === 0
      ? 0
      : Math.min(
          firstVisibleSale +
            sales.length -
            1,
          totalSales,
        );

  const noRowsMessage =
    search.trim()
      ? "No se encontraron ventas con esa búsqueda."
      : "Todavía no hay ventas registradas.";

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
      {/* TOOLBAR */}

      <Stack
        spacing={{
          xs: 2,
          sm: 1.5,
        }}
        sx={{
          px: {
            xs: 2,
            sm: 2,
          },

          py: {
            xs: 2,
            sm: 1.5,
          },

          borderBottom:
            "1px solid",

          borderColor:
            "divider",
        }}
      >
        {/* BUSCADOR */}

        <TextField
          value={search}
          onChange={(
            event,
          ) => {
            onSearchChange(
              event.target.value,
            );
          }}
          placeholder="Buscar venta, cliente o vendedor"
          size="small"
          fullWidth
          sx={{
            maxWidth: {
              xs: "100%",
              sm: 360,
            },

            "& .MuiOutlinedInput-root":
              {
                borderRadius:
                  "15px",
                bgcolor:
                  "#FFFFFF",
              },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded
                    fontSize="small"
                    sx={{
                      color:
                        "text.secondary",
                    }}
                  />
                </InputAdornment>
              ),

              endAdornment:
                search ? (
                  <InputAdornment position="end">
                    <IconButton
                      type="button"
                      size="small"
                      aria-label="Limpiar búsqueda"
                      onClick={() => {
                        onSearchChange(
                          "",
                        );
                      }}
                    >
                      <ClearRounded
                        fontSize="small"
                      />
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
            },
          }}
        />

        {/* FILTROS */}

        <Box
          sx={{
            display: "grid",

            gridTemplateColumns: {
              xs: "1fr",
              sm: "180px auto",
            },

            gap: {
              xs: 1.5,
              sm: 1,
            },

            alignItems:
              "center",
          }}
        >
          {/* ESTADO */}

          <TextField
            select
            label="Estado"
            size="small"
            value={
              statusFilter
            }
            onChange={(
              event,
            ) => {
              onStatusFilterChange(
                event.target
                  .value as SaleStatusFilter,
              );
            }}
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root":
                {
                  borderRadius:
                    "15px",
                  bgcolor:
                    "#FFFFFF",
                },
            }}
          >
            <MenuItem value="ALL">
              Todos
            </MenuItem>

            <MenuItem value="COMPLETED">
              Completadas
            </MenuItem>

            <MenuItem value="CANCELLED">
              Canceladas
            </MenuItem>
          </TextField>

          {/* ACCIONES */}

          <Stack
            direction="row"
            spacing={1}
            sx={{
              width: {
                xs: "100%",
                sm: "auto",
              },

              justifyContent: {
                xs: "flex-end",
                sm: "flex-end",
              },

              alignItems:
                "center",
            }}
          >
            {/* LIMPIAR */}

            <Tooltip title="Limpiar filtros">
              <span>
                <IconButton
                  type="button"
                  disabled={
                    !hasActiveFilters ||
                    loading
                  }
                  onClick={
                    onClearFilters
                  }
                  sx={{
                    width: 40,
                    height: 40,

                    border:
                      "1px solid",

                    borderColor:
                      "divider",

                    borderRadius:
                      "10px",

                    bgcolor:
                      "#FFFFFF",
                  }}
                >
                  <CleaningServicesOutlined
                    fontSize="small"
                  />
                </IconButton>
              </span>
            </Tooltip>

            {/* ACTUALIZAR */}

            <Tooltip title="Actualizar ventas">
              <span>
                <IconButton
                  type="button"
                  disabled={
                    loading
                  }
                  onClick={
                    onRefresh
                  }
                  sx={{
                    width: 40,
                    height: 40,

                    border:
                      "1px solid",

                    borderColor:
                      "divider",

                    borderRadius:
                      "10px",

                    bgcolor:
                      "#FFFFFF",
                  }}
                >
                  {loading ? (
                    <CircularProgress
                      size={16}
                    />
                  ) : (
                    <RefreshRounded
                      fontSize="small"
                    />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Box>
      </Stack>

      {/* GRID */}

      <DataGrid
        autoHeight
        rows={sales}
        columns={columns}
        rowCount={
          totalSales
        }
        loading={loading}
        pagination
        paginationMode="server"
        paginationModel={
          paginationModel
        }
        onPaginationModelChange={
          onPaginationModelChange
        }
        pageSizeOptions={[
          5,
          10,
          20,
          50,
          100,
        ]}
        checkboxSelection
        disableRowSelectionOnClick
        disableColumnSorting
        disableColumnFilter
        hideFooter
        getRowId={(
          row,
        ) => row.id}
        rowHeight={62}
        columnHeaderHeight={
          46
        }
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
        slots={{
          noRowsOverlay:
            EmptySales,
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
              display:
                "flex",

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
              display:
                "none",
            },

          "& .MuiCheckbox-root":
            {
              p: 0.75,
            },

          "& .MuiDataGrid-overlay":
            {
              minHeight:
                180,

              color:
                "text.secondary",

              fontSize:
                "0.9rem",
            },
        }}
      />

      {/* FOOTER */}

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

          justifyContent:
            "space-between",

          borderTop:
            "1px solid",

          borderColor:
            "divider",
        }}
      >
        <Stack
          direction="row"
          spacing={1.25}
          sx={{
            alignItems:
              "center",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
            }}
          >
            Resultado{" "}
            {firstVisibleSale}-
            {lastVisibleSale} de{" "}
            {totalSales}
          </Typography>

          <TextField
            select
            size="small"
            value={
              paginationModel.pageSize
            }
            onChange={(
              event,
            ) => {
              onPaginationModelChange({
                page: 0,

                pageSize:
                  Number(
                    event.target
                      .value,
                  ),
              });
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
                  key={
                    option
                  }
                  value={
                    option
                  }
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
            alignItems:
              "center",

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
              onPaginationModelChange({
                ...paginationModel,

                page:
                  paginationModel.page -
                  1,
              });
            }}
            sx={{
              borderRadius:
                "5px",
            }}
          >
            Anterior
          </Button>

          <Pagination
            count={
              totalPages
            }
            page={
              paginationModel.page +
              1
            }
            onChange={(
              _event,
              newPage,
            ) => {
              onPaginationModelChange({
                ...paginationModel,

                page:
                  newPage -
                  1,
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
              onPaginationModelChange({
                ...paginationModel,

                page:
                  paginationModel.page +
                  1,
              });
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
  );
}

function EmptySales() {
  return (
    <Stack
      sx={{
        height: "100%",
        minHeight: 160,
        alignItems:
          "center",
        justifyContent:
          "center",
        spacing: 0.6,
      }}
    >
      <ReceiptLongRounded
        sx={{
          fontSize: 32,
          color:
            "text.disabled",
        }}
      />

      <Typography
        sx={{
          fontSize:
            "0.86rem",
          fontWeight: 700,
        }}
      >
        No hay ventas
      </Typography>

      <Typography
        color="text.secondary"
        sx={{
          fontSize:
            "0.76rem",
        }}
      >
        No se encontraron
        ventas para mostrar.
      </Typography>
    </Stack>
  );
}