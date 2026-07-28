import {
  AccountBalanceRounded,
  CreditCardRounded,
  PaymentsRounded,
  PointOfSaleRounded,
} from "@mui/icons-material";

import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  PaymentMethod,
} from "../types/sales.types";

export type CheckoutFormValues = {
  customerName: string;
  customerTaxId: string;
  notes: string;
  paymentMethod: PaymentMethod;
  amountReceived: string;
  reference: string;
};

type CheckoutSaleDialogProps = {
  open: boolean;
  total: number;
  loading: boolean;

  onClose: () => void;

  onConfirm: (
    values: CheckoutFormValues,
  ) => Promise<void>;
};

function formatCurrency(
  value: number,
): string {
  return `Q${value.toLocaleString(
    "es-GT",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )}`;
}

export function CheckoutSaleDialog({
  open,
  total,
  loading,
  onClose,
  onConfirm,
}: CheckoutSaleDialogProps) {
  const [
    customerName,
    setCustomerName,
  ] = useState("Consumidor final");

  const [
    customerTaxId,
    setCustomerTaxId,
  ] = useState("CF");

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState<PaymentMethod>("CASH");

  const [
    amountReceived,
    setAmountReceived,
  ] = useState("");

  const [reference, setReference] =
    useState("");

  const [notes, setNotes] =
    useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setCustomerName(
      "Consumidor final",
    );

    setCustomerTaxId("CF");
    setPaymentMethod("CASH");
    setAmountReceived(
      total.toFixed(2),
    );
    setReference("");
    setNotes("");
  }, [open, total]);

  const isCash =
    paymentMethod === "CASH";

  const requiresReference =
    paymentMethod === "CARD" ||
    paymentMethod === "TRANSFER";

  const amountReceivedNumber =
    Number(amountReceived) || 0;

  const missingAmount = useMemo(
    () =>
      Math.max(
        total - amountReceivedNumber,
        0,
      ),
    [total, amountReceivedNumber],
  );

  const changeAmount = useMemo(
    () =>
      Math.max(
        amountReceivedNumber - total,
        0,
      ),
    [total, amountReceivedNumber],
  );

  const canSubmit =
    total > 0 &&
    amountReceivedNumber >= total &&
    (!requiresReference ||
      reference.trim() !== "");

  const handlePaymentMethodChange = (
    method: PaymentMethod,
  ) => {
    setPaymentMethod(method);

    setAmountReceived(
      total.toFixed(2),
    );

    if (method === "CASH") {
      setReference("");
    }
  };

  const handleSubmit = async () => {
    if (
      !canSubmit ||
      loading
    ) {
      return;
    }

    await onConfirm({
      customerName,
      customerTaxId,
      notes,
      paymentMethod,
      amountReceived,
      reference,
    });
  };

  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="sm"
      onClose={
        loading
          ? undefined
          : onClose
      }
      slotProps={{
        paper: {
          sx: {
            borderRadius: "5px",
          },
        },
      }}
    >
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <PointOfSaleRounded
            sx={{
              color: "primary.main",
            }}
          />

          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
            }}
          >
            Cobrar venta
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            display: "grid",
            gap: 2,
            pt: 1,
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                sm: "repeat(2, minmax(0, 1fr))",
              },
              gap: 1.5,
            }}
          >
            <TextField
              label="Cliente"
              value={customerName}
              disabled={loading}
              onChange={(event) => {
                setCustomerName(
                  event.target.value,
                );
              }}
              sx={{
                "& .MuiOutlinedInput-root":
                  {
                    borderRadius: "5px",
                  },
              }}
            />

            <TextField
              label="NIT"
              value={customerTaxId}
              disabled={loading}
              onChange={(event) => {
                setCustomerTaxId(
                  event.target.value,
                );
              }}
              sx={{
                "& .MuiOutlinedInput-root":
                  {
                    borderRadius: "5px",
                  },
              }}
            />
          </Box>

          <Divider />

          <TextField
            select
            label="Método de pago"
            value={paymentMethod}
            disabled={loading}
            onChange={(event) => {
              handlePaymentMethodChange(
                event.target
                  .value as PaymentMethod,
              );
            }}
            sx={{
              "& .MuiOutlinedInput-root":
                {
                  borderRadius: "5px",
                },
            }}
          >
            <MenuItem value="CASH">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <PaymentsRounded fontSize="small" />

                Efectivo
              </Box>
            </MenuItem>

            <MenuItem value="CARD">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <CreditCardRounded fontSize="small" />

                Tarjeta
              </Box>
            </MenuItem>

            <MenuItem value="TRANSFER">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <AccountBalanceRounded fontSize="small" />

                Transferencia
              </Box>
            </MenuItem>
          </TextField>

          <TextField
            type="number"
            label={
              isCash
                ? "Monto recibido"
                : "Monto pagado"
            }
            value={amountReceived}
            disabled={
              loading || !isCash
            }
            onChange={(event) => {
              setAmountReceived(
                event.target.value,
              );
            }}
            slotProps={{
              htmlInput: {
                min: 0,
                step: "0.01",
              },

              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    Q
                  </InputAdornment>
                ),
              },
            }}
            error={
              amountReceivedNumber > 0 &&
              amountReceivedNumber < total
            }
            helperText={
              missingAmount > 0
                ? `Faltan ${formatCurrency(
                    missingAmount,
                  )}`
                : " "
            }
            sx={{
              "& .MuiOutlinedInput-root":
                {
                  borderRadius: "5px",
                },
            }}
          />

          {requiresReference && (
            <TextField
              label={
                paymentMethod === "CARD"
                  ? "Referencia o autorización"
                  : "Número de transferencia"
              }
              value={reference}
              required
              disabled={loading}
              onChange={(event) => {
                setReference(
                  event.target.value,
                );
              }}
              helperText="La referencia es obligatoria."
              sx={{
                "& .MuiOutlinedInput-root":
                  {
                    borderRadius: "5px",
                  },
              }}
            />
          )}

          <TextField
            label="Notas"
            value={notes}
            disabled={loading}
            multiline
            minRows={2}
            onChange={(event) => {
              setNotes(
                event.target.value,
              );
            }}
            sx={{
              "& .MuiOutlinedInput-root":
                {
                  borderRadius: "5px",
                },
            }}
          />

          <Box
            sx={{
              border: "1px solid",
              borderColor: "primary.main",
              borderRadius: "5px",
              bgcolor: "primary.light",
              p: 2,
              display: "grid",
              gap: 1.25,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent:
                  "space-between",
                gap: 2,
              }}
            >
              <Typography
                sx={{
                  color: "text.secondary",
                }}
              >
                Total
              </Typography>

              <Typography
                sx={{
                  fontWeight: 800,
                }}
              >
                {formatCurrency(total)}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent:
                  "space-between",
                gap: 2,
              }}
            >
              <Typography
                sx={{
                  color: "text.secondary",
                }}
              >
                Monto recibido
              </Typography>

              <Typography
                sx={{
                  fontWeight: 700,
                }}
              >
                {formatCurrency(
                  amountReceivedNumber,
                )}
              </Typography>
            </Box>

            {isCash && (
              <>
                <Divider />

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "space-between",
                    gap: 2,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    Cambio
                  </Typography>

                  <Typography
                    variant="h5"
                    sx={{
                      color:
                        "primary.main",
                      fontWeight: 900,
                    }}
                  >
                    {formatCurrency(
                      changeAmount,
                    )}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          gap: 1,
        }}
      >
        <Button
          type="button"
          variant="outlined"
          disabled={loading}
          onClick={onClose}
          sx={{
            borderRadius: "5px",
          }}
        >
          Cancelar
        </Button>

        <Button
          type="button"
          variant="contained"
          disabled={
            !canSubmit ||
            loading
          }
          onClick={() => {
            void handleSubmit();
          }}
          startIcon={
            loading ? (
              <CircularProgress
                size={18}
                sx={{
                  color: "inherit",
                }}
              />
            ) : (
              <PointOfSaleRounded />
            )
          }
          sx={{
            minWidth: 165,
            borderRadius: "5px",
            fontWeight: 700,
          }}
        >
          {loading
            ? "Procesando..."
            : "Confirmar venta"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}