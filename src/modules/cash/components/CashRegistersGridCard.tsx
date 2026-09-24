import {
  EditRounded,
  LockOpenRounded,
  MoreVertRounded,
  RefreshRounded, 
  SearchRounded,
  PointOfSaleRounded,
  ArrowBackRounded,
  ArrowForwardRounded,
} from "@mui/icons-material";

import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Menu,
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

import { useMemo, useState } from "react";

import type { CashRegister, CashSession } from "../types/cash";
import { esES } from "@mui/x-data-grid/locales"; 

type CashRegistersGridCardProps = {
  cashRegisters: CashRegister[];
  totalCashRegisters: number;
  loading: boolean;
  search: string;
  paginationModel: GridPaginationModel;
  onSearchChange: (value: string) => void;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  onRefresh: () => void;
  onEdit: (cashRegister: CashRegister) => void;
  openCashSessions: CashSession[];
  onOpenSession: (cashRegister: CashRegister) => void;
};


export function CashRegistersGridCard({
  cashRegisters,
  openCashSessions,
  totalCashRegisters,
  loading,
  search,
  paginationModel,
  onSearchChange,
  onPaginationModelChange,
  onRefresh,
  onEdit,
  onOpenSession,
}: CashRegistersGridCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCashRegister, setSelectedCashRegister] = useState<CashRegister | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, cashRegister: CashRegister) => {
    setAnchorEl(event.currentTarget);
    setSelectedCashRegister(cashRegister);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedCashRegister(null);
  };

  const handleEdit = () => {
    if (!selectedCashRegister) return;

    const cashRegister = selectedCashRegister;

    handleCloseMenu();
    onEdit(cashRegister);
  };

  const handleOpenSession = () => {
    if (!selectedCashRegister) return;

    const cashRegister = selectedCashRegister;

    handleCloseMenu();
    onOpenSession(cashRegister);
  };

  const isCashRegisterOpen = (cashRegisterId: string) => {
    return openCashSessions.some((session) => session.cash_register_id === cashRegisterId);
  };


  const columns = useMemo<GridColDef<CashRegister>[]>(() => [
    {
      field: "name",
      headerName: "Caja",
      flex: 1,
      minWidth: 230,
      sortable: false,
      renderCell: (params) => (
        <Box
          sx={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
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
                fontSize: 20,
              }}
            />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: "0.875rem",
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              { params.row.name }
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 0.25,
                fontSize: "0.75rem",
              }}
            >
              { params.row.code }
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: "branch_name",
      headerName: "Sucursal",
      flex: 1,
      minWidth: 180,
      sortable: false,
    },
    {
      field: "is_active",
      headerName: "Estado",
      width: 130,
      sortable: false,
      renderCell: (params) => (
        <Chip
          label={ params.row.is_active ? "Activa" : "Inactiva" }
          size="small"
          color={ params.row.is_active ? "success" : "default" }
          sx={{ borderRadius: "14px", fontWeight: 700 }}
        />
      ),
    },
    {
      field: "session_status",
      headerName: "Sesión",
      width: 140,
      sortable: false,
      renderCell: (params) => {
        const isOpen = openCashSessions.some(
          (session) => session.cash_register_id === params.row.id
        );

        return (
          <Chip
            label={ isOpen ? "Abierta" : "Cerrada" }
            size="small"
            color={ isOpen ? "success" : "default" }
            sx={{ borderRadius: "14px", fontWeight: 700 }}
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "",
      width: 70,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      align: "center",
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={ (event) => handleOpenMenu(event, params.row) }
        >
          <MoreVertRounded fontSize="small" />
        </IconButton>
      ),
    },
  ], [openCashSessions]);

   const totalPages = Math.max(
        1,
        Math.ceil(
        totalCashRegisters /
            paginationModel.pageSize,
        ),
    );

   const firstVisibleCashRegister =
    totalCashRegisters === 0
      ? 0
      : paginationModel.page *
          paginationModel.pageSize +
        1;


  const lastVisibleCashRegister =
    totalCashRegisters === 0
      ? 0
      : Math.min(
          firstVisibleCashRegister +
            cashRegisters.length -
            1,
          totalCashRegisters,
        );

  const noRowsMessage =
    search.trim()
      ? "No se encontraron cajas con esa búsqueda."
      : "Todavía no hay cajas registradas.";

  return (
    <>
      <Paper
        elevation={ 0 }
        sx={{
          p: 2,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "15px",
          bgcolor: "#FFFFFF",
        }}
      >
        <Box
          sx={{
            mb: 2,
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
          }}
        >
          <TextField
            value={ search }
            onChange={ (event) => onSearchChange(event.target.value) }
            placeholder="Buscar por nombre o código"
            size="small"
            sx={{
              width: {
                xs: "100%",
                sm: 360,
              },
              "& .MuiOutlinedInput-root": {
                minHeight: 40,
                borderRadius: "5px",
                bgcolor: "#FFFFFF",
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded
                      sx={{
                        color: "text.secondary",
                        fontSize: 20,
                      }}
                    />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Tooltip title="Actualizar">
            <span>
              <IconButton
                onClick={ onRefresh }
                disabled={ loading }
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "15px",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <RefreshRounded fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        <DataGrid
            autoHeight 
            rows={ cashRegisters }
            columns={ columns }
            loading={ loading }
            rowCount={ totalCashRegisters }
            paginationMode="server"
            pagination
            paginationModel={ paginationModel }
            onPaginationModelChange={ onPaginationModelChange }
            pageSizeOptions={[
                5,
                10,
                20,
                50,
                100,
            ]}
            checkboxSelection
            disableRowSelectionOnClick
            disableColumnSorting
            disableColumnFilter
            hideFooter
            getRowId={(row) => row.id}

            rowHeight={62}

            columnHeaderHeight={46}
            localeText={{
                ...esES.components
                    .MuiDataGrid
                    .defaultProps
                    .localeText,
        
                noRowsLabel:
                    noRowsMessage,
        
                noResultsOverlayLabel:
                    noRowsMessage,
                }}

            slots={{
              noRowsOverlay: EmptyPurchases,
            }}
            sx={{
                border: 0,

                "& .MuiDataGrid-columnHeaders":
                    {
                    bgcolor:
                        "#F7F8F6",

                    borderBottom:
                        "1px solid",

                    borderColor:
                        "divider",
                    },

                "& .MuiDataGrid-columnHeaderTitle":
                    {
                    fontSize:
                        "0.78rem",

                    fontWeight: 700,
                    },

                "& .MuiDataGrid-cell":
                    {
                    display: "flex",

                    alignItems:
                        "center",

                    borderColor:
                        "divider",

                    fontSize:
                        "0.82rem",
                    },

                "& .MuiDataGrid-row:hover":
                    {
                    bgcolor:
                        "action.hover",
                    },

                "& .MuiDataGrid-columnSeparator":
                    {
                    display: "none",
                    },

                "& .MuiCheckbox-root":
                    {
                    p: 0.75,
                    },

                "& .MuiDataGrid-overlay":
                    {
                    minHeight: 180,

                    color:
                        "text.secondary",

                    fontSize:
                        "0.9rem",
                    },
                }}
            />

            {/* PAGINACIÓN */}
            <Stack
                direction={{
                    xs: "column",
                    md: "row",
                }}
                spacing={1.5}
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
                    spacing={1.25}
                    sx={{
                        alignItems: "center",
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                        fontWeight: 700,
                        }}
                    >
                        Resultado{" "}
                        {firstVisibleCashRegister}-
                        {lastVisibleCashRegister} de{" "}
                        {totalCashRegisters}
                    </Typography>

                    <TextField
                        select
                        size="small"

                        value={
                        paginationModel.pageSize
                        }

                        onChange={(event) => {
                        onPaginationModelChange(
                            {
                            page: 0,

                            pageSize:
                                Number(
                                event.target
                                    .value,
                                ),
                            },
                        );
                        }}

                        sx={{
                        width: 76,

                        "& .MuiOutlinedInput-root":
                            {
                            height: 34,

                            borderRadius:
                                "5px",
                            },
                        }}
                    >
                        {[
                        5,
                        10,
                        20,
                        50,
                        100,
                        ].map(
                        (option) => (
                            <MenuItem
                            key={option}
                            value={option}
                            >
                            {option}
                            </MenuItem>
                        ),
                        )}
                    </TextField>
                </Stack>


                <Stack
                    direction="row"
                    spacing={0.75}
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

                        startIcon={
                        <ArrowBackRounded />
                        }

                        disabled={
                        paginationModel.page ===
                            0 ||
                        loading
                        }

                        onClick={() => {
                        onPaginationModelChange(
                            {
                            ...paginationModel,

                            page:
                                paginationModel.page -
                                1,
                            },
                        );
                        }}

                        sx={{
                        borderRadius:
                            "5px",
                        }}
                    >
                        Anterior
                    </Button>


                    <Pagination
                        count={totalPages}
                        page={ paginationModel.page + 1 }
                        onChange={(
                        _event,
                        newPage,
                        ) => {
                        onPaginationModelChange(
                            {
                            ...paginationModel,

                            page:
                                newPage -
                                1,
                            },
                        );
                        }}
                        disabled={loading}
                        shape="rounded"
                        size="small"
                        siblingCount={1}
                        boundaryCount={1}
                        hidePrevButton
                        hideNextButton
                        sx={{
                        display: {
                            xs: "none",
                            sm: "block",
                        },

                        "& .MuiPaginationItem-root":
                            {
                            border:
                                "1px solid",

                            borderColor:
                                "divider",

                            borderRadius:
                                "5px",
                            },

                        "& .Mui-selected":
                            {
                            color:
                                "primary.main",

                            bgcolor:
                                "transparent !important",

                            borderColor:
                                "primary.main",
                            },
                        }}
                    />


                    <Button
                    type="button"
                    variant="outlined"
                    size="small"

                    endIcon={
                    <ArrowForwardRounded />
                    }

                    disabled={
                    paginationModel.page >=
                        totalPages - 1 ||
                    loading
                    }

                    onClick={() => {
                    onPaginationModelChange(
                        {
                        ...paginationModel,

                        page:
                            paginationModel.page +
                            1,
                        },
                    );
                    }}

                    sx={{
                    borderRadius:
                        "5px",
                    }}
                >
                    Siguiente
                    </Button>
                </Stack>
            </Stack>
        </Paper>

      <Menu
        anchorEl={ anchorEl }
        open={ Boolean(anchorEl) }
        onClose={ handleCloseMenu }
      >

        {selectedCashRegister && !isCashRegisterOpen(selectedCashRegister.id) && selectedCashRegister.is_active && (
          <MenuItem onClick={ handleOpenSession }>
            <LockOpenRounded
              sx={{
                mr: 1.5,
                fontSize: 19,
                color: "text.secondary",
              }}
            />

            Abrir caja
          </MenuItem>
        )}
        <MenuItem onClick={ handleEdit }>
          <EditRounded
            sx={{
              mr: 1.5,
              fontSize: 19,
              color: "text.secondary",
            }}
          />

          Editar
        </MenuItem>
      </Menu>
    </>
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
        No hay cajas
      </Typography>

      <Typography color="text.secondary" sx={{ fontSize: "0.76rem" }}>
        No se encontraron cajas para mostrar.
      </Typography>
    </Stack>
  );
}