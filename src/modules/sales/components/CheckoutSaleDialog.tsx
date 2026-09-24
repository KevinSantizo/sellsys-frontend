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

import { useEffect,  useMemo, useState,} from "react";
import type { PaymentMethod,} from "../types/sales.types";
import { OpenCashSessionSelect } from "../../cash/components/OpenCashSessionSelect";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCashRegister, getCashRegisters, getCashSessions, openCashSession, } from "../../cash/services/cashService";
import { OpenCashSessionDialog } from "../../cash/components/OpenCashSessionDialog";

import { CashRegisterFormDialog } from "../../cash/components/CashRegisterFormDialog";

import type { CashRegister, CashRegisterFormValues, } from "../../cash/types/cash";


export type CheckoutFormValues = {
  customerName: string;
  customerTaxId: string;
  notes: string;
  paymentMethod: PaymentMethod;
  amountReceived: string;
  reference: string;
  cashSessionId: string | null;
};

type CheckoutSaleDialogProps = {
  open: boolean;
  total: number;
  loading: boolean;
  companyId: string;
  branchId: string;
  branchName: string;
  onClose: () => void;
  onConfirm: (values: CheckoutFormValues) => Promise<void>;
};

function formatCurrency(value: number): string {
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
  companyId,
  branchId,
  branchName,
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

  const [reference, setReference] = useState("");

  const [notes, setNotes] = useState("");

  const [cashSessionId, setCashSessionId] = useState("");

  const queryClient = useQueryClient();
  const [selectedCashRegisterId, setSelectedCashRegisterId] = useState("");
  const [openingCashRegister, setOpeningCashRegister] = useState<CashRegister | null>(null);
  const [openCashSessionError, setOpenCashSessionError] = useState<string | null>(null);
  const [isCashRegisterDialogOpen, setIsCashRegisterDialogOpen] = useState(false);
  const [createCashRegisterError, setCreateCashRegisterError] = useState<string | null>(null);
  
  const openCashSessionsQuery = useQuery({
    queryKey: [
      "cash-sessions",
      "sale-checkout",
      companyId,
      branchId,
    ],
    queryFn: () => getCashSessions({
      companyId,
      branchId,
      status: "OPEN",
      ordering: "-opened_at",
      page: 1,
      pageSize: 100,
    }),
    enabled: Boolean(open && companyId && branchId),
  });

  const openCashSessions = openCashSessionsQuery.data?.results ?? [];

  const cashRegistersQuery = useQuery({
    queryKey: [
      "cash-registers",
      "sale-checkout",
      companyId,
      branchId,
    ],
    queryFn: () => getCashRegisters({
      companyId,
      branchId,
      isActive: true,
      page: 1,
      pageSize: 100,
    }),
    enabled: Boolean(
      open &&
      companyId &&
      branchId &&
      paymentMethod === "CASH" &&
      openCashSessions.length === 0
    ),
  });

  const cashRegisters = cashRegistersQuery.data?.results ?? [];


  useEffect(() => {
    if (!open) {
      return;
    }

    setCustomerName("Consumidor final");
    setCustomerTaxId("CF");
    setPaymentMethod("CASH");
    setAmountReceived(total.toFixed(2));
    setReference("");
    setNotes("");
    setCashSessionId("");
    setSelectedCashRegisterId("");
    setOpeningCashRegister(null);
    setOpenCashSessionError(null);
    setIsCashRegisterDialogOpen(false);
    setCreateCashRegisterError(null);

  }, [open, total]);

  const isCash = paymentMethod === "CASH";

  const requiresReference =
    paymentMethod === "CARD" ||
    paymentMethod === "TRANSFER";

  const amountReceivedNumber = Number(amountReceived) || 0;

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
    (!requiresReference || reference.trim() !== "") &&
    (!isCash || cashSessionId !== "");


  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method);
    setAmountReceived(total.toFixed(2));

    if (method === "CASH") {
      setReference("");
    } else {
      setCashSessionId("");
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
      cashSessionId: isCash ? cashSessionId : null,
    });
  };

  const openCashSessionMutation = useMutation({
    mutationFn: ({ cashRegister, openingAmount }: {
      cashRegister: CashRegister;
      openingAmount: string;
    }) => {
      return openCashSession({
        company_id: companyId,
        branch_id: branchId,
        cash_register_id: cashRegister.id,
        opening_amount: openingAmount,
        notes: "Apertura de caja desde venta",
      });
    },

    onSuccess: async (cashSession) => {
      await queryClient.invalidateQueries({
        queryKey: ["cash-sessions"],
      });

      setCashSessionId(cashSession.id);
      setOpeningCashRegister(null);
      setOpenCashSessionError(null);
    },

    onError: () => {
      setOpenCashSessionError(
        "No fue posible abrir la caja.",
      );
    },
  });

  const createCashRegisterMutation = useMutation({
    mutationFn: (values: CashRegisterFormValues) => {
      return createCashRegister({
        company_id: companyId,
        branch_id: branchId,
        name: values.name,
        code: values.code,
        is_active: values.is_active,
      });
    },

    onSuccess: async (cashRegister) => {
      await queryClient.invalidateQueries({
        queryKey: ["cash-registers"],
      });

      setSelectedCashRegisterId(cashRegister.id);
      setIsCashRegisterDialogOpen(false);
      setCreateCashRegisterError(null);

      setOpeningCashRegister(cashRegister);
    },

    onError: () => {
      setCreateCashRegisterError(
        "No fue posible crear la caja.",
      );
    },
  });


  const handleCreateCashRegister = () => {
    setCreateCashRegisterError(null);
    setIsCashRegisterDialogOpen(true);
  };

  const handleCloseCashRegisterDialog = () => {
    if (createCashRegisterMutation.isPending) {
      return;
    }

    setIsCashRegisterDialogOpen(false);
    setCreateCashRegisterError(null);
  };

  const handleSubmitCashRegister = (values: CashRegisterFormValues) => {
    setCreateCashRegisterError(null);
    createCashRegisterMutation.mutate(values);
  };

  const handleOpenCashRegister = () => {
    const cashRegister = cashRegisters.find(
      (item) => item.id === selectedCashRegisterId,
    );

    if (!cashRegister) {
      return;
    }

    setOpenCashSessionError(null);
    setOpeningCashRegister(cashRegister);
  };

  const handleSubmitOpenCashSession = (values: { opening_amount: string }) => {
    if (!openingCashRegister) {
      return;
    }

    openCashSessionMutation.mutate({
      cashRegister: openingCashRegister,
      openingAmount: values.opening_amount,
    });
  };

  return (
    <>
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
                fontWeight: 700,
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

            {paymentMethod === "CASH" && (
              <>
                {openCashSessionsQuery.isLoading ? (
                  <OpenCashSessionSelect
                    cashSessions={ [] }
                    value=""
                    loading={ true }
                    onChange={ setCashSessionId }
                  />
                ) : openCashSessions.length > 0 ? (
                  <OpenCashSessionSelect
                    cashSessions={ openCashSessions }
                    value={ cashSessionId }
                    loading={ false }
                    onChange={ setCashSessionId }
                  />
                ) : cashRegistersQuery.isLoading ? (
                  <Box
                    sx={{
                      p: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: "5px",
                    }}
                  >
                    <Typography color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                      Cargando cajas disponibles...
                    </Typography>
                  </Box>
                ) : cashRegisters.length === 0 ? (
                  <Box
                    sx={{
                      p: 2,
                      display: "grid",
                      gap: 1.5,
                      border: "1px solid",
                      borderColor: "warning.main",
                      borderRadius: "5px",
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontSize: "0.9rem", fontWeight: 700 }}>
                        No hay cajas creadas
                      </Typography>

                      <Typography
                        color="text.secondary"
                        sx={{ mt: 0.3, fontSize: "0.8rem" }}
                      >
                        Esta sucursal todavía no tiene una caja disponible.
                        Crea una para poder registrar pagos en efectivo.
                      </Typography>
                    </Box>

                    <Box>
                      <Button
                        variant="contained"
                        onClick={ handleCreateCashRegister }
                        sx={{
                          borderRadius: "5px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Crear caja
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      p: 2,
                      display: "grid",
                      gap: 1.5,
                      border: "1px solid",
                      borderColor: "warning.main",
                      borderRadius: "5px",
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontSize: "0.9rem", fontWeight: 700 }}>
                        No hay una caja abierta
                      </Typography>

                      <Typography
                        color="text.secondary"
                        sx={{ mt: 0.3, fontSize: "0.8rem" }}
                      >
                        Selecciona una caja para abrirla y continuar con el cobro.
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "minmax(0, 1fr) auto",
                        },
                        gap: 1,
                      }}
                    >
                      <TextField
                        select
                        label="Caja disponible"
                        value={ selectedCashRegisterId }
                        onChange={(event) => setSelectedCashRegisterId(event.target.value)}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "5px",
                          },
                        }}
                      >
                        {cashRegisters.map((cashRegister) => (
                          <MenuItem key={ cashRegister.id } value={ cashRegister.id }>
                            { cashRegister.name } ({ cashRegister.code })
                          </MenuItem>
                        ))}
                      </TextField>

                      <Button
                        variant="contained"
                        disabled={ !selectedCashRegisterId }
                        onClick={ handleOpenCashRegister }
                        sx={{
                          borderRadius: "5px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Abrir caja
                      </Button>
                    </Box>
                  </Box>
                )}
              </>
            )}

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
                    fontWeight: 700,
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
      
      <CashRegisterFormDialog
        open={ isCashRegisterDialogOpen }
        title="Nueva caja"
        submitLabel="Guardar"
        branchName={ branchName }
        initialValues={ undefined }
        isSubmitting={ createCashRegisterMutation.isPending }
        error={ createCashRegisterError }
        onClose={ handleCloseCashRegisterDialog }
        onSubmit={ handleSubmitCashRegister }
      />
      <OpenCashSessionDialog
        open={ Boolean(openingCashRegister) }
        cashRegister={ openingCashRegister }
        isSubmitting={ openCashSessionMutation.isPending }
        error={ openCashSessionError }
        onClose={() => {
          if (openCashSessionMutation.isPending) {
            return;
          }

          setOpeningCashRegister(null);
          setOpenCashSessionError(null);
        }}
        onSubmit={ handleSubmitOpenCashSession }
      />
    </>
  );
}