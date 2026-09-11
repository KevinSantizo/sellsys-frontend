import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import { useEffect, useState } from "react";

import type { CashRegisterFormValues } from "../types/cash";


type CashRegisterFormDialogProps = {
  open: boolean;
  title: string;
  submitLabel: string;
  branchName: string;
  initialValues?: CashRegisterFormValues;
  isSubmitting: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (values: CashRegisterFormValues) => void;
};


const emptyValues: CashRegisterFormValues = {
  name: "",
  code: "",
  is_active: true,
};


export function CashRegisterFormDialog({
  open,
  title,
  submitLabel,
  branchName,
  initialValues,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: CashRegisterFormDialogProps) {
  const [values, setValues] = useState<CashRegisterFormValues>(emptyValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;

    setValues(initialValues ?? emptyValues);
    setErrors({});
  }, [open, initialValues]);

  const updateValue = <K extends keyof CashRegisterFormValues>(
    field: K,
    value: CashRegisterFormValues[K],
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
      nextErrors.name = "El nombre de la caja es obligatorio.";
    }

    if (!values.code.trim()) {
      nextErrors.code = "El código de la caja es obligatorio.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) return;

    onSubmit({
      name: values.name.trim(),
      code: values.code.trim(),
      is_active: values.is_active,
    });
  };

  const handleClose = () => {
    if (isSubmitting) return;

    onClose();
  };

  return (
    <Dialog
      open={ open }
      onClose={ handleClose }
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
        onSubmit={ handleSubmit }
        noValidate
        sx={{
          display: "flex",
          flexDirection: "column",
          maxHeight: "calc(100vh - 32px)",
          overflow: "hidden",
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
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
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            <TextField
              label="Nombre"
              value={ values.name }
              onChange={ (event) => updateValue("name", event.target.value) }
              placeholder="Ej. Caja principal"
              error={ Boolean(errors.name) }
              helperText={ errors.name }
              disabled={ isSubmitting }
              fullWidth
              autoFocus
            />

            <TextField
              label="Código"
              value={ values.code }
              onChange={ (event) => updateValue("code", event.target.value) }
              placeholder="Ej. CAJA-01"
              error={ Boolean(errors.code) }
              helperText={ errors.code }
              disabled={ isSubmitting }
              fullWidth
              slotProps={{
                htmlInput: {
                  maxLength: 30,
                },
              }}
            />

            <TextField
              label="Sucursal"
              value={ branchName }
              disabled
              fullWidth
            />

            <Box
              sx={{
                minHeight: 56,
                px: 1.75,
                display: "flex",
                alignItems: "center",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "5px",
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={ values.is_active }
                    onChange={ (event) => updateValue("is_active", event.target.checked) }
                    disabled={ isSubmitting }
                  />
                }
                label={
                  <Box>
                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 700 }}>
                      Caja activa
                    </Typography>

                    <Typography
                      color="text.secondary"
                      sx={{
                        fontSize: "0.75rem",
                        lineHeight: 1.3,
                      }}
                    >
                      Permite utilizar esta caja en la sucursal.
                    </Typography>
                  </Box>
                }
                sx={{
                  m: 0,
                  width: "100%",
                }}
              />
            </Box>
          </Box>

          {error && (
            <Typography
              color="error"
              sx={{
                mt: 2,
                fontSize: "0.82rem",
              }}
            >
              { error }
            </Typography>
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
            variant="outlined"
            onClick={ handleClose }
            disabled={ isSubmitting }
            sx={{ borderRadius: "5px" }}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={ isSubmitting }
            sx={{ borderRadius: "5px" }}
          >
            { isSubmitting ? "Guardando..." : submitLabel }
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}