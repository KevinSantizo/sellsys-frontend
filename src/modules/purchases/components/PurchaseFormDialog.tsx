import {
  AddRounded,
  DeleteOutlineRounded,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import type { Product } from "../../catalog/products/types/product";
import type { Supplier } from "../suppliers/types/supplier";

import type {
  PurchaseFormValues,
  PurchaseItemFormValues,
  PurchasePaymentMethod,
} from "../../purchases/suppliers/types/purchase";

type PurchaseFormDialogProps = {
  open: boolean;
  title: string;
  submitLabel: string;
  initialValues?: PurchaseFormValues;
  suppliers: Supplier[];
  products: Product[];
  branchName: string;
  isSubmitting: boolean;
  isLoadingOptions: boolean;
  isLoadingPurchase: boolean;
  submitError: string | null;
  formatCurrency: (value: string | number) => string;

  createdProduct?: Product | null;
  createdProductItemIndex?: number | null;

  onCreateProduct: (itemIndex: number) => void;
  onProductConsumed: () => void;

  onClose: () => void;
  onSubmit: (values: PurchaseFormValues) => void;
};

const emptyPurchaseItem: PurchaseItemFormValues = {
  product_id: "",
  quantity: "1",
  unit_cost: "",
  sale_price: "",
  lot_number: "",
  expiration_date: "",
};

const emptyPurchaseValues: PurchaseFormValues = {
  supplier_id: "",
  supplier_invoice_number: "",
  purchase_date: getCurrentLocalDate(),
  payment_method: "CASH",
  discount_total: "",
  tax_total: "",
  notes: "",
  items: [
    { ...emptyPurchaseItem },
  ],
};

export function PurchaseFormDialog({
  open,
  title,
  submitLabel,
  initialValues,
  suppliers,
  products,
  branchName,
  isSubmitting,
  isLoadingOptions,
  isLoadingPurchase,
  submitError,
  formatCurrency,
  createdProduct,
  createdProductItemIndex,
  onCreateProduct,
  onProductConsumed,
  onClose,
  onSubmit,
}: PurchaseFormDialogProps) {
  const [values, setValues] = useState<PurchaseFormValues>(
    emptyPurchaseValues,
  );

  const [validationError, setValidationError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setValues(
      initialValues
        ? {
            ...initialValues,
            items: initialValues.items.map((item) => ({
              ...item,
            })),
          }
        : {
            ...emptyPurchaseValues,
            purchase_date: getCurrentLocalDate(),
            items: [
              { ...emptyPurchaseItem },
            ],
          },
    );

    setValidationError(null);
  }, [open, initialValues]);

  useEffect(() => {
    if (!createdProduct || createdProductItemIndex === null || createdProductItemIndex === undefined) {
      return;
    }

    setValues((current) => ({
      ...current,
      items: current.items.map((item, index) => {
        if (index !== createdProductItemIndex) {
          return item;
        }

        return {
          ...item,
          product_id: createdProduct.id,
          unit_cost: createdProduct.cost_price ?? "0.00",
          sale_price: createdProduct.sale_price ?? "0.00",
        };
      }),
    }));

    onProductConsumed();
  }, [
    createdProduct,
    createdProductItemIndex,
    onProductConsumed,
  ]);

  const updateValue = <Key extends keyof PurchaseFormValues>(
    key: Key,
    value: PurchaseFormValues[Key],
  ) => {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const updateItem = (
    index: number,
    key: keyof PurchaseItemFormValues,
    value: string,
  ) => {
    setValues((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        return {
          ...item,
          [key]: value,
        };
      }),
    }));
  };

  const handleProductChange = (
    index: number,
    productId: string,
  ) => {
    const product = products.find(
      (item) => item.id === productId,
    );

    setValues((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        return {
          ...item,
          product_id: productId,
          unit_cost: product?.cost_price ?? "0.00",
          sale_price: product?.sale_price ?? "0.00",
        };
      }),
    }));
  };

  const handleAddItem = () => {
    setValues((current) => ({
      ...current,
      items: [
        ...current.items,
        { ...emptyPurchaseItem },
      ],
    }));
  };

  const handleRemoveItem = (index: number) => {
    if (values.items.length === 1) {
      return;
    }

    setValues((current) => ({
      ...current,
      items: current.items.filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    }));
  };

  const subtotal = useMemo(() => {
    return values.items.reduce((total, item) => {
      const quantity = Number(item.quantity);
      const unitCost = Number(item.unit_cost);

      if (!Number.isFinite(quantity) || !Number.isFinite(unitCost)) {
        return total;
      }

      return total + quantity * unitCost;
    }, 0);
  }, [values.items]);

  const discountTotal = Number(values.discount_total) || 0;
  const taxTotal = Number(values.tax_total) || 0;

  const total = Math.max(
    0,
    subtotal - discountTotal + taxTotal,
  );

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setValidationError(null);

    if (isSubmitting || isLoadingPurchase) {
      return;
    }

    if (!values.supplier_id) {
      setValidationError(
        "Debes seleccionar un proveedor.",
      );

      return;
    }

    if (!values.purchase_date) {
      setValidationError(
        "Debes seleccionar la fecha de la compra.",
      );

      return;
    }

    if (values.items.length === 0) {
      setValidationError(
        "La compra debe contener al menos un producto.",
      );

      return;
    }

    const productIds = new Set<string>();

    for (const item of values.items) {
      if (!item.product_id) {
        setValidationError(
          "Debes seleccionar un producto en todas las líneas.",
        );

        return;
      }

      if (productIds.has(item.product_id)) {
        const product = products.find(
          (productItem) => productItem.id === item.product_id,
        );

        setValidationError(
          `El producto "${product?.name ?? "seleccionado"}" está repetido en la compra.`,
        );

        return;
      }

      productIds.add(item.product_id);

      const quantity = Number(item.quantity);
      const unitCost = Number(item.unit_cost);
      const salePrice = Number(item.sale_price);
      if (!Number.isFinite(quantity) || quantity <= 0) {
        setValidationError(
          "Todas las cantidades deben ser mayores a cero.",
        );

        return;
      }

      if (!Number.isFinite(unitCost) || unitCost < 0) {
        setValidationError(
          "Todos los costos unitarios deben ser válidos.",
        );

        return;
      }

      if (
        !Number.isFinite(salePrice) ||
        salePrice < 0
      ) {
        setValidationError(
          "Todos los precios de venta deben ser válidos.",
        );

        return;
      }
    }

    if (discountTotal < 0) {
      setValidationError(
        "El descuento no puede ser negativo.",
      );

      return;
    }

    if (discountTotal > subtotal) {
      setValidationError(
        "El descuento no puede ser mayor al subtotal.",
      );

      return;
    }

    if (taxTotal < 0) {
      setValidationError(
        "El impuesto no puede ser negativo.",
      );

      return;
    }

    onSubmit(values);
  };

  const loading = isLoadingOptions || isLoadingPurchase;

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="md"
      slotProps={{
        paper: {
          sx: {
            borderRadius: "5px",
            maxHeight: "calc(100vh - 32px)",
            overflow: "hidden",
          },
        },
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{
          display: "flex",
          flexDirection: "column",
          maxHeight: "calc(100vh - 32px)",
          overflow: "hidden",
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
          }}
        >
          {title}
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            p: 3,
          }}
        >
          {loading ? (
            <Stack
              sx={{
                minHeight: 340,
                alignItems: "center",
                justifyContent: "center",
                spacing: 1.5,
              }}
            >
              <CircularProgress size={32} />

              <Typography
                color="text.secondary"
                sx={{
                  fontSize: "0.85rem",
                }}
              >
                Cargando información...
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={3}>
              {(validationError || submitError) && (
                <Alert severity="error">
                  {validationError || submitError}
                </Alert>
              )}

              <Box>
                <Typography
                  sx={{
                    mb: 1.5,
                    fontSize: "0.9rem",
                    fontWeight: 800,
                  }}
                >
                  Información de la compra
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, minmax(0, 1fr))",
                    },
                    gap: 2,
                  }}
                >
                  <TextField
                    select
                    label="Proveedor"
                    value={values.supplier_id}
                    onChange={(event) => {
                      updateValue(
                        "supplier_id",
                        event.target.value,
                      );
                    }}
                    required
                    fullWidth
                    disabled={isSubmitting}
                  >
                    {suppliers.map((supplier) => (
                      <MenuItem
                        key={supplier.id}
                        value={supplier.id}
                      >
                        {supplier.name}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label="Factura del proveedor"
                    value={values.supplier_invoice_number}
                    onChange={(event) => {
                      updateValue(
                        "supplier_invoice_number",
                        event.target.value,
                      );
                    }}
                    fullWidth
                    disabled={isSubmitting}
                  />

                  <TextField
                    label="Fecha de compra"
                    type="date"
                    value={values.purchase_date}
                    onChange={(event) => {
                      updateValue(
                        "purchase_date",
                        event.target.value,
                      );
                    }}
                    required
                    fullWidth
                    disabled={isSubmitting}
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      },
                    }}
                  />

                  <TextField
                    select
                    label="Método de pago"
                    value={values.payment_method}
                    onChange={(event) => {
                      updateValue(
                        "payment_method",
                        event.target.value as PurchasePaymentMethod,
                      );
                    }}
                    fullWidth
                    disabled={isSubmitting}
                  >
                    <MenuItem value="CASH">
                      Efectivo
                    </MenuItem>

                    <MenuItem value="TRANSFER">
                      Transferencia
                    </MenuItem>

                    <MenuItem value="CARD">
                      Tarjeta
                    </MenuItem>

                    <MenuItem value="SUPPLIER_CREDIT">
                      Crédito de proveedor
                    </MenuItem>

                    <MenuItem value="OTHER">
                      Otro
                    </MenuItem>
                  </TextField>
                </Box>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 1.2,
                    fontSize: "0.76rem",
                  }}
                >
                  Sucursal: {branchName || "Sin sucursal seleccionada"}
                </Typography>
              </Box>

              <Box>
                <Box
                  sx={{
                    mb: 1.5,
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    width: "100%",
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "0.9rem",
                        fontWeight: 800,
                      }}
                    >
                      Productos
                    </Typography>

                    <Typography
                      color="text.secondary"
                      sx={{
                        mt: 0.25,
                        fontSize: "0.76rem",
                      }}
                    >
                      Agrega los productos incluidos en esta compra.
                    </Typography>
                  </Box>

                  <Button
                    type="button"
                    variant="outlined"
                    startIcon={<AddRounded />}
                    onClick={handleAddItem}
                    disabled={isSubmitting}
                    sx={{
                      borderRadius: "5px",
                      textTransform: "none",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    Agregar producto
                  </Button>
                </Box>

                <Stack spacing={1.25}>
                  {values.items.map((item, index) => {
                    const itemSubtotal =
                      (Number(item.quantity) || 0) *
                      (Number(item.unit_cost) || 0);

                    return (
                      <Box
                        key={index}
                        sx={{
                          position: "relative",
                          p: {
                            xs: 1.5,
                            sm: 2,
                          },
                          pr: {
                            xs: 1.5,
                            sm: 6,
                          },
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: "5px",
                          bgcolor: "#FFFFFF",
                        }}
                      >
                      
                        <Stack spacing={1.5}>
                          {/* PRIMERA FILA */}
                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: {
                                xs: "1fr",
                                sm: "repeat(2, minmax(0, 1fr))",
                                 md: "minmax(240px, 2fr) minmax(100px, 0.65fr) minmax(130px, 0.85fr) minmax(130px, 0.85fr) 56px",
                              },
                              gap: 1.25,
                              alignItems: "center",
                            }}
                          > 
                            {/* PRODUCTO */}
                            <TextField
                              select
                              label="Producto"
                              value={item.product_id}
                              onChange={(event) => {
                                handleProductChange(
                                  index,
                                  event.target.value,
                                );
                              }}
                              required
                              fullWidth
                              disabled={isSubmitting}
                            >
                              {products.map((product) => (
                                <MenuItem
                                  key={product.id}
                                  value={product.id}
                                  disabled={values.items.some(
                                    (
                                      purchaseItem,
                                      purchaseItemIndex,
                                    ) =>
                                      purchaseItemIndex !== index &&
                                      purchaseItem.product_id === product.id,
                                  )}
                                >
                                  {product.name} - {product.sku}
                                </MenuItem>
                              ))}
                            </TextField>

                            {/* CANTIDAD */}
                            <TextField
                              label="Cantidad"
                              type="number"
                              value={item.quantity}
                              onChange={(event) => {
                                updateItem(
                                  index,
                                  "quantity",
                                  event.target.value,
                                );
                              }}
                              required
                              fullWidth
                              disabled={isSubmitting}
                              slotProps={{
                                htmlInput: {
                                  min: 0.001,
                                  step: 0.001,
                                },
                              }}
                            />

                            {/* COSTO */}
                            <TextField
                              label="Costo unitario"
                              type="number"
                              value={item.unit_cost}
                              onChange={(event) => {
                                updateItem(
                                  index,
                                  "unit_cost",
                                  event.target.value,
                                );
                              }}
                              placeholder="0.00"
                              required
                              fullWidth
                              disabled={isSubmitting}
                              slotProps={{
                                htmlInput: {
                                  min: 0,
                                  step: 0.01,
                                },
                              }}
                            />

                            {/* PRECIO DE VENTA */}
                            <TextField
                              label="Precio de venta"
                              type="number"
                              value={item.sale_price}
                              onChange={(event) => {
                                updateItem(
                                  index,
                                  "sale_price",
                                  event.target.value,
                                );
                              }}
                              placeholder="0.00"
                              required
                              fullWidth
                              disabled={isSubmitting}
                              slotProps={{
                                htmlInput: {
                                  min: 0,
                                  step: 0.01,
                                },
                              }}
                            />
                            <IconButton
                              type="button"
                              onClick={() => {
                                handleRemoveItem(index);
                              }}
                              disabled={
                                isSubmitting ||
                                values.items.length === 1
                              }
                              sx={{
                                width: 44,
                                height: 44,
                                borderRadius: "5px",
                                color: "error.main",
                                alignSelf: "center",
                                justifySelf: "center",
                              }}
                            >
                              <DeleteOutlineRounded
                                sx={{
                                  fontSize: 27,
                                }}
                              />
                            </IconButton>
                          </Box>

                          <Button
                            type="button"
                            size="small"
                            startIcon={<AddRounded />}
                            onClick={() => {
                              onCreateProduct(index);
                            }}
                            disabled={isSubmitting}
                            sx={{
                              alignSelf: "flex-start",
                              minWidth: 0,
                              px: 0.5,
                              textTransform: "none",
                              fontWeight: 700,
                            }}
                          >
                            Crear nuevo producto
                          </Button>
                           
                          {/* SEGUNDA FILA */}
                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: {
                                xs: "1fr",
                                sm: "repeat(2, minmax(0, 1fr))",
                                md: "minmax(200px, 1fr) minmax(200px, 1fr) minmax(160px, 0.7fr)",
                              },
                              gap: 1.25,
                              ml: {
                                xs: 0,
                                md: 0,
                              },
                            }}
                          >
                            {/* LOTE */}
                            <TextField
                              label="Lote"
                              value={item.lot_number}
                              onChange={(event) => {
                                updateItem(
                                  index,
                                  "lot_number",
                                  event.target.value,
                                );
                              }}
                              placeholder="Ej. LOT-2026-001"
                              fullWidth
                              disabled={isSubmitting}
                            />

                            {/* VENCIMIENTO */}
                            <TextField
                              label="Vencimiento"
                              type="date"
                              value={item.expiration_date}
                              onChange={(event) => {
                                updateItem(
                                  index,
                                  "expiration_date",
                                  event.target.value,
                                );
                              }}
                              fullWidth
                              disabled={isSubmitting}
                              slotProps={{
                                inputLabel: {
                                  shrink: true,
                                },
                              }}
                            />

                            {/* SUBTOTAL */}
                            <Box
                              sx={{
                                minHeight: 56,
                                px: 1.5,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: "5px",
                                bgcolor: "#FAFAFA",
                              }}
                            >
                              <Typography
                                color="text.secondary"
                                sx={{
                                  fontSize: "0.68rem",
                                }}
                              >
                                Subtotal
                              </Typography>

                              <Typography
                                sx={{
                                  mt: 0.2,
                                  fontSize: "0.9rem",
                                  fontWeight: 800,
                                }}
                              >
                                {formatCurrency(itemSubtotal)}
                              </Typography>
                            </Box>
                          </Box>
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>

              <Box>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, minmax(0, 1fr))",
                    },
                    gap: 2,
                  }}
                >
                  <TextField
                    label="Descuento"
                    type="number"
                    value={values.discount_total}
                    onChange={(event) => {
                      updateValue(
                        "discount_total",
                        event.target.value,
                      );
                    }}
                    placeholder="0.00"
                    fullWidth
                    disabled={isSubmitting}
                    slotProps={{
                      htmlInput: {
                        min: 0,
                        step: 0.01,
                      },
                    }}
                  />

                  <TextField
                    label="Impuesto"
                    type="number"
                    value={values.tax_total}
                    onChange={(event) => {
                      updateValue(
                        "tax_total",
                        event.target.value,
                      );
                    }}
                    placeholder="0.00"
                    fullWidth
                    disabled={isSubmitting}
                    slotProps={{
                      htmlInput: {
                        min: 0,
                        step: 0.01,
                      },
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    mt: 2,
                    ml: "auto",
                    width: {
                      xs: "100%",
                      sm: 320,
                    },
                  }}
                >
                  <Typography
                    sx={{
                      mb: 1.5,
                      fontSize: "0.9rem",
                      fontWeight: 700,
                    }}
                  >
                    Totales
                  </Typography>

                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "#FAFAFA",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: "5px",
                    }}
                  >
                    <SummaryRow
                      label="Subtotal"
                      value={formatCurrency(subtotal)}
                    />

                    <SummaryRow
                      label="Descuento"
                      value={`- ${formatCurrency(discountTotal)}`}
                    />

                    <SummaryRow
                      label="Impuesto"
                      value={formatCurrency(taxTotal)}
                    />

                    <Box
                      sx={{
                        mt: 1.25,
                        pt: 1.25,
                        borderTop: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "0.9rem",
                            fontWeight: 800,
                          }}
                        >
                          Total
                        </Typography>

                        <Typography
                          color="primary.main"
                          sx={{
                            fontSize: "1rem",
                            fontWeight: 700,
                          }}
                        >
                          {formatCurrency(total)}
                        </Typography>
                      </Stack>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <TextField
                label="Notas"
                value={values.notes}
                onChange={(event) => {
                  updateValue(
                    "notes",
                    event.target.value,
                  );
                }}
                multiline
                minRows={3}
                fullWidth
                disabled={isSubmitting}
              />
            </Stack>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            flexShrink: 0,
            bgcolor: "#FFFFFF",
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Button
            type="button"
            variant="outlined"
            onClick={onClose}
            disabled={isSubmitting}
            sx={{
              borderRadius: "5px",
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || loading}
            sx={{
              borderRadius: "5px",
              textTransform: "none",
              fontWeight: 700,
              minWidth: 130,
            }}
          >
            {isSubmitting ? (
              <CircularProgress
                size={20}
                color="inherit"
              />
            ) : (
              submitLabel
            )}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

type SummaryRowProps = {
  label: string;
  value: string;
};

function SummaryRow({
  label,
  value,
}: SummaryRowProps) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        py: 0.4,
        justifyContent: "space-between",
      }}
    >
      <Typography
        color="text.secondary"
        sx={{
          fontSize: "0.8rem",
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: "0.8rem",
          fontWeight: 700,
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

function getCurrentLocalDate() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}