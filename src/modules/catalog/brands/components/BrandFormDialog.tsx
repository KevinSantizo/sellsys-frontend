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

import type { BrandFormValues } from "../types/brand";

type BrandFormDialogProps = {
  open: boolean;
  title: string;
  submitLabel: string;
  initialValues?: BrandFormValues;
  isSubmitting: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (values: BrandFormValues) => void;
};

const emptyValues: BrandFormValues = {
  name: "",
  description: "",
  is_active: true,
};

export function BrandFormDialog({
  open,
  title,
  submitLabel,
  initialValues,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: BrandFormDialogProps) {
  const [values, setValues] = useState<BrandFormValues>(emptyValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) {
      return;
    }

    setValues(initialValues ?? emptyValues);
    setErrors({});
  }, [open, initialValues]);

  const updateValue = <K extends keyof BrandFormValues>(
    field: K,
    value: BrandFormValues[K],
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
      nextErrors.name = "El nombre de la marca es obligatorio.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    onSubmit({
      ...values,
      name: values.name.trim(),
      description: values.description.trim(),
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
              autoFocus
              required 
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "5px",
                },
              }}
            />

            <TextField
              label="Descripción"
              value={ values.description }
              onChange={(event) => updateValue("description", event.target.value)}
              disabled={ isSubmitting }
              multiline
              minRows={ 3 }
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "5px",
                },
              }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={ values.is_active }
                  onChange={(event) => updateValue("is_active", event.target.checked)}
                  disabled={ isSubmitting }
                />
              }
              label="Marca activa"
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