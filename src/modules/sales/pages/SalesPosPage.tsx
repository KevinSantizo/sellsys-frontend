import {
  AddRounded,
  AddShoppingCartRounded,
  DeleteOutlineRounded,
  PointOfSaleRounded,
  RemoveRounded,
  SearchRounded,
  ShoppingCartCheckoutRounded,
} from "@mui/icons-material";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  useMutation,
  useQuery,
} from "@tanstack/react-query";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useBranchStore } from "../../branches/store/branchStore";
import { getProducts } from "../../catalog/products/services/productService";
import type { Product } from "../../catalog/products/types/product";
import { useCompanyStore } from "../../companies/store/companyStore";

import {
  calculateCartDiscount,
  calculateCartSubtotal,
  calculateCartTotal,
  calculateLineSubtotal,
  calculateLineTotal,
  useSalesCartStore,
} from "../store/salesCartStore";

import axios from "axios";

import {
  CheckoutSaleDialog,
  type CheckoutFormValues,
} from "../components/CheckoutSaleDialog";

import { checkoutSale } from "../services/salesService";

import type {
  SaleDetail,
} from "../types/sales.types";


import {
  showErrorAlert,
  showSuccessAlert,
} from "../../../shared/alerts/appAlerts";


function formatCurrency(
  value: number,
): string {
  return `Q${value.toLocaleString(
    "es-GT",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )}`;
}

function findApiErrorMessage(
  value: unknown,
): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const message =
        findApiErrorMessage(item);

      if (message) {
        return message;
      }
    }

    return null;
  }

  if (
    value !== null &&
    typeof value === "object"
  ) {
    for (
      const item
      of Object.values(value)
    ) {
      const message =
        findApiErrorMessage(item);

      if (message) {
        return message;
      }
    }
  }

  return null;
}

function getCheckoutErrorMessage(
  error: unknown,
): string {
  if (axios.isAxiosError(error)) {
    return (
      findApiErrorMessage(
        error.response?.data,
      ) ??
      "El servidor no pudo registrar la venta."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "No fue posible registrar la venta.";
}

export function SalesPosPage() {

  const [ checkoutOpen, setCheckoutOpen, ] = useState(false);
  const selectedCompany =
    useCompanyStore(
      (state) => state.selectedCompany,
    );

  const selectedBranch =
    useBranchStore(
      (state) => state.selectedBranch,
    );

  const items =
    useSalesCartStore(
      (state) => state.items,
    );

  const addProduct =
    useSalesCartStore(
      (state) => state.addProduct,
    );

  const increaseQuantity =
    useSalesCartStore(
      (state) => state.increaseQuantity,
    );

  const decreaseQuantity =
    useSalesCartStore(
      (state) => state.decreaseQuantity,
    );

  const updateQuantity =
    useSalesCartStore(
      (state) => state.updateQuantity,
    );

  const updateDiscount =
    useSalesCartStore(
      (state) => state.updateDiscount,
    );

  const removeProduct =
    useSalesCartStore(
      (state) => state.removeProduct,
    );

  const clearCart =
    useSalesCartStore(
      (state) => state.clearCart,
    );

  const [search, setSearch] =
    useState("");

  const [
    debouncedSearch,
    setDebouncedSearch,
  ] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(
      () => {
        setDebouncedSearch(
          search.trim(),
        );
      },
      400,
    );

    return () => {
      window.clearTimeout(timeout);
    };
  }, [search]);

  const canSearch =
    Boolean(selectedCompany?.id) &&
    debouncedSearch.length >= 2;

  const productsQuery = useQuery({
    queryKey: [
      "sales-product-search",
      selectedCompany?.id,
      debouncedSearch,
    ],

    queryFn: () =>
      getProducts({
        companyId:
          selectedCompany!.id,
        search: debouncedSearch,
        page: 1,
        pageSize: 12,
        isActive: true,
      }),

    enabled: canSearch,
  });

  const products =
    productsQuery.data?.results ?? [];

  const subtotal = useMemo(
    () =>
      calculateCartSubtotal(items),
    [items],
  );

  const discountTotal = useMemo(
    () =>
      calculateCartDiscount(items),
    [items],
  );

  const total = useMemo(
    () =>
      calculateCartTotal(items),
    [items],
  );

  const checkoutMutation =
  useMutation<
    SaleDetail,
    unknown,
    CheckoutFormValues
  >({
    mutationFn: async (values) => {
      if (!selectedCompany) {
        throw new Error(
          "No hay una empresa seleccionada.",
        );
      }

      if (!selectedBranch) {
        throw new Error(
          "No hay una sucursal seleccionada.",
        );
      }

      if (items.length === 0) {
        throw new Error(
          "El carrito está vacío.",
        );
      }

      const paymentAmount =
        values.paymentMethod === "CASH"
          ? Number(
              values.amountReceived,
            )
          : total;

      if (
        !Number.isFinite(
          paymentAmount,
        ) ||
        paymentAmount <= 0
      ) {
        throw new Error(
          "El monto recibido no es válido.",
        );
      }

      return checkoutSale({
        company_id:
          selectedCompany.id,

        branch_id:
          selectedBranch.id,

        customer_name:
          values.customerName.trim(),

        customer_tax_id:
          values.customerTaxId.trim(),

        notes:
          values.notes.trim(),

        items: items.map((item) => ({
          product_id:
            item.product.id,

          quantity:
            item.quantity.toFixed(3),

          discount_percent:
            item.discountPercent.toFixed(
              2,
            ),
        })),

        payments: [
          {
            method:
              values.paymentMethod,

            amount:
              paymentAmount.toFixed(2),

            reference:
              values.paymentMethod ===
              "CASH"
                ? ""
                : values.reference.trim(),
          },
        ],
      });
    },

    onSuccess: async (sale) => {
      setCheckoutOpen(false);

      clearCart();

      setSearch("");
      setDebouncedSearch("");

      const changeAmount = Number(
        sale.change_amount,
      );

      await showSuccessAlert({
        title: "Venta registrada",
        text:
          changeAmount > 0
            ? `${sale.sale_number} fue registrada correctamente. Cambio: ${formatCurrency(
                changeAmount,
              )}`
            : `${sale.sale_number} fue registrada correctamente.`,
      });
    },

    onError: async (error) => {
      await showErrorAlert({
        title:
          "No se pudo registrar la venta",
        text:
          getCheckoutErrorMessage(
            error,
          ),
      });
    },
  });

  const totalUnits = useMemo(
    () =>
      items.reduce(
        (accumulator, item) =>
          accumulator +
          item.quantity,
        0,
      ),
    [items],
  );

  const handleAddProduct = (
    product: Product,
  ) => {
    addProduct(product);
  };

  return (
    <Box>
      {/* Encabezado */}
      <Box
        sx={{
          display: "flex",
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          alignItems: {
            xs: "flex-start",
            sm: "center",
          },
          justifyContent:
            "space-between",
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
            }}
          >
            Punto de venta
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              mt: 0.5,
            }}
          >
            Sucursal:{" "}
            {selectedBranch?.name ??
              "Sin sucursal"}
          </Typography>
        </Box>

        <Chip
          icon={
            <PointOfSaleRounded />
          }
          label={`${items.length} productos · ${totalUnits} unidades`}
          variant="outlined"
          sx={{
            borderRadius: "5px",
            bgcolor: "#FFFFFF",
            fontWeight: 600,
          }}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            xl: "minmax(0, 1fr) 370px",
          },
          gap: 2,
          alignItems: "start",
        }}
      >
        {/* Zona izquierda */}
        <Box
          sx={{
            minWidth: 0,
            display: "grid",
            gap: 2,
          }}
        >
          {/* Buscador */}
          <Card
            variant="outlined"
            sx={{
              borderRadius: "5px",
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                Buscar productos
              </Typography>

              <TextField
                fullWidth
                value={search}
                onChange={(event) => {
                  setSearch(
                    event.target.value,
                  );
                }}
                placeholder="Buscar por nombre, SKU o código de barras"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRounded
                          sx={{
                            color:
                              "text.secondary",
                          }}
                        />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root":
                    {
                      minHeight: 46,
                      borderRadius: "5px",
                      bgcolor: "#FFFFFF",
                    },
                }}
              />

              {/* Estado inicial */}
              {!canSearch && (
                <Box
                  sx={{
                    py: 6,
                    textAlign: "center",
                  }}
                >
                  <SearchRounded
                    sx={{
                      fontSize: 46,
                      color:
                        "text.disabled",
                      mb: 1,
                    }}
                  />

                  <Typography
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    Busca un producto
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        "text.secondary",
                    }}
                  >
                    Escribe al menos dos
                    caracteres para comenzar.
                  </Typography>
                </Box>
              )}

              {/* Cargando */}
              {canSearch &&
                productsQuery.isLoading && (
                  <Box
                    sx={{
                      py: 6,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <CircularProgress
                      size={32}
                    />
                  </Box>
                )}

              {/* Error */}
              {canSearch &&
                productsQuery.isError && (
                  <Box
                    sx={{
                      py: 5,
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        color: "error.main",
                        fontWeight: 700,
                      }}
                    >
                      No fue posible cargar
                      los productos.
                    </Typography>

                    <Button
                      type="button"
                      variant="text"
                      onClick={() => {
                        void productsQuery.refetch();
                      }}
                      sx={{
                        mt: 1,
                        borderRadius: "5px",
                      }}
                    >
                      Intentar nuevamente
                    </Button>
                  </Box>
                )}

              {/* Sin resultados */}
              {canSearch &&
                !productsQuery.isLoading &&
                !productsQuery.isError &&
                products.length === 0 && (
                  <Box
                    sx={{
                      py: 6,
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 700,
                      }}
                    >
                      No encontramos
                      productos
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          "text.secondary",
                      }}
                    >
                      Prueba con otro nombre,
                      SKU o código de barras.
                    </Typography>
                  </Box>
                )}

              {/* Resultados */}
              {products.length > 0 && (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "minmax(0, 1fr)",
                      md: "repeat(2, minmax(0, 1fr))",
                      lg: "repeat(3, minmax(0, 1fr))",
                    },
                    gap: 1.5,
                    mt: 2,
                  }}
                >
                  {products.map(
                    (product) => (
                      <Card
                        key={product.id}
                        variant="outlined"
                        sx={{
                          borderRadius:
                            "5px",
                          transition:
                            "border-color 150ms ease, box-shadow 150ms ease",

                          "&:hover": {
                            borderColor:
                              "primary.main",
                            boxShadow:
                              "0 5px 16px rgba(15, 23, 42, 0.08)",
                          },
                        }}
                      >
                        <CardContent
                          sx={{
                            height: "100%",
                            display: "flex",
                            flexDirection:
                              "column",
                            p: 2,

                            "&:last-child": {
                              pb: 2,
                            },
                          }}
                        >
                          <Box
                            sx={{
                              flex: 1,
                            }}
                          >
                            <Typography
                              sx={{
                                fontWeight:
                                  700,
                                lineHeight:
                                  1.3,
                              }}
                            >
                              {product.name}
                            </Typography>

                            <Typography
                              variant="caption"
                              sx={{
                                display:
                                  "block",
                                color:
                                  "text.secondary",
                                mt: 0.5,
                              }}
                            >
                              SKU:{" "}
                              {product.sku}
                            </Typography>

                            <Typography
                              variant="caption"
                              sx={{
                                display:
                                  "block",
                                color:
                                  "text.secondary",
                              }}
                            >
                              {product.category_name ??
                                "Sin categoría"}
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "space-between",
                              gap: 1,
                              mt: 2,
                            }}
                          >
                            <Typography
                              sx={{
                                color:
                                  "primary.main",
                                fontWeight:
                                  800,
                              }}
                            >
                              {formatCurrency(
                                Number(
                                  product.sale_price,
                                ),
                              )}
                            </Typography>

                            <Tooltip title="Agregar al carrito">
                              <IconButton
                                type="button"
                                onClick={() => {
                                  handleAddProduct(
                                    product,
                                  );
                                }}
                                sx={{
                                  width: 36,
                                  height: 36,
                                  borderRadius:
                                    "5px",
                                  bgcolor:
                                    "primary.main",
                                  color:
                                    "#FFFFFF",

                                  "&:hover": {
                                    bgcolor:
                                      "primary.dark",
                                  },
                                }}
                              >
                                <AddShoppingCartRounded fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </CardContent>
                      </Card>
                    ),
                  )}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Carrito */}
          <Card
            variant="outlined"
            sx={{
              borderRadius: "5px",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "space-between",
                  gap: 2,
                  mb: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    Carrito de venta
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        "text.secondary",
                    }}
                  >
                    Modifica cantidades y
                    descuentos.
                  </Typography>
                </Box>

                <Button
                  type="button"
                  variant="text"
                  disabled={
                    items.length === 0
                  }
                  onClick={clearCart}
                  sx={{
                    borderRadius: "5px",
                    color: "error.main",
                    whiteSpace: "nowrap",
                  }}
                >
                  Vaciar carrito
                </Button>
              </Box>

              <Divider />

              {items.length === 0 ? (
                <Box
                  sx={{
                    py: 7,
                    textAlign: "center",
                  }}
                >
                  <ShoppingCartCheckoutRounded
                    sx={{
                      fontSize: 48,
                      color:
                        "text.disabled",
                      mb: 1,
                    }}
                  />

                  <Typography
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    El carrito está vacío
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        "text.secondary",
                    }}
                  >
                    Busca y agrega productos
                    para iniciar la venta.
                  </Typography>
                </Box>
              ) : (
                <Box>
                  {items.map(
                    (item, index) => {
                      const lineSubtotal =
                        calculateLineSubtotal(
                          item,
                        );

                      const lineTotal =
                        calculateLineTotal(
                          item,
                        );

                      return (
                        <Box
                          key={
                            item.product.id
                          }
                        >
                          <Box
                            sx={{
                              display:
                                "grid",
                              gridTemplateColumns:
                                {
                                  xs: "minmax(0, 1fr)",
                                  md: "minmax(180px, 1fr) 142px 118px 110px 42px",
                                },
                              alignItems:
                                "center",
                              gap: 1.5,
                              py: 2,
                            }}
                          >
                            {/* Producto */}
                            <Box
                              sx={{
                                minWidth: 0,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontWeight:
                                    700,
                                  overflow:
                                    "hidden",
                                  textOverflow:
                                    "ellipsis",
                                  whiteSpace:
                                    "nowrap",
                                }}
                              >
                                {
                                  item
                                    .product
                                    .name
                                }
                              </Typography>

                              <Typography
                                variant="caption"
                                sx={{
                                  color:
                                    "text.secondary",
                                }}
                              >
                                {
                                  item
                                    .product
                                    .sku
                                }{" "}
                                ·{" "}
                                {formatCurrency(
                                  Number(
                                    item
                                      .product
                                      .sale_price,
                                  ),
                                )}
                              </Typography>
                            </Box>

                            {/* Cantidad */}
                            <Box
                              sx={{
                                display:
                                  "flex",
                                alignItems:
                                  "center",
                                gap: 0.5,
                              }}
                            >
                              <IconButton
                                type="button"
                                size="small"
                                onClick={() => {
                                  decreaseQuantity(
                                    item
                                      .product
                                      .id,
                                  );
                                }}
                                sx={{
                                  border:
                                    "1px solid",
                                  borderColor:
                                    "divider",
                                  borderRadius:
                                    "5px",
                                }}
                              >
                                <RemoveRounded fontSize="small" />
                              </IconButton>

                              <TextField
                                type="number"
                                size="small"
                                value={item.quantity}
                                onChange={(event) => {
                                  updateQuantity(
                                    item.product.id,
                                    Number(event.target.value),
                                  );
                                }}
                                slotProps={{
                                  htmlInput: {
                                    min: 0.001,
                                    step: 1,
                                    style: {
                                      textAlign: "center",
                                      paddingLeft: 6,
                                      paddingRight: 6,
                                    },
                                  },
                                }}
                                sx={{
                                  width: 64,

                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: "15px",
                                  },

                                  "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                                    {
                                      WebkitAppearance: "none",
                                      margin: 0,
                                    },

                                  "& input[type=number]": {
                                    MozAppearance: "textfield",
                                  },
                                }}
                              />

                              <IconButton
                                type="button"
                                size="small"
                                onClick={() => {
                                  increaseQuantity(
                                    item
                                      .product
                                      .id,
                                  );
                                }}
                                sx={{
                                  border:
                                    "1px solid",
                                  borderColor:
                                    "divider",
                                  borderRadius:
                                    "5px",
                                }}
                              >
                                <AddRounded fontSize="small" />
                              </IconButton>
                            </Box>

                            {/* Descuento */}
                            <TextField
                              type="number"
                              size="small"
                              label="Descuento"
                              value={item.discountPercent}
                              onChange={(event) => {
                                updateDiscount(
                                  item.product.id,
                                  Number(event.target.value),
                                );
                              }}
                              slotProps={{
                                htmlInput: {
                                  min: 0,
                                  max: 100,
                                  step: 1,
                                  style: {
                                    textAlign: "center", 
                                  },
                                },

                                input: {
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      %
                                    </InputAdornment>
                                  ),
                                },
                              }}
                              sx={{ 
                                
                                width: 75,
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: "5px",
                                },

                                "& .MuiInputAdornment-root": {
                                  ml: 0,
                                },

                                "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                                  {
                                    WebkitAppearance: "none",
                                    margin: 0,
                                  },

                                "& input[type=number]": {
                                  MozAppearance: "textfield",
                                },
                              }}
                            />

                            {/* Total */}
                            <Box
                              sx={{
                                textAlign: {
                                  xs: "left",
                                  md: "right",
                                },
                              }}
                            >
                              {item.discountPercent >
                                0 && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display:
                                      "block",
                                    color:
                                      "text.secondary",
                                    textDecoration:
                                      "line-through",
                                  }}
                                >
                                  {formatCurrency(
                                    lineSubtotal,
                                  )}
                                </Typography>
                              )}

                              <Typography
                                sx={{
                                  fontWeight:
                                    800,
                                }}
                              >
                                {formatCurrency(
                                  lineTotal,
                                )}
                              </Typography>
                            </Box>

                            {/* Eliminar */}
                            <Tooltip title="Eliminar producto">
                              <IconButton
                                type="button"
                                onClick={() => {
                                  removeProduct(
                                    item
                                      .product
                                      .id,
                                  );
                                }}
                                sx={{
                                  borderRadius:
                                    "5px",
                                  color:
                                    "error.main",
                                }}
                              >
                                <DeleteOutlineRounded />
                              </IconButton>
                            </Tooltip>
                          </Box>

                          {index <
                            items.length -
                              1 && (
                            <Divider />
                          )}
                        </Box>
                      );
                    },
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Resumen */}
        <Card
          variant="outlined"
          sx={{
            borderRadius: "5px",
            position: {
              xl: "sticky",
            },
            top: {
              xl: 0,
            },
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
              }}
            >
              Resumen de venta
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                mt: 0.5,
              }}
            >
              {selectedBranch?.name}
            </Typography>

            <Divider
              sx={{
                my: 2,
              }}
            />

            <Box
              sx={{
                display: "grid",
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  gap: 2,
                }}
              >
                <Typography
                  sx={{
                    color:
                      "text.secondary",
                  }}
                >
                  Subtotal
                </Typography>

                <Typography
                  sx={{
                    fontWeight: 600,
                  }}
                >
                  {formatCurrency(
                    subtotal,
                  )}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  gap: 2,
                }}
              >
                <Typography
                  sx={{
                    color:
                      "text.secondary",
                  }}
                >
                  Descuento
                </Typography>

                <Typography
                  sx={{
                    color:
                      discountTotal > 0
                        ? "success.main"
                        : "text.primary",
                    fontWeight: 600,
                  }}
                >
                  -
                  {formatCurrency(
                    discountTotal,
                  )}
                </Typography>
              </Box>

              <Divider />

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "space-between",
                  gap: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  Total
                </Typography>

                <Typography
                  variant="h5"
                  sx={{
                    color:
                      "primary.main",
                    fontWeight: 800,
                  }}
                >
                  {formatCurrency(total)}
                </Typography>
              </Box>

              <Button
                type="button"
                fullWidth
                size="large"
                variant="contained"
                startIcon={
                  <PointOfSaleRounded />
                }
                disabled={
                  items.length === 0 ||
                  checkoutMutation.isPending
                }
                onClick={() => {
                  setCheckoutOpen(true);
                }}
                sx={{
                  minHeight: 48,
                  mt: 1,
                  borderRadius: "5px",
                  fontWeight: 700,
                }}
              >
                {checkoutMutation.isPending
                  ? "Procesando..."
                  : "Cobrar"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <CheckoutSaleDialog
        open={checkoutOpen}
        total={total}
        loading={
          checkoutMutation.isPending
        }
        onClose={() => {
          if (
            !checkoutMutation.isPending
          ) {
            setCheckoutOpen(false);
          }
        }}
        onConfirm={async (values) => {
          await checkoutMutation.mutateAsync(
            values,
          );
        }}
      />

    </Box>
    
  );
}