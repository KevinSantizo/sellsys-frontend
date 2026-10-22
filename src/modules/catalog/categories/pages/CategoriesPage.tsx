import {
  AddRounded,
  SearchRounded,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";

import type { GridPaginationModel } from "@mui/x-data-grid";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  useEffect,
  useState,
} from "react";

import { useCompanyStore } from "../../../companies/store/companyStore";

import {
    showErrorAlert,
    showSuccessAlert,
} from "../../../../shared/alerts/appAlerts";

import { getApiErrorMessage } from "../../../../shared/utils/getApiErrorMessage";
import { CategoriesGridCard } from "../components/CategoriesGridCard";
import { CategoryFormDialog } from "../components/CategoryFormDialog";

import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
} from "../services/categoryService";

import type {
  Category,
  CategoryDetail,
  CategoryFormValues,
} from "../types/category";

export function CategoriesPage() {
  const queryClient = useQueryClient();

  const selectedCompany = useCompanyStore((state) => state.selectedCompany);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [editingCategory, setEditingCategory] = useState<CategoryDetail | null>(null);

  const [formError, setFormError] = useState<string | null>(null);

  const [loadingCategoryDetail, setLoadingCategoryDetail] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search);

      setPaginationModel((current) => ({
        ...current,
        page: 0,
      }));
    }, 400);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [search]);

  useEffect(() => {
    setPaginationModel((current) => ({
      ...current,
      page: 0,
    }));
  }, [selectedCompany?.id]);

  const categoriesQuery = useQuery({
    queryKey: [
      "categories",
      selectedCompany?.id,
      debouncedSearch,
      paginationModel.page,
      paginationModel.pageSize,
    ],
    queryFn: () => getCategories({
      companyId: selectedCompany!.id,
      search: debouncedSearch || undefined,
      page: paginationModel.page + 1,
      pageSize: paginationModel.pageSize,
    }),
    enabled: Boolean(selectedCompany?.id),
    placeholderData: keepPreviousData,
  });

  const parentCategoriesQuery = useQuery({
    queryKey: [
      "categories",
      "parents",
      selectedCompany?.id,
    ],
    queryFn: () => getCategories({
      companyId: selectedCompany!.id,
      isActive: true,
      ordering: "name",
      page: 1,
      pageSize: 100,
    }),
    enabled: Boolean(selectedCompany?.id),
  });

  const categories = categoriesQuery.data?.results ?? [];
  const totalCategories = categoriesQuery.data?.count ?? 0;

  const parentCategories = parentCategoriesQuery.data?.results ?? [];
 

  const parentCategoriesError = parentCategoriesQuery.isError
    ? getApiErrorMessage(
        parentCategoriesQuery.error,
        "No fue posible cargar las categorías padre.",
    )
    : null;


  const createCategoryMutation = useMutation({
    mutationFn: (values: CategoryFormValues) => {
      if (!selectedCompany) {
        throw new Error("No hay empresa seleccionada.");
      }

      return createCategory({
        company_id: selectedCompany.id,
        name: values.name,
        description: values.description,
        parent_id: values.parent_id || null,
        is_active: values.is_active,
      });
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["categories"],
      });

      setIsDialogOpen(false);
      setEditingCategory(null);
      setFormError(null);

      await showSuccessAlert({
        title: "Categoría creada correctamente.",
      });
    },

    onError: (error) => {
      setFormError(
        getApiErrorMessage(
          error,
          "No fue posible crear la categoría.",
        ),
      );
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: CategoryFormValues;
    }) => {
      return updateCategory(id, {
        name: values.name,
        description: values.description,
        parent_id: values.parent_id || null,
        is_active: values.is_active,
      });
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["categories"],
      });

      setIsDialogOpen(false);
      setEditingCategory(null);
      setFormError(null);

      await showSuccessAlert({
        title: "Categoría actualizada correctamente.",
      });
    },
    onError: (error) => {
      setFormError(
        getApiErrorMessage(
          error,
          "No fue posible actualizar la categoría.",
        ),
      );
    },
  });

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setFormError(null);
    setIsDialogOpen(true);
  };

  const handleEditCategory = async (category: Category) => {
    setFormError(null);
    setLoadingCategoryDetail(true);

    try {
      const categoryDetail = await getCategory(category.id);

      setEditingCategory(categoryDetail);
      setIsDialogOpen(true);
    } catch (error) {
      await showErrorAlert({
        title: "No fue posible cargar la categoría",
        text: getApiErrorMessage(
          error,
          "No fue posible cargar la información de la categoría.",
        ),
      });
    } finally {
      setLoadingCategoryDetail(false);
    }
  };

  const handleCloseDialog = () => {
    if (
      createCategoryMutation.isPending ||
      updateCategoryMutation.isPending
    ) {
      return;
    }

    setIsDialogOpen(false);
    setEditingCategory(null);
    setFormError(null);
  };

  const handleSubmitCategory = (values: CategoryFormValues) => {
    setFormError(null);

    if (editingCategory) {
      updateCategoryMutation.mutate({
        id: editingCategory.id,
        values,
      });

      return;
    }

    createCategoryMutation.mutate(values);
  };

  const categoryInitialValues: CategoryFormValues | undefined =
    editingCategory
      ? {
          name: editingCategory.name,
          description: editingCategory.description,
          parent_id: editingCategory.parent?.id ?? "",
          is_active: editingCategory.is_active,
        }
      : undefined;

  const isSubmitting =
    createCategoryMutation.isPending ||
    updateCategoryMutation.isPending;

  return (
    <Box>
      <Box
        sx={{
          mb: 3,
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
          gap: 2,
        }}
      >
        <Box>
          <Typography 
            sx={{
                fontSize: {
                xs: "1.65rem",
                sm: "1.85rem",
                },
                fontWeight: 700,
                mb: 0.4,
            }}
          >
            Categorías
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 0.5,
              fontSize: "0.875rem",
            }}
          >
            Administra las categorías utilizadas para organizar tus productos.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={ <AddRounded /> }
          onClick={ handleCreateCategory }
          disabled={ !selectedCompany }
          sx={{
            borderRadius: "5px",
            width: {
              xs: "100%",
              md: "auto",
            },
            whiteSpace: "nowrap",
          }}
        >
          Nueva categoría
        </Button>
      </Box>

      <Box
        sx={{
          mb: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <TextField
          value={ search }
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar categoría..."
          size="small"
          sx={{
            width: {
              xs: "100%",
              sm: 380,
            },
            "& .MuiOutlinedInput-root": {
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
                    }}
                  />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      {categoriesQuery.isError && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            borderRadius: "5px",
          }}
        >
          {getApiErrorMessage(
            categoriesQuery.error,
            "No fue posible cargar las categorías.",
          )}
        </Alert>
      )}

      {!categoriesQuery.isError && (
        <CategoriesGridCard
          categories={ categories }
          totalCategories={ totalCategories }
          loading={
              categoriesQuery.isLoading ||
              categoriesQuery.isFetching ||
              loadingCategoryDetail
          }
          search={ search }
          paginationModel={ paginationModel }
          onPaginationModelChange={ setPaginationModel }
          onEdit={ handleEditCategory }
        />
      )}

      <CategoryFormDialog
        open={ isDialogOpen }
        title={ editingCategory ? "Editar categoría" : "Nueva categoría" }
        submitLabel={ editingCategory ? "Guardar cambios" : "Guardar" }
        categories={ parentCategories }
        initialValues={ categoryInitialValues }
        editingCategoryId={ editingCategory?.id }
        isSubmitting={ isSubmitting }
        error={ formError ?? parentCategoriesError }
        onClose={ handleCloseDialog }
        onSubmit={ handleSubmitCategory }
      />
    </Box>
  );
}