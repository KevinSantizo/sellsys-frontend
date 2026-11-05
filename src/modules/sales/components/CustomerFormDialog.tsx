import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import type { CustomerFormValues } from "../types/customer.types";

type CustomerFormDialogProps = {
  open: boolean;
  title: string;
  submitLabel: string;
  initialValues?: CustomerFormValues;
  isSubmitting: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (values: CustomerFormValues) => void;
};

const emptyValues: CustomerFormValues = {
  first_name: "",
  last_name: "",
  phone: "",
};

export function CustomerFormDialog({
  open,
  title,
  submitLabel,
  initialValues,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: CustomerFormDialogProps) {
  const [values, setValues] =
    useState<CustomerFormValues>(
      emptyValues,
    );

  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setValues(initialValues ?? emptyValues);
    setValidationError(null);
    setErrors({});

  }, [open, initialValues]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateValue = < Key extends keyof CustomerFormValues >(
    key: Key,
    value: CustomerFormValues[Key],
  ) => {
    setValues((current) => ({
      ...current,
      [key]: value,
    }));

    setValidationError(null);
  };

    const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!values.first_name.trim()) {
      nextErrors.name = "El nombre del cliente es obligatorio.";
    }

    setErrors(nextErrors); 
    return Object.keys(nextErrors).length === 0;
  };


  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
 
    if (!validate()) {
      return;
    }

    onSubmit({
      first_name: values.first_name.trim(),
      last_name: values.last_name.trim(),
      phone: values.phone.trim(),
    });
  };

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    onClose();
  };

  const visibleError =
    validationError ?? error;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
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
            fontWeight: 600,
          }}
        >
          {title}
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            {visibleError && (
              <Alert severity="error">
                {visibleError}
              </Alert>
            )}

            <TextField
              label="Nombre"
              value={values.first_name}
              onChange={(event) => {
                updateValue(
                  "first_name",
                  event.target.value,
                );
              }}
              error={ Boolean(errors.name) }
              helperText={ errors.name }
              disabled={isSubmitting}
              required
              fullWidth
              autoFocus
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "5px",
                },
              }}
            />

            <TextField
              label="Apellido"
              value={values.last_name}
              onChange={(event) => {
                updateValue(
                  "last_name",
                  event.target.value,
                );
              }}
              disabled={isSubmitting}
              required
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "5px",
                },
              }}
            />

            <TextField
              label="Número de teléfono"
              value={values.phone}
              onChange={(event) => {
                updateValue(
                  "phone",
                  event.target.value,
                );
              }}
              disabled={isSubmitting}
              fullWidth
              slotProps=
                {{
                    htmlInput: {
                        maxLength: 30,
                    },
                }}
                sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "5px",
                },
              }}
            />
          </Stack>
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
            disabled={isSubmitting}
            sx={{
              borderRadius: "5px",
            }}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={18} />
              ) : undefined
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