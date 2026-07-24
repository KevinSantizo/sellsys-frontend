import {
  AddRounded,
  Inventory2Rounded,
  RefreshRounded,
  SearchRounded,
  ClearRounded,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Navigate } from "react-router-dom";

import { useCompanyStore } from "../../../companies/store/companyStore";


import axios from "axios";

import { ProductFormDialog } from "../components/ProductFormDialog";

import {
  getBrandOptions,
  getCategoryOptions,
  getUnitOptions,
} from "../services/catalogReferenceService";

import {
  createProduct,
  getProducts,
} from "../services/productService";

import type {
  Product,
  ProductFormValues,
} from "../types/product";


export function ProductsPage() {

    const queryClient = useQueryClient();

    const [isProductDialogOpen, setIsProductDialogOpen] =
    useState(false);

    const [createError, setCreateError] =
    useState<string | null>(null);

  const selectedCompany = useCompanyStore(
    (state) => state.selectedCompany,
  );

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] =
    useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [search]);

  const {
    data: products = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      "products",
      selectedCompany?.id,
      debouncedSearch,
    ],

    queryFn: () => {
      if (!selectedCompany) {
        return Promise.resolve([]);
      }

      return getProducts({
        companyId: selectedCompany.id,
        search: debouncedSearch,
      });
    },

    enabled: Boolean(selectedCompany?.id),
  });

  const categoriesQuery = useQuery({
    queryKey: [
        "catalog-categories",
        selectedCompany?.id,
    ],

    queryFn: () =>
        getCategoryOptions(selectedCompany!.id),

    enabled:
        Boolean(selectedCompany?.id) &&
        isProductDialogOpen,
    });

    const brandsQuery = useQuery({
    queryKey: [
        "catalog-brands",
        selectedCompany?.id,
    ],

    queryFn: () =>
        getBrandOptions(selectedCompany!.id),

    enabled:
        Boolean(selectedCompany?.id) &&
        isProductDialogOpen,
    });

    const unitsQuery = useQuery({
    queryKey: [
        "catalog-units",
        selectedCompany?.id,
    ],

    queryFn: () =>
        getUnitOptions(selectedCompany!.id),

    enabled:
        Boolean(selectedCompany?.id) &&
        isProductDialogOpen,
    });

    const createProductMutation = useMutation({
        mutationFn: (
            values: ProductFormValues,
        ) => {
            if (!selectedCompany) {
            throw new Error(
                "No existe una empresa seleccionada.",
            );
            }

            return createProduct({
            company_id: selectedCompany.id,
            name: values.name.trim(),
            description: values.description.trim(),
            sku: values.sku.trim(),
            barcode: values.barcode.trim() || null,
            product_type: values.product_type,
            category_id: values.category_id || null,
            brand_id: values.brand_id || null,
            base_unit_id: values.base_unit_id,
            cost_price: values.cost_price || "0.00",
            sale_price: values.sale_price,
            track_inventory:
                values.product_type === "SERVICE"
                ? false
                : values.track_inventory,
            is_active: values.is_active,
            });
        },

        onSuccess: async () => {
            setCreateError(null);
            setIsProductDialogOpen(false);

            await queryClient.invalidateQueries({
            queryKey: [
                "products",
                selectedCompany?.id,
            ],
            });
        },

        onError: (error: unknown) => {
            if (axios.isAxiosError(error)) {
            const responseData = error.response?.data;

            if (
                responseData &&
                typeof responseData === "object"
            ) {
                setCreateError(
                Object.values(responseData)
                    .flat()
                    .join(" "),
                );

                return;
            }
            }

            setCreateError(
            "No fue posible crear el producto.",
            );
        },
        });

  const currencyFormatter = useMemo(() => {
    return new Intl.NumberFormat("es-GT", {
      style: "currency",
      currency: selectedCompany?.currency ?? "GTQ",
      minimumFractionDigits: 2,
    });
  }, [selectedCompany?.currency]);

  const formatCurrency = (value: string) => {
    const numberValue = Number(value);

    if (Number.isNaN(numberValue)) {
      return value;
    }

    return currencyFormatter.format(numberValue);
  };

  if (!selectedCompany) {
    return (
      <Navigate
        to="/companies"
        replace
      />
    );
  }

  return (
    <Stack spacing={2.5}>
      {/* Encabezado */}
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={2}
        sx={{
          alignItems: {
            xs: "stretch",
            sm: "center",
          },
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontSize: {
                xs: "1.65rem",
                sm: "1.85rem",
              },
              fontWeight: 800,
              mb: 0.4,
            }}
          >
            Productos
          </Typography>

          <Typography
            sx={{
              color: "text.secondary",
              fontSize: "0.9rem",
            }}
          >
            Administra los productos y servicios de{" "}
            {selectedCompany.name}.
          </Typography>
        </Box>

        <Button
          type="button"
          variant="contained"
          startIcon={<AddRounded />}
          onClick={() => {
                setCreateError(null);
                setIsProductDialogOpen(true);
            }}
          sx={{
            borderRadius: "15px",
            alignSelf: {
              xs: "stretch",
              sm: "center",
            },
          }}
        >
          Nuevo producto
        </Button>
      </Stack>

      {/* Buscador */}
      <Paper
        variant="outlined"
        sx={{
          bgcolor: "#FFFFFF",
          borderRadius: "15px",
          borderColor: "divider",
          p: 1.5,
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: "center",
          }}
        >
          <TextField
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
            }}
            placeholder="Buscar por nombre, SKU o código de barras"
            fullWidth
            size="medium"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded
                      sx={{
                        color: "text.secondary",
                      }}
                    />
                  </InputAdornment>
                ),
                endAdornment: search && (
                    <InputAdornment position="end">
                    <IconButton
                        onClick={() => setSearch("")}
                        edge="end"
                        aria-label="Limpiar búsqueda"
                    >
                        <ClearRounded />
                    </IconButton>
                    </InputAdornment>
                ),
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                minHeight: 46,
                borderRadius: "15px",
                bgcolor: "#FFFFFF",
              },
            }}
          />

          <Tooltip title="Actualizar productos">
            <span>
              <IconButton
                type="button"
                disabled={isFetching}
                onClick={() => {
                  void refetch();
                }}
                sx={{
                  width: 46,
                  height: 50,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: "15px",
                  bgcolor: "#FFFFFF",
                }}
              >
                {isFetching ? (
                  <CircularProgress size={20} />
                ) : (
                  <RefreshRounded />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Paper>

      {/* Error */}
      {isError && (
        <Alert severity="error">
          No fue posible cargar los productos.
        </Alert>
      )}

      {/* Cargando */}
      {isLoading && (
        <Paper
          variant="outlined"
          sx={{
            minHeight: 260,
            bgcolor: "#FFFFFF",
            borderRadius: "15px",
            borderColor: "divider",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Stack
            spacing={1.5}
            sx={{
              alignItems: "center",
            }}
          >
            <CircularProgress />

            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
              }}
            >
              Cargando productos...
            </Typography>
          </Stack>
        </Paper>
      )}

      {!isLoading && !isError && products.length === 0 && (
        <EmptyProductsState
          hasSearch={Boolean(debouncedSearch)}
        />
      )}

      {!isLoading && !isError && products.length > 0 && (
        <>
          {/* Tabla para escritorio */}
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
              display: {
                xs: "none",
                md: "block",
              },
              bgcolor: "#FFFFFF",
              borderRadius: "15px",
              borderColor: "divider",
              overflow: "hidden",
            }}
          >
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    bgcolor: "#F7F8F6",
                  }}
                >
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                      }}
                    >
                      Producto
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                      }}
                    >
                      Categoría
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                      }}
                    >
                      Marca
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                      }}
                    >
                      Tipo
                    </Typography>
                  </TableCell>

                  <TableCell
                    sx={{
                      textAlign: "right",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                      }}
                    >
                      Precio
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                      }}
                    >
                      Estado
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {products.map((product) => (
                  <ProductTableRow
                    key={product.id}
                    product={product}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Cards para móviles */}
          <Stack
            spacing={1.5}
            sx={{
              display: {
                xs: "flex",
                md: "none",
              },
            }}
          >
            {products.map((product) => (
              <ProductMobileCard
                key={product.id}
                product={product}
                formatCurrency={formatCurrency}
              />
            ))}
          </Stack>

          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
            }}
          >
            {products.length}{" "}
            {products.length === 1
              ? "producto encontrado"
              : "productos encontrados"}
          </Typography>
        </>
      )}

      <ProductFormDialog
        open={isProductDialogOpen}
        isSubmitting={createProductMutation.isPending}
        isLoadingOptions={
            categoriesQuery.isLoading ||
            brandsQuery.isLoading ||
            unitsQuery.isLoading
        }
        submitError={createError}
        categories={categoriesQuery.data ?? []}
        brands={brandsQuery.data ?? []}
        units={unitsQuery.data ?? []}
        onClose={() => {
            if (!createProductMutation.isPending) {
            setIsProductDialogOpen(false);
            setCreateError(null);
            }
        }}
        onSubmit={(values) => {
            setCreateError(null);
            createProductMutation.mutate(values);
        }}
        />
    </Stack> 
  );

  
}

type ProductRowProps = {
  product: Product;
  formatCurrency: (value: string) => string;
};

function ProductTableRow({
  product,
  formatCurrency,
}: ProductRowProps) {
  return (
    <TableRow
      hover
      sx={{
        "&:last-child td": {
          borderBottom: 0,
        },
      }}
    >
      <TableCell>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              flexShrink: 0,
              borderRadius: "15px",
              bgcolor: "primary.light",
              color: "primary.main",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Inventory2Rounded fontSize="small" />
          </Box>

          <Box
            sx={{
              minWidth: 0,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.9rem",
                fontWeight: 700,
              }}
            >
              {product.name}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontSize: "0.78rem",
              }}
            >
              SKU: {product.sku}
            </Typography>

            {product.barcode && (
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  fontSize: "0.75rem",
                }}
              >
                Código: {product.barcode}
              </Typography>
            )}
          </Box>
        </Stack>
      </TableCell>

      <TableCell>
        {product.category_name ?? "Sin categoría"}
      </TableCell>

      <TableCell>
        {product.brand_name ?? "Sin marca"}
      </TableCell>

      <TableCell>
        <Chip
          label={product.product_type_display}
          size="small"
          variant="outlined"
          sx={{
            borderRadius: "5px",
          }}
        />
      </TableCell>

      <TableCell
        sx={{
          textAlign: "right",
          whiteSpace: "nowrap",
          fontWeight: 700,
        }}
      >
        {formatCurrency(product.sale_price)}
      </TableCell>

      <TableCell>
        <Chip
          label={product.is_active ? "Activo" : "Inactivo"}
          size="small"
          color={product.is_active ? "primary" : "default"}
          sx={{
            borderRadius: "5px",
          }}
        />
      </TableCell>
    </TableRow>
  );
}

function ProductMobileCard({
  product,
  formatCurrency,
}: ProductRowProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        bgcolor: "#FFFFFF",
        borderRadius: "5px",
        borderColor: "divider",
        p: 2,
      }}
    >
      <Stack spacing={1.5}>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            alignItems: "flex-start",
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              flexShrink: 0,
              borderRadius: "5px",
              bgcolor: "primary.light",
              color: "primary.main",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Inventory2Rounded fontSize="small" />
          </Box>

          <Box
            sx={{
              minWidth: 0,
              flex: 1,
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
              }}
            >
              {product.name}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
              }}
            >
              {product.sku}
            </Typography>
          </Box>

          <Chip
            label={product.is_active ? "Activo" : "Inactivo"}
            size="small"
            color={product.is_active ? "primary" : "default"}
            sx={{
              borderRadius: "5px",
            }}
          />
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1.5,
          }}
        >
          <ProductData
            label="Categoría"
            value={product.category_name ?? "Sin categoría"}
          />

          <ProductData
            label="Marca"
            value={product.brand_name ?? "Sin marca"}
          />

          <ProductData
            label="Tipo"
            value={product.product_type_display}
          />

          <ProductData
            label="Precio"
            value={formatCurrency(product.sale_price)}
          />
        </Box>
      </Stack>
    </Paper>
  );
}

type ProductDataProps = {
  label: string;
  value: string;
};

function ProductData({
  label,
  value,
}: ProductDataProps) {
  return (
    <Box>
      <Typography
        variant="caption"
        sx={{
          color: "text.secondary",
        }}
      >
        {label}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function EmptyProductsState({
  hasSearch,
}: {
  hasSearch: boolean;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        minHeight: 260,
        bgcolor: "#FFFFFF",
        borderRadius: "15px",
        borderColor: "divider",
        display: "grid",
        placeItems: "center",
        p: 3,
      }}
    >
      <Stack
        spacing={1.5}
        sx={{
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            width: 54,
            height: 54,
            borderRadius: "15px",
            bgcolor: "primary.light",
            color: "primary.main",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Inventory2Rounded />
        </Box>

        <Typography
          sx={{
            fontWeight: 700,
          }}
        >
          {hasSearch
            ? "No se encontraron productos"
            : "Todavía no hay productos"}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            maxWidth: 360,
            color: "text.secondary",
          }}
        >
          {hasSearch
            ? "Prueba con otro nombre, SKU o código de barras."
            : "Los productos creados para esta empresa aparecerán aquí."}
        </Typography>
      </Stack>
    </Paper>
  );
}