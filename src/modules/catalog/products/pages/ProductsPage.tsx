import {
  AddRounded,
  FileDownloadOutlined,
  FileUploadOutlined,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import {
 
  type GridPaginationModel,
} from "@mui/x-data-grid";

 

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import axios from "axios";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Navigate } from "react-router-dom";

import { showSuccessAlert, showDeleteProductConfirmation, showErrorAlert,} from "../../../../shared/alerts/appAlerts";

import { useCompanyStore } from "../../../companies/store/companyStore";

import { ProductFormDialog } from "../components/ProductFormDialog";

import {
  getBrandOptions,
  getCategoryOptions,
  getUnitOptions,
} from "../services/catalogReferenceService";

import {
  createProduct,
  getProductDetail,
  getProducts,
  updateProduct,
  deleteProduct,
} from "../services/productService";

import type {
  Product,
  ProductDetail,
  ProductFormValues,
  ProductStatusFilter,
  ProductTypeFilter,
} from "../types/product";

import { ProductsGridCard } from "../components/ProductsGridCard";

import {
  useBranchStore,
} from "../../../branches/store/branchStore";

type SaveProductVariables = {
  productId: string | null;
  values: ProductFormValues;
};

export function ProductsPage() {
  const queryClient = useQueryClient();
  const selectedCompany = useCompanyStore( (state) => state.selectedCompany, );
  const [search, setSearch] = useState("");
  const [ statusFilter,  setStatusFilter, ] = useState<ProductStatusFilter>("ALL"); 
  const [ categoryFilter,  setCategoryFilter, ] = useState("ALL");
  const [ brandFilter, setBrandFilter, ] = useState("ALL");
  const [ productTypeFilter, setProductTypeFilter,] = useState<ProductTypeFilter>( "ALL",);

  const selectedBranch =  useBranchStore( (state) => state.selectedBranch,);

  useEffect(() => {
    setPaginationModel((current) => ({
      ...current,
      page: 0,
    }));
  }, [
    selectedCompany?.id,
    statusFilter,
    categoryFilter,
    brandFilter,
    productTypeFilter,
  ]);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [
    paginationModel,
    setPaginationModel,
  ] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const [
    isProductDialogOpen,
    setIsProductDialogOpen,
  ] = useState(false);

  const [
    editingProductId,
    setEditingProductId,
  ] = useState<string | null>(null);

  const [formError, setFormError] =
    useState<string | null>(null);

  const isEditing = editingProductId !== null;


  /*
   * Aplica la búsqueda después de 400 ms.
   * Al cambiar la búsqueda, regresa a la primera página.
   */
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim());

      setPaginationModel((current) => ({
        ...current,
        page: 0,
      }));
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [search]);

  /*
   * Al cambiar de empresa, regresa a la primera página.
   */
  useEffect(() => {
    setPaginationModel((current) => ({
      ...current,
      page: 0,
    }));
  }, [selectedCompany?.id]);

  useEffect(() => {
    setPaginationModel(
      (current) => ({
        ...current,
        page: 0,
      }),
    );
  }, [selectedBranch?.id]);

  /*
   * Listado paginado de productos.
   */
  const {
    data: productsResponse,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      "products",
      selectedCompany?.id,
      selectedBranch?.id,
      debouncedSearch,
      statusFilter,
      categoryFilter,
      brandFilter,
      productTypeFilter,
      paginationModel.page,
      paginationModel.pageSize,
    ],

    queryFn: () => {
      if (!selectedCompany) {
        throw new Error(
          "No existe una empresa seleccionada.",
        );
      }

      return getProducts({
        companyId: selectedCompany.id,
        branchId: selectedBranch!.id,
        search: debouncedSearch,
        page: paginationModel.page + 1,
        pageSize: paginationModel.pageSize,
        isActive: statusFilter === "ALL"
          ? undefined
          : statusFilter === "ACTIVE",
        categoryId: categoryFilter === "ALL"
          ? undefined
          : categoryFilter,

        brandId: brandFilter === "ALL"
          ? undefined
          : brandFilter,

          productType: productTypeFilter === "ALL"
            ? undefined
            : productTypeFilter,
      });
    },

    enabled:
      Boolean(selectedCompany?.id) &&
      Boolean(selectedBranch?.id),

    /*
     * Mantiene los registros anteriores mientras
     * se solicita una nueva página.
     */
    placeholderData: keepPreviousData,
  });

  const products =
    productsResponse?.results ?? [];

  const totalProducts =
    productsResponse?.count ?? 0;

  /*
   * Opciones del formulario.
   */
  const categoriesQuery = useQuery({
    queryKey: [
      "catalog-categories",
      selectedCompany?.id,
    ],

    queryFn: () =>
      getCategoryOptions(
        selectedCompany!.id,
      ),

    enabled: Boolean( selectedCompany?.id, ),
  });

  const brandsQuery = useQuery({
    queryKey: [
      "catalog-brands",
      selectedCompany?.id,
    ], 
    queryFn: () => getBrandOptions( selectedCompany!.id, ), 
    enabled: Boolean(selectedCompany?.id),
  });

  const unitsQuery = useQuery({
    queryKey: [
      "catalog-units",
      selectedCompany?.id,
    ],

    queryFn: () =>
      getUnitOptions(
        selectedCompany!.id,
      ),

    enabled:
      Boolean(selectedCompany?.id) &&
      isProductDialogOpen,
  });

  /*
   * Detalle del producto que se está editando.
   */
  const productDetailQuery = useQuery({
    queryKey: [
      "product-detail",
      editingProductId,
    ],

    queryFn: () =>
      getProductDetail(
        editingProductId!,
      ),

    enabled:
      isProductDialogOpen &&
      Boolean(editingProductId),
  });

  /*
   * Convierte el detalle del backend en los valores
   * que necesita ProductFormDialog.
   */
  const productInitialValues =
    useMemo<ProductFormValues | undefined>(
      () => {
        const product =
          productDetailQuery.data;

        if (!product) {
          return undefined;
        }

        return {
          name: product.name ?? "",
          description:
            product.description ?? "",
          sku: product.sku ?? "",
          barcode: product.barcode ?? "",
          product_type:
            product.product_type,

          category_id:
            product.category?.id ??
            product.category_id ??
            "",

          brand_id:
            product.brand?.id ??
            product.brand_id ??
            "",

          base_unit_id:
            product.base_unit?.id ??
            product.base_unit_id ??
            "",

          cost_price:
            product.cost_price ?? "",

          sale_price:
            product.sale_price ?? "",

          track_inventory:
            product.track_inventory,

          is_active:
            product.is_active,
        };
      },
      [productDetailQuery.data],
    );

  /*
   * Una sola mutación crea o actualiza productos.
   */
  const saveProductMutation = useMutation<
    ProductDetail,
    Error,
    SaveProductVariables
  >({
    mutationFn: ({
      productId,
      values,
    }) => {
      if (!selectedCompany) {
        throw new Error(
          "No existe una empresa seleccionada.",
        );
      }

      const payload = {
        name: values.name.trim(),
        description:
          values.description.trim(),
        sku: values.sku.trim(),
        barcode:
          values.barcode.trim() || null,
        product_type:
          values.product_type,
        category_id:
          values.category_id || null,
        brand_id:
          values.brand_id || null,
        base_unit_id:
          values.base_unit_id,
        cost_price:
          values.cost_price || "0.00",
        sale_price:
          values.sale_price,

        track_inventory:
          values.product_type === "SERVICE"
            ? false
            : values.track_inventory,

        is_active:
          values.is_active,
      };

      if (productId) {
        return updateProduct(
          productId,
          payload,
        );
      }

      return createProduct({
        company_id:
          selectedCompany.id,

        ...payload,
      });
    },

    onSuccess: async (
      savedProduct,
      variables,
    ) => {
      const wasEditing =
        variables.productId !== null;

        
      setFormError(null);
      setIsProductDialogOpen(false);
      setEditingProductId(null);
      
      if (!wasEditing) {
        setPaginationModel(
          (current) => ({
            ...current,
            page: 0,
          }),
        );
      }


      await queryClient.invalidateQueries({
        queryKey: [
          "products",
          selectedCompany?.id,
        ],
      });

      if (variables.productId) {
        queryClient.removeQueries({
          queryKey: [
            "product-detail",
            variables.productId,
          ],
        });
      }

      void showSuccessAlert({
        title: wasEditing
          ? "Producto actualizado correctamente"
          : "Producto guardado correctamente",

        text: wasEditing
          ? `Los cambios de "${savedProduct.name}" se guardaron correctamente.`
          : `"${savedProduct.name}" ya está disponible en el catálogo.`,
      });
    },

    onError: (
      error,
      variables,
    ) => {
      const fallbackMessage =
        variables.productId
          ? "No fue posible actualizar el producto."
          : "No fue posible crear el producto.";

      setFormError(
        getApiErrorMessage(
          error,
          fallbackMessage,
        ),
      );
    },
  });

  const deleteProductMutation = useMutation<
  void,
  Error,
  Product
>({
  mutationFn: (product) =>
    deleteProduct(product.id),

  onSuccess: async (
    _data,
    deletedProduct,
  ) => {
    const shouldGoToPreviousPage =
      products.length === 1 &&
      paginationModel.page > 0;

    if (shouldGoToPreviousPage) {
      setPaginationModel(
        (current) => ({
          ...current,
          page: current.page - 1,
        }),
      );
    }

    await queryClient.invalidateQueries({
      queryKey: [
        "products",
        selectedCompany?.id,
      ],
    });

    void showSuccessAlert({
      title: "Producto eliminado",
      text: `"${deletedProduct.name}" fue eliminado correctamente.`,
    });
  },

  onError: (error) => {
    void showErrorAlert({
      title: "No fue posible eliminar",
      text: getApiErrorMessage(
        error,
        "El producto podría tener ventas, inventario o movimientos relacionados. Puedes desactivarlo para conservar su historial.",
      ),
    });
  },
});


  const currencyFormatter =
    useMemo(() => {
      return new Intl.NumberFormat(
        "es-GT",
        {
          style: "currency",
          currency:
            selectedCompany?.currency ??
            "GTQ",
          minimumFractionDigits: 2,
        },
      );
    }, [selectedCompany?.currency]);

  const formatCurrency = useCallback(
    (value: string) => {
      const numberValue = Number(value);

      if (Number.isNaN(numberValue)) {
        return value;
      }

      return currencyFormatter.format(
        numberValue,
      );
    },
    [currencyFormatter],
  );

  const handleOpenCreate = () => {
    setEditingProductId(null);
    setFormError(null);
    setIsProductDialogOpen(true);
  };


  const hasActiveFilters =
    Boolean(search.trim()) ||
    statusFilter !== "ALL" ||
    categoryFilter !== "ALL" ||
    brandFilter !== "ALL" ||
    productTypeFilter !== "ALL";

  const handleClearFilters = () => {
    setSearch("");
    setDebouncedSearch("");

    setStatusFilter("ALL");
    setCategoryFilter("ALL");
    setBrandFilter("ALL");
    setProductTypeFilter("ALL");

    setPaginationModel((current) => ({
      ...current,
      page: 0,
    }));
  };

  const handleEditProduct = useCallback(
    (product: Product) => {
      setFormError(null);
      setEditingProductId(product.id);
      setIsProductDialogOpen(true);
    },
    [],
  );

  const handleDeleteProduct = async (
    product: Product,
  ) => {
    const confirmed =
      await showDeleteProductConfirmation({
        productName: product.name,
      });

    if (!confirmed) {
      return;
    }

    deleteProductMutation.mutate(product);
  };

  const handleCloseDialog = () => {
    if (saveProductMutation.isPending) {
      return;
    }

    setIsProductDialogOpen(false);
    setEditingProductId(null);
    setFormError(null);
  };
 

  if (!selectedCompany) {
    return (
      <Navigate
        to="/companies"
        replace
      />
    );
  }

  const productDetailError =
    isEditing &&
    productDetailQuery.isError
      ? "No fue posible cargar la información del producto."
      : null;

  const isLoadingFormOptions =
    categoriesQuery.isLoading ||
    brandsQuery.isLoading ||
    unitsQuery.isLoading;

 

  return (
    <Stack spacing={2.5}>
      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        spacing={1.5}
        sx={{
          alignItems: {
            xs: "stretch",
            md: "center",
          },
          justifyContent:
            "space-between",
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontSize: {
                xs: "1.65rem",
                sm: "1.85rem",
              },
              fontWeight: 800,
              mb: 0.4,
          }}
          >
            Lista de productos
          </Typography>

          <Typography
            sx={{
              color: "text.secondary",
              fontSize: "0.9rem",
            }}
          >
            Administra el catálogo de{" "}
            {selectedCompany.name}.
          </Typography>
        </Box>

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={1}
        >
          <Button
            type="button"
            variant="outlined"
            disabled
            startIcon={
              <FileUploadOutlined />
            }
            sx={{
              borderRadius: "5px",
              bgcolor: "#FFFFFF",
            }}
          >
            Importar
          </Button>

          <Button
            type="button"
            variant="outlined"
            disabled
            startIcon={
              <FileDownloadOutlined />
            }
            sx={{
              borderRadius: "5px",
              bgcolor: "#FFFFFF",
            }}
          >
            Exportar
          </Button>

          <Button
            type="button"
            variant="contained"
            startIcon={<AddRounded />}
            onClick={handleOpenCreate}
            sx={{
              borderRadius: "5px",
            }}
          >
            Nuevo producto
          </Button>
        </Stack>
      </Stack>
 
      {isError && (
        <Alert severity="error">
          No fue posible cargar los
          productos.
        </Alert>
      )}

      {!isError && (
        <Paper
          variant="outlined"
          sx={{
            width: "100%",
            bgcolor: "#FFFFFF",
            borderRadius: "15px",
            borderColor: "divider",
            overflow: "hidden",
          }}
        >
          <ProductsGridCard
            products={products}
            totalProducts={totalProducts}
            loading={ isLoading || isFetching || deleteProductMutation.isPending}
            search={search}
            statusFilter={statusFilter}
            categoryFilter={categoryFilter}
            brandFilter={brandFilter}
            productTypeFilter={ productTypeFilter }
            categories={ categoriesQuery.data ?? [] }
            brands={ brandsQuery.data ?? [] }
            paginationModel={ paginationModel }
            hasActiveFilters={ hasActiveFilters }
            onSearchChange={setSearch}
            onStatusFilterChange={ setStatusFilter }
            onCategoryFilterChange={ setCategoryFilter }
            onBrandFilterChange={ setBrandFilter }
            onProductTypeFilterChange={ setProductTypeFilter }
            onPaginationModelChange={ setPaginationModel }
            onClearFilters={ handleClearFilters }
            onRefresh={() => {
              void refetch();
            }}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            formatCurrency={formatCurrency}
          />
        </Paper>
      )}

      <ProductFormDialog
        open={isProductDialogOpen}
        title={
          isEditing
            ? "Editar producto"
            : "Nuevo producto"
        }
        submitLabel={
          isEditing
            ? "Guardar cambios"
            : "Guardar producto"
        }
        initialValues={
          isEditing
            ? productInitialValues
            : undefined
        }
        isLoadingProduct={
          isEditing &&
          productDetailQuery.isLoading
        }
        isSubmitting={
          saveProductMutation.isPending
        }
        isLoadingOptions={
          isLoadingFormOptions ||
          Boolean(productDetailError)
        }
        submitError={
          formError ??
          productDetailError
        }
        categories={
          categoriesQuery.data ?? []
        }
        brands={
          brandsQuery.data ?? []
        }
        units={
          unitsQuery.data ?? []
        }
        onClose={handleCloseDialog}
        onSubmit={(values) => {
          setFormError(null);

          if (
            isEditing &&
            !productDetailQuery.data
          ) {
            setFormError(
              "No fue posible cargar la información del producto.",
            );

            return;
          }

          saveProductMutation.mutate({
            productId:
              editingProductId,
            values,
          });
        }}
      />
    </Stack>
  );
}
 
function getApiErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  if (!axios.isAxiosError(error)) {
    return fallbackMessage;
  }

  const messages = flattenErrorMessages(
    error.response?.data,
  );

  if (messages.length === 0) {
    return fallbackMessage;
  }

  return messages.join(" ");
}

function flattenErrorMessages(
  value: unknown,
): string[] {
  if (typeof value === "string") {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.flatMap(
      flattenErrorMessages,
    );
  }

  if (
    value &&
    typeof value === "object"
  ) {
    return Object.values(value).flatMap(
      flattenErrorMessages,
    );
  }

  return [];
}