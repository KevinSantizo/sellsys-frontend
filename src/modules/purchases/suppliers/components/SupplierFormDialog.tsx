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
  SupplierFormValues,
} from "../types/supplier";


type SupplierFormDialogProps = {
  open: boolean;

  title: string;

  submitLabel: string;

  initialValues?: SupplierFormValues;

  isSubmitting: boolean;

  isLoadingSupplier: boolean;

  submitError: string | null;

  onClose: () => void;

  onSubmit: (
    values: SupplierFormValues,
  ) => void;
};


const emptySupplierValues:
  SupplierFormValues = {
    name: "",
    tax_id: "",
    contact_name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
    is_active: true,
  };


export function SupplierFormDialog({
  open,
  title,
  submitLabel,
  initialValues,
  isSubmitting,
  isLoadingSupplier,
  submitError,
  onClose,
  onSubmit,
}: SupplierFormDialogProps) {
  const [values, setValues] =
    useState<SupplierFormValues>(
      emptySupplierValues,
    );

  const [
    validationError,
    setValidationError,
  ] = useState<string | null>(
    null,
  );


  useEffect(() => {
    if (!open) {
      return;
    }

    setValues({
      ...(
        initialValues ??
        emptySupplierValues
      ),
    });

    setValidationError(null);
  }, [
    open,
    initialValues,
  ]);


  const updateValue = <
    Key extends keyof SupplierFormValues,
  >(
    key: Key,
    value: SupplierFormValues[Key],
  ) => {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));
  };


  const handleSubmit = (
    event:
      FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setValidationError(null);

    if (
      isSubmitting ||
      isLoadingSupplier
    ) {
      return;
    }


    if (!values.name.trim()) {
      setValidationError(
        "Debes ingresar el nombre del proveedor.",
      );

      return;
    }


    if (
      values.email.trim() &&
      !isValidEmail(
        values.email.trim(),
      )
    ) {
      setValidationError(
        "Debes ingresar un correo electrónico válido.",
      );

      return;
    }


    onSubmit(values);
  };


  const handleClose = () => {
    if (
      isSubmitting ||
      isLoadingSupplier
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
          {isLoadingSupplier ? (
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
                  alignItems:
                    "center",
                }}
              >
                <CircularProgress />

                <Typography
                  variant="body2"
                  sx={{
                    color:
                      "text.secondary",
                  }}
                >
                  Cargando proveedor...
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

                  gridTemplateColumns:
                    {
                      xs: "1fr",

                      sm: "repeat(2, minmax(0, 1fr))",
                    },

                  gap: 2,
                }}
              >
                {/* Nombre */}
                <TextField
                  label="Nombre"
                  value={values.name}
                  onChange={(
                    event,
                  ) => {
                    updateValue(
                      "name",
                      event.target.value,
                    );
                  }}
                  required
                  fullWidth
                  disabled={
                    isSubmitting
                  }
                />


                {/* NIT */}
                <TextField
                  label="NIT"
                  value={
                    values.tax_id
                  }
                  onChange={(
                    event,
                  ) => {
                    updateValue(
                      "tax_id",
                      event.target.value,
                    );
                  }}
                  fullWidth
                  disabled={
                    isSubmitting
                  }
                />


                {/* Contacto */}
                <TextField
                  label="Nombre de contacto"
                  value={
                    values.contact_name
                  }
                  onChange={(
                    event,
                  ) => {
                    updateValue(
                      "contact_name",
                      event.target.value,
                    );
                  }}
                  fullWidth
                  disabled={
                    isSubmitting
                  }
                />


                {/* Teléfono */}
                <TextField
                  label="Teléfono"
                  value={
                    values.phone
                  }
                  onChange={(
                    event,
                  ) => {
                    updateValue(
                      "phone",
                      event.target.value,
                    );
                  }}
                  fullWidth
                  disabled={
                    isSubmitting
                  }
                />


                {/* Correo */}
                <TextField
                  label="Correo electrónico"
                  type="email"
                  value={
                    values.email
                  }
                  onChange={(
                    event,
                  ) => {
                    updateValue(
                      "email",
                      event.target.value,
                    );
                  }}
                  fullWidth
                  disabled={
                    isSubmitting
                  }
                />


                {/* Dirección */}
                <TextField
                  label="Dirección"
                  value={
                    values.address
                  }
                  onChange={(
                    event,
                  ) => {
                    updateValue(
                      "address",
                      event.target.value,
                    );
                  }}
                  fullWidth
                  disabled={
                    isSubmitting
                  }
                />
              </Box>


              {/* Notas */}
              <TextField
                label="Notas"
                value={
                  values.notes
                }
                onChange={(
                  event,
                ) => {
                  updateValue(
                    "notes",
                    event.target.value,
                  );
                }}
                multiline
                minRows={2}
                fullWidth
                disabled={
                  isSubmitting
                }
              />


              {/* Estado */}
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
                    xs:
                      "flex-start",

                    sm: "center",
                  },
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={
                        values.is_active
                      }
                      disabled={
                        isSubmitting
                      }
                      onChange={(
                        event,
                      ) => {
                        updateValue(
                          "is_active",
                          event.target
                            .checked,
                        );
                      }}
                    />
                  }
                  label={
                    <CheckboxLabelWithInfo
                      label="Proveedor activo"
                      description="Indica que el proveedor está disponible para utilizarse en nuevas compras. Si se desactiva, se conserva su historial, pero ya no estará disponible para nuevas operaciones."
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
            onClick={
              handleClose
            }
            disabled={
              isSubmitting ||
              isLoadingSupplier
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
              isLoadingSupplier
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
          aria-label={
            `Información sobre ${label}`
          }
          sx={{
            position: "absolute",
            top: -2,
            right: 0,
            display: "inline-flex",
            color: "info.main",
            outline: "none",

            transition:
              "color 150ms ease, transform 150ms ease",

            "&:hover": {
              color: "info.dark",
              transform:
                "scale(1.1)",
            },

            "&:focus-visible":
              {
                color:
                  "info.dark",
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


function isValidEmail(
  email: string,
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email,
  );
}