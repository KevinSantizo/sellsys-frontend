import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import type {
  Supplier,
} from "../../purchases/suppliers/types/supplier";

import type {
  ExpenseCategory,
  ExpenseFormValues,
  ExpensePaymentMethod,
} from "../types/expense";


type ExpenseFormDialogProps = {
  open: boolean;

  title: string;

  submitLabel: string;

  initialValues?: ExpenseFormValues;

  categories: ExpenseCategory[];

  suppliers: Supplier[];

  isSubmitting: boolean;

  isLoadingOptions: boolean;

  isLoadingExpense: boolean;

  submitError: string | null;

  onClose: () => void;

  onSubmit: (
    values: ExpenseFormValues,
  ) => void;
};


const emptyExpenseValues:
  ExpenseFormValues = {
    category_id: "",
    supplier_id: "",
    description: "",
    amount: "",
    expense_date:
      getCurrentLocalDate(),
    payment_method: "CASH",
    reference: "",
    notes: "",
  };


export function ExpenseFormDialog({
  open,
  title,
  submitLabel,
  initialValues,
  categories,
  //suppliers,
  isSubmitting,
  isLoadingOptions,
  isLoadingExpense,
  submitError,
  onClose,
  onSubmit,
}: ExpenseFormDialogProps) {
  const [
    values,
    setValues,
  ] = useState<ExpenseFormValues>(
    emptyExpenseValues,
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
        {
          ...emptyExpenseValues,
          expense_date:
            getCurrentLocalDate(),
        }
      ),
    });

    setValidationError(null);
  }, [
    open,
    initialValues,
  ]);


  const updateValue = <
    Key extends keyof ExpenseFormValues,
  >(
    key: Key,
    value: ExpenseFormValues[Key],
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
      isLoadingExpense
    ) {
      return;
    }


    if (!values.category_id) {
      setValidationError(
        "Debes seleccionar una categoría.",
      );

      return;
    }


    if (
      !values.description.trim()
    ) {
      setValidationError(
        "Debes ingresar la descripción del gasto.",
      );

      return;
    }


    const amount = Number(
      values.amount,
    );

    if (
      !values.amount ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setValidationError(
        "Debes ingresar un monto válido mayor a cero.",
      );

      return;
    }


    if (!values.expense_date) {
      setValidationError(
        "Debes seleccionar la fecha del gasto.",
      );

      return;
    }


    if (!values.payment_method) {
      setValidationError(
        "Debes seleccionar un método de pago.",
      );

      return;
    }


    onSubmit(values);
  };


  const handleClose = () => {
    if (
      isSubmitting ||
      isLoadingExpense
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
            fontWeight: 700,
          }}
        >
          {title}
        </DialogTitle>


        <DialogContent dividers>
          {isLoadingExpense ? (
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
                  Cargando gasto...
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

                {/* Descripción */}
                <TextField
                  label="Descripción"
                  value={
                    values.description
                  }
                  onChange={(
                    event,
                  ) => {
                    updateValue(
                      "description",
                      event.target.value,
                    );
                  }}
                  required
                  fullWidth
                  disabled={
                    isSubmitting
                  }
                />


                {/* Monto */}
                <TextField
                  label="Monto"
                  type="number"
                  value={
                    values.amount
                  }
                  placeholder="0.00"
                  onChange={(
                    event,
                  ) => {
                    updateValue(
                      "amount",
                      event.target.value,
                    );
                  }}
                  required
                  fullWidth
                  disabled={
                    isSubmitting
                  }
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },

                    htmlInput: {
                      min: 0.01,
                      step: "0.01",
                    },
                  }}
                />


                {/* Fecha */}
                <TextField
                  label="Fecha del gasto"
                  type="date"
                  value={
                    values.expense_date
                  }
                  onChange={(
                    event,
                  ) => {
                    updateValue(
                      "expense_date",
                      event.target.value,
                    );
                  }}
                  required
                  fullWidth
                  disabled={
                    isSubmitting
                  }
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                />


                {/* Método de pago */}
                <TextField
                  select
                  label="Método de pago"
                  value={
                    values.payment_method
                  }
                  onChange={(
                    event,
                  ) => {
                    updateValue(
                      "payment_method",
                      event.target
                        .value as ExpensePaymentMethod,
                    );
                  }}
                  required
                  fullWidth
                  disabled={
                    isSubmitting
                  }
                >
                  <MenuItem value="CASH">
                    Efectivo
                  </MenuItem>

                  <MenuItem value="TRANSFER">
                    Transferencia
                  </MenuItem>

                  <MenuItem value="CARD">
                    Tarjeta
                  </MenuItem>

                  <MenuItem value="OTHER">
                    Otro
                  </MenuItem>
                </TextField>


                {/* Referencia */}
                <TextField
                  label="Referencia"
                  value={
                    values.reference
                  }
                  onChange={(
                    event,
                  ) => {
                    updateValue(
                      "reference",
                      event.target.value,
                    );
                  }}
                  placeholder="Factura, recibo, transferencia..."
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
              isLoadingExpense
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
              isLoadingExpense ||
              categories.length === 0
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


function getCurrentLocalDate() {
  const date = new Date();

  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}