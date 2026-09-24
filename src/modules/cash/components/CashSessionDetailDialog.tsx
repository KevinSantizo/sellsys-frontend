import {
  ArrowBackRounded,
  ArrowDownwardRounded,
  ArrowForwardRounded,
  ArrowUpwardRounded,
} from "@mui/icons-material";

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Pagination,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
} from "@mui/x-data-grid";

import {
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query";

import {
  useMemo,
  useState,
} from "react";

import {
  getCashMovements,
  getCashSessionSummary,
} from "../services/cashService";

import type {
  CashMovement,
  CashMovementType,
  CashSession,
} from "../types/cash";


type CashSessionDetailDialogProps = {
  open: boolean;
  cashSession: CashSession;
  formatCurrency: (value: string | number) => string;
  onClose: () => void;
};


export function CashSessionDetailDialog({
  open,
  cashSession,
  formatCurrency,
  onClose,
}: CashSessionDetailDialogProps) {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const summaryQuery = useQuery({
    queryKey: [
      "cash-session-summary",
      cashSession.id,
    ],
    queryFn: () => getCashSessionSummary(cashSession.id),
    enabled: open,
  });

  const movementsQuery = useQuery({
    queryKey: [
      "cash-movements",
      "session-detail",
      cashSession.id,
      paginationModel.page,
      paginationModel.pageSize,
    ],
    queryFn: () => getCashMovements({
      cashSessionId: cashSession.id,
      ordering: "-created_at",
      page: paginationModel.page + 1,
      pageSize: paginationModel.pageSize,
    }),
    enabled: open,
    placeholderData: keepPreviousData,
  });

  const summary = summaryQuery.data;
  const cashMovements = movementsQuery.data?.results ?? [];
  const totalCashMovements = movementsQuery.data?.count ?? 0;

  const totalPages = Math.max(
    1,
    Math.ceil(totalCashMovements / paginationModel.pageSize),
  );

  const firstVisible =
    totalCashMovements === 0
      ? 0
      : paginationModel.page * paginationModel.pageSize + 1;

  const lastVisible = Math.min(
    (paginationModel.page + 1) * paginationModel.pageSize,
    totalCashMovements,
  );

  const difference = cashSession.difference !== null
    ? Number(cashSession.difference)
    : null;

  const columns = useMemo<GridColDef<CashMovement>[]>(() => [
    {
      field: "created_at",
      headerName: "Fecha / hora",
      width: 165,
      sortable: false,
      renderCell: (params) => (
        <DateTimeValue value={ params.row.created_at } />
      ),
    },
    {
      field: "movement_type",
      headerName: "Tipo",
      width: 155,
      sortable: false,
      renderCell: (params) => (
        <Chip
          label={ getMovementTypeLabel(params.row.movement_type) }
          size="small"
          sx={{
            borderRadius: "14px",
            fontWeight: 700,
          }}
        />
      ),
    },
    {
      field: "direction",
      headerName: "Dirección",
      width: 145,
      sortable: false,
      renderCell: (params) => {
        const isEntry = params.row.direction === "IN";

        return (
          <Chip
            icon={
              isEntry
                ? <ArrowUpwardRounded />
                : <ArrowDownwardRounded />
            }
            label={ isEntry ? "Entrada" : "Salida" }
            size="small"
            color={ isEntry ? "success" : "error" }
            variant="outlined"
            sx={{
              borderRadius: "14px",
              fontWeight: 700,
            }}
          />
        );
      },
    },
    {
      field: "reference",
      headerName: "Referencia",
      minWidth: 180,
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Typography sx={{ fontSize: "0.84rem" }}>
          { params.row.reference || "—" }
        </Typography>
      ),
    },
    {
      field: "notes",
      headerName: "Notas",
      minWidth: 240,
      flex: 1.5,
      sortable: false,
      renderCell: (params) => (
        <Typography
          noWrap
          title={ params.row.notes || "" }
          color="text.secondary"
          sx={{ fontSize: "0.82rem" }}
        >
          { params.row.notes || "—" }
        </Typography>
      ),
    },
    {
      field: "amount",
      headerName: "Monto",
      width: 150,
      align: "right",
      headerAlign: "right",
      sortable: false,
      renderCell: (params) => {
        const isEntry = params.row.direction === "IN";

        return (
          <Typography
            sx={{
              width: "100%",
              textAlign: "right",
              fontWeight: 700,
              color: isEntry ? "success.main" : "error.main",
            }}
          >
            { isEntry ? "+" : "-" } { formatCurrency(params.row.amount) }
          </Typography>
        );
      },
    },
  ], [formatCurrency]);

  return (
    <Dialog
      open={ open }
      onClose={ onClose }
      fullWidth
      maxWidth="lg"
      slotProps={{
        paper: {
          sx: {
                borderRadius: "5px",
                maxHeight: "92vh",
                overflow: "hidden",
            },
        },
      }} 
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          maxHeight: "92vh",
          overflow: "hidden",
        }}
      >
        <DialogTitle
          sx={{
            flexShrink: 0,
            fontWeight: 700,
          }}
        >
          Detalle de sesión de caja
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
              display: "flex",
              flexDirection: {
                xs: "column",
                sm: "row",
              },
              alignItems: {
                xs: "flex-start",
                sm: "center",
              },
              justifyContent: "space-between",
              gap: 1.5,
              mb: 3,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: "1.1rem",
                  fontWeight: 700,
                }}
              >
                { cashSession.cash_register_name }
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 0.25,
                  fontSize: "0.8rem",
                }}
              >
                { cashSession.cash_register_code }
                {" · "}
                { cashSession.branch_name }
              </Typography>
            </Box>

            <Chip
              label={ cashSession.status_display }
              size="small"
              sx={{
                borderRadius: "14px",
                fontWeight: 700,
              }}
            />
          </Box>

          <Typography
            sx={{
              mb: 1.5,
              fontSize: "0.9rem",
              fontWeight: 700,
            }}
          >
            Información de la sesión
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
              },
              gap: 1.5,
              mb: 3,
            }}
          >
            <SessionInfoCard
              title="Apertura"
              date={ cashSession.opened_at }
              user={ cashSession.opened_by_name }
            />

            <SessionInfoCard
              title="Cierre"
              date={ cashSession.closed_at }
              user={ cashSession.closed_by_name }
            />
          </Box>

          <Typography
            sx={{
              mb: 1.5,
              fontSize: "0.9rem",
              fontWeight: 700,
            }}
          >
            Resumen
          </Typography>

          {summaryQuery.isLoading ? (
            <Typography color="text.secondary">
              Cargando resumen...
            </Typography>
          ) : summary ? (
            <>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                    md: "repeat(4, minmax(0, 1fr))",
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

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                  },
                  gap: 1.5,
                  mt: 1.5,
                }}
              >
                <SummaryItem
                  label="Efectivo contado"
                  value={
                    cashSession.counted_amount !== null
                      ? formatCurrency(cashSession.counted_amount)
                      : "—"
                  }
                />

                <Box
                  sx={{
                    p: 1.75,
                    border: "1px solid",
                    borderColor:
                      difference === null || difference === 0
                        ? "divider"
                        : difference > 0
                          ? "success.main"
                          : "error.main",
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
                    Diferencia
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: "1.05rem",
                      fontWeight: 700,
                      color:
                        difference === null || difference === 0
                          ? "text.primary"
                          : difference > 0
                            ? "success.main"
                            : "error.main",
                    }}
                  >
                    {difference === null
                      ? "—"
                      : `${difference > 0 ? "+" : ""}${formatCurrency(difference)}`}
                  </Typography>
                </Box>
              </Box>
            </>
          ) : summaryQuery.isError ? (
            <Typography color="error">
              No fue posible cargar el resumen de la sesión.
            </Typography>
          ) : null}

          <Box sx={{ mt: 3 }}>
            <Typography
              sx={{
                mb: 1.5,
                fontSize: "0.9rem",
                fontWeight: 700,
              }}
            >
              Movimientos de la sesión
            </Typography>

            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "5px",
                overflow: "hidden",
              }}
            >
              <DataGrid
                rows={ cashMovements }
                columns={ columns }
                loading={ movementsQuery.isFetching }
                rowCount={ totalCashMovements }
                paginationMode="server"
                paginationModel={ paginationModel }
                onPaginationModelChange={ setPaginationModel }
                pageSizeOptions={ [5, 10, 20, 50, 100] }
                hideFooter
                disableRowSelectionOnClick
                autoHeight
                rowHeight={ 58 }
                sx={{
                  border: 0,
                  "& .MuiDataGrid-columnHeaders": {
                    bgcolor: "#F8F9FA",
                  },
                  "& .MuiDataGrid-columnHeaderTitle": {
                    fontSize: "0.8rem",
                    fontWeight: 700,
                  },
                  "& .MuiDataGrid-cell": {
                    display: "flex",
                    alignItems: "center",
                    borderColor: "divider",
                  },
                }}
              />

              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={ 1.5 }
                sx={{
                  px: 2,
                  py: 1.5,
                  alignItems: {
                    xs: "stretch",
                    md: "center",
                  },
                  justifyContent: "space-between",
                  borderTop: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Stack
                  direction="row"
                  spacing={ 1.25 }
                  sx={{ alignItems: "center" }}
                >
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700 }}
                  >
                    Resultado { firstVisible }-{ lastVisible } de { totalCashMovements }
                  </Typography>

                  <TextField
                    select
                    size="small"
                    value={ paginationModel.pageSize }
                    onChange={ (event) => {
                      setPaginationModel({
                        page: 0,
                        pageSize: Number(event.target.value),
                      });
                    }}
                    sx={{
                      width: 76,
                      "& .MuiOutlinedInput-root": {
                        height: 34,
                        borderRadius: "5px",
                      },
                    }}
                  >
                    {[5, 10, 20, 50, 100].map((option) => (
                      <MenuItem key={ option } value={ option }>
                        { option }
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>

                <Stack
                  direction="row"
                  spacing={ 0.75 }
                  sx={{
                    alignItems: "center",
                    justifyContent: {
                      xs: "space-between",
                      md: "flex-end",
                    },
                  }}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={ <ArrowBackRounded /> }
                    disabled={ paginationModel.page === 0 || movementsQuery.isFetching }
                    onClick={ () => {
                      setPaginationModel((current) => ({
                        ...current,
                        page: current.page - 1,
                      }));
                    }}
                    sx={{ borderRadius: "5px" }}
                  >
                    Anterior
                  </Button>

                  <Pagination
                    count={ totalPages }
                    page={ paginationModel.page + 1 }
                    onChange={ (_event, newPage) => {
                      setPaginationModel((current) => ({
                        ...current,
                        page: newPage - 1,
                      }));
                    }}
                    disabled={ movementsQuery.isFetching }
                    shape="rounded"
                    size="small"
                    siblingCount={ 1 }
                    boundaryCount={ 1 }
                    hidePrevButton
                    hideNextButton
                    sx={{
                      display: {
                        xs: "none",
                        sm: "block",
                      },
                      "& .MuiPaginationItem-root": {
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: "5px",
                      },
                      "& .Mui-selected": {
                        color: "primary.main",
                        bgcolor: "transparent !important",
                        borderColor: "primary.main",
                      },
                    }}
                  />

                  <Button
                    variant="outlined"
                    size="small"
                    endIcon={ <ArrowForwardRounded /> }
                    disabled={ paginationModel.page >= totalPages - 1 || movementsQuery.isFetching }
                    onClick={ () => {
                      setPaginationModel((current) => ({
                        ...current,
                        page: current.page + 1,
                      }));
                    }}
                    sx={{ borderRadius: "5px" }}
                  >
                    Siguiente
                  </Button>
                </Stack>
              </Stack>
            </Box>
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
            variant="contained"
            onClick={ onClose }
            sx={{ borderRadius: "5px" }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}


type SessionInfoCardProps = {
  title: string;
  date: string | null;
  user: string | null;
};


function SessionInfoCard({
  title,
  date,
  user,
}: SessionInfoCardProps) {
  return (
    <Box
      sx={{
        p: 1.75,
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
        { title }
      </Typography>

      <Typography
        sx={{
          mt: 0.5,
          fontSize: "0.9rem",
          fontWeight: 700,
        }}
      >
        { date ? formatDateTime(date) : "—" }
      </Typography>

      <Typography
        color="text.secondary"
        sx={{
          mt: 0.25,
          fontSize: "0.78rem",
        }}
      >
        { user || "—" }
      </Typography>
    </Box>
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
          fontWeight: 700,
          color: highlighted ? "primary.main" : "text.primary",
        }}
      >
        { value }
      </Typography>
    </Box>
  );
}


type DateTimeValueProps = {
  value: string;
};


function DateTimeValue({
  value,
}: DateTimeValueProps) {
  const date = new Date(value);

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Typography sx={{ fontSize: "0.82rem", fontWeight: 700 }}>
        { date.toLocaleDateString("es-GT") }
      </Typography>

      <Typography color="text.secondary" sx={{ fontSize: "0.72rem" }}>
        { date.toLocaleTimeString("es-GT", {
          hour: "2-digit",
          minute: "2-digit",
        }) }
      </Typography>
    </Box>
  );
}


function formatDateTime(value: string) {
  const date = new Date(value);

  return `${date.toLocaleDateString("es-GT")} ${date.toLocaleTimeString("es-GT", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}


function getMovementTypeLabel(type: CashMovementType) {
  switch (type) {
    case "SALE":
      return "Venta";

    case "EXPENSE":
      return "Gasto";

    case "PURCHASE":
      return "Compra";

    case "MANUAL_IN":
      return "Entrada manual";

    case "MANUAL_OUT":
      return "Salida manual";

    case "REVERSAL":
      return "Reversión";

    default:
      return type;
  }
}