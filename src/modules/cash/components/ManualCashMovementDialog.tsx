import {
  ArrowDownwardRounded,
  ArrowUpwardRounded,
} from "@mui/icons-material";

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

import type {
  CashMovementDirection,
  CashSession,
} from "../types/cash";


type ManualCashMovementFormValues = {
  amount: string;
  reference: string;
  notes: string;
};


type ManualCashMovementDialogProps = {
  open: boolean;
  cashSession: CashSession;
  direction: CashMovementDirection;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (values: ManualCashMovementFormValues) => void;
};


const emptyValues: ManualCashMovementFormValues = {
  amount: "",
  reference: "",
  notes: "",
};


export function ManualCashMovementDialog({
  open,
  cashSession,
  direction,
  loading,
  error,
  onClose,
  onSubmit,
}: ManualCashMovementDialogProps) {
  const [values, setValues] = useState<ManualCashMovementFormValues>(emptyValues);

  const isEntry = direction === "IN";

  useEffect(() => {
    if (open) {
      setValues(emptyValues);
    }
  }, [open, cashSession.id, direction]);

  const canSubmit =
    values.amount.trim() !== "" &&
    Number(values.amount) > 0 &&
    !loading;

  const handleChange = (
    field: keyof ManualCashMovementFormValues,
    value: string,
  ) => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    onSubmit(values);
  };

  return (
    <Dialog
      open={ open }
      onClose={ loading ? undefined : onClose }
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: "5px",
            maxHeight: "90vh",
            overflow: "hidden",
            },
        },
      }} 
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
          overflow: "hidden",
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {isEntry ? (
            <ArrowUpwardRounded color="success" />
          ) : (
            <ArrowDownwardRounded color="error" />
          )}

          {isEntry ? "Registrar entrada" : "Registrar salida"}
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            p: 3,
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
          }}
        >
          <Box
            sx={{
              p: 2,
              mb: 2.5,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "5px",
              bgcolor: "#FAFAFA",
            }}
          >
            <Typography
              color="text.secondary"
              sx={{
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              Caja
            </Typography>

            <Typography
              sx={{
                mt: 0.25,
                fontSize: "0.95rem",
                fontWeight: 700,
              }}
            >
              { cashSession.cash_register_name }
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 0.2,
                fontSize: "0.75rem",
              }}
            >
              { cashSession.branch_name }
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 2,
            }}
          >
            <TextField
              label="Monto"
              type="number"
              value={ values.amount }
              onChange={ (event) => handleChange("amount", event.target.value) }
              fullWidth
              required
              disabled={ loading }
              slotProps={{
                htmlInput: {
                  min: 0.01,
                  step: "0.01",
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "5px",
                },
              }}
            />

            <TextField
              label="Referencia"
              value={ values.reference }
              onChange={ (event) => handleChange("reference", event.target.value) }
              fullWidth
              disabled={ loading }
              placeholder={
                isEntry
                  ? "Ej. Fondo adicional"
                  : "Ej. Retiro de efectivo"
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "5px",
                },
              }}
            />

            <TextField
              label="Notas"
              value={ values.notes }
              onChange={ (event) => handleChange("notes", event.target.value) }
              fullWidth
              multiline
              minRows={ 3 }
              disabled={ loading }
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "5px",
                },
              }}
            />

            {error && (
              <Typography
                color="error"
                sx={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                }}
              >
                { error }
              </Typography>
            )}
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
            onClick={ onClose }
            disabled={ loading }
            sx={{ borderRadius: "5px" }}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={ handleSubmit }
            disabled={ !canSubmit }
            startIcon={
              isEntry
                ? <ArrowUpwardRounded />
                : <ArrowDownwardRounded />
            }
            sx={{ borderRadius: "5px" }}
          >
            {loading
              ? "Registrando..."
              : isEntry
                ? "Registrar entrada"
                : "Registrar salida"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}