import {
  AccountBalanceRounded,
  CreditCardRounded,
  PaymentsRounded,
} from "@mui/icons-material";

import {
  Alert,
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
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useQuery } from "@tanstack/react-query";

import type {
  PaymentMethod,
} from "../types/sales.types";

import type {
  AddSalePaymentPayload,
} from "../services/salesService";

import {
  getCashSessions,
} from "../../cash/services/cashService";

import { OpenCashSessionSelect } from "../../cash/components/OpenCashSessionSelect";

type AddSalePaymentDialogProps = {
  open: boolean;
  saleNumber: string;
  balanceDue: number | string;
  companyId: string;
  branchId: string;
  isSubmitting: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (
    payload: AddSalePaymentPayload,
  ) => void;
};

function formatCurrency(value: number) {
  return `Q${value.toLocaleString("es-GT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function AddSalePaymentDialog({
  open,
  saleNumber,
  balanceDue,
  companyId,
  branchId,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: AddSalePaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("CASH");

  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [cashSessionId, setCashSessionId] =
    useState("");

  const balanceDueNumber =
    Number(balanceDue) || 0;

  const openCashSessionsQuery = useQuery({
    queryKey: [
      "cash-sessions",
      "add-sale-payment",
      companyId,
      branchId,
    ],

    queryFn: () =>
      getCashSessions({
        companyId,
        branchId,
        status: "OPEN",
        ordering: "-opened_at",
        page: 1,
        pageSize: 100,
      }),

    enabled: Boolean(
      open &&
      companyId &&
      branchId &&
      paymentMethod === "CASH",
    ),
  });

  const openCashSessions =
    openCashSessionsQuery.data?.results ?? [];

  useEffect(() => {
    if (!open) {
      return;
    }

    setPaymentMethod("CASH");
    setAmount(balanceDueNumber.toFixed(2));
    setReference("");
    setCashSessionId("");
  }, [open, balanceDueNumber]);

  useEffect(() => {
    if (
      !open ||
      paymentMethod !== "CASH"
    ) {
      return;
    }

    if (openCashSessions.length === 1) {
      setCashSessionId(
        openCashSessions[0].id,
      );
      return;
    }

    if (openCashSessions.length === 0) {
      setCashSessionId("");
    }
  }, [
    open,
    paymentMethod,
    openCashSessions.length,
    openCashSessions[0]?.id,
  ]);

  const amountNumber =
    Number(amount) || 0;

  const amountError = useMemo(() => {
    if (amount.trim() === "") {
      return "Ingresa el monto del abono.";
    }

    if (amountNumber <= 0) {
      return "El monto debe ser mayor que cero.";
    }

    if (amountNumber > balanceDueNumber) {
      return "El abono no puede superar el saldo pendiente.";
    }

    return "";
  }, [
    amount,
    amountNumber,
    balanceDueNumber,
  ]);

  const requiresReference =
    paymentMethod === "CARD" ||
    paymentMethod === "TRANSFER";

  const canSubmit =
    amountError === "" &&
    (!requiresReference ||
      reference.trim() !== "") &&
    (paymentMethod !== "CASH" ||
      cashSessionId !== "");

  const handleSubmit = () => {
    if (!canSubmit || isSubmitting) {
      return;
    }

    onSubmit({
      method: paymentMethod,
      amount: amountNumber.toFixed(2),
      reference:
        paymentMethod === "CASH"
          ? ""
          : reference.trim(),
      cash_session_id:
        paymentMethod === "CASH"
          ? cashSessionId
          : null,
    });
  };

  return (
    <Dialog
      open={open}
      onClose={
        isSubmitting ? undefined : onClose
      }
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
      <DialogTitle
        sx={{
          fontWeight: 600,
        }}
      >
        Registrar abono
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography
            color="text.secondary"
            sx={{
              fontSize: "0.9rem",
            }}
          >
            Venta:{" "}
            <strong>{saleNumber}</strong>
          </Typography>

          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          <Box
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "warning.main",
              borderRadius: "5px",
              bgcolor: "#FFFBEB",
            }}
          >
            <Typography
              color="text.secondary"
              sx={{ fontSize: "0.85rem" }}
            >
              Saldo pendiente
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: "1.35rem",
                fontWeight: 800,
                color: "warning.dark",
              }}
            >
              {formatCurrency(balanceDueNumber)}
            </Typography>
          </Box>

          <TextField
            select
            label="Método de pago"
            value={paymentMethod}
            disabled={isSubmitting}
            onChange={(event) => {
              setPaymentMethod(
                event.target.value as PaymentMethod,
              );
              setReference("");
              setCashSessionId("");
              setAmount(
                balanceDueNumber.toFixed(2),
              );
            }}
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
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

          {paymentMethod === "CASH" && (
            <>
              {openCashSessionsQuery.isLoading ? (
                <Box
                  sx={{
                    p: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "5px",
                  }}
                >
                  <CircularProgress size={18} />
                </Box>
              ) : openCashSessions.length === 1 ? (
                <Box
                  sx={{
                    p: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "5px",
                    bgcolor: "#FAFAFA",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}
                  >
                    Caja seleccionada automáticamente
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{
                      mt: 0.3,
                      fontSize: "0.78rem",
                    }}
                  >
                    Se utilizará la única caja abierta
                    disponible.
                  </Typography>
                </Box>
              ) : openCashSessions.length > 1 ? (
                <OpenCashSessionSelect
                  cashSessions={openCashSessions}
                  value={cashSessionId}
                  loading={false}
                  onChange={setCashSessionId}
                />
              ) : (
                <Alert severity="warning">
                  No hay una caja abierta para registrar
                  este abono en efectivo.
                </Alert>
              )}
            </>
          )}

          <TextField
            type="number"
            label="Monto del abono"
            value={amount}
            disabled={isSubmitting}
            onChange={(event) => {
              setAmount(event.target.value);
            }}
            error={amountError !== ""}
            helperText={
              amountError || " "
            }
            slotProps={{
              htmlInput: {
                min: 0,
                step: "0.01",
                max: balanceDueNumber,
              },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    Q
                  </InputAdornment>
                ),
              },
            }}
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
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
              disabled={isSubmitting}
              required
              onChange={(event) => {
                setReference(event.target.value);
              }}
              helperText="La referencia es obligatoria."
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "5px",
                },
              }}
            />
          )}

          <Box
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "primary.main",
              borderRadius: "5px",
              bgcolor: "primary.light",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Typography color="text.secondary">
                Abono
              </Typography>

              <Typography sx={{fontWeight: 600}} >
                {formatCurrency(amountNumber)}
              </Typography>
            </Box>

            <Divider sx={{ my: 1 }} />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Typography sx={{fontWeight: 600}} >
                Saldo restante
              </Typography>

              <Typography
              sx={{
                color: "primary.main",
                fontWeight: 600,
              }}
                
              >
                {formatCurrency(
                  Math.max(
                    balanceDueNumber -
                      amountNumber,
                    0,
                  ),
                )}
              </Typography>
            </Box>
          </Box>
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
          disabled={isSubmitting}
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
            !canSubmit || isSubmitting
          }
          onClick={handleSubmit}
          startIcon={
            isSubmitting ? (
              <CircularProgress
                size={18}
                color="inherit"
              />
            ) : undefined
          }
          sx={{
            borderRadius: "5px",
            fontWeight: 600,
          }}
        >
          {isSubmitting
            ? "Guardando..."
            : "Registrar abono"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}