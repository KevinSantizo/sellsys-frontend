import {
  AddRounded,
  SearchRounded,
} from "@mui/icons-material";

import {
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

import axios from "axios";

import {
  useEffect,
  useState,
} from "react";

import { useCompanyStore } from "../../../companies/store/companyStore";

import { showSuccessAlert } from "../../../../shared/alerts/appAlerts";

import { BrandFormDialog } from "../components/BrandFormDialog";
import { BrandsGridCard } from "../components/BrandsGridCard";

import {
  createBrand,
  getBrand,
  getBrands,
  updateBrand,
} from "../services/brandService";

import type {
  Brand,
  BrandDetail,
  BrandFormValues,
} from "../types/brand";

export function BrandsPage() {
  const queryClient = useQueryClient();

  const selectedCompany = useCompanyStore(
    (state) => state.selectedCompany,
  );

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [editingBrand, setEditingBrand] = useState<BrandDetail | null>(null);

  const [formError, setFormError] = useState<string | null>(null);

  const [loadingBrandDetail, setLoadingBrandDetail] = useState(false);

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

  const brandsQuery = useQuery({
    queryKey: [
      "brands",
      selectedCompany?.id,
      debouncedSearch,
      paginationModel.page,
      paginationModel.pageSize,
    ],
    queryFn: () => getBrands({
      companyId: selectedCompany!.id,
      search: debouncedSearch || undefined,
      page: paginationModel.page + 1,
      pageSize: paginationModel.pageSize,
    }),
    enabled: Boolean(selectedCompany?.id),
    placeholderData: keepPreviousData,
  });

  const brands = brandsQuery.data?.results ?? [];
  const totalBrands = brandsQuery.data?.count ?? 0;

  const getApiErrorMessage = (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return "Ocurrió un error inesperado.";
    }

    const data = error.response?.data;

    if (typeof data?.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data?.name)) {
      return data.name[0];
    }

    if (typeof data === "object" && data !== null) {
      const firstValue = Object.values(data)[0];

      if (Array.isArray(firstValue) && firstValue.length > 0) {
        return String(firstValue[0]);
      }

      if (typeof firstValue === "string") {
        return firstValue;
      }
    }

    return "No fue posible guardar la marca.";
  };

  const createBrandMutation = useMutation({
    mutationFn: (values: BrandFormValues) => {
      if (!selectedCompany) {
        throw new Error("No hay empresa seleccionada.");
      }

      return createBrand({
        company_id: selectedCompany.id,
        name: values.name,
        description: values.description,
        is_active: values.is_active,
      });
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["brands"],
      });

      setIsDialogOpen(false);
      setEditingBrand(null);
      setFormError(null);

      await showSuccessAlert({
        title: "Marca creada correctamente.",
      });
    },

    onError: (error) => {
      setFormError(getApiErrorMessage(error));
    },
  });

  const updateBrandMutation = useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: BrandFormValues;
    }) => {
      return updateBrand(id, {
        name: values.name,
        description: values.description,
        is_active: values.is_active,
      });
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["brands"],
      });

      setIsDialogOpen(false);
      setEditingBrand(null);
      setFormError(null);

      await showSuccessAlert({
        title: "Marca actualizada correctamente.",
      });
    },

    onError: (error) => {
      setFormError(getApiErrorMessage(error));
    },
  });

  const handleCreateBrand = () => {
    setEditingBrand(null);
    setFormError(null);
    setIsDialogOpen(true);
  };

  const handleEditBrand = async (brand: Brand) => {
    setFormError(null);
    setLoadingBrandDetail(true);

    try {
      const brandDetail = await getBrand(brand.id);

      setEditingBrand(brandDetail);
      setIsDialogOpen(true);
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    } finally {
      setLoadingBrandDetail(false);
    }
  };

  const handleCloseDialog = () => {
    if (
      createBrandMutation.isPending ||
      updateBrandMutation.isPending
    ) {
      return;
    }

    setIsDialogOpen(false);
    setEditingBrand(null);
    setFormError(null);
  };

  const handleSubmitBrand = (values: BrandFormValues) => {
    setFormError(null);

    if (editingBrand) {
      updateBrandMutation.mutate({
        id: editingBrand.id,
        values,
      });

      return;
    }

    createBrandMutation.mutate(values);
  };

  const brandInitialValues: BrandFormValues | undefined =
    editingBrand
      ? {
          name: editingBrand.name,
          description: editingBrand.description,
          is_active: editingBrand.is_active,
        }
      : undefined;

  const isSubmitting =
    createBrandMutation.isPending ||
    updateBrandMutation.isPending;

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
            Marcas
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              fontSize: "0.875rem",
            }}
          >
            Administra las marcas disponibles para tus productos.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={ <AddRounded /> }
          onClick={ handleCreateBrand }
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
          Nueva marca
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
          onChange={(event) => {
            setSearch(event.target.value);
          }}
          placeholder="Buscar marca..."
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

      <BrandsGridCard
        brands={ brands }
        totalBrands={ totalBrands }
        loading={
          brandsQuery.isLoading ||
          brandsQuery.isFetching ||
          loadingBrandDetail
        }
        search={ search }
        paginationModel={ paginationModel }
        onPaginationModelChange={ setPaginationModel }
        onEdit={ handleEditBrand }
      />

      <BrandFormDialog
        open={ isDialogOpen }
        title={ editingBrand ? "Editar marca" : "Nueva marca" }
        submitLabel={ editingBrand ? "Guardar cambios" : "Guardar" }
        initialValues={ brandInitialValues }
        isSubmitting={ isSubmitting }
        error={ formError }
        onClose={ handleCloseDialog }
        onSubmit={ handleSubmitBrand }
      />
    </Box>
  );
}