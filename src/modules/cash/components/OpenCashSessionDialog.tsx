import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";

import { useEffect, useState } from "react";

import type { CashRegister } from "../types/cash";


type OpenCashSessionFormValues = {
  opening_amount: string; 
};


type OpenCashSessionDialogProps = {
  open: boolean;
  cashRegister: CashRegister | null;
  isSubmitting: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (values: OpenCashSessionFormValues) => void;
};


const emptyValues: OpenCashSessionFormValues = {
  opening_amount: "", 
};


export function OpenCashSessionDialog({
  open,
  cashRegister,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: OpenCashSessionDialogProps) {
  const [values, setValues] = useState<OpenCashSessionFormValues>(emptyValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;

    setValues(emptyValues);
    setErrors({});
  }, [open]);

  const updateValue = <K extends keyof OpenCashSessionFormValues>(
    field: K,
    value: OpenCashSessionFormValues[K],
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

    if (values.opening_amount.trim() === "") {
      nextErrors.opening_amount = "El saldo inicial es obligatorio.";
    } else {
      const openingAmount = Number(values.opening_amount);

      if (!Number.isFinite(openingAmount) || openingAmount < 0) {
        nextErrors.opening_amount = "Ingresa un saldo inicial válido.";
      }
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) return;

    onSubmit({
      opening_amount: values.opening_amount, 
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
          Abrir caja
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
                sm: "repeat(2, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            <TextField
              label="Caja"
              value={ cashRegister?.name ?? "" }
              disabled
              fullWidth
            />

            <TextField
              label="Sucursal"
              value={ cashRegister?.branch_name ?? "" }
              disabled
              fullWidth
            />

            <TextField
              label="Saldo inicial"
              type="number"
              value={ values.opening_amount }
              onChange={ (event) => updateValue("opening_amount", event.target.value) }
              placeholder="0.00"
              error={ Boolean(errors.opening_amount) }
              helperText={ errors.opening_amount }
              disabled={ isSubmitting }
              fullWidth
              autoFocus
              slotProps={{
                htmlInput: {
                  min: 0,
                  step: 0.01,
                },
              }}
            />

            <Box />
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
            { isSubmitting ? "Abriendo..." : "Abrir caja" }
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}