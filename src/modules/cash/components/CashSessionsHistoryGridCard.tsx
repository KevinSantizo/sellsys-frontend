import {
  ArrowBackRounded,
  ArrowForwardRounded,
  PointOfSaleRounded,
  FilterAltOffRounded,
  VisibilityRounded,
} from "@mui/icons-material";

import {
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
} from "@mui/x-data-grid";

import { useMemo } from "react";

import type {
  CashRegister,
  CashSession,
} from "../types/cash";


type CashSessionsHistoryGridCardProps = {
  cashSessions: CashSession[];
  cashRegisters: CashRegister[];
  totalCashSessions: number;
  loading: boolean;
  cashRegisterId: string;
  paginationModel: GridPaginationModel;
  formatCurrency: (value: string | number) => string;
  onCashRegisterChange: (value: string) => void;
  onClearFilters: () => void;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  onViewDetail: (cashSession: CashSession) => void;
};


export function CashSessionsHistoryGridCard({
  cashSessions,
  cashRegisters,
  totalCashSessions,
  loading,
  cashRegisterId,
  paginationModel,
  formatCurrency,
  onCashRegisterChange,
  onClearFilters,
  onPaginationModelChange,
  onViewDetail,
}: CashSessionsHistoryGridCardProps) {
  const totalPages = Math.max(
    1,
    Math.ceil(totalCashSessions / paginationModel.pageSize),
  );

  const firstVisible =
    totalCashSessions === 0
      ? 0
      : paginationModel.page * paginationModel.pageSize + 1;

  const lastVisible = Math.min(
    (paginationModel.page + 1) * paginationModel.pageSize,
    totalCashSessions,
  );

  const columns = useMemo<GridColDef<CashSession>[]>(() => [
    {
      field: "cash_register_name",
      headerName: "Caja",
      minWidth: 150,
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Typography sx={{ fontSize: "0.86rem", fontWeight: 800 }}>
            { params.row.cash_register_name }
          </Typography>

          <Typography color="text.secondary" sx={{ fontSize: "0.72rem" }}>
            { params.row.cash_register_code }
          </Typography>
        </Box>
      ),
    },
    {
      field: "opened_at",
      headerName: "Apertura",
      width: 125,
      sortable: false,
      renderCell: (params) => (
        <DateTimeValue value={ params.row.opened_at } />
      ),
    },
    {
      field: "closed_at",
      headerName: "Cierre",
      width: 125,
      sortable: false,
      renderCell: (params) => (
        <DateTimeValue value={ params.row.closed_at } />
      ),
    },
    {
      field: "opened_by_name",
      headerName: "Abrió",
      minWidth: 125,
      flex: 0.8,
      sortable: false,
      renderCell: (params) => (
        <Typography sx={{ fontSize: "0.84rem" }}>
          { params.row.opened_by_name || "—" }
        </Typography>
      ),
    },
    {
      field: "closed_by_name",
      headerName: "Cerró",
      minWidth: 125,
      flex: 0.8,
      sortable: false,
      renderCell: (params) => (
        <Typography sx={{ fontSize: "0.84rem" }}>
          { params.row.closed_by_name || "—" }
        </Typography>
      ),
    },
    {
      field: "opening_amount",
      headerName: "Saldo inicial",
      width: 135,
      align: "right",
      headerAlign: "right",
      sortable: false,
      renderCell: (params) => (
        <AmountValue value={ formatCurrency(params.row.opening_amount) } />
      ),
    },
    {
      field: "expected_amount",
      headerName: "Esperado",
      width: 135,
      align: "right",
      headerAlign: "right",
      sortable: false,
      renderCell: (params) => (
        <AmountValue
          value={
            params.row.expected_amount !== null
              ? formatCurrency(params.row.expected_amount)
              : "—"
          }
        />
      ),
    },
    {
      field: "counted_amount",
      headerName: "Contado",
      width: 135,
      align: "right",
      headerAlign: "right",
      sortable: false,
      renderCell: (params) => (
        <AmountValue
          value={
            params.row.counted_amount !== null
              ? formatCurrency(params.row.counted_amount)
              : "—"
          }
        />
      ),
    },
    {
      field: "difference",
      headerName: "Diferencia",
      width: 145,
      align: "right",
      headerAlign: "right",
      sortable: false,
      renderCell: (params) => {
        if (params.row.difference === null) {
          return <AmountValue value="—" />;
        }

        const difference = Number(params.row.difference);

        return (
          <Typography
            sx={{
              width: "100%",
              textAlign: "right",
              fontSize: "0.86rem",
              fontWeight: 700,
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
        );
      },
    },
    {
        field: "status",
        headerName: "Estado",
        width: 110,
        sortable: false,
        renderCell: () => (
            <Box
            sx={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
            >
            <Chip
                label="Cerrada"
                size="small"
                sx={{
                borderRadius: "14px",
                fontWeight: 700,
                }}
            />
            </Box>
        ),
    },
    {
        field: "actions",
        headerName: "",
        width: 70,
        sortable: false,
        filterable: false,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => (
            <Tooltip title="Ver detalle">
            <IconButton
                size="small"
                onClick={ () => onViewDetail(params.row) }
                sx={{
                width: 34,
                height: 34,
                borderRadius: "5px",
                border: "1px solid",
                borderColor: "divider",
                }}
            >
                <VisibilityRounded fontSize="small" />
            </IconButton>
            </Tooltip>
        ),
    },
  ], [formatCurrency, onViewDetail]);

  return (
    <Paper
      elevation={ 0 }
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "15px",
        overflow: "hidden",
        bgcolor: "#FFFFFF",
      }}
    >
      <Box
        sx={{
          px: 2,
          pt: 2,
        }}
      >
        <Typography
          sx={{
            fontSize: "1rem",
            fontWeight: 700,
            mb: 1.5,
          }}
        >
          Historial de sesiones de caja
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: {
              xs: "column",
              sm: "row",
            },
            gap: 1.25,
            mb: 2,
          }}
        >
          <TextField
            select
            label="Caja"
            size="small"
            value={ cashRegisterId }
            onChange={ (event) => onCashRegisterChange(event.target.value) }
            sx={{
              width: {
                xs: "100%",
                sm: 300,
              },
              "& .MuiOutlinedInput-root": {
                borderRadius: "5px",
              },
            }}
          >
            <MenuItem value="">
              Todas las cajas
            </MenuItem>

            {cashRegisters.map((cashRegister) => (
              <MenuItem
                key={ cashRegister.id }
                value={ cashRegister.id }
              >
                { cashRegister.name }
              </MenuItem>
            ))}
          </TextField>

          <Button
            variant="outlined"
            startIcon={ <FilterAltOffRounded /> }
            onClick={ onClearFilters }
            sx={{
              borderRadius: "5px",
              whiteSpace: "nowrap",
            }}
          >
            Limpiar filtros
          </Button>
        </Box>
      </Box>

      <DataGrid
        rows={ cashSessions }
        columns={ columns }
        loading={ loading }
        rowCount={ totalCashSessions }
        paginationMode="server"
        paginationModel={ paginationModel }
        onPaginationModelChange={ onPaginationModelChange }
        pageSizeOptions={ [5, 10, 20, 50, 100] }
        hideFooter
        disableRowSelectionOnClick
        autoHeight
        rowHeight={ 58 }
        slots={{
          noRowsOverlay: EmptyPurchases,
        }}
        sx={{
            border: 0,
            borderTop: "1px solid",
            borderColor: "divider",

            "& .MuiDataGrid-columnHeaders": {
                bgcolor: "#F8F9FA",
            },

            "& .MuiDataGrid-columnHeaderTitle": {
                fontWeight: 700,
                fontSize: "0.8rem",
            },

            "& .MuiDataGrid-cell": {
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
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
        <Stack direction="row" spacing={ 1.25 } sx={{ alignItems: "center" }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            Resultado { firstVisible }-{ lastVisible } de { totalCashSessions }
          </Typography>

          <TextField
            select
            size="small"
            value={ paginationModel.pageSize }
            onChange={ (event) => {
              onPaginationModelChange({
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
            type="button"
            variant="outlined"
            size="small"
            startIcon={ <ArrowBackRounded /> }
            disabled={ paginationModel.page === 0 || loading }
            onClick={ () => {
              onPaginationModelChange({
                ...paginationModel,
                page: paginationModel.page - 1,
              });
            }}
            sx={{ borderRadius: "5px" }}
          >
            Anterior
          </Button>

          <Pagination
            count={ totalPages }
            page={ paginationModel.page + 1 }
            onChange={ (_event, newPage) => {
              onPaginationModelChange({
                ...paginationModel,
                page: newPage - 1,
              });
            }}
            disabled={ loading }
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
            type="button"
            variant="outlined"
            size="small"
            endIcon={ <ArrowForwardRounded /> }
            disabled={ paginationModel.page >= totalPages - 1 || loading }
            onClick={ () => {
              onPaginationModelChange({
                ...paginationModel,
                page: paginationModel.page + 1,
              });
            }}
            sx={{ borderRadius: "5px" }}
          >
            Siguiente
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}


type DateTimeValueProps = {
  value: string | null;
};


function DateTimeValue({ value }: DateTimeValueProps) {
  if (!value) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Typography color="text.secondary">
          —
        </Typography>
      </Box>
    );
  }

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
      <Typography sx={{ fontSize: "0.84rem", fontWeight: 700 }}>
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


type AmountValueProps = {
  value: string;
};


function AmountValue({ value }: AmountValueProps) {
  return (
    <Typography
      sx={{
        width: "100%",
        textAlign: "right",
        fontSize: "0.86rem",
        fontWeight: 700,
      }}
    >
      { value }
    </Typography>
  );
}


function EmptyPurchases() {
  return (
    <Stack 
      sx={{
        height: "100%",
        minHeight: 160,
        alignItems: "center",
        justifyContent: "center",
        spacing: 0.6,
      }}
    >
      <PointOfSaleRounded sx={{ fontSize: 32, color: "text.disabled" }} />

      <Typography sx={{ fontSize: "0.86rem", fontWeight: 700 }}>
        No hay sesiones
      </Typography>

      <Typography color="text.secondary" sx={{ fontSize: "0.76rem" }}>
        No se encontraron sesiones para mostrar.
      </Typography>
    </Stack>
  );
}