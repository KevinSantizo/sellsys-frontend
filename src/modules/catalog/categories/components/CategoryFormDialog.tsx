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

import { useEffect, useState } from "react";

import type {
  Category,
  CategoryFormValues,
} from "../types/category";

type CategoryFormDialogProps = {
  open: boolean;
  title: string;
  submitLabel: string;
  categories: Category[];
  initialValues?: CategoryFormValues;
  editingCategoryId?: string;
  isSubmitting: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (values: CategoryFormValues) => void;
};

const emptyValues: CategoryFormValues = {
  name: "",
  description: "",
  parent_id: "",
  is_active: true,
};

export function CategoryFormDialog({
  open,
  title,
  submitLabel,
  categories,
  initialValues,
  editingCategoryId,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: CategoryFormDialogProps) {
  const [values, setValues] = useState<CategoryFormValues>(emptyValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) {
      return;
    }

    setValues(initialValues ?? emptyValues);
    setErrors({});
  }, [open, initialValues]);

  const updateValue = <K extends keyof CategoryFormValues>(
    field: K,
    value: CategoryFormValues[K],
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
      nextErrors.name = "El nombre de la categoría es obligatorio.";
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

  const availableParentCategories = categories.filter(
    (category) => category.id !== editingCategoryId,
  );

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
              label="Categoría padre"
              select
              value={ values.parent_id }
              onChange={(event) => updateValue("parent_id", event.target.value)}
              disabled={ isSubmitting }
              fullWidth
              helperText="Opcional. Úsala para crear subcategorías."
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "5px",
                },
              }}
            >
              <MenuItem value="">
                Sin categoría padre
              </MenuItem>

              { availableParentCategories.map((category) => (
                <MenuItem key={ category.id } value={ category.id }>
                  { category.name }
                </MenuItem>
              )) }
            </TextField>

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
              label="Categoría activa"
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