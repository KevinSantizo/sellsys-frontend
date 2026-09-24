import {
  ArrowBackRounded,
  ArrowForwardRounded,
  ClearRounded,
  EditRounded,
  LocalShippingRounded,
  RefreshRounded,
  SearchRounded,
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
  Supplier,
} from "../types/supplier";


type SuppliersGridCardProps = { 
  suppliers: Supplier[]; 
  totalSuppliers: number; 
  loading: boolean; 
  search: string; 
  paginationModel: GridPaginationModel; 
  onEdit: ( supplier: Supplier,  ) => void; 
  onSearchChange: ( value: string,  ) => void; 
  onPaginationModelChange: ( model: GridPaginationModel, ) => void; 
  onRefresh: () => void;
};


export function SuppliersGridCard({
  suppliers,
  totalSuppliers,
  loading,
  search,
  paginationModel,
  onSearchChange,
  onPaginationModelChange,
  onRefresh,
  onEdit
}: SuppliersGridCardProps) {
  const columns =
    useMemo<GridColDef<Supplier>[]>(
      () => [
        {
          field: "name",
          headerName: "Proveedor",
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
                <LocalShippingRounded
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
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {row.name}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.75rem",
                  }}
                >
                  Tel:{" "}
                  {row.phone || "—"}
                </Typography>
              </Box>
            </Stack>
          ),
        },

        {
          field: "tax_id",
          headerName: "NIT",
          minWidth: 140,
          flex: 0.7,

          renderCell: ({ row }) =>
            row.tax_id || "—",
        },

        {
          field: "contact_name",
          headerName: "Contacto",
          minWidth: 170,
          flex: 0.85,

          renderCell: ({ row }) =>
            row.contact_name || "—",
        },

        {
          field: "email",
          headerName: "Correo",
          minWidth: 220,
          flex: 1,

          renderCell: ({ row }) =>
            row.email || "—",
        },

        {
          field: "is_active",
          headerName: "Estado",
          width: 120,
          align: "center",
          headerAlign: "center",

          renderCell: ({ row }) => (
            <Chip
              label={
                row.is_active
                  ? "Activo"
                  : "Inactivo"
              }
              size="small"
              sx={{
                height: 26,
                borderRadius: "14px",
                fontSize: "0.76rem",
                fontWeight: 600,

                color:
                  row.is_active
                    ? "#166534"
                    : "#991B1B",

                bgcolor:
                  row.is_active
                    ? "#DCFCE7"
                    : "#FEE2E2",
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
              key="edit"
              icon={<EditRounded />}
              label="Editar proveedor"
              showInMenu
              onClick={() => {
                onEdit(row);
              }}
            />,
          ],
        },
      ],
      [onEdit],
    );


  const totalPages = Math.max(
    1,
    Math.ceil(
      totalSuppliers /
        paginationModel.pageSize,
    ),
  );


  const firstVisibleSupplier =
    totalSuppliers === 0
      ? 0
      : paginationModel.page *
          paginationModel.pageSize +
        1;


  const lastVisibleSupplier =
    totalSuppliers === 0
      ? 0
      : Math.min(
          firstVisibleSupplier +
            suppliers.length -
            1,
          totalSuppliers,
        );


  const noRowsMessage =
    search.trim()
      ? "No se encontraron proveedores con esa búsqueda."
      : "Todavía no hay proveedores registrados.";


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
        {/* BUSCADOR */}
        <TextField
          value={search}
          onChange={(event) => {
            onSearchChange(
              event.target.value,
            );
          }}
          placeholder="Buscar proveedor"
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


        {/* ACCIONES TOOLBAR */}
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
          <Tooltip title="Actualizar proveedores">
            <span>
              <IconButton
                type="button"
                disabled={loading}
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
        rows={suppliers} 
        columns={columns} 
        rowCount={totalSuppliers}
        loading={loading}
        pagination
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
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
        getRowId={(row) => row.id}

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
            {firstVisibleSupplier}-
            {lastVisibleSupplier} de{" "}
            {totalSuppliers}
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
            page={ paginationModel.page + 1 }
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
  );
}