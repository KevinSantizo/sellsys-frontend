import {
  PrintRounded,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import type {
  SaleDetail,
  SaleStatus,
} from "../types/sales.types";

type SaleDetailDialogProps = {
  open: boolean;
  sale?: SaleDetail;
  loading: boolean;
  error: boolean;
  downloading: boolean;
  cancelling: boolean;

  formatCurrency: (
    value: string | number,
  ) => string;

  formatDateTime: (
    value:
      | string
      | null
      | undefined,
  ) => string;

  onClose: () => void;

  onDownloadReceipt: (
    sale: {
      id: string;
      sale_number: string;
      status?: SaleStatus;
    },
  ) => Promise<void>;

  onCancel: (
    sale: SaleDetail,
  ) => void;
};

export function SaleDetailDialog({
  open,
  sale,
  loading,
  error,
  downloading,
  cancelling,
  formatCurrency,
  formatDateTime,
  onClose,
  onDownloadReceipt,
  onCancel,
}: SaleDetailDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={
        downloading
          ? undefined
          : onClose
      }
      fullWidth
      maxWidth="md"
      slotProps={{
        paper: {
          sx: {
            borderRadius:
              "15px",

            maxHeight:
              "calc(100vh - 32px)",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 800,
        }}
      >
        Detalle de venta
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          p: {
            xs: 2,
            sm: 3,
          },
        }}
      >
        {/* LOADING */}

        {loading && (
          <Box
            sx={{
              minHeight: 300,
              display: "grid",
              placeItems:
                "center",
            }}
          >
            <CircularProgress
              size={32}
            />
          </Box>
        )}

        {/* ERROR */}

        {error && (
          <Alert severity="error">
            No fue posible cargar
            la información de la
            venta.
          </Alert>
        )}

        {/* CONTENIDO */}

        {!loading &&
          !error &&
          sale && (
            <Stack spacing={3}>
              {/* HEADER */}

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={1}
                sx={{
                  justifyContent:
                    "space-between",

                  alignItems: {
                    xs: "flex-start",
                    sm: "center",
                  },
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize:
                        "1.1rem",

                      fontWeight:
                        800,
                    }}
                  >
                    {
                      sale.sale_number
                    }
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{
                      fontSize:
                        "0.8rem",
                    }}
                  >
                    {formatDateTime(
                      sale.completed_at ??
                        sale.created_at,
                    )}
                  </Typography>
                </Box>

                <SaleStatusChip
                  status={
                    sale.status
                  }
                  label={
                    sale.status_display
                  }
                />
              </Stack>

              <Divider />

              {/* INFORMACIÓN */}

              <Box
                sx={{
                  display:
                    "grid",

                  gridTemplateColumns:
                    {
                      xs: "1fr",
                      sm: "repeat(2, minmax(0, 1fr))",
                    },

                  gap: 2,
                }}
              >
                <DetailItem
                  label="Cliente"
                  value={
                    sale.customer_name ||
                    "Consumidor final"
                  }
                />

                <DetailItem
                  label="NIT"
                  value={
                    sale.customer_tax_id ||
                    "CF"
                  }
                />

                <DetailItem
                  label="Sucursal"
                  value={
                    sale.branch_name
                  }
                />

                <DetailItem
                  label="Vendedor"
                  value={
                    sale.created_by_name ??
                    "-"
                  }
                />
              </Box>

              {/* PRODUCTOS */}

              <Box>
                <Typography
                  sx={{
                    mb: 1.25,

                    fontSize:
                      "0.9rem",

                    fontWeight:
                      800,
                  }}
                >
                  Productos
                </Typography>

                <Paper
                  variant="outlined"
                  sx={{
                    overflow:
                      "hidden",

                    borderRadius:
                      "10px",
                  }}
                >
                  {sale.items.map(
                    (
                      item,
                      index,
                    ) => (
                      <Box
                        key={
                          item.id
                        }
                        sx={{
                          px: 2,
                          py: 1.5,

                          borderBottom:
                            index <
                            sale.items
                              .length -
                              1
                              ? "1px solid"
                              : undefined,

                          borderColor:
                            "divider",
                        }}
                      >
                        <Stack
                          direction={{
                            xs: "column",
                            sm: "row",
                          }}
                          spacing={1}
                          sx={{
                            justifyContent:
                              "space-between",

                            alignItems: {
                              xs: "flex-start",
                              sm: "center",
                            },
                          }}
                        >
                          <Box>
                            <Typography
                              sx={{
                                fontSize:
                                  "0.84rem",

                                fontWeight:
                                  700,
                              }}
                            >
                              {
                                item.product_name
                              }
                            </Typography>

                            <Typography
                              color="text.secondary"
                              sx={{
                                fontSize:
                                  "0.75rem",
                              }}
                            >
                              {
                                item.quantity
                              }{" "}
                              ×{" "}
                              {formatCurrency(
                                item.unit_price,
                              )}
                            </Typography>

                            {Number(
                              item.discount_amount,
                            ) >
                              0 && (
                              <Typography
                                color="text.secondary"
                                sx={{
                                  fontSize:
                                    "0.72rem",
                                }}
                              >
                                Descuento:{" "}
                                {formatCurrency(
                                  item.discount_amount,
                                )}
                              </Typography>
                            )}
                          </Box>

                          <Typography
                            sx={{
                              fontSize:
                                "0.86rem",

                              fontWeight:
                                700,

                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {formatCurrency(
                              item.line_total,
                            )}
                          </Typography>
                        </Stack>
                      </Box>
                    ),
                  )}
                </Paper>
              </Box>

              {/* RESUMEN */}

              <Box
                sx={{
                  ml: {
                    xs: 0,
                    sm: "auto",
                  },

                  width: {
                    xs: "100%",
                    sm: 340,
                  },
                }}
              >
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,

                    borderRadius:
                      "10px",

                    bgcolor:
                      "#FAFAFA",
                  }}
                >
                  <SummaryRow
                    label="Subtotal"
                    value={formatCurrency(
                      sale.subtotal,
                    )}
                  />

                  <SummaryRow
                    label="Descuento"
                    value={`- ${formatCurrency(
                      sale.discount_total,
                    )}`}
                  />

                  <SummaryRow
                    label="Impuesto"
                    value={formatCurrency(
                      sale.tax_total,
                    )}
                  />

                  <Divider
                    sx={{
                      my: 1.25,
                    }}
                  />

                  <SummaryRow
                    label="Total"
                    value={formatCurrency(
                      sale.total,
                    )}
                    strong
                  />

                  <SummaryRow
                    label="Recibido"
                    value={formatCurrency(
                      sale.amount_received,
                    )}
                  />

                  <SummaryRow
                    label="Cambio"
                    value={formatCurrency(
                      sale.change_amount,
                    )}
                  />
                </Paper>
              </Box>

              {/* PAGOS */}

              {sale.payments.length >
                0 && (
                <Box>
                  <Typography
                    sx={{
                      mb: 1,

                      fontSize:
                        "0.9rem",

                      fontWeight:
                        800,
                    }}
                  >
                    Pagos
                  </Typography>

                  <Stack spacing={1}>
                    {sale.payments.map(
                      (
                        payment,
                      ) => (
                        <Paper
                          key={
                            payment.id
                          }
                          variant="outlined"
                          sx={{
                            p: 1.5,

                            borderRadius:
                              "10px",
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={2}
                            sx={{
                              justifyContent:
                                "space-between",

                              alignItems:
                                "center",
                            }}
                          >
                            <Box>
                              <Typography
                                sx={{
                                  fontSize:
                                    "0.82rem",

                                  fontWeight:
                                    700,
                                }}
                              >
                                {
                                  payment.method_display
                                }
                              </Typography>

                              {payment.reference && (
                                <Typography
                                  color="text.secondary"
                                  sx={{
                                    fontSize:
                                      "0.72rem",
                                  }}
                                >
                                  Referencia:{" "}
                                  {
                                    payment.reference
                                  }
                                </Typography>
                              )}
                            </Box>

                            <Typography
                              sx={{
                                fontWeight:
                                  700,

                                whiteSpace:
                                  "nowrap",
                              }}
                            >
                              {formatCurrency(
                                payment.amount,
                              )}
                            </Typography>
                          </Stack>
                        </Paper>
                      ),
                    )}
                  </Stack>
                </Box>
              )}

              {/* NOTAS */}

              {sale.notes && (
                <Box>
                  <Typography
                    sx={{
                      mb: 0.5,

                      fontSize:
                        "0.82rem",

                      fontWeight:
                        700,
                    }}
                  >
                    Notas
                  </Typography>

                  <Typography
                    color="text.secondary"
                    sx={{
                      fontSize:
                        "0.8rem",
                    }}
                  >
                    {sale.notes}
                  </Typography>
                </Box>
              )}
            </Stack>
          )}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,

          borderTop:
            "1px solid",

          borderColor:
            "divider",
        }}
      >
        <Button
          type="button"
          variant="outlined"
          onClick={onClose}
          disabled={
            downloading
          }
          sx={{
            borderRadius:
              "5px",

            textTransform:
              "none",
          }}
        >
          Cerrar
        </Button>
        {sale?.status === "COMPLETED" && (
          <Button
            type="button"
            variant="outlined"
            color="error"
            disabled={
              downloading ||
              cancelling
            }
            onClick={() => {
              onCancel(sale);
            }}
            sx={{
              borderRadius: "5px",
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Cancelar venta
          </Button>
        )}
        <Button
          type="button"
          variant="contained"
          startIcon={
            downloading ? (
              <CircularProgress
                size={18}
                color="inherit"
              />
            ) : (
              <PrintRounded />
            )
          }
          disabled={
            downloading ||
            !sale ||
            sale.status !==
              "COMPLETED"
          }
          onClick={() => {
            if (!sale) {
              return;
            }

            void onDownloadReceipt(
              sale,
            );
          }}
          sx={{
            borderRadius:
              "5px",

            textTransform:
              "none",

            fontWeight: 700,
          }}
        >
          Imprimir recibo
        </Button>
      </DialogActions>
    </Dialog>
  );
}

type SaleStatusChipProps = {
  status:
    | "DRAFT"
    | "COMPLETED"
    | "CANCELLED";

  label: string;
};

function SaleStatusChip({
  status,
  label,
}: SaleStatusChipProps) {
  const completed =
    status ===
    "COMPLETED";

  const cancelled =
    status ===
    "CANCELLED";

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        height: 26,

        borderRadius:
          "14px",

        fontSize:
          "0.76rem",

        fontWeight: 600,

        color:
          completed
            ? "#166534"
            : cancelled
              ? "#991B1B"
              : "#854D0E",

        bgcolor:
          completed
            ? "#DCFCE7"
            : cancelled
              ? "#FEE2E2"
              : "#FEF9C3",
      }}
    />
  );
}

type DetailItemProps = {
  label: string;

  value:
    | string
    | number
    | null
    | undefined;
};

function DetailItem({
  label,
  value,
}: DetailItemProps) {
  return (
    <Box>
      <Typography
        color="text.secondary"
        sx={{
          fontSize:
            "0.72rem",

          mb: 0.3,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize:
            "0.84rem",

          fontWeight: 600,
        }}
      >
        {value ?? "-"}
      </Typography>
    </Box>
  );
}

type SummaryRowProps = {
  label: string;

  value: string;

  strong?: boolean;
};

function SummaryRow({
  label,
  value,
  strong = false,
}: SummaryRowProps) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        py: 0.45,

        justifyContent:
          "space-between",
      }}
    >
      <Typography
        color={
          strong
            ? "text.primary"
            : "text.secondary"
        }
        sx={{
          fontSize:
            strong
              ? "0.9rem"
              : "0.8rem",

          fontWeight:
            strong
              ? 800
              : 400,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize:
            strong
              ? "0.9rem"
              : "0.8rem",

          fontWeight:
            strong
              ? 800
              : 700,

          whiteSpace:
            "nowrap",
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}