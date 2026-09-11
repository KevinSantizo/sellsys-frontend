import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  TextField,
  Typography,
} from "@mui/material";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { getCashSessionSummary } from "../services/cashService";

import type { CashSession } from "../types/cash";


type CloseCashSessionDialogProps = {
  open: boolean;
  cashSession: CashSession | null;
  loading: boolean;
  error: string | null;
  formatCurrency: (value: string | number) => string;
  onClose: () => void;
  onSubmit: (countedAmount: string) => void;
};


export function CloseCashSessionDialog({
  open,
  cashSession,
  loading,
  error,
  formatCurrency,
  onClose,
  onSubmit,
}: CloseCashSessionDialogProps) {
  const [countedAmount, setCountedAmount] = useState("");

  const summaryQuery = useQuery({
    queryKey: ["cash-session-summary", cashSession?.id],
    queryFn: () => getCashSessionSummary(cashSession!.id),
    enabled: Boolean(open && cashSession?.id),
  });

  const summary = summaryQuery.data;

  useEffect(() => {
    if (!open) {
      setCountedAmount("");
    }
  }, [open]);

  const difference = useMemo(() => {
    if (!summary || countedAmount.trim() === "") {
      return null;
    }

    const counted = Number(countedAmount);
    const expected = Number(summary.expected_amount);

    if (!Number.isFinite(counted) || !Number.isFinite(expected)) {
      return null;
    }

    return counted - expected;
  }, [countedAmount, summary]);

  const canSubmit =
    Boolean(summary) &&
    countedAmount.trim() !== "" &&
    Number(countedAmount) >= 0 &&
    !loading;

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    onSubmit(countedAmount);
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
        <DialogTitle sx={{ fontWeight: 800, flexShrink: 0 }}>
          Cerrar caja
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
          <Typography
            sx={{
              fontSize: "1rem",
              fontWeight: 800,
              mb: 0.25,
            }}
          >
            { cashSession?.cash_register_name }
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              fontSize: "0.8rem",
              mb: 2.5,
            }}
          >
            Verifica el efectivo disponible antes de cerrar la caja.
          </Typography>

          {!cashSession ? null : summaryQuery.isLoading ? (
            <Typography color="text.secondary">
                Cargando resumen de caja...
            </Typography>
            )  : summary ? (
            <>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                  },
                  gap: 1.5,
                }}
              >
                <SummaryItem
                  label="Saldo inicial"
                  value={ formatCurrency(summary.opening_amount) }
                />

                <SummaryItem
                  label="Entradas"
                  value={ `+ ${formatCurrency(summary.total_in)}` }
                />

                <SummaryItem
                  label="Salidas"
                  value={ `- ${formatCurrency(summary.total_out)}` }
                />

                <SummaryItem
                  label="Saldo esperado"
                  value={ formatCurrency(summary.expected_amount) }
                  highlighted
                />
              </Box>

              <Divider sx={{ my: 2.5 }} />

              <TextField
                label="Efectivo contado"
                type="number"
                value={ countedAmount }
                onChange={ (event) => setCountedAmount(event.target.value) }
                fullWidth
                disabled={ loading }
                slotProps={{
                  htmlInput: {
                    min: 0,
                    step: "0.01",
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "5px",
                  },
                }}
              />

              {difference !== null && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    border: "1px solid",
                    borderColor:
                      difference === 0
                        ? "divider"
                        : difference > 0
                          ? "success.main"
                          : "error.main",
                    borderRadius: "5px",
                    bgcolor: "#FAFAFA",
                  }}
                >
                  <Typography sx={{ fontWeight: 700 }}>
                    Diferencia
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: "1.1rem",
                      fontWeight: 800,
                      color:
                        difference === 0
                          ? "text.primary"
                          : difference > 0
                            ? "success.main"
                            : "error.main",
                    }}
                  >
                    { difference > 0 ? "+" : "" }
                    { formatCurrency(difference) }
                  </Typography>
                </Box>
              )}

              {error && (
                <Typography
                  color="error"
                  sx={{
                    mt: 2,
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  { error }
                </Typography>
              )}
            </>
          ) :  summaryQuery.isError ? (
                <Typography color="error">
                    No fue posible cargar el resumen de la caja.
                </Typography>
            ) : null} 
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
            sx={{ borderRadius: "5px" }}
          >
            { loading ? "Cerrando..." : "Cerrar caja" }
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}


type SummaryItemProps = {
  label: string;
  value: string;
  highlighted?: boolean;
};


function SummaryItem({
  label,
  value,
  highlighted = false,
}: SummaryItemProps) {
  return (
    <Box
      sx={{
        p: 1.75,
        border: "1px solid",
        borderColor: highlighted ? "primary.main" : "divider",
        borderRadius: "5px",
        bgcolor: highlighted ? "primary.light" : "#FAFAFA",
      }}
    >
      <Typography
        color="text.secondary"
        sx={{
          fontSize: "0.75rem",
          fontWeight: 600,
        }}
      >
        { label }
      </Typography>

      <Typography
        sx={{
          mt: 0.5,
          fontSize: "1.05rem",
          fontWeight: 800,
          color: highlighted ? "primary.main" : "text.primary",
        }}
      >
        { value }
      </Typography>
    </Box>
  );
}