import {
  AddRounded,
  ArrowDownwardRounded,
  ArrowUpwardRounded,
  CloseRounded,
  PointOfSaleRounded,
  RefreshRounded,
} from "@mui/icons-material";

import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Skeleton,
  Tooltip,
  Typography,
} from "@mui/material";

import { useQuery } from "@tanstack/react-query";

import { getCashSessionSummary } from "../services/cashService";

import type { CashSession } from "../types/cash";


type OpenCashSessionCardProps = {
  cashSession: CashSession;
  formatCurrency: (value: string | number) => string;
  onManualEntry: (cashSession: CashSession) => void;
  onManualExit: (cashSession: CashSession) => void;
  onCloseSession: (cashSession: CashSession) => void;
};


export function OpenCashSessionCard({
  cashSession,
  formatCurrency,
  onManualEntry,
  onManualExit,
  onCloseSession,
}: OpenCashSessionCardProps) {
  const summaryQuery = useQuery({
    queryKey: ["cash-session-summary", cashSession.id],
    queryFn: () => getCashSessionSummary(cashSession.id),
  });

  const summary = summaryQuery.data;

  return (
    <Paper
      elevation={ 0 }
      sx={{
        p: 2.5,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "15px",
        bgcolor: "#FFFFFF",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          mb: 2.5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 1.5,
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              width: 42,
              height: 42,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "5px",
              bgcolor: "primary.light",
              flexShrink: 0,
            }}
          >
            <PointOfSaleRounded
              sx={{
                color: "primary.main",
                fontSize: 23,
              }}
            />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: "1rem",
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              { cashSession.cash_register_name }
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 0.3,
                fontSize: "0.76rem",
              }}
            >
              { cashSession.cash_register_code }
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Chip
            label="Abierta"
            size="small"
            color="success"
            sx={{
              borderRadius: "14px",
              fontWeight: 700,
            }}
          />

          <Tooltip title="Actualizar resumen">
            <span>
              <IconButton
                size="small"
                onClick={ () => summaryQuery.refetch() }
                disabled={ summaryQuery.isFetching }
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: "5px",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <RefreshRounded fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {summaryQuery.isLoading ? (
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
          {[1, 2, 3, 4].map((item) => (
            <Skeleton
              key={ item }
              variant="rounded"
              height={ 72 }
              sx={{ borderRadius: "5px" }}
            />
          ))}
        </Box>
      ) : summary ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(4, minmax(0, 1fr))",
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
            icon={ <ArrowUpwardRounded fontSize="small" /> }
          />

          <SummaryItem
            label="Salidas"
            value={ `- ${formatCurrency(summary.total_out)}` }
            icon={ <ArrowDownwardRounded fontSize="small" /> }
          />

          <SummaryItem
            label="Saldo esperado"
            value={ formatCurrency(summary.expected_amount) }
            highlighted
          />
        </Box>
      ) : (
        <Typography
          color="error"
          sx={{ fontSize: "0.85rem" }}
        >
          No fue posible cargar el resumen de esta caja.
        </Typography>
      )}

      <Box
        sx={{
          mt: 2.5,
          pt: 2,
          display: "flex",
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          alignItems: {
            xs: "stretch",
            sm: "center",
          },
          justifyContent: "space-between",
          gap: 1.5,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 1,
          }}
        >
          <Button
            variant="outlined"
            startIcon={ <AddRounded /> }
            onClick={ () => onManualEntry(cashSession) }
            sx={{ borderRadius: "5px" }}
          >
            Entrada
          </Button>

          <Button
            variant="outlined"
            startIcon={ <ArrowDownwardRounded /> }
            onClick={ () => onManualExit(cashSession) }
            sx={{ borderRadius: "5px" }}
          >
            Salida
          </Button>
        </Box>

        <Button
          variant="contained"
          startIcon={ <CloseRounded /> }
          onClick={ () => onCloseSession(cashSession) }
          sx={{ borderRadius: "5px" }}
        >
          Cerrar caja
        </Button>
      </Box>
    </Paper>
  );
}


type SummaryItemProps = {
  label: string;
  value: string;
  icon?: React.ReactNode;
  highlighted?: boolean;
};


function SummaryItem({
  label,
  value,
  icon,
  highlighted = false,
}: SummaryItemProps) {
  return (
    <Box
      sx={{
        p: 1.75,
        minHeight: 72,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        border: "1px solid",
        borderColor: highlighted ? "primary.main" : "divider",
        borderRadius: "5px",
        bgcolor: highlighted ? "primary.light" : "#FAFAFA",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 0.75,
        }}
      >
        { icon }

        <Typography
          color="text.secondary"
          sx={{
            fontSize: "0.75rem",
            fontWeight: 600,
          }}
        >
          { label }
        </Typography>
      </Box>

      <Typography
        color={ highlighted ? "primary.main" : "text.primary" }
        sx={{
          mt: 0.5,
          fontSize: "1.05rem",
          fontWeight: 700,
        }}
      >
        { value }
      </Typography>
    </Box>
  );
}