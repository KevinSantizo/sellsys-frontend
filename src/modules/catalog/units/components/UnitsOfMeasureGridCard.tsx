import {
    ArrowBackRounded,
    ArrowForwardRounded,
    EditRounded,
} from "@mui/icons-material";

import {
    Box,
    Button,
    Chip,
    IconButton,
    MenuItem,
    Pagination,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";

import {
    DataGrid,
    type GridColDef,
    type GridPaginationModel,
} from "@mui/x-data-grid";

import { esES } from "@mui/x-data-grid/locales";

import type { UnitOfMeasure } from "../types/units";

type UnitsOfMeasureGridCardProps = {
    units: UnitOfMeasure[];
    totalUnits: number;
    loading: boolean;
    search: string;
    paginationModel: GridPaginationModel;
    onPaginationModelChange: (model: GridPaginationModel) => void;
    onEdit: (unit: UnitOfMeasure) => void;
};

export function UnitsOfMeasureGridCard({
    units,
    totalUnits,
    loading,
    search,
    paginationModel,
    onPaginationModelChange,
    onEdit,
}: UnitsOfMeasureGridCardProps) {
    const columns: GridColDef<UnitOfMeasure>[] = [
        {
            field: "name",
            headerName: "Nombre",
            flex: 1,
            minWidth: 180,
            sortable: false,
            renderCell: (params) => (
                <Typography
                    sx={{
                        fontSize: "0.84rem",
                        fontWeight: 700,
                    }}
                >
                    { params.row.name }
                </Typography>
            ),
        },
        {
            field: "symbol",
            headerName: "Símbolo",
            width: 120,
            sortable: false,
            renderCell: (params) => (
                <Typography
                    sx={{
                        fontSize: "0.84rem",
                        fontWeight: 600,
                    }}
                >
                    { params.row.symbol }
                </Typography>
            ),
        },
        {
            field: "unit_type_display",
            headerName: "Tipo",
            minWidth: 150,
            flex: 1,
            sortable: false,
            renderCell: (params) => (
                <Typography
                    sx={{
                        fontSize: "0.82rem",
                    }}
                >
                    { params.row.unit_type_display }
                </Typography>
            ),
        },
        {
            field: "allows_decimal",
            headerName: "Decimales",
            width: 130,
            sortable: false,
            renderCell: (params) => (
                <Chip
                    size="small"
                    label={ params.row.allows_decimal ? "Sí" : "No" }
                    sx={{
                        minWidth: 58,
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        bgcolor: params.row.allows_decimal
                            ? "primary.light"
                            : "action.disabledBackground",
                        color: params.row.allows_decimal
                            ? "primary.main"
                            : "text.secondary",
                    }}
                />
            ),
        },
        {
            field: "is_active",
            headerName: "Estado",
            width: 130,
            sortable: false,
            renderCell: (params) => (
                <Chip
                    size="small"
                    label={ params.row.is_active ? "Activa" : "Inactiva" }
                    sx={{ 
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        bgcolor: params.row.is_active
                            ? "success.main"
                            : "action.disabledBackground",
                        color: params.row.is_active
                            ? "#FFFFFF"
                            : "text.secondary",
                    }}
                />
            ),
        },
        {
            field: "actions",
            headerName: "",
            width: 80,
            sortable: false,
            filterable: false,
            align: "center",
            headerAlign: "center",
            renderCell: (params) => (
                <Tooltip title="Editar unidad de medida">
                    <IconButton
                        size="small"
                        onClick={() => onEdit(params.row)}
                        sx={{
                            color: "text.secondary",
                            "&:hover": {
                                color: "primary.main",
                                bgcolor: "primary.light",
                            },
                        }}
                    >
                        <EditRounded fontSize="small" />
                    </IconButton>
                </Tooltip>
            ),
        },
    ];

    const totalPages = Math.max(
        1,
        Math.ceil(totalUnits / paginationModel.pageSize),
    );

    const firstVisibleUnit =
        totalUnits === 0
            ? 0
            : paginationModel.page * paginationModel.pageSize + 1;

    const lastVisibleUnit =
        totalUnits === 0
            ? 0
            : Math.min(
                firstVisibleUnit + units.length - 1,
                totalUnits,
            );

    const noRowsMessage = search.trim()
        ? "No se encontraron unidades de medida con esa búsqueda."
        : "Todavía no hay unidades de medida registradas.";

    return (
        <Box
            sx={{
                border: "1px solid",
                borderColor: "#E2E7E5",
                borderRadius: "5px",
                bgcolor: "#FFFFFF",
                overflow: "hidden",
            }}
        >
            <DataGrid
                autoHeight
                rows={ units }
                columns={ columns }
                rowCount={ totalUnits }
                loading={ loading }
                pagination
                paginationMode="server"
                paginationModel={ paginationModel }
                onPaginationModelChange={ onPaginationModelChange }
                pageSizeOptions={[5, 10, 20, 50, 100]}
                checkboxSelection
                disableRowSelectionOnClick
                disableColumnSorting
                disableColumnFilter
                hideFooter
                getRowId={(row) => row.id}
                rowHeight={ 62 }
                columnHeaderHeight={ 46 }
                localeText={{
                    ...esES.components.MuiDataGrid.defaultProps.localeText,
                    noRowsLabel: noRowsMessage,
                    noResultsOverlayLabel: noRowsMessage,
                }}
                sx={{
                    border: 0,

                    "& .MuiDataGrid-columnHeaders": {
                        bgcolor: "#F7F8F6",
                        borderBottom: "1px solid",
                        borderColor: "divider",
                    },

                    "& .MuiDataGrid-columnHeaderTitle": {
                        fontSize: "0.78rem",
                        fontWeight: 700,
                    },

                    "& .MuiDataGrid-cell": {
                        display: "flex",
                        alignItems: "center",
                        borderColor: "divider",
                        fontSize: "0.82rem",
                    },

                    "& .MuiDataGrid-row:hover": {
                        bgcolor: "action.hover",
                    },

                    "& .MuiDataGrid-columnSeparator": {
                        display: "none",
                    },

                    "& .MuiCheckbox-root": {
                        p: 0.75,
                    },

                    "& .MuiDataGrid-overlay": {
                        minHeight: 180,
                        color: "text.secondary",
                        fontSize: "0.9rem",
                    },
                }}
            />

            <Box
                sx={{
                    px: 2,
                    py: 1.5,
                    display: "flex",
                    flexDirection: {
                        xs: "column",
                        md: "row",
                    },
                    alignItems: {
                        xs: "stretch",
                        md: "center",
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
                        alignItems: "center",
                        gap: 1.25,
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: 700,
                        }}
                    >
                        Resultado { firstVisibleUnit }-{ lastVisibleUnit } de { totalUnits }
                    </Typography>

                    <TextField
                        select
                        size="small"
                        value={ paginationModel.pageSize }
                        onChange={(event) => {
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
                            <MenuItem
                                key={ option }
                                value={ option }
                            >
                                { option }
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: {
                            xs: "space-between",
                            md: "flex-end",
                        },
                        gap: 0.75,
                    }}
                >
                    <Button
                        type="button"
                        variant="outlined"
                        size="small"
                        startIcon={ <ArrowBackRounded /> }
                        disabled={ paginationModel.page === 0 || loading }
                        onClick={() => {
                            onPaginationModelChange({
                                ...paginationModel,
                                page: paginationModel.page - 1,
                            });
                        }}
                        sx={{
                            borderRadius: "5px",
                        }}
                    >
                        Anterior
                    </Button>

                    <Pagination
                        count={ totalPages }
                        page={ paginationModel.page + 1 }
                        onChange={(_event, newPage) => {
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
                        onClick={() => {
                            onPaginationModelChange({
                                ...paginationModel,
                                page: paginationModel.page + 1,
                            });
                        }}
                        sx={{
                            borderRadius: "5px",
                        }}
                    >
                        Siguiente
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}