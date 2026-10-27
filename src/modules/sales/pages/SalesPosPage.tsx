import {
  AddRounded, 
  CropFree,
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
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
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
 
import { CheckoutSaleDialog, type CheckoutFormValues, } from "../components/CheckoutSaleDialog";
import { checkoutSale, downloadSaleReceipt } from "../services/salesService";
import type { SaleDetail, } from "../types/sales.types";
import { showErrorAlert, showSaleSuccessAlert  } from "../../../shared/alerts/appAlerts";
import { getApiErrorMessage } from "../../../shared/utils/getApiErrorMessage";
import { BarcodeScannerInline } from "../components/BarcodeScannerInline";

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
 

export function SalesPosPage() {

  const theme = useTheme();

  const isMobile = useMediaQuery(
    theme.breakpoints.down("sm"),
  );

  const queryClient = useQueryClient();

  const formatQuantity = (value: string | number) => {
    const quantity = Number(value);

    if (Number.isInteger(quantity)) {
      return quantity.toString();
    }

    return quantity.toLocaleString("es-GT", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    });
  };

  const [ checkoutOpen, setCheckoutOpen, ] = useState(false);
  const [checkoutIdempotencyKey, setCheckoutIdempotencyKey] = useState<string | null>(null);
  const selectedCompany = useCompanyStore( (state) => state.selectedCompany, );
  const selectedBranch = useBranchStore( (state) => state.selectedBranch, );

  const items = useSalesCartStore( (state) => state.items, );
  const addProduct = useSalesCartStore( (state) => state.addProduct, );
  const increaseQuantity = useSalesCartStore( (state) => state.increaseQuantity, );
  const decreaseQuantity = useSalesCartStore( (state) => state.decreaseQuantity, );
  const updateQuantity = useSalesCartStore( (state) => state.updateQuantity, );
  const updateDiscount = useSalesCartStore( (state) => state.updateDiscount, );
  const removeProduct = useSalesCartStore( (state) => state.removeProduct, );
  const clearCart =  useSalesCartStore( (state) => state.clearCart, );
  const setCartContext = useSalesCartStore((state) => state.setCartContext);

  const [search, setSearch] = useState("");
  const [ debouncedSearch, setDebouncedSearch, ] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isBarcodeSearching, setIsBarcodeSearching] = useState(false); 
  const [ barcodeScannerOpen, setBarcodeScannerOpen ] = useState(false);


  useEffect(() => {
      setCheckoutIdempotencyKey(null);
  }, [items, selectedCompany?.id, selectedBranch?.id]);
  useEffect(() => {
    if (!selectedCompany?.id || !selectedBranch?.id) {
      return;
    }

    setCartContext(
      selectedCompany.id,
      selectedBranch.id,
    );
  }, [
    selectedCompany?.id,
    selectedBranch?.id,
    setCartContext,
  ]);

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

  const canSearch =  Boolean(selectedCompany?.id) && debouncedSearch.length >= 2;

  const productsQuery = useQuery({
    queryKey: [
      "sales-product-search",
      selectedCompany?.id,
      selectedBranch?.id,
      debouncedSearch,
    ],

  queryFn: () => {
    if (
      !selectedCompany ||
      !selectedBranch
    ) {
      throw new Error(
        "Empresa o sucursal no seleccionada.",
      );
    }

    return getProducts({
      companyId: selectedCompany.id,
      branchId: selectedBranch.id,
      search: debouncedSearch,
      page: 1,
      pageSize: 12,
      isActive: true,
    });
  },

  enabled:
    Boolean(selectedCompany?.id) &&
    Boolean(selectedBranch?.id) &&
    canSearch,
  });

  const suggestedProducts = productsQuery.data?.results ?? [];
  const isSearchingProducts = productsQuery.isFetching; 
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

  const checkoutMutation = useMutation<SaleDetail, unknown, CheckoutFormValues>({
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

      const paymentAmount = Number(values.amountReceived);

      if (
        !Number.isFinite(paymentAmount) ||
        paymentAmount <= 0
      ) {
        throw new Error(
          "El monto recibido no es válido.",
        );
      }

      if (!checkoutIdempotencyKey) {
        throw new Error("No se pudo generar la clave de la operación.");
      }

      return checkoutSale(
        {
          company_id: selectedCompany.id,
          branch_id: selectedBranch.id,

          cash_session_id:
              values.paymentMethod === "CASH"
                  ? values.cashSessionId
                  : null,

          customer_name: values.customerName.trim(),
          customer_tax_id: values.customerTaxId.trim(),
          notes: values.notes.trim(),

          cart_discount_type: values.cartDiscountType,
          cart_discount_value: values.cartDiscountType === "NONE" ? "0.00" : values.cartDiscountValue,

          items: items.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity.toFixed(3),
            discount_percent: item.discountPercent.toFixed(2),
          })),

          payments: [
            {
              method: values.paymentMethod,
              amount: paymentAmount.toFixed(2),
              reference: values.paymentMethod === "CASH" ? "" : values.reference.trim(),
            },
          ],
        },
        checkoutIdempotencyKey,
      );
    },

    onSuccess: async (sale) => {
      setCheckoutOpen(false);
      clearCart();
      setCheckoutIdempotencyKey(null);
      setSearch("");
      setDebouncedSearch("");

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["cash-movements"] }),
        queryClient.invalidateQueries({ queryKey: ["cash-session-summary"] }),
      ]);

      const changeAmount = Number(sale.change_amount);

      const downloadReceipt = await showSaleSuccessAlert({
        title: "Venta registrada",
        text:
          changeAmount > 0
            ? `${sale.sale_number} fue registrada correctamente. Cambio: ${formatCurrency(changeAmount)}`
            : `${sale.sale_number} fue registrada correctamente.`,
      });

      if (!downloadReceipt) {
        return;
      }

      try {
        await downloadSaleReceipt(sale.id, sale.sale_number);
      } catch {
        await showErrorAlert({
          title: "No se pudo descargar el comprobante",
          text: "La venta fue registrada correctamente, pero no fue posible descargar el comprobante.",
        });
      }
    },

    onError: async (error) => {
      await showErrorAlert({
        title: "No se pudo registrar la venta",
       text: getApiErrorMessage(
            error,
            "No fue posible registrar la venta.",
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

  const addProductByBarcode = async (
    barcode: string,
  ) => {
    const normalizedBarcode =
      barcode.trim();

    if (
      !normalizedBarcode ||
      !selectedCompany ||
      !selectedBranch
    ) {
      return false;
    }

    setSearchError(null);
    setIsBarcodeSearching(true);

    try {
      const response =
        await getProducts({
          companyId:
            selectedCompany.id,

          branchId:
            selectedBranch.id,

          search:
            normalizedBarcode,

          page: 1,
          pageSize: 10,

          isActive: true,
        });

      const product =
        response.results.find(
          (item) =>
            item.barcode?.trim() ===
            normalizedBarcode,
        );

      if (!product) {
        return false;
      }

      handleAddProduct(product);

      return true;
    } catch {
      setSearchError(
        "No fue posible buscar el producto.",
      );

      return false;
    } finally {
      setIsBarcodeSearching(false);
    }
  };

  const handleAddProduct = (
    product: Product,
  ) => {
    setSearchError(null);

    if (
      product.track_inventory &&
      Number(product.current_stock) <= 0
    ) {
      setSearchError(
        `"${product.name}" no tiene existencias disponibles.`,
      );

      return;
    }

    addProduct(product);

    setSearch("");
    setDebouncedSearch("");
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
            sx={{
              fontSize: {
                xs: "1.65rem",
                sm: "1.85rem",
              },
              fontWeight: 700,
              mb: 0.4,
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
          icon={ <PointOfSaleRounded /> }
          label={`${items.length} productos · ${totalUnits} unidades`}
          variant="outlined"
          sx={{
            borderRadius: "5px",
            bgcolor: "#FFFFFF",
            fontWeight: 600,
          }}
        />
      </Box>
      {isMobile && !barcodeScannerOpen && (
        <Button
          type="button" 
          fullWidth
          startIcon={
            <CropFree />
          }
          onClick={() => {
            setBarcodeScannerOpen(true);
          }}
          sx={{
            mb: 2,
            minHeight: 48,
            borderRadius: "5px",
            fontWeight: 700,
            textTransform: "none",
            bgcolor: "#FFFFFF",
          }}
        >
          Escanear producto
        </Button>
      )}

      {isMobile && (
        <BarcodeScannerInline
          open={barcodeScannerOpen}
          onClose={() => {
            setBarcodeScannerOpen(false);
          }}
          onDetected={addProductByBarcode}
        />
      )}

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
                  justifyContent: "space-between",
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
 

              <Box
                sx={{
                  position: "relative",
                  mb: 2,
                }}
              >
                <TextField
                  value={search}
                  onChange={(event) => {
                    setSearch(
                      event.target.value,
                    );

                    setSearchError(null);
                  }}
                  onKeyDown={async (event) => {
                    if (event.key !== "Enter") {
                      return;
                    }

                    event.preventDefault();

                    const value =
                      search.trim();

                    if (!value) {
                      return;
                    }

                    await addProductByBarcode(
                      value,
                    );
                  }}
                  onPaste={(event) => {
                    const pastedValue =
                      event.clipboardData
                        .getData("text")
                        .trim();

                    if (!pastedValue) {
                      return;
                    }

                    event.preventDefault();

                    setSearch(pastedValue);

                    void addProductByBarcode(
                      pastedValue,
                    ).then((added) => {
                      if (!added) {
                        setSearch(
                          pastedValue,
                        );
                      }
                    });
                  }}
                  placeholder={
                    "Escanea un código o busca por nombre, SKU o código de barras"
                  }
                  fullWidth
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRounded />
                        </InputAdornment>
                      ),

                      endAdornment:
                        isSearchingProducts ||
                        isBarcodeSearching ? (
                          <InputAdornment position="end">
                            <CircularProgress
                              size={18}
                            />
                          </InputAdornment>
                        ) : null,
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "5px",
                    },
                  }}
                />

                {search.trim().length >= 2 &&
                  suggestedProducts.length > 0 && (
                    <Paper
                      variant="outlined"
                      sx={{
                        position: "absolute",
                        top: "calc(100% + 4px)",
                        left: 0,
                        right: 0,
                        zIndex: 20,

                        maxHeight: 320,
                        overflowY: "auto",

                        borderRadius: "5px",

                        boxShadow:
                          "0 8px 24px rgba(0,0,0,0.10)",
                      }}
                    >
                      {suggestedProducts.map(
                        (product) => {
                          const stock =
                            Number(
                              product.current_stock ??
                                0,
                            );

                          const noStock =
                            product.track_inventory &&
                            stock <= 0;

                          return (
                            <Button
                              key={product.id}
                              type="button"
                              disabled={noStock}
                              onClick={() => {
                                handleAddProduct(
                                  product,
                                );
                              }}
                              sx={{
                                width: "100%",

                                px: 2,
                                py: 1.25,

                                borderRadius: 0,

                                justifyContent:
                                  "space-between",

                                textAlign: "left",

                                color: "text.primary",

                                textTransform: "none",

                                borderBottom:
                                  "1px solid",

                                borderColor:
                                  "divider",

                                "&:last-child": {
                                  borderBottom: 0,
                                },
                              }}
                            >
                              <Box
                                sx={{
                                  minWidth: 0,
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontWeight: 700,
                                    fontSize:
                                      "0.9rem",

                                    overflow:
                                      "hidden",

                                    textOverflow:
                                      "ellipsis",

                                    whiteSpace:
                                      "nowrap",
                                  }}
                                >
                                  {product.name}
                                </Typography>

                                <Typography
                                  variant="body2"
                                  sx={{
                                    color:
                                      "text.secondary",

                                    fontSize:
                                      "0.76rem",
                                  }}
                                >
                                  SKU:{" "}
                                  {product.sku}
                                  {product.barcode
                                    ? ` · ${product.barcode}`
                                    : ""}
                                </Typography>
                              </Box>

                              <Stack
                                spacing={0.25}
                                sx={{
                                  flexShrink: 0,
                                  ml: 2,
                                  alignItems:
                                    "flex-end",
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontWeight: 700,
                                  }}
                                >
                                  {formatCurrency(
                                    Number(product.sale_price),
                                  )}
                                </Typography>

                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: noStock
                                      ? "error.main"
                                      : "text.secondary",
                                  }}
                                >
                                  {product.track_inventory
                                    ? `Stock: ${stock}`
                                    : "Servicio"}
                                </Typography>
                              </Stack>
                            </Button>
                          );
                        },
                      )}
                    </Paper>
                  )}

                {searchError && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mt: 0.75,
                      color: "error.main",
                    }}
                  >
                    {searchError}
                  </Typography>
                )}
              </Box>
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
                              display: "grid",

                              gridTemplateColumns: {
                                xs: "minmax(0, 1fr) auto",
                                md: "minmax(180px, 1fr) 142px 118px 110px 42px",
                              },

                              gridTemplateAreas: {
                                xs: `
                                  "product product"
                                  "quantity discount"
                                  "total delete"
                                `,
                                md: `
                                  "product quantity discount total delete"
                                `,
                              },

                              alignItems: "center",

                              columnGap: {
                                xs: 1,
                                md: 1.5,
                              },

                              rowGap: {
                                xs: 1.5,
                                md: 0,
                              },

                              py: {
                                xs: 1.75,
                                md: 2,
                              },
                            }}
                          >
                            {/* Producto */}
                            <Box
                              sx={{
                                gridArea: "product",
                                minWidth: 0,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontWeight: 700,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",

                                  whiteSpace: {
                                    xs: "normal",
                                    md: "nowrap",
                                  },
                                }}
                              >
                                {item.product.name}
                              </Typography>

                              <Typography
                                variant="caption"
                                sx={{
                                  color: "text.secondary",
                                  display: "block",
                                  mt: 0.25,
                                }}
                              >
                                {item.product.sku}{" "}
                                ·{" "}
                                {formatCurrency(
                                  Number(item.product.sale_price),
                                )}
                              </Typography>
                            </Box>

                            {/* Cantidad */}
                            <Box
                              sx={{
                                gridArea: "quantity",
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                minWidth: 0,
                              }}
                            >
                              <IconButton
                                type="button"
                                size="small"
                                onClick={() => {
                                  decreaseQuantity(
                                    item.product.id,
                                  );
                                }}
                                sx={{
                                  border: "1px solid",
                                  borderColor: "divider",
                                  borderRadius: "5px",
                                  width: 36,
                                  height: 36,
                                }}
                              >
                                <RemoveRounded fontSize="small" />
                              </IconButton>

                              <TextField
                                type="number"
                                size="small"
                                value={formatQuantity(
                                  item.quantity,
                                )}
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
                                      paddingLeft: 4,
                                      paddingRight: 4,
                                    },
                                  },
                                }}
                                sx={{
                                  width: {
                                    xs: 68,
                                    md: 64,
                                  },

                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: "15px",
                                    height: 40,
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
                                    item.product.id,
                                  );
                                }}
                                sx={{
                                  border: "1px solid",
                                  borderColor: "divider",
                                  borderRadius: "5px",
                                  width: 36,
                                  height: 36,
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
                                gridArea: "discount",

                                width: {
                                  xs: 92,
                                  md: 75,
                                },

                                justifySelf: {
                                  xs: "end",
                                  md: "start",
                                },

                                "& .MuiOutlinedInput-root": {
                                  borderRadius: "5px",
                                  height: 46,
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
                                gridArea: "total",

                                textAlign: {
                                  xs: "left",
                                  md: "right",
                                },

                                alignSelf: "center",
                              }}
                            >
                              {item.discountPercent > 0 && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display: "block",
                                    color: "text.secondary",
                                    textDecoration: "line-through",
                                    lineHeight: 1.2,
                                  }}
                                >
                                  {formatCurrency(
                                    lineSubtotal,
                                  )}
                                </Typography>
                              )}

                              <Typography
                                sx={{
                                  fontWeight: 800,

                                  fontSize: {
                                    xs: "1.05rem",
                                    md: "1rem",
                                  },
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
                                    item.product.id,
                                  );
                                }}
                                sx={{
                                  gridArea: "delete",
                                  justifySelf: "end",

                                  borderRadius: "5px",
                                  color: "error.main",

                                  width: 38,
                                  height: 38,
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
          sx={{ borderRadius: "5px", }}
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
                    fontWeight: 700,
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
                  if (!checkoutIdempotencyKey) {
                      setCheckoutIdempotencyKey(crypto.randomUUID());
                  }

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
        open={ checkoutOpen }
        total={ total }
        loading={ checkoutMutation.isPending }
        companyId={ selectedCompany?.id ?? "" }
        branchId={ selectedBranch?.id ?? "" }
        branchName={ selectedBranch?.name ?? "" }
        onClose={ () => {
          if (!checkoutMutation.isPending) {
            setCheckoutOpen(false);
          }
        }}
        onConfirm={ async (values) => {
          await checkoutMutation.mutateAsync(values);
        }}
      />
      
    </Box>
    
  );
}