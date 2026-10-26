import {
  ArrowBackRounded,
  ArrowForwardRounded, 
  CancelRounded, 
  CheckCircleRounded,
  ClearRounded,
  EditRounded,
  ReceiptLongRounded,
  RefreshRounded,
  SearchRounded,
  ShoppingCartRounded
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
  Expense,
} from "../types/expense";


type ExpensesGridCardProps = {
  expenses: Expense[];

  totalExpenses: number;

  loading: boolean;

  search: string;

  paginationModel:
    GridPaginationModel;

  onSearchChange: (
    value: string,
  ) => void;

  onPaginationModelChange: (
    model: GridPaginationModel,
  ) => void;

  onRefresh: () => void;

  onEdit: (
    expense: Expense,
  ) => void;

  onComplete: (
    expense: Expense,
  ) => void;

  onCancel: (
    expense: Expense,
  ) => void;

  formatCurrency: (
    value: string,
  ) => string;
};


export function ExpensesGridCard({
  expenses,
  totalExpenses,
  loading,
  search,
  paginationModel,
  onSearchChange,
  onPaginationModelChange,
  onRefresh,
  onEdit,
  onComplete,
  onCancel,
  formatCurrency,
}: ExpensesGridCardProps) {
  const columns =
    useMemo<GridColDef<Expense>[]>(
      () => [
        {
          field: "description",
          headerName: "Gasto",
          minWidth: 280,
          flex: 1.3,

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
                    overflow: "hidden",
                    fontSize: "0.88rem",
                    fontWeight: 700,
                    textOverflow:
                      "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {row.description}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color:
                      "text.secondary",
                    fontSize: "0.75rem",
                  }}
                >
                  Ref:{" "}
                  {row.reference || "—"}
                </Typography>
              </Box>
            </Stack>
          ),
        },

        {
          field: "category_name",
          headerName: "Categoría",
          minWidth: 150,
          flex: 0.75,

          renderCell: ({ row }) =>
            row.category_name ||
            "Sin categoría",
        },

        {
          field: "supplier_name",
          headerName: "Proveedor",
          minWidth: 180,
          flex: 0.9,

          renderCell: ({ row }) =>
            row.supplier_name ||
            "Sin proveedor",
        },

        {
          field: "expense_date",
          headerName: "Fecha",
          width: 130,

          renderCell: ({ row }) =>
            formatDate(
              row.expense_date,
            ),
        },

        {
          field:
            "payment_method_display",
          headerName: "Método",
          width: 140,

          renderCell: ({ row }) => (
            <Chip
              label={
                row.payment_method_display
              }
              size="small"
              variant="outlined"
              sx={{
                height: 26,
                borderRadius: "5px",
                fontSize: "0.78rem",
              }}
            />
          ),
        },

        {
          field: "amount",
          headerName: "Monto",
          width: 140,
          align: "right",
          headerAlign: "right",

          renderCell: ({ row }) => (
            <Typography
              variant="body2"
              sx={{
                width: "100%",
                fontWeight: 700,
                textAlign: "right",
                whiteSpace: "nowrap",
              }}
            >
              {formatCurrency(
                row.amount,
              )}
            </Typography>
          ),
        },

        {
          field: "status",
          headerName: "Estado",
          width: 125,
          align: "center",
          headerAlign: "center",

          renderCell: ({ row }) => {
            const statusStyle =
              getStatusStyle(
                row.status,
              );

            return (
              <Chip
                label={
                  row.status_display
                }
                size="small"
                sx={{
                  height: 26,
                  borderRadius: "14px",
                  fontSize: "0.76rem",
                  fontWeight: 600,
                  color:
                    statusStyle.color,
                  bgcolor:
                    statusStyle.bgcolor,
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
          headerAlign: "center",

          getActions: ({ row }) => {
            const actions = [];

            if (
              row.status ===
              "DRAFT"
            ) {
              actions.push(
                <GridActionsCellItem
                  key="edit"
                  icon={
                    <EditRounded />
                  }
                  label="Editar gasto"
                  showInMenu
                  onClick={() => {
                    onEdit(row);
                  }}
                />,
              );

              actions.push(
                <GridActionsCellItem
                  key="complete"
                  icon={
                    <CheckCircleRounded
                      sx={{
                        color:
                          "success.main",
                      }}
                    />
                  }
                  label={
                    <Typography
                      component="span"
                      sx={{
                        color:
                          "success.main",
                        fontSize:
                          "inherit",
                      }}
                    >
                      Completar gasto
                    </Typography>
                  }
                  showInMenu
                  onClick={() => {
                    onComplete(row);
                  }}
                />,
              );
            }

            if (
              row.status !==
              "CANCELLED"
            ) {
              actions.push(
                <GridActionsCellItem
                  key="cancel"
                  icon={
                    <CancelRounded
                      sx={{
                        color:
                          "error.main",
                      }}
                    />
                  }
                  label={
                    <Typography
                      component="span"
                      sx={{
                        color:
                          "error.main",
                        fontSize:
                          "inherit",
                      }}
                    >
                      Cancelar gasto
                    </Typography>
                  }
                  showInMenu
                  onClick={() => {
                    onCancel(row);
                  }}
                />,
              );
            }

            return actions;
          },
        },
      ],
      [
        formatCurrency,
        onEdit,
        onComplete,
        onCancel,
      ],
    );


  const totalPages = Math.max(
    1,
    Math.ceil(
      totalExpenses /
        paginationModel.pageSize,
    ),
  );


  const firstVisibleExpense =
    totalExpenses === 0
      ? 0
      : paginationModel.page *
          paginationModel.pageSize +
        1;


  const lastVisibleExpense =
    totalExpenses === 0
      ? 0
      : Math.min(
          firstVisibleExpense +
            expenses.length -
            1,
          totalExpenses,
        );


  const noRowsMessage =
    search.trim()
      ? "No se encontraron gastos con esa búsqueda."
      : "Todavía no hay gastos registrados.";


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
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={1}
        sx={{
          px: 2,
          py: 1.5,

          alignItems: {
            xs: "stretch",
            sm: "center",
          },

          justifyContent:
            "space-between",

          borderBottom:
            "1px solid",

          borderColor:
            "divider",

          ml: {
            xs: 0,
            lg: "auto",
          },

          flexWrap: {
            xs: "nowrap",
            md: "wrap",
          },
        }}
      >
        <TextField
          value={search}
          onChange={(event) => {
            onSearchChange(
              event.target.value,
            );
          }}
          placeholder="Buscar gasto"
          size="small"
          sx={{
            width: {
              xs: "100%",
              sm: 280,
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
            alignItems: "center",
            justifyContent:
              "flex-end",

            ml: {
              xs: 0,
              lg: "auto",
            },
          }}
        >
          <Tooltip title="Actualizar gastos">
            <span>
              <IconButton
                type="button"
                disabled={loading}
                onClick={onRefresh}
                sx={{
                  width: 40,
                  height: 40,

                  border:
                    "1px solid",

                  borderColor:
                    "divider",

                  borderRadius:
                    "15px",

                  bgcolor:
                    "#FFFFFF",
                }}
              >
                {loading ? (
                  <CircularProgress
                    size={18}
                  />
                ) : (
                  <RefreshRounded fontSize="small" />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>


      {/* GRID */}
      <DataGrid
        autoHeight
        rows={expenses}
        columns={columns}
        rowCount={
          totalExpenses
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
        getRowId={(row) =>
          row.id
        }
        rowHeight={62}
        columnHeaderHeight={46}
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
          noRowsOverlay: EmptyPurchases,
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
            {firstVisibleExpense}-
            {lastVisibleExpense} de{" "}
            {totalExpenses}
          </Typography>

          <TextField
            select
            size="small"
            value={
              paginationModel.pageSize
            }
            onChange={(event) => {
              onPaginationModelChange({
                page: 0,

                pageSize:
                  Number(
                    event.target.value,
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
            count={totalPages}
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
                  newPage - 1,
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


function formatDate(
  date: string,
) {
  const [
    year,
    month,
    day,
  ] = date.split("-");

  return `${day}/${month}/${year}`;
}


function getStatusStyle(
  status: Expense["status"],
) {
  switch (status) {
    case "COMPLETED":
      return {
        color: "#166534",
        bgcolor: "#DCFCE7",
      };

    case "CANCELLED":
      return {
        color: "#991B1B",
        bgcolor: "#FEE2E2",
      };

    default:
      return {
        color: "#854D0E",
        bgcolor: "#FEF9C3",
      };
  }
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
        No hay gastos
      </Typography>

      <Typography color="text.secondary" sx={{ fontSize: "0.76rem" }}>
        No se encontraron gastos para mostrar.
      </Typography>
    </Stack>
  );
}