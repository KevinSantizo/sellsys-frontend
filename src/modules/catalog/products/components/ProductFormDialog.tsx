import { CropFree, InfoOutlined } from "@mui/icons-material";

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
  Drawer,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import type {
  BrandOption,
  CategoryOption,
  ProductFormValues,
  ProductType,
  UnitOption,
} from "../types/product";
 
import { BarcodeScannerInline } from "../../../sales/components/BarcodeScannerInline";
import { uploadProductImage } from "../services/productService";
import AddIcon from "@mui/icons-material/Add";
import CameraAltOutlinedIcon from "@mui/icons-material/CameraAltOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import CloseIcon from "@mui/icons-material/Close";

type ProductFormDialogProps = {
  open: boolean;
  title: string;
  submitLabel: string;
  initialValues?: ProductFormValues; 
  isEditing: boolean;
  branchName: string;
  isSubmitting: boolean;
  isLoadingOptions: boolean;
  isLoadingProduct: boolean;
  submitError: string | null;
  categories: CategoryOption[];
  brands: BrandOption[];
  units: UnitOption[];
  hideInitialStock?: boolean;
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
  content_quantity: "",
  content_unit_id: "",
  sale_price: "",
  track_inventory: true,
  is_active: true,
  initial_stock: "",
  package_quantity: "",
  package_unit_id: "", 
  image_url: null,
  image_public_id: null,
};

export function ProductFormDialog({
  open,
  title,
  submitLabel,
  initialValues,
  isEditing,
  branchName,
  isSubmitting,
  isLoadingOptions,
  isLoadingProduct,
  submitError,
  categories,
  brands,
  units,
  hideInitialStock = false,
  onClose,
  onSubmit,
}: ProductFormDialogProps) {

  const [barcodeScannerOpen, setBarcodeScannerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [values, setValues] = useState<ProductFormValues>( emptyProductValues, );
  const [validationError, setValidationError] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false); 
  const [imageSourceOpen, setImageSourceOpen] =  useState(false);

  useEffect(() => {
    if (!open) {
      setBarcodeScannerOpen(false);
      return;
    }

    setValues({
      ...(initialValues ?? emptyProductValues),
    });

    setSelectedImage(null);

    setImagePreview(
      initialValues?.image_url ?? null,
    );

    setValidationError(null);
    setBarcodeScannerOpen(false);
  }, [open, initialValues]);

  const updateValue = <Key extends keyof ProductFormValues>(
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

      initial_stock:
      productType === "PRODUCT"
        ? current.initial_stock
        : "0",
    }));
  };

  const handleImageChange = ( event: ChangeEvent<HTMLInputElement>, ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setValidationError(
        "Debes seleccionar un archivo de imagen válido.",
      );

      return;
    }

    if (
      imagePreview &&
      imagePreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(
        imagePreview,
      );
    }

    setSelectedImage(
      file,
    );

    const previewUrl =
      URL.createObjectURL(
        file,
      );

    setImagePreview(
      previewUrl,
    );

    setValidationError(null);

    setImageSourceOpen(false);
  };

  const handleRemoveImage = () => {
    if (
      imagePreview &&
      imagePreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(
        imagePreview,
      );
    }

    setSelectedImage(null);
    setImagePreview(null);

    setValues((current) => ({
      ...current,
      image_url: null,
      image_public_id: null,
    }));
  };

  useEffect(() => {
    return () => {
      if (
        imagePreview &&
        imagePreview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(
          imagePreview,
        );
      }
    };
  }, [imagePreview]);

  const handleSubmit = async (
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

    if (
      !hideInitialStock &&
      !isEditing &&
      values.product_type === "PRODUCT" &&
      values.track_inventory
    ) {
      const initialStock = Number(
        values.initial_stock,
      );

      if (
        values.initial_stock === "" ||
        !Number.isFinite(initialStock) ||
        initialStock < 0
      ) {
        setValidationError(
          "Debes ingresar un stock inicial válido.",
        );

        return;
      }
    }

    let imageUrl = values.image_url ?? null;

    let imagePublicId = values.image_public_id ?? null;

    if (selectedImage) {
      try {
        setIsUploadingImage(true); 
        const uploadedImage = await uploadProductImage(selectedImage); 
        imageUrl = uploadedImage.image_url; 
        imagePublicId = uploadedImage.image_public_id;
        } catch {
          setValidationError(
            "No se pudo subir la imagen del producto.",
          );

          return;
        } finally {
          setIsUploadingImage(false);
        }
      }
      
      onSubmit({
        ...values, 
        image_url: imageUrl, 
        image_public_id: imagePublicId,
    });
  };

  const handleClose = () => {
    if (
      isSubmitting ||
      isUploadingImage ||
      isLoadingProduct
    ) {
      return;
    }

    onClose();
  };

  return (
    <>
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
            fontWeight: 700,
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
              <Box>
                <Typography
                  sx={{
                    mb: 1,
                    fontWeight: 600,
                    fontSize: "0.875rem",
                  }}
                >
                  Imagen del producto
                </Typography>

                {!imagePreview ? (
                  <>
                    {isMobile ? (
                      <Box
                        onClick={() => {
                          setImageSourceOpen(true);
                        }}
                        sx={{
                          width: 180,
                          height: 120,
                          border: "1.5px dashed",
                          borderColor: "divider",
                          borderRadius: "5px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          bgcolor: "background.paper",
                          transition: "all 150ms ease",

                          "&:hover": {
                            borderColor: "primary.main",
                            bgcolor: "action.hover",
                          },
                        }}
                      >
                        <AddIcon
                          sx={{
                            fontSize: 34,
                            mb: 0.5,
                            color: "text.primary",
                          }}
                        />

                        <Typography
                          sx={{
                            fontSize: "0.75rem",
                            color: "text.secondary",
                          }}
                        >
                          Agregar imagen
                        </Typography>
                      </Box>
                    ) : (
                      <Box
                        component="label"
                        sx={{
                          width: 180,
                          height: 120,
                          border: "1.5px dashed",
                          borderColor: "divider",
                          borderRadius: "5px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          bgcolor: "background.paper",
                          transition: "all 150ms ease",

                          "&:hover": {
                            borderColor: "primary.main",
                            bgcolor: "action.hover",
                          },
                        }}
                      >
                        <ImageOutlinedIcon
                          sx={{
                            fontSize: 34,
                            mb: 0.5,
                            color: "text.secondary",
                          }}
                        />

                        <Typography
                          sx={{
                            fontSize: "0.75rem",
                            color: "text.secondary",
                          }}
                        >
                          Seleccionar imagen
                        </Typography>

                        <input
                          hidden
                          type="file"
                          accept="image/*"
                          onChange={
                            handleImageChange
                          }
                        />
                      </Box>
                    )}
                  </>
                ) : (
                  <Box
                    sx={{
                      position: "relative",
                      width: 180,
                      height: 120,
                      borderRadius: "5px",
                      overflow: "hidden",
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.paper",
                    }}
                  >
                    <Box
                      component="img"
                      src={imagePreview}
                      alt="Vista previa del producto"
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        bgcolor: "background.paper",
                        p: 0.5,
                      }}
                    />

                    <IconButton
                      type="button"
                      size="small"
                      onClick={
                        handleRemoveImage
                      }
                      disabled={
                        isSubmitting ||
                        isUploadingImage
                      }
                      sx={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        bgcolor: "background.paper",
                        boxShadow: 1,

                        "&:hover": {
                          bgcolor:
                            "background.paper",
                        },
                      }}
                    >
                      <CloseIcon
                        fontSize="small"
                      />
                    </IconButton>
                  </Box>
                )}
              </Box>
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

                <Box>
                  <TextField
                    label="Código de barras"
                    value={values.barcode}
                    onChange={(event) => {
                      updateValue("barcode", event.target.value);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        event.stopPropagation();
                      }
                    }}
                    fullWidth
                    disabled={isSubmitting}
                  />

                  {isMobile && !barcodeScannerOpen && (
                    <Button
                      type="button"
                      variant="outlined"
                      fullWidth
                      startIcon={<CropFree />}
                      disabled={isSubmitting}
                      onClick={() => {
                        setBarcodeScannerOpen(true);
                      }}
                      sx={{
                        mt: 1,
                        minHeight: 42,
                        borderRadius: "5px",
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                    >
                      Escanear código
                    </Button>
                  )}
                </Box>

                {isMobile && barcodeScannerOpen && (
                  <Box sx={{ gridColumn: "1 / -1" }}>
                    <BarcodeScannerInline
                      open={barcodeScannerOpen}
                      onClose={() => {
                        setBarcodeScannerOpen(false);
                      }}
                      onDetected={async (barcode) => {
                        updateValue("barcode", barcode);
                        return true;
                      }}
                    />
                  </Box>
                )}

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

                <Box
                  sx={{
                      gridColumn: "1 / -1",
                      display: "grid",
                      gridTemplateColumns: {
                          xs: "1fr",
                          md: "repeat(3, 1fr)",
                      },
                      gap: 2,
                  }}
              >
                  <TextField
                      select
                      label="Unidad de inventario"
                      value={ values.base_unit_id }
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
                      sx={{
                          "& .MuiOutlinedInput-root": {
                              borderRadius: "5px",
                          },
                      }}
                  >
                      { units.map((unit) => (
                          <MenuItem
                              key={ unit.id }
                              value={ unit.id }
                          >
                              { unit.name } ({ unit.symbol })
                          </MenuItem>
                      )) }
                  </TextField>

                  <TextField
                      label="Presentación"
                      type="number"
                      value={ values.content_quantity }
                      onChange={(event) => {
                          updateValue(
                              "content_quantity",
                              event.target.value,
                          );
                      }}
                      disabled={ isSubmitting }
                      placeholder="Ej. 473"
                      fullWidth
                      slotProps={{
                          htmlInput: {
                              min: 0,
                              step: "any",
                          },
                      }}
                      sx={{
                          "& .MuiOutlinedInput-root": {
                              borderRadius: "5px",
                          },
                      }}
                  />

                  <TextField
                      select
                      label="Unidad de presentación"
                      value={ values.content_unit_id }
                      onChange={(event) => {
                          updateValue(
                              "content_unit_id",
                              event.target.value,
                          );
                      }}
                      disabled={
                          isSubmitting ||
                          isLoadingOptions
                      }
                      fullWidth
                      sx={{
                          "& .MuiOutlinedInput-root": {
                              borderRadius: "5px",
                          },
                      }}
                  >
                      <MenuItem value="">
                          No aplica
                      </MenuItem>

                      { units.map((unit) => (
                          <MenuItem
                              key={ unit.id }
                              value={ unit.id }
                          >
                              { unit.name } ({ unit.symbol })
                          </MenuItem>
                      )) }
                  </TextField>
                </Box>

                <Box
                  sx={{
                    mt:1,
                    gridColumn: "1 / -1",
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        md: (
                            !isEditing &&
                            values.product_type === "PRODUCT" &&
                            values.track_inventory
                        )
                            ? "repeat(3, 1fr)"
                            : "repeat(2, 1fr)",
                    },
                    gap: 2,
                  }}
                >
                    {!hideInitialStock &&
                      !isEditing &&
                      values.product_type === "PRODUCT" &&
                      values.track_inventory && (
                            <TextField
                                label="Stock inicial"
                                type="number"
                                placeholder="0.00"
                                value={ values.initial_stock }
                                onChange={(event) => {
                                    updateValue(
                                        "initial_stock",
                                        event.target.value,
                                    );
                                }}
                                helperText={
                                    `Existencia inicial en ${branchName}`
                                }
                                fullWidth
                                disabled={ isSubmitting }
                                slotProps={{
                                    inputLabel: {
                                        shrink: true,
                                    },
                                    htmlInput: {
                                        min: 0,
                                        step: "0.001",
                                    },
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: "5px",
                                    },
                                }}
                            />
                        )}

                    <TextField
                        label="Precio costo*"
                        type="number"
                        value={ values.cost_price }
                        placeholder="0.00"
                        onChange={(event) => {
                            updateValue(
                                "cost_price",
                                event.target.value,
                            );
                        }}
                        fullWidth
                        disabled={ isSubmitting }
                        slotProps={{
                            inputLabel: {
                                shrink: true,
                            },
                            htmlInput: {
                                min: 0,
                                step: "0.1",
                            },
                        }}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "5px",
                            },
                        }}
                    />

                    <TextField
                        label="Precio de venta"
                        type="number"
                        value={ values.sale_price }
                        placeholder="0.00"
                        onChange={(event) => {
                            updateValue(
                                "sale_price",
                                event.target.value,
                            );
                        }}
                        required
                        fullWidth
                        disabled={ isSubmitting }
                        slotProps={{
                            inputLabel: {
                                shrink: true,
                            },
                            htmlInput: {
                                min: 0,
                                step: "0.1",
                            },
                        }}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "5px",
                            },
                        }}
                    />
                </Box>
 
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
              isUploadingImage ||
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
              isUploadingImage ||
              isLoadingOptions ||
              isLoadingProduct ||
              units.length === 0
            }
            sx={{
              borderRadius: "5px",
            }}
          >
            {isUploadingImage
            ? "Subiendo imagen..."
            : isSubmitting
              ? "Guardando..."
              : submitLabel}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
    <Drawer
      anchor="bottom"
      open={
        imageSourceOpen
      }
      onClose={() => {
        setImageSourceOpen(
          false,
        );
      }}
      slotProps={{
        paper: {
          sx: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            px: 2,
            pt: 1.5,
            pb: 3,
          },
        },
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 4,
          bgcolor: "divider",
          borderRadius: 10,
          mx: "auto",
          mb: 2,
        }}
      />

      <Typography
        sx={{
          fontWeight: 700,
          fontSize: "1rem",
          mb: 1.5,
        }}
      >
        Agregar imagen
      </Typography>

      <Stack
        spacing={1}
      >
        <Button
          component="label"
          variant="text"
          startIcon={
            <ImageOutlinedIcon />
          }
          sx={{
            minHeight: 52,
            justifyContent:
              "flex-start",
            textTransform:
              "none",
            color:
              "text.primary",
            fontWeight: 500,
          }}
        >
          Seleccionar desde la galería

          <input
            hidden
            type="file"
            accept="image/*"
            onChange={
              handleImageChange
            }
          />
        </Button>

        <Button
          component="label"
          variant="text"
          startIcon={
            <CameraAltOutlinedIcon />
          }
          sx={{
            minHeight: 52,
            justifyContent:
              "flex-start",
            textTransform:
              "none",
            color:
              "text.primary",
            fontWeight: 500,
          }}
        >
          Tomar foto

          <input
            hidden
            type="file"
            accept="image/*"
            capture="environment"
            onChange={
              handleImageChange
            }
          />
        </Button>
      </Stack>
    </Drawer>
    </>
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