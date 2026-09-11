import {
  ArrowBackRounded,
  ArrowDownwardRounded,
  ArrowForwardRounded,
  ArrowUpwardRounded,
  FilterAltOffRounded,
  SearchRounded,
} from "@mui/icons-material";

import {
  Box,
  Button,
  Chip,
  InputAdornment,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
} from "@mui/x-data-grid";

import { useMemo } from "react";

import type {
  CashMovement,
  CashMovementDirection,
  CashMovementType,
  CashRegister,
} from "../types/cash";


type CashMovementsGridCardProps = {
  cashMovements: CashMovement[];
  cashRegisters: CashRegister[];
  totalCashMovements: number;
  loading: boolean;
  search: string;
  movementType: CashMovementType | "";
  direction: CashMovementDirection | "";
  cashRegisterId: string;
  paginationModel: GridPaginationModel;
  formatCurrency: (value: string | number) => string;
  onSearchChange: (value: string) => void;
  onMovementTypeChange: (value: CashMovementType | "") => void;
  onDirectionChange: (value: CashMovementDirection | "") => void;
  onCashRegisterChange: (value: string) => void;
  onClearFilters: () => void;
  onPaginationModelChange: (model: GridPaginationModel) => void;
};


export function CashMovementsGridCard({
  cashMovements,
  cashRegisters,
  totalCashMovements,
  loading,
  search,
  movementType,
  direction,
  cashRegisterId,
  paginationModel,
  formatCurrency,
  onSearchChange,
  onMovementTypeChange,
  onDirectionChange,
  onCashRegisterChange,
  onClearFilters,
  onPaginationModelChange,
}: CashMovementsGridCardProps) {
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

  const columns = useMemo<GridColDef<CashMovement>[]>(() => [
    {
      field: "date",
      headerName: "Fecha",
      width: 115,
      sortable: false,
      valueGetter: (_value, row) => {
        return new Date(row.created_at).toLocaleDateString("es-GT");
      },
    },
    {
      field: "time",
      headerName: "Hora",
      width: 100,
      sortable: false,
      valueGetter: (_value, row) => {
        return new Date(row.created_at).toLocaleTimeString("es-GT", {
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
    {
      field: "cash_register_name",
      headerName: "Caja",
      minWidth: 160,
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Typography sx={{ fontSize: "0.86rem", fontWeight: 700 }}>
            { params.row.cash_register_name }
          </Typography>

          <Typography color="text.secondary" sx={{ fontSize: "0.72rem" }}>
            { params.row.cash_register_code }
          </Typography>
        </Box>
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
      minWidth: 160,
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
      minWidth: 220,
      flex: 1.5,
      sortable: false,
      renderCell: (params) => (
        <Typography
          color="text.secondary"
          noWrap
          title={ params.row.notes || "" }
          sx={{ fontSize: "0.82rem" }}
        >
          { params.row.notes || "—" }
        </Typography>
      ),
    },
    {
      field: "amount",
      headerName: "Monto",
      width: 155,
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
              fontWeight: 800,
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
      <Box sx={{ px: 2, pt: 2 }}>
        <Typography
          sx={{
            fontSize: "1rem",
            fontWeight: 800,
            mb: 1.5,
          }}
        >
          Historial general de movimientos de la sucursal
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "minmax(220px, 1.5fr) repeat(3, minmax(160px, 1fr)) auto",
            },
            gap: 1.25,
            mb: 2,
          }}
        >
          <TextField
            value={ search }
            onChange={ (event) => onSearchChange(event.target.value) }
            placeholder="Buscar por referencia o notas"
            size="small"
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "5px",
              },
            }}
          />

          <TextField
            select
            label="Tipo"
            size="small"
            value={ movementType }
            onChange={ (event) => {
              onMovementTypeChange(event.target.value as CashMovementType | "");
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "5px",
              },
            }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="SALE">Venta</MenuItem>
            <MenuItem value="EXPENSE">Gasto</MenuItem>
            <MenuItem value="PURCHASE">Compra</MenuItem>
            <MenuItem value="MANUAL_IN">Entrada manual</MenuItem>
            <MenuItem value="MANUAL_OUT">Salida manual</MenuItem>
            <MenuItem value="REVERSAL">Reversión</MenuItem>
          </TextField>

          <TextField
            select
            label="Dirección"
            size="small"
            value={ direction }
            onChange={ (event) => {
              onDirectionChange(event.target.value as CashMovementDirection | "");
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "5px",
              },
            }}
          >
            <MenuItem value="">Todas</MenuItem>
            <MenuItem value="IN">Entrada</MenuItem>
            <MenuItem value="OUT">Salida</MenuItem>
          </TextField>

          <TextField
            select
            label="Caja"
            size="small"
            value={ cashRegisterId }
            onChange={ (event) => onCashRegisterChange(event.target.value) }
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "5px",
              },
            }}
          >
            <MenuItem value="">Todas las cajas</MenuItem>

            {cashRegisters.map((cashRegister) => (
              <MenuItem key={ cashRegister.id } value={ cashRegister.id }>
                { cashRegister.name }
              </MenuItem>
            ))}
          </TextField>

          <Button
            variant="outlined"
            startIcon={ <FilterAltOffRounded /> }
            onClick={ onClearFilters }
            sx={{
              minWidth: 145,
              borderRadius: "5px",
              whiteSpace: "nowrap",
            }}
          >
            Limpiar filtros
          </Button>
        </Box>
      </Box>

      <DataGrid
        rows={ cashMovements }
        columns={ columns }
        loading={ loading }
        rowCount={ totalCashMovements }
        paginationMode="server"
        paginationModel={ paginationModel }
        onPaginationModelChange={ onPaginationModelChange }
        pageSizeOptions={ [5, 10, 20, 50, 100] }
        hideFooter
        disableRowSelectionOnClick
        autoHeight
        sx={{
          border: 0,
          borderTop: "1px solid",
          borderColor: "divider",
          "& .MuiDataGrid-columnHeaders": {
            bgcolor: "#F8F9FA",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: 800,
            fontSize: "0.8rem",
          },
          "& .MuiDataGrid-cell": {
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
        <Stack direction="row" spacing={ 1.25 } sx={{ alignItems: "center" }}>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            Resultado { firstVisible }-{ lastVisible } de { totalCashMovements }
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