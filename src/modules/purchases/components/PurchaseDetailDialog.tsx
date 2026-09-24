import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  Divider 
} from "@mui/material";

import type {
  Purchase,
  PurchaseStatus,
} from "../../purchases/suppliers/types/purchase";


type PurchaseDetailDialogProps = {
  open: boolean;
  purchase?: Purchase;
  loading: boolean;
  formatCurrency: (value: string | number) => string;
  onClose: () => void;
};


export function PurchaseDetailDialog({
  open,
  purchase,
  loading,
  formatCurrency,
  onClose,
}: PurchaseDetailDialogProps) {
  return (
    <Dialog
      open={ open }
      onClose={ onClose }
      fullWidth
      maxWidth="md"
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
        sx={{
          display: "flex",
          flexDirection: "column",
          maxHeight: "calc(100vh - 32px)",
          overflow: "hidden",
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Detalle de compra
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
          {loading || !purchase ? (
            <Stack
              
              sx=
                {{ 
                    minHeight: 340,
                    alignItems: "center",
                    justifyContent: "center",
                    spacing: 1.5 
                }}
            >
              <CircularProgress size={32} />

              <Typography color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                Cargando compra...
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={3}>
              <Box>
                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                        mb: 2,
                    }}
                >
                    <Typography
                        sx={{
                        fontSize: "1.05rem",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        }}
                    >
                        { purchase.purchase_number }
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{
                        fontSize: "0.82rem",
                        flex: 1,
                        }}
                    >
                        { purchase.supplier_name }
                    </Typography>

                    <PurchaseStatusChip
                        status={ purchase.status }
                        label={ purchase.status_display }
                    />
                </Box>
                 <Divider />
                <Box
                  sx={{
                    mt: 3,
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, minmax(0, 1fr))",
                    },
                    gap: 2,
                  }}
                >
                  <DetailField
                    label="Proveedor"
                    value={ purchase.supplier_name }
                  />

                  <DetailField
                    label="Factura del proveedor"
                    value={ purchase.supplier_invoice_number || "Sin factura" }
                  />

                  <DetailField
                    label="Fecha de compra"
                    value={ formatDate(purchase.purchase_date) }
                  />

                  <DetailField
                    label="Método de pago"
                    value={ purchase.payment_method_display }
                  />

                  <DetailField
                    label="Sucursal"
                    value={ purchase.branch_name }
                  />

                  <DetailField
                    label="Registrado por"
                    value={ purchase.created_by_name || "-" }
                  />
                </Box>
              </Box>

            <Divider />

              <Box>
              <Typography sx={{ mb: 1.5, fontSize: "0.9rem", fontWeight: 800 }}>
                  Productos
              </Typography>

              <Stack spacing={1}>
                  {purchase.items.map((item) => (
                  <Box
                      key={ item.id }
                      sx={{
                      p: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: "5px",
                      }}
                  >
                      <Box
                      sx={{
                          display: "grid",
                          gridTemplateColumns: {
                          xs: "1fr",
                          sm: "minmax(0, 2fr) repeat(3, minmax(100px, 0.7fr))",
                          },
                          gap: 2,
                          alignItems: "center",
                      }}
                      >
                      <Box sx={{ minWidth: 0 }}>
                          <Typography
                          sx={{
                              fontSize: "0.84rem",
                              fontWeight: 700,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                          }}
                          >
                          { item.product_name }
                          </Typography>

                          <Typography color="text.secondary" sx={{ fontSize: "0.72rem" }}>
                          SKU: { item.product_sku }
                          </Typography>
                      </Box>

                      <DetailValue
                          label="Cantidad"
                          value={ formatQuantity(item.quantity) }
                      />

                      <DetailValue
                          label="Costo unitario"
                          value={ formatCurrency(item.unit_cost) }
                      />

                      <DetailValue
                          label="Subtotal"
                          value={ formatCurrency(item.subtotal) }
                          bold
                      />
                      </Box>
                  </Box>
                  ))}
              </Stack>
              </Box>

              <Box
                      sx={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "flex-end",
                      }}
                  >
                  <Box
                      sx={{
                      width: {
                          xs: "100%",
                          sm: 330,
                      },
                      }}
                  >
                      <Typography
                      sx={{
                          mb: 1.5,
                          fontSize: "0.9rem",
                          fontWeight: 700,
                      }}
                      >
                      Totales
                      </Typography>

                      <Box
                      sx={{
                          p: 2,
                          bgcolor: "#FAFAFA",
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: "5px",
                      }}
                      >
                      <SummaryRow
                          label="Subtotal"
                          value={ formatCurrency(purchase.subtotal) }
                      />

                      <SummaryRow
                          label="Descuento"
                          value={ `- ${formatCurrency(purchase.discount_total)}` }
                      />

                      <SummaryRow
                          label="Impuesto"
                          value={ formatCurrency(purchase.tax_total) }
                      />

                      <Box
                          sx={{
                          mt: 1.25,
                          pt: 1.25,
                          borderTop: "1px solid",
                          borderColor: "divider",
                          }}
                      >
                          <Stack
                          
                          sx={{
                              direction: "row",
                              justifyContent: "space-between",
                              spacing: 2 
                          }}
                          >
                          <Typography sx={{ fontSize: "0.9rem", fontWeight: 800 }}>
                              Total
                          </Typography>

                          <Typography
                              color="primary.main"
                              sx={{
                              fontSize: "1rem",
                              fontWeight: 700,
                              }}
                          >
                              { formatCurrency(purchase.total) }
                          </Typography>
                          </Stack>
                      </Box>
                      </Box>
                  </Box>
              </Box>

              {purchase.notes && (
                <Box>
                  <Typography sx={{ mb: 1, fontSize: "0.9rem", fontWeight: 800 }}>
                    Notas
                  </Typography>

                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: "#FAFAFA",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: "5px",
                    }}
                  >
                    <Typography sx={{ fontSize: "0.82rem", whiteSpace: "pre-wrap" }}>
                      { purchase.notes }
                    </Typography>
                  </Box>
                </Box>
              )}
            </Stack>
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
            variant="contained"
            onClick={ onClose }
            sx={{
              borderRadius: "5px",
              textTransform: "none",
              fontWeight: 700,
              minWidth: 100,
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}


type DetailFieldProps = {
  label: string;
  value: string;
};


function DetailField({ label, value }: DetailFieldProps) {
  return (
    <Box>
      <Typography color="text.secondary" sx={{ mb: 0.35, fontSize: "0.80rem" }}>
        { label }
      </Typography>

      <Typography sx={{ fontSize: "0.9rem", fontWeight: 700 }}>
        { value }
      </Typography>
    </Box>
  );
}


type DetailValueProps = {
  label: string;
  value: string;
  bold?: boolean;
};


function DetailValue({ label, value, bold = false }: DetailValueProps) {
  return (
    <Box>
      <Typography color="text.secondary" sx={{ fontSize: "0.68rem" }}>
        { label }
      </Typography>

      <Typography sx={{ mt: 0.15, fontSize: "0.82rem", fontWeight: bold ? 800 : 600 }}>
        { value }
      </Typography>
    </Box>
  );
}


type SummaryRowProps = {
  label: string;
  value: string;
};


function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <Stack 
         
        sx={{ 
            py: 0.4,
            direction: "row", 
            justifyContent: "space-between", 
            spacing: 2
        }}
    >
      <Typography color="text.secondary" sx={{ fontSize: "0.8rem" }}>
        { label }
      </Typography>

      <Typography sx={{ fontSize: "0.8rem", fontWeight: 700 }}>
        { value }
      </Typography>
    </Stack>
  );
}


function PurchaseStatusChip({
  status,
  label,
}: {
  status: PurchaseStatus;
  label: string;
}) {
  if (status === "COMPLETED") {
    return (
      <Chip
        label={ label }
        size="small"
        sx={{
          bgcolor: "rgba(16, 126, 64, 0.10)",
          color: "#107E40",
          fontWeight: 700,
        }}
      />
    );
  }

  if (status === "CANCELLED") {
    return (
      <Chip
        label={ label }
        size="small"
        sx={{
          bgcolor: "rgba(211, 47, 47, 0.10)",
          color: "error.main",
          fontWeight: 700,
        }}
      />
    );
  }

  return (
    <Chip
      label={ label }
      size="small"
      sx={{
        bgcolor: "rgba(237, 108, 2, 0.10)",
        color: "warning.dark",
        fontWeight: 700,
      }}
    />
  );
}


function formatQuantity(value: string) {
  const quantity = Number(value);

  if (!Number.isFinite(quantity)) return "-";

  return quantity.toLocaleString("es-GT", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  });
}


function formatDate(value: string) {
  if (!value) return "-";

  const [year, month, day] = value.split("-");

  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
}