import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import {
  useEffect,
  useState,
} from "react";

import type { FormEvent } from "react";

import {
  unitTypeOptions,
  type UnitOfMeasureFormValues,
} from "../types/units";

type UnitOfMeasureFormDialogProps = {
  open: boolean;
  title: string;
  submitLabel: string;
  initialValues?: UnitOfMeasureFormValues;
  isSubmitting: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (values: UnitOfMeasureFormValues) => void;
};

const emptyValues: UnitOfMeasureFormValues = {
  name: "",
  symbol: "",
  unit_type: "UNIT",
  allows_decimal: false,
  is_active: true,
};

export function UnitOfMeasureFormDialog({
  open,
  title,
  submitLabel,
  initialValues,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: UnitOfMeasureFormDialogProps) {
  const [values, setValues] = useState<UnitOfMeasureFormValues>(emptyValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) {
      return;
    }

    setValues(initialValues ?? emptyValues);
    setErrors({});
  }, [open, initialValues]);

  const updateValue = <K extends keyof UnitOfMeasureFormValues>(
    field: K,
    value: UnitOfMeasureFormValues[K],
  ) => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: "",
    }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!values.name.trim()) {
      nextErrors.name = "El nombre de la unidad es obligatorio.";
    }

    if (!values.symbol.trim()) {
      nextErrors.symbol = "El símbolo es obligatorio.";
    }

    if (!values.unit_type) {
      nextErrors.unit_type = "Selecciona un tipo de unidad.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    onSubmit({
      ...values,
      name: values.name.trim(),
      symbol: values.symbol.trim(),
    });
  };

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    onClose();
  };

  return (
    <Dialog
      open={ open }
      onClose={ handleClose }
      fullWidth
      maxWidth="sm"
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
        onSubmit={ handleSubmit }
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
            fontWeight: 600,
          }}
        >
          { title }
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
          <Box
            sx={{
              display: "grid",
              gap: 2,
            }}
          >
            <TextField
              label="Nombre"
              value={ values.name }
              onChange={(event) => updateValue("name", event.target.value)}
              error={ Boolean(errors.name) }
              helperText={ errors.name }
              disabled={ isSubmitting }
              fullWidth
              required
              autoFocus 
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "5px",
                },
              }}
            />

            <TextField
              label="Símbolo"
              value={ values.symbol }
              onChange={(event) => updateValue("symbol", event.target.value)}
              error={ Boolean(errors.symbol) }
              helperText={ errors.symbol }
              disabled={ isSubmitting }
              fullWidth
              required 
              placeholder="Ej. kg, lb, m, L, un"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "5px",
                },
              }}
            />

            <TextField
              select
              label="Tipo de unidad"
              value={ values.unit_type }
              onChange={(event) => {
                updateValue(
                  "unit_type",
                  event.target.value as UnitOfMeasureFormValues["unit_type"],
                );
              }}
              error={ Boolean(errors.unit_type) }
              helperText={ errors.unit_type }
              disabled={ isSubmitting }
              fullWidth
              required
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "5px",
                },
              }}
            >
              { unitTypeOptions.map((option) => (
                <MenuItem
                  key={ option.value }
                  value={ option.value }
                >
                  { option.label }
                </MenuItem>
              )) }
            </TextField>

            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={ values.allows_decimal }
                    onChange={(event) => {
                      updateValue(
                        "allows_decimal",
                        event.target.checked,
                      );
                    }}
                    disabled={ isSubmitting }
                  />
                }
                label="Permitir cantidades decimales"
              />

              <Typography
                color="text.secondary"
                sx={{
                  fontSize: "0.78rem",
                  ml: 6,
                  mt: -0.5,
                }}
              >
                Permite cantidades como 0.50, 1.25 o 2.75.
              </Typography>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={ values.is_active }
                  onChange={(event) => {
                    updateValue(
                      "is_active",
                      event.target.checked,
                    );
                  }}
                  disabled={ isSubmitting }
                />
              }
              label="Unidad activa"
            />

            { error && (
              <Typography
                color="error"
                sx={{
                  fontSize: "0.82rem",
                }}
              >
                { error }
              </Typography>
            ) }
          </Box>
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
            variant="outlined"
            onClick={ handleClose }
            disabled={ isSubmitting }
            sx={{
              borderRadius: "5px",
            }}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={ isSubmitting }
            sx={{
              borderRadius: "5px",
            }}
          >
            { isSubmitting ? "Guardando..." : submitLabel }
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}