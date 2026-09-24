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

import { esES } from "@mui/x-data-grid/locales";

import type { Category } from "../types/category";

type CategoriesGridCardProps = {
  categories: Category[];
  totalCategories: number;
  loading: boolean;
  search: string;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  onEdit: (category: Category) => void;
};

export function CategoriesGridCard({
  categories,
  totalCategories,
  loading,
  search,
  paginationModel,
  onPaginationModelChange,
  onEdit,
}: CategoriesGridCardProps) {
  const columns: GridColDef<Category>[] = [
    {
      field: "name",
      headerName: "Nombre",
      flex: 1,
      minWidth: 220,
      sortable: false,
      renderCell: (params) => (
        <Typography sx={{ fontSize: "0.84rem", fontWeight: 700 }}>
          { params.row.name }
        </Typography>
      ),
    },
    {
      field: "parent_name",
      headerName: "Categoría padre",
      flex: 1,
      minWidth: 200,
      sortable: false,
      renderCell: (params) => (
        <Typography color="text.secondary" sx={{ fontSize: "0.82rem" }}>
          { params.row.parent_name || "—" }
        </Typography>
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
            borderRadius: "14px",
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
        <Tooltip title="Editar categoría">
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
    Math.ceil(totalCategories / paginationModel.pageSize),
  );

  const firstVisibleCategory =
    totalCategories === 0
      ? 0
      : paginationModel.page * paginationModel.pageSize + 1;

  const lastVisibleCategory =
    totalCategories === 0
      ? 0
      : Math.min(
          firstVisibleCategory + categories.length - 1,
          totalCategories,
        );

  const noRowsMessage = search.trim()
    ? "No se encontraron categorías con esa búsqueda."
    : "Todavía no hay categorías registradas.";

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
        rows={ categories }
        columns={ columns }
        rowCount={ totalCategories }
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

      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
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
            { firstVisibleCategory }-{ lastVisibleCategory } de{" "}
            { totalCategories }
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
            disabled={
              paginationModel.page >= totalPages - 1 ||
              loading
            }
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
        </Stack>
      </Stack>
    </Box>
  );
}