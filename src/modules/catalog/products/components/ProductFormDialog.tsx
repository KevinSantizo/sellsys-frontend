import { InfoOutlined } from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import type {
  BrandOption,
  CategoryOption,
  ProductFormValues,
  ProductType,
  UnitOption,
} from "../types/product";

type ProductFormDialogProps = {
  open: boolean;
  title: string;
  submitLabel: string;
  initialValues?: ProductFormValues;
  isSubmitting: boolean;
  isLoadingOptions: boolean;
  isLoadingProduct: boolean;
  submitError: string | null;
  categories: CategoryOption[];
  brands: BrandOption[];
  units: UnitOption[];
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => void;
};

const emptyProductValues: ProductFormValues = {
  name: "",
  description: "",
  sku: "",
  barcode: "",
  product_type: "PRODUCT",
  category_id: "",
  brand_id: "",
  base_unit_id: "",
  cost_price: "",
  sale_price: "",
  track_inventory: true,
  is_active: true,
};

export function ProductFormDialog({
  open,
  title,
  submitLabel,
  initialValues,
  isSubmitting,
  isLoadingOptions,
  isLoadingProduct,
  submitError,
  categories,
  brands,
  units,
  onClose,
  onSubmit,
}: ProductFormDialogProps) {
  const [values, setValues] =
    useState<ProductFormValues>(
      emptyProductValues,
    );

  const [validationError, setValidationError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setValues({
      ...(initialValues ?? emptyProductValues),
    });

    setValidationError(null);
  }, [open, initialValues]);

  const updateValue = <
    Key extends keyof ProductFormValues,
  >(
    key: Key,
    value: ProductFormValues[Key],
  ) => {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleProductTypeChange = (
    productType: ProductType,
  ) => {
    setValues((current) => ({
      ...current,
      product_type: productType,
      track_inventory:
        productType === "PRODUCT",
    }));
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setValidationError(null);

    if (isSubmitting || isLoadingProduct) {
      return;
    }

    if (!values.name.trim()) {
      setValidationError(
        "Debes ingresar el nombre del producto.",
      );

      return;
    }

    if (!values.sku.trim()) {
      setValidationError(
        "Debes ingresar el SKU.",
      );

      return;
    }

    if (!values.base_unit_id) {
      setValidationError(
        "Debes seleccionar una unidad de medida.",
      );

      return;
    }

    if (
      values.cost_price &&
      Number(values.cost_price) < 0
    ) {
      setValidationError(
        "El costo no puede ser negativo.",
      );

      return;
    }

    if (
      !values.sale_price ||
      Number.isNaN(Number(values.sale_price)) ||
      Number(values.sale_price) < 0
    ) {
      setValidationError(
        "Debes ingresar un precio de venta válido.",
      );

      return;
    }

    onSubmit(values);
  };

  const handleClose = () => {
    if (
      isSubmitting ||
      isLoadingProduct
    ) {
      return;
    }

    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      slotProps={{
        paper: {
          sx: {
            borderRadius: "5px",
          },
        },
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
          }}
        >
          {title}
        </DialogTitle>

        <DialogContent dividers>
          {isLoadingProduct ? (
            <Box
              sx={{
                minHeight: 340,
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
                  Cargando producto...
                </Typography>
              </Stack>
            </Box>
          ) : (
            <Stack spacing={2.5}>
              {(validationError ||
                submitError) && (
                <Alert severity="error">
                  {validationError ||
                    submitError}
                </Alert>
              )}

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
                  label="Nombre"
                  value={values.name}
                  onChange={(event) => {
                    updateValue(
                      "name",
                      event.target.value,
                    );
                  }}
                  required
                  fullWidth
                  disabled={isSubmitting}
                />

                <TextField
                  label="SKU"
                  value={values.sku}
                  onChange={(event) => {
                    updateValue(
                      "sku",
                      event.target.value.toUpperCase(),
                    );
                  }}
                  required
                  fullWidth
                  disabled={isSubmitting}
                />

                <TextField
                  label="Código de barras"
                  value={values.barcode}
                  onChange={(event) => {
                    updateValue(
                      "barcode",
                      event.target.value,
                    );
                  }}
                  fullWidth
                  disabled={isSubmitting}
                />

                <TextField
                  select
                  label="Tipo"
                  value={values.product_type}
                  onChange={(event) => {
                    handleProductTypeChange(
                      event.target
                        .value as ProductType,
                    );
                  }}
                  fullWidth
                  disabled={isSubmitting}
                >
                  <MenuItem value="PRODUCT">
                    Producto
                  </MenuItem>

                  <MenuItem value="SERVICE">
                    Servicio
                  </MenuItem>
                </TextField>

                <TextField
                  select
                  label="Categoría"
                  value={values.category_id}
                  onChange={(event) => {
                    updateValue(
                      "category_id",
                      event.target.value,
                    );
                  }}
                  fullWidth
                  disabled={
                    isSubmitting ||
                    isLoadingOptions
                  }
                >
                  <MenuItem value="">
                    Sin categoría
                  </MenuItem>

                  {categories.map(
                    (category) => (
                      <MenuItem
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </MenuItem>
                    ),
                  )}
                </TextField>

                <TextField
                  select
                  label="Marca"
                  value={values.brand_id}
                  onChange={(event) => {
                    updateValue(
                      "brand_id",
                      event.target.value,
                    );
                  }}
                  fullWidth
                  disabled={
                    isSubmitting ||
                    isLoadingOptions
                  }
                >
                  <MenuItem value="">
                    Sin marca
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

                <TextField
                  select
                  label="Unidad de medida"
                  value={values.base_unit_id}
                  onChange={(event) => {
                    updateValue(
                      "base_unit_id",
                      event.target.value,
                    );
                  }}
                  required
                  fullWidth
                  disabled={
                    isSubmitting ||
                    isLoadingOptions
                  }
                >
                  {units.map((unit) => (
                    <MenuItem
                      key={unit.id}
                      value={unit.id}
                    >
                      {unit.name} ({unit.symbol})
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Costo"
                  type="number"
                  value={values.cost_price}
                  placeholder="0.00"
                  onChange={(event) => {
                    updateValue(
                      "cost_price",
                      event.target.value,
                    );
                  }}
                  fullWidth
                  disabled={isSubmitting}
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                    htmlInput: {
                      min: 0,
                      step: "0.01",
                    },
                  }}
                />

                <TextField
                  label="Precio de venta"
                  type="number"
                  value={values.sale_price}
                  placeholder="0.00"
                  onChange={(event) => {
                    updateValue(
                      "sale_price",
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
                    htmlInput: {
                      min: 0,
                      step: "0.01",
                    },
                  }}
                />
              </Box>

              <TextField
                label="Descripción"
                value={values.description}
                onChange={(event) => {
                  updateValue(
                    "description",
                    event.target.value,
                  );
                }}
                multiline
                minRows={2}
                fullWidth
                disabled={isSubmitting}
              />

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={{
                  xs: 1,
                  sm: 4,
                }}
                sx={{
                  alignItems: {
                    xs: "flex-start",
                    sm: "center",
                  },
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={values.track_inventory}
                      disabled
                      onChange={(event) => {
                        updateValue(
                          "track_inventory",
                          event.target.checked,
                        );
                      }}
                    />
                  }
                  label={
                    <CheckboxLabelWithInfo
                      label="Controlar inventario"
                      description={
                        values.product_type ===
                        "SERVICE"
                          ? "Los servicios no manejan existencias físicas, por lo que el control de inventario permanece desactivado."
                          : "Permite registrar y descontar las existencias físicas de este producto por cada sucursal."
                      }
                    />
                  }
                  sx={{
                    m: 0,
                  }}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={values.is_active}
                      disabled={isSubmitting}
                      onChange={(event) => {
                        updateValue(
                          "is_active",
                          event.target.checked,
                        );
                      }}
                    />
                  }
                  label={
                    <CheckboxLabelWithInfo
                      label="Producto activo"
                      description="Indica que el producto está disponible para utilizarse y venderse. Si se desactiva, se conserva su historial, pero ya no estará disponible para nuevas operaciones."
                    />
                  }
                  sx={{
                    m: 0,
                  }}
                />
              </Stack>
            </Stack>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
          }}
        >
          <Button
            type="button"
            variant="outlined"
            onClick={handleClose}
            disabled={
              isSubmitting ||
              isLoadingProduct
            }
            sx={{
              borderRadius: "5px",
            }}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={
              isSubmitting ||
              isLoadingOptions ||
              isLoadingProduct ||
              units.length === 0
            }
            sx={{
              borderRadius: "5px",
            }}
          >
            {isSubmitting
              ? "Guardando..."
              : submitLabel}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

type CheckboxLabelWithInfoProps = {
  label: string;
  description: string;
};

function CheckboxLabelWithInfo({
  label,
  description,
}: CheckboxLabelWithInfoProps) {
  return (
    <Box
      component="span"
      sx={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        minHeight: 30,
        pr: 3,
      }}
    >
      <Typography
        component="span"
        sx={{
          fontSize: "1rem",
          fontWeight: 500,
          lineHeight: 1.4,
        }}
      >
        {label}
      </Typography>

      <Tooltip
        title={description}
        arrow
        placement="top"
        enterDelay={250}
        slotProps={{
          tooltip: {
            sx: {
              maxWidth: 400,
              px: 1.75,
              py: 1.25,
              fontSize: "1rem",
              lineHeight: 1.5,
            },
          },
          arrow: {
            sx: {
              color: "grey.800",
            },
          },
        }}
      >
        <Box
          component="span"
          tabIndex={0}
          aria-label={`Información sobre ${label}`}
          sx=
            {{
              position: "absolute",
              top: -2,
              right: 0,
              display: "inline-flex",
              color: "info.main",
              outline: "none",
              transition: "color 150ms ease, transform 150ms ease",

              "&:hover": {
                  color: "info.dark",
                  transform: "scale(1.1)",
              },

              "&:focus-visible": {
                  color: "info.dark",
              },
          }}
        >
          <InfoOutlined
            sx={{
              fontSize: 20,
            }}
          />
        </Box>
      </Tooltip>
    </Box>
  );
}