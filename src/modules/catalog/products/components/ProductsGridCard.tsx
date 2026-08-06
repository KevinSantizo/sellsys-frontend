import {
  ArrowBackRounded,
  ArrowForwardRounded,
  ClearRounded,
  EditRounded,
  Inventory2Rounded,
  RefreshRounded,
  SearchRounded,
  FilterAltOffRounded,
  CleaningServicesOutlined,
  DeleteOutlineRounded,
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
  BrandOption,
  CategoryOption,
  Product,
  ProductStatusFilter,
  ProductTypeFilter,
} from "../types/product";

type ProductsGridCardProps = {
  products: Product[];
  totalProducts: number;
  loading: boolean;
  search: string;

  statusFilter:
    ProductStatusFilter;

  categoryFilter: string;
  categories: CategoryOption[];

  brandFilter: string;
  brands: BrandOption[];

  productTypeFilter:
    ProductTypeFilter;

  paginationModel:
    GridPaginationModel;

  onSearchChange: (
    value: string,
  ) => void;

  onStatusFilterChange: (
    value: ProductStatusFilter,
  ) => void;

  onCategoryFilterChange: (
    value: string,
  ) => void;

  onBrandFilterChange: (
    value: string,
  ) => void;

  onProductTypeFilterChange: (
    value: ProductTypeFilter,
  ) => void;

  onPaginationModelChange: (
    model: GridPaginationModel,
  ) => void;

  onRefresh: () => void;
  onEdit: (product: Product) => void;

  formatCurrency: (
    value: string,
  ) => string;

  hasActiveFilters: boolean;

  onClearFilters: () => void;

  onDelete: (
    product: Product,
  ) => void;
};

export function ProductsGridCard({
  products,
  totalProducts,
  loading,
  search,
  statusFilter,
  categoryFilter,
  categories,
 // brandFilter,
 // brands,
  productTypeFilter,
  paginationModel,
  hasActiveFilters,
  onSearchChange,
  onStatusFilterChange,
  onCategoryFilterChange,
 // onBrandFilterChange,
  onProductTypeFilterChange,
  onPaginationModelChange,
  onClearFilters,
  onRefresh,
  onEdit,
  formatCurrency,
  onDelete,
}: ProductsGridCardProps) {
  const columns =
    useMemo<GridColDef<Product>[]>(
      () => [
        {
          field: "name",
          headerName: "Producto",
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
                <Inventory2Rounded
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
                    color:
                      "text.secondary",
                    fontSize: "0.75rem",
                  }}
                >
                  SKU: {row.sku}
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
            row.category_name ??
            "Sin categoría",
        },
        {
          field: "brand_name",
          headerName: "Marca",
          minWidth: 140,
          flex: 0.7,
          renderCell: ({ row }) =>
            row.brand_name ??
            "Sin marca",
        },
        {
          field: "product_type_display",
          headerName: "Tipo",
          width: 125,
          renderCell: ({ row }) => (
            <Chip
              label={
                row.product_type_display
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
          field: "current_stock",
          headerName: "Stock",
          description:
            "Existencia disponible en la sucursal activa",
          width: 125,
          align: "center",
          headerAlign: "center",
          sortable: false,

          renderCell: ({ row }) => {
            if (!row.track_inventory) {
              return (
                <Chip
                  label="No aplica"
                  size="small"
                  variant="outlined"
                  sx={{
                    height: 26,
                    borderRadius: "5px",
                    color: "text.secondary",
                    fontSize: "0.75rem",
                  }}
                />
              );
            }

            const stock = Number(
              row.current_stock ?? 0,
            );

            const hasStock = stock > 0;

            return (
              <Chip
                label={`${stock.toLocaleString(
                  "es-GT",
                  {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 3,
                  },
                )} `}
                size="small"
                sx={{
                  height: 26,
                  borderRadius: "5px",
                  fontSize: "0.76rem",
                  fontWeight: 700,

                  color: hasStock
                    ? "#166534"
                    : "#991B1B",

                  bgcolor: hasStock
                    ? "#DCFCE7"
                    : "#FEE2E2",
                }}
              />
            );
          },
        },
        {
          field: "sale_price",
          headerName: "Precio",
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
                row.sale_price,
              )}
            </Typography>
          ),
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
                color: row.is_active
                  ? "#166534"
                  : "#991B1B",
                bgcolor: row.is_active
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
              label="Editar producto"
              showInMenu
              onClick={() => {
                onEdit(row);
              }}
            />,

            <GridActionsCellItem
              key="delete"
              icon={
                <DeleteOutlineRounded
                  sx={{
                    color: "error.main",
                  }}
                />
              }
              label={
                <Typography
                  component="span"
                  sx={{
                    color: "error.main",
                    fontSize: "inherit",
                  }}
                >
                  Eliminar producto
                </Typography>
              }
              showInMenu
              onClick={() => {
                onDelete(row);
              }}
            />,
          ],
        },
      ],
      [
        formatCurrency,
        onEdit,
        onDelete,
      ]
    );

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalProducts /
        paginationModel.pageSize,
    ),
  );

  const firstVisibleProduct =
    totalProducts === 0
      ? 0
      : paginationModel.page *
          paginationModel.pageSize +
        1;

  const lastVisibleProduct =
    totalProducts === 0
      ? 0
      : Math.min(
          firstVisibleProduct +
            products.length -
            1,
          totalProducts,
        );

  const noRowsMessage = search.trim()
    ? "No se encontraron productos con esa búsqueda."
    : "Todavía no hay productos registrados.";

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
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
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
          placeholder="Buscar producto"
          size="small"
          sx={{
            width: {
              xs: "100%",
              sm: 280,
            },

            "& .MuiOutlinedInput-root":
              {
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
                      color:
                        "text.secondary",
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
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={1}
          sx={{
            alignItems: {
              xs: "stretch",
              sm: "center",
            },

            justifyContent: "flex-end",

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
            select
            label="Estado"
            size="small"
            value={statusFilter}
            onChange={(event) => {
              onStatusFilterChange(
                event.target
                  .value as ProductStatusFilter,
              );
            }}
            sx={{
              width: {
                xs: "100%",
                sm: 150,
              },

              "& .MuiOutlinedInput-root": {
                borderRadius: "15px",
                bgcolor: "#FFFFFF",
              },
            }}
          >
            <MenuItem value="ALL">
              Todos
            </MenuItem>

            <MenuItem value="ACTIVE">
              Activos
            </MenuItem>

            <MenuItem value="INACTIVE">
              Inactivos
            </MenuItem>
          </TextField>

          <TextField
            select
            label="Categoría"
            size="small"
            value={categoryFilter}
            onChange={(event) => {
              onCategoryFilterChange(
                event.target.value,
              );
            }}
            disabled={loading}
            sx={{
              width: {
                xs: "100%",
                sm: 190,
              },

              "& .MuiOutlinedInput-root": {
                borderRadius: "15px",
                bgcolor: "#FFFFFF",
              },
            }}
          >
            <MenuItem value="ALL">
              Todas
            </MenuItem>

            {categories.map((category) => (
              <MenuItem
                key={category.id}
                value={category.id}
              >
                {category.name}
              </MenuItem>
            ))}
          </TextField>
         
         {/* <TextField
            select
            label="Marca"
            size="small"
            value={brandFilter}
            onChange={(event) => {
              onBrandFilterChange(
                event.target.value,
              );
            }}
            disabled={loading}
            sx={{
              width: {
                xs: "100%",
                sm: 170,
              },

              "& .MuiOutlinedInput-root": {
                borderRadius: "15px",
                bgcolor: "#FFFFFF",
              },
            }}
          >
            <MenuItem value="ALL">
              Todas
            </MenuItem>

            {brands.map((brand) => (
              <MenuItem
                key={brand.id}
                value={brand.id}
              >
                {brand.name}
              </MenuItem>
            ))}
          </TextField>
        */}
          <TextField
            select
            label="Tipo"
            size="small"
            value={productTypeFilter}
            onChange={(event) => {
              onProductTypeFilterChange(
                event.target
                  .value as ProductTypeFilter,
              );
            }}
            disabled={loading}
            sx={{
              width: {
                xs: "100%",
                sm: 160,
              },

              "& .MuiOutlinedInput-root": {
                borderRadius: "15px",
                bgcolor: "#FFFFFF",
              },
            }}
          >
            <MenuItem value="ALL">
              Todos
            </MenuItem>

            <MenuItem value="PRODUCT">
              Productos
            </MenuItem>

            <MenuItem value="SERVICE">
              Servicios
            </MenuItem>
          </TextField>

          <Tooltip title="Limpiar filtros">
            <span>
              <IconButton
                type="button"  
                disabled={
                  !hasActiveFilters ||
                  loading
                }
                onClick={onClearFilters}
                sx={{ 
                  width: 40,
                  height: 40,
                  border: "1px solid",
                  borderColor:
                    "divider",
                  borderRadius: "15px",
                  bgcolor: "#FFFFFF",
                }}
              > 
              <CleaningServicesOutlined fontSize="small"/>
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Actualizar productos">
            <span>
              <IconButton
                type="button"
                disabled={loading}
                onClick={onRefresh}
                sx={{
                  width: 40,
                  height: 40,
                  border: "1px solid",
                  borderColor:
                    "divider",
                  borderRadius: "15px",
                  bgcolor: "#FFFFFF",
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

      <DataGrid
        autoHeight
        rows={products}
        columns={columns}
        rowCount={totalProducts}
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
        getRowId={(row) => row.id}
        rowHeight={62}
        columnHeaderHeight={46}
        localeText={{
          ...esES.components.MuiDataGrid
            .defaultProps.localeText,

          noRowsLabel:
            noRowsMessage,

          noResultsOverlayLabel:
            noRowsMessage,
        }}
        sx={{
          border: 0,

          "& .MuiDataGrid-columnHeaders":
            {
              bgcolor: "#F7F8F6",
              borderBottom:
                "1px solid",
              borderColor:
                "divider",
            },

          "& .MuiDataGrid-columnHeaderTitle":
            {
              fontSize: "0.78rem",
              fontWeight: 700,
            },

          "& .MuiDataGrid-cell": {
            display: "flex",
            alignItems: "center",
            borderColor: "divider",
            fontSize: "0.82rem",
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

          "& .MuiCheckbox-root": {
            p: 0.75,
          },

          "& .MuiDataGrid-overlay":
            {
              minHeight: 180,
              color:
                "text.secondary",
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
          justifyContent:
            "space-between",
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
            {firstVisibleProduct}-
            {lastVisibleProduct} de{" "}
            {totalProducts}
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
                pageSize: Number(
                  event.target.value,
                ),
              });
            }}
            sx={{
              width: 76,

              "& .MuiOutlinedInput-root":
                {
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
              borderRadius: "5px",
            }}
          >
            Anterior
          </Button>

          <Pagination
            count={totalPages}
            page={
              paginationModel.page + 1
            }
            onChange={(
              _event,
              newPage,
            ) => {
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

              "& .MuiPaginationItem-root":
                {
                  border:
                    "1px solid",
                  borderColor:
                    "divider",
                  borderRadius:
                    "5px",
                },

              "& .Mui-selected": {
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
              borderRadius: "5px",
            }}
          >
            Siguiente
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
