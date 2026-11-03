import {
   AddRounded,
   PictureAsPdfRounded,
   GridOnRounded,
} from "@mui/icons-material";
import {
   Alert,
   Box,
   Button,
   CircularProgress,
   Paper,
   Stack,
   Typography,
} from "@mui/material";
import {
   type GridPaginationModel,
} from "@mui/x-data-grid";
import {
   getCategories,
} from "../../categories/services/categoryService";
import {
   keepPreviousData,
   useMutation,
   useQuery,
   useQueryClient,
} from "@tanstack/react-query";
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
import { getApiErrorMessage } from "../../../../shared/utils/getApiErrorMessage";
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
   BrandOption,
   //BrandOption,
   CategoryOption,
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
import {
   getExpiringProductsReport,
   downloadInventoryExcel,
   downloadInventoryPdf,
} from "../../../reports/services/reportsService";
import { CategoryFormDialog } from "../../categories/components/CategoryFormDialog";
import type { CategoryFormValues } from "../../categories/types/category";
import { createCategory } from "../../categories/services/categoryService";
import type { BrandFormValues } from "../../brands/types/brand";
import { createBrand } from "../../brands/services/brandService";
import { BrandFormDialog } from "../../brands/components/BrandFormDialog";
import { UnitOfMeasureFormDialog } from "../../units/components/UnitOfMeasureFormDialog";
import { createUnitOfMeasure } from "../../units/services/unitService";
import type {UnitOfMeasureFormValues} from "../../units/types/units";
type SaveProductVariables = {
   productId: string | null;
   values: ProductFormValues;
};
type ExpirationReportStatus = "UPCOMING" | "EXPIRED";

export function ProductsPage() {
   const queryClient = useQueryClient();
   const selectedCompany = useCompanyStore( (state) => state.selectedCompany, );
   const [search, setSearch] = useState("");
   const [ statusFilter,   setStatusFilter, ] = useState<ProductStatusFilter>("ALL");
   const [ categoryFilter,   setCategoryFilter, ] = useState("ALL");
   const [ brandFilter, setBrandFilter, ] = useState("ALL");
   const [ productTypeFilter, setProductTypeFilter,] = useState<ProductTypeFilter>( "ALL",);
   const [expirationFilter, setExpirationFilter] = useState<ExpirationReportStatus | null>(null);
   const selectedBranch = useBranchStore((state) => state.selectedBranch);
   const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);
   const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
   const [isBrandDialogOpen, setIsBrandDialogOpen] = useState(false);
   const [brandFormError, setBrandFormError] = useState<string | null>(null);
   const [createdBrand, setCreatedBrand] = useState<BrandOption | null>(null);
   type UnitTarget =
   | "base_unit_id"
   | "content_unit_id";
   type CreatedUnit = {
      id: string;
      name: string;
      symbol: string;
   };
   const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false);
   const [unitFormError, setUnitFormError] = useState<string | null>(null);
   const [unitTarget, setUnitTarget] = useState<UnitTarget | null>(null);
   const [createdUnit, setCreatedUnit] = useState<CreatedUnit | null>(null);
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
      expirationFilter,
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
   const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
   const [categoryFormError, setCategoryFormError] = useState<string | null>(null);
   const [createdCategory, setCreatedCategory] = useState<CategoryOption | null>(null);
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
         expirationFilter,
         paginationModel.page,
         paginationModel.pageSize,
      ],
      queryFn: () => {
         if (!selectedCompany) {
            throw new Error(
               "No existe una empresa seleccionada.",
            );
         }
         if (!selectedBranch) {
            throw new Error(
               "No existe una sucursal seleccionada.",
            );
         }
         return getProducts({
            companyId: selectedCompany.id,
            branchId: selectedBranch.id,
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
            expirationStatus: expirationFilter ?? undefined,
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
   const expirationQueryEnabled =
      Boolean(selectedCompany?.id) &&
      Boolean(selectedBranch?.id);
   const upcomingExpirationQuery = useQuery({
      queryKey: [
         "expiring-products",
         "UPCOMING",
         selectedCompany?.id,
         selectedBranch?.id,
         debouncedSearch,
      ],
      queryFn: () => {
         if (!selectedCompany || !selectedBranch) {
            throw new Error(
               "No existe una empresa o sucursal seleccionada.",
            );
         }
         return getExpiringProductsReport({
            companyId: selectedCompany.id,
            branchId: selectedBranch.id,
            status: "UPCOMING",
            days: 30,
            search: debouncedSearch || undefined,
            page: 1,
            pageSize: 100,
         });
      },
      enabled: expirationQueryEnabled,
   });
   const expiredExpirationQuery = useQuery({
      queryKey: [
         "expiring-products",
         "EXPIRED",
         selectedCompany?.id,
         selectedBranch?.id,
         debouncedSearch,
      ],
      queryFn: () => {
         if (!selectedCompany || !selectedBranch) {
            throw new Error(
               "No existe una empresa o sucursal seleccionada.",
            );
         }
         return getExpiringProductsReport({
            companyId: selectedCompany.id,
            branchId: selectedBranch.id,
            status: "EXPIRED",
            search: debouncedSearch || undefined,
            page: 1,
            pageSize: 100,
         });
      },
      enabled: expirationQueryEnabled,
   });
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
               package_quantity:
                  product.package_quantity
                     ? String(product.package_quantity)
                     : "",
               package_unit_id:
                  product.package_unit?.id ??
                  product.package_unit_id ??
                  "",
               content_quantity:
                  product.content_quantity
                     ? String(product.content_quantity)
                     : "",
               content_unit_id:
                  product.content_unit?.id ??
                  product.content_unit_id ??
                  "",
               cost_price:
                  product.cost_price ?? "",
               sale_price:
                  product.sale_price ?? "",
               track_inventory:
                  product.track_inventory,
               is_active:
                  product.is_active,
               initial_stock: "0",
               initial_lot_number:
                  product.initial_lot_number ?? "",
               initial_expiration_date:
                  product.initial_expiration_date ?? "",
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
            product_type: values.product_type,
            category_id: values.category_id || null,
            brand_id: values.brand_id || null,
            base_unit_id: values.base_unit_id,
            cost_price: values.cost_price || "0.00",
            sale_price: values.sale_price,
            track_inventory:
               values.product_type === "SERVICE"
                  ? false
                  : values.track_inventory,
            is_active: values.is_active,
            image_url: values.image_url ?? null,
            image_public_id: values.image_public_id ?? null,
         };
         if (productId) {
            return updateProduct(
               productId,
               payload,
            );
         }
            const branch = selectedBranch;
            if (!branch) {
               throw new Error(
                  "No existe una sucursal seleccionada.",
               );
            }
         return createProduct({
            ...payload,
            company_id: selectedCompany.id,
            branch_id: selectedBranch.id || null,
            initial_stock: values.track_inventory
                  ? values.initial_stock
                  : "0",
            initial_lot_number: values.track_inventory
                  ? values.initial_lot_number.trim() || null
                  : null,
            initial_expiration_date: values.track_inventory
                  ? values.initial_expiration_date || null
                  : null,
            package_quantity: values.package_quantity
                  ? Number(values.package_quantity)
                  : null,
            package_unit_id: values.package_unit_id || null,
            content_quantity: values.content_quantity
                  ? values.content_quantity
                  : null,
            content_unit_id: values.content_unit_id || null,
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
         await queryClient.invalidateQueries({
            queryKey: [
               "expiring-products",
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
      await queryClient.invalidateQueries({
         queryKey: [
            "expiring-products",
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
      productTypeFilter !== "ALL" ||
      expirationFilter !== null;
   const handleClearFilters = () => {
      setSearch("");
      setDebouncedSearch("");
      setStatusFilter("ALL");
      setCategoryFilter("ALL");
      setBrandFilter("ALL");
      setProductTypeFilter("ALL");
      setExpirationFilter(null);
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
   const handleDownloadExcel = async () => {
      if (!selectedCompany || !selectedBranch) {
         return;
      }
      try {
         setIsDownloadingExcel(true);
         await downloadInventoryExcel({
            companyId: selectedCompany.id,
            branchId: selectedBranch.id,
            search: search.trim() || undefined,
            isActive:
               statusFilter === "ALL"
                  ? undefined
                  : statusFilter === "ACTIVE",
            categoryId:
               categoryFilter === "ALL"
                  ? undefined
                  : categoryFilter,
            brandId:
               brandFilter === "ALL"
                  ? undefined
                  : brandFilter,
            productType:
               productTypeFilter === "ALL"
                  ? undefined
                  : productTypeFilter,
            expirationStatus: expirationFilter ?? undefined,
         });
      } catch {
         await showErrorAlert({
            title: "No se pudo descargar el reporte",
            text: "Ocurrió un error al generar el reporte de inventario en Excel.",
         });
      } finally {
         setIsDownloadingExcel(false);
      }
   };
   const handleDownloadPdf = async () => {
      if (!selectedCompany || !selectedBranch) {
         return;
      }
      try {
         setIsDownloadingPdf(true);
         await downloadInventoryPdf({
            companyId: selectedCompany.id,
            branchId: selectedBranch.id,
            search: search.trim() || undefined,
            isActive:
               statusFilter === "ALL"
                  ? undefined
                  : statusFilter === "ACTIVE",
            categoryId:
               categoryFilter === "ALL"
                  ? undefined
                  : categoryFilter,
            brandId:
               brandFilter === "ALL"
                  ? undefined
                  : brandFilter,
            productType:
               productTypeFilter === "ALL"
                  ? undefined
                  : productTypeFilter,
            expirationStatus: expirationFilter ?? undefined,
         });
      } catch {
         await showErrorAlert({
            title: "No se pudo descargar el reporte",
            text: "Ocurrió un error al generar el reporte de inventario en PDF.",
         });
      } finally {
         setIsDownloadingPdf(false);
      }
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
   const createUnitMutation = useMutation({
      mutationFn: (
         values: UnitOfMeasureFormValues,
      ) => {
         if (!selectedCompany) {
            throw new Error(
               "No hay una empresa seleccionada.",
            );
         }
         return createUnitOfMeasure({
            company_id: selectedCompany.id,
            name: values.name,
            symbol: values.symbol,
            unit_type: values.unit_type,
            allows_decimal:
               values.allows_decimal,
            is_active: values.is_active,
         });
      },
      onSuccess: async (unit) => {
         await queryClient.invalidateQueries({
            queryKey: [
               "catalog-units",
               selectedCompany?.id,
            ],
         });
         setCreatedUnit({
            id: unit.id,
            name: unit.name,
            symbol: unit.symbol,
         });
         setIsUnitDialogOpen(false);
         setUnitFormError(null);
      },
      onError: () => {
         setUnitFormError(
            "No fue posible crear la unidad de medida.",
         );
      },
   });
   const createCategoryMutation = useMutation({
      mutationFn: (values: CategoryFormValues) => {
         if (!selectedCompany) {
            throw new Error(
               "No hay una empresa seleccionada.",
            );
         }
         return createCategory({
            ...values,
            company_id: selectedCompany.id,
         });
      },
      onSuccess: async (category) => {
         await queryClient.invalidateQueries({
            queryKey: ["categories"],
         });
         setCreatedCategory({
            id: category.id,
            name: category.name,
            is_active: category.is_active ?? true,
         });
         setIsCategoryDialogOpen(false);
         setCategoryFormError(null);
      },
      onError: () => {
         setCategoryFormError(
            "No fue posible crear la categoría.",
         );
      },
   });
   const createBrandMutation = useMutation({
      mutationFn: (values: BrandFormValues) => {
         if (!selectedCompany) {
            throw new Error(
               "No hay una empresa seleccionada.",
            );
         }
         return createBrand({
            ...values,
            company_id: selectedCompany.id,
         });
      },
      onSuccess: async (brand) => {
         await queryClient.invalidateQueries({
            queryKey: [
               "catalog-brands",
               selectedCompany?.id,
            ],
         });
         setCreatedBrand({
            id: brand.id,
            name: brand.name,
            is_active: brand.is_active ?? true,
         });
         setIsBrandDialogOpen(false);
         setBrandFormError(null);
      },
      onError: () => {
         setBrandFormError(
            "No fue posible crear la marca.",
         );
      },
   });
   const categoryParentsQuery = useQuery({
      queryKey: [
         "categories",
         "product-form-parents",
         selectedCompany?.id,
      ],
      queryFn: async () => {
         if (!selectedCompany) {
            return [];
         }
         const response = await getCategories({
            companyId: selectedCompany.id,
            isActive: true,
            ordering: "name",
            page: 1,
            pageSize: 100,
         });
         return response.results;
      },
      enabled: Boolean(selectedCompany?.id),
   });
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
                     fontWeight: 700,
                     mb: 0.4,
               }}
               >
                  Productos
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
                  startIcon={
                     isDownloadingExcel
                        ? <CircularProgress size={18} />
                        : <GridOnRounded />
                  }
                  onClick={handleDownloadExcel}
                  disabled={
                     !selectedBranch ||
                     isDownloadingExcel ||
                     isDownloadingPdf
                  }
                  sx={{
                     borderRadius: "5px",
                     bgcolor: "#FFFFFF",
                  }}
               >
                  Excel
               </Button>
               <Button
                  type="button"
                  variant="outlined"
                  startIcon={
                     isDownloadingPdf
                        ? <CircularProgress size={18} />
                        : <PictureAsPdfRounded />
                  }
                  onClick={handleDownloadPdf}
                  disabled={
                     !selectedBranch ||
                     isDownloadingExcel ||
                     isDownloadingPdf
                  }
                  sx={{
                     borderRadius: "5px",
                     bgcolor: "#FFFFFF",
                  }}
               >
                  PDF
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
               No fue posible cargar los productos.
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
                  expirationFilter={expirationFilter ?? "ALL"}
                  upcomingExpirationCount={
                     upcomingExpirationQuery.data?.summary.products ?? 0
                  }
                  expiredExpirationCount={
                     expiredExpirationQuery.data?.summary.products ?? 0
                  }
                  categories={ categoriesQuery.data ?? [] }
                  brands={ brandsQuery.data ?? [] }
                  paginationModel={ paginationModel }
                  hasActiveFilters={ hasActiveFilters }
                  onSearchChange={setSearch}
                  onStatusFilterChange={ setStatusFilter }
                  onCategoryFilterChange={ setCategoryFilter }
                  onBrandFilterChange={ setBrandFilter }
                  onProductTypeFilterChange={ setProductTypeFilter }
                  onExpirationFilterChange={(value) => {
                     setExpirationFilter(
                        value === "ALL" ? null : value,
                     );
                  }}
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
            isEditing={isEditing}
            branchName={ selectedBranch?.name ?? "Sucursal activa"}
            initialValues={
               isEditing
                  ? productInitialValues
                  : undefined
            }
            isLoadingProduct={ isEditing && productDetailQuery.isLoading }
            isSubmitting={ saveProductMutation.isPending }
            isLoadingOptions={ isLoadingFormOptions || Boolean(productDetailError) }
            submitError={ formError ?? productDetailError }
            categories={ categoriesQuery.data ?? [] }
            brands={ brandsQuery.data ?? [] }
            units={ unitsQuery.data ?? [] }
            onClose={handleCloseDialog}
            onSubmit={(values) => {
               setFormError(null);
               if (isEditing && !productDetailQuery.data) {
                  setFormError("No fue posible cargar la información del producto.",);
                  return;
               }
               saveProductMutation.mutate({productId: editingProductId, values,});
            }}
            createdCategory={createdCategory}
            onCreateCategory={() => {
               setCategoryFormError(null);
               setIsCategoryDialogOpen(true);
            }}
            createdBrand={createdBrand}
            onCreateBrand={() => {
               setBrandFormError(null);
               setIsBrandDialogOpen(true);
            }}
            createdUnit={createdUnit}
            createdUnitTarget={unitTarget}
            onCreateUnit={(target) => {
               setUnitTarget(target);
               setUnitFormError(null);
               setIsUnitDialogOpen(true);
            }}
         />
         <CategoryFormDialog
            open={isCategoryDialogOpen}
            title="Nueva categoría"
            submitLabel="Guardar"
            categories={categoryParentsQuery.data ?? []}
            isSubmitting={createCategoryMutation.isPending}
            error={categoryFormError}
            onClose={() => {
               if (createCategoryMutation.isPending) {
                  return;
               }
               setIsCategoryDialogOpen(false);
               setCategoryFormError(null);
            }}
            onSubmit={(values) => {
               setCategoryFormError(null);
               createCategoryMutation.mutate(values);
            }}
         />
         <BrandFormDialog
            open={isBrandDialogOpen}
            title="Nueva marca"
            submitLabel="Guardar"
            isSubmitting={
               createBrandMutation.isPending
            }
            error={brandFormError}
            onClose={() => {
               if (createBrandMutation.isPending) {
                  return;
               }
               setIsBrandDialogOpen(false);
               setBrandFormError(null);
            }}
            onSubmit={(values) => {
               setBrandFormError(null);
               createBrandMutation.mutate(values);
            }}
         />
         <UnitOfMeasureFormDialog
            open={isUnitDialogOpen}
            title="Nueva unidad de medida"
            submitLabel="Guardar"
            initialValues={undefined}
            isSubmitting={
               createUnitMutation.isPending
            }
            error={unitFormError}
            onClose={() => {
               if (createUnitMutation.isPending) {
                  return;
               }
               setIsUnitDialogOpen(false);
               setUnitFormError(null);
               setUnitTarget(null);
            }}
            onSubmit={(values) => {
               setUnitFormError(null);
               createUnitMutation.mutate(values);
            }}
         />
      </Stack>
   );
}
