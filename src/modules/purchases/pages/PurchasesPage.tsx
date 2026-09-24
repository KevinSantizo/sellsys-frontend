import {
  AddRounded,
  FileDownloadRounded,
  FileUploadRounded,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Stack,
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
  useMemo,
  useState,
} from "react";

import { useCompanyStore } from "../../companies/store/companyStore";
import { useBranchStore } from "../../branches/store/branchStore";

import { PurchasesGridCard } from "../suppliers/components/PurchasesGridCard";
import {cancelPurchase, completePurchase, createPurchase, getPurchase, getPurchases, updatePurchase,} from "../suppliers/services/purchaseService";

import type {  
  Purchase,
  PurchaseFormValues,
  PurchasePaymentMethodFilter,
  PurchaseStatusFilter, 
} from "../suppliers/types/purchase"; 

import axios from "axios"; 
import { showSuccessAlert } from "../../../shared/alerts/appAlerts"; 
import { PurchaseFormDialog } from "../components/PurchaseFormDialog";  
import { getSuppliers } from "../suppliers/services/supplierService"; 
import { getProducts } from "../../catalog/products/services/productService";
import { PurchaseDetailDialog } from "../components/PurchaseDetailDialog";
import { getCashSessions } from "../../cash/services/cashService";

import Swal from "sweetalert2";



export function PurchasesPage() {
  const queryClient = useQueryClient(); 

  const [statusFilter, setStatusFilter] = useState<PurchaseStatusFilter>("ALL");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<PurchasePaymentMethodFilter>("ALL");

  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const selectedCompany = useCompanyStore((state) => state.selectedCompany);
  const selectedBranch = useBranchStore((state) => state.selectedBranch);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [editingPurchaseId, setEditingPurchaseId] = useState<string | null>(null);

  const isEditing = editingPurchaseId !== null;
  const [viewingPurchaseId, setViewingPurchaseId] = useState<string | null>(null);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  useEffect(() => {
    setPaginationModel((current) => ({
      ...current,
      page: 0,
    }));
  }, [
    selectedCompany?.id,
    selectedBranch?.id,
    statusFilter,
    paymentMethodFilter,
  ]);

  const purchaseViewQuery = useQuery({
    queryKey: ["purchase-view", viewingPurchaseId],
    queryFn: () => getPurchase(viewingPurchaseId!),
    enabled: Boolean(viewingPurchaseId),
  });

  const handleViewPurchase = (purchase: Purchase) => {
    setViewingPurchaseId(purchase.id);
  };

  const handleClosePurchaseDetail = () => {
    setViewingPurchaseId(null);
  };

  const purchaseDetailQuery = useQuery({
    queryKey: ["purchase-detail", editingPurchaseId],
    queryFn: () => getPurchase(editingPurchaseId!),
    enabled: isPurchaseDialogOpen && Boolean(editingPurchaseId),
  });

  const suppliersQuery = useQuery({
    queryKey: [
      "purchase-suppliers",
      selectedCompany?.id,
    ],

    queryFn: () => getSuppliers({
      companyId: selectedCompany!.id,
      isActive: true,
      ordering: "name",
      page: 1,
      pageSize: 100,
    }),

    enabled: Boolean(selectedCompany?.id) && isPurchaseDialogOpen,
  });
 
  const suppliers = suppliersQuery.data?.results ?? [];

  const purchaseProductsQuery = useQuery({
    queryKey: [
      "purchase-products",
      selectedCompany?.id,
      selectedBranch?.id,
    ],

    queryFn: () => getProducts({
      companyId: selectedCompany!.id,
      branchId: selectedBranch!.id,
      isActive: true,
      productType: "PRODUCT",
      page: 1,
      pageSize: 100,
    }),

    enabled:
      Boolean(selectedCompany?.id) &&
      Boolean(selectedBranch?.id) &&
      isPurchaseDialogOpen,
  });


  const purchaseProducts = useMemo(() => {
    return (purchaseProductsQuery.data?.results ?? []).filter(
      (product) => product.track_inventory,
    );
  }, [purchaseProductsQuery.data]);


  const purchaseInitialValues = useMemo<PurchaseFormValues | undefined>(() => {
    const purchase = purchaseDetailQuery.data;

    if (!purchase) return undefined;

    return {
      supplier_id: purchase.supplier_id,
      supplier_invoice_number: purchase.supplier_invoice_number ?? "",
      purchase_date: purchase.purchase_date,
      payment_method: purchase.payment_method,
      discount_total: purchase.discount_total,
      tax_total: purchase.tax_total,
      notes: purchase.notes ?? "",
      items: purchase.items.map((item) => ({
        product_id: item.product_id,
        quantity: formatQuantityInput(item.quantity),
        unit_cost: item.unit_cost,
      })),
    };
  }, [purchaseDetailQuery.data]);

  function formatQuantityInput(value: string) {
    const quantity = Number(value);

    if (!Number.isFinite(quantity)) return "";

    return quantity.toString();
  }

  type CompletePurchaseMutationVariables = {
    purchase: Purchase;
    cashSessionId?: string;
  };

  const completePurchaseMutation = useMutation<Purchase, Error, CompletePurchaseMutationVariables>({
    mutationFn: ({ purchase, cashSessionId }) => {
      return completePurchase(purchase.id, cashSessionId);
    },

    onSuccess: async (purchase) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["purchases", selectedCompany?.id, selectedBranch?.id],
        }),

        queryClient.invalidateQueries({
          queryKey: ["products"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["cash-movements"],
        }),

        queryClient.invalidateQueries({
          queryKey: ["cash-session-summary"],
        }),
      ]);

      queryClient.removeQueries({
        queryKey: ["purchase-detail", purchase.id],
      });

      void showSuccessAlert({
        title: "Compra completada",
        text: `${purchase.purchase_number} fue completada correctamente.`,
      });
    },

    onError: (error) => {
      void Swal.fire({
        title: "No fue posible completar la compra",
        text: getApiErrorMessage(
          error,
          "Ocurrió un error al completar la compra.",
        ),
        icon: "error",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#064A57",
      });
    },
  });

  const updatePurchaseMutation = useMutation< Purchase, Error, PurchaseFormValues >({
    mutationFn: (values) => {
      if (!editingPurchaseId) {
        throw new Error("No existe una compra seleccionada.");
      }

      return updatePurchase(editingPurchaseId, {
        supplier_id: values.supplier_id,
        supplier_invoice_number: values.supplier_invoice_number.trim(),
        purchase_date: values.purchase_date,
        payment_method: values.payment_method,
        discount_total: values.discount_total || "0.00",
        tax_total: values.tax_total || "0.00",
        notes: values.notes.trim(),
        items: values.items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
        })),
      });
    },

    onSuccess: async (purchase) => {
      setFormError(null);
      setIsPurchaseDialogOpen(false);
      setEditingPurchaseId(null);

      await queryClient.invalidateQueries({
        queryKey: ["purchases", selectedCompany?.id, selectedBranch?.id],
      });

      queryClient.removeQueries({
        queryKey: ["purchase-detail", purchase.id],
      });

      void showSuccessAlert({
        title: "Compra actualizada correctamente",
        text: `${purchase.purchase_number} fue actualizada correctamente.`,
      });
    },

    onError: (error) => {
      setFormError(
        getApiErrorMessage(
          error,
          "No fue posible actualizar la compra.",
        ),
      );
    },
  });

  const createPurchaseMutation = useMutation< Purchase, Error, PurchaseFormValues >({
    mutationFn: (values) => {
      if (!selectedCompany) {
        throw new Error("No existe una empresa seleccionada.");
      }

      if (!selectedBranch) {
        throw new Error("No existe una sucursal seleccionada.");
      }

      return createPurchase({
        company_id: selectedCompany.id,
        branch_id: selectedBranch.id,
        supplier_id: values.supplier_id,
        supplier_invoice_number: values.supplier_invoice_number.trim(),
        purchase_date: values.purchase_date,
        payment_method: values.payment_method,
        discount_total: values.discount_total || "0.00",
        tax_total: values.tax_total || "0.00",
        notes: values.notes.trim(),
        items: values.items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
        })),
      });
    },

    onSuccess: async (purchase) => {
      setFormError(null);
      setIsPurchaseDialogOpen(false);

      setPaginationModel((current) => ({
        ...current,
        page: 0,
      }));

      await queryClient.invalidateQueries({
        queryKey: [
          "purchases",
          selectedCompany?.id,
          selectedBranch?.id,
        ],
      });

      void showSuccessAlert({
        title: "Compra guardada correctamente",
        text: `${purchase.purchase_number} fue registrada como borrador.`,
      });
    },

    onError: (error) => {
      setFormError(
        getApiErrorMessage(
          error,
          "No fue posible guardar la compra.",
        ),
      );
    },
  });

  const cancelPurchaseMutation = useMutation<Purchase, Error, Purchase>({
    mutationFn: (purchase) => cancelPurchase(purchase.id),

    onSuccess: async (purchase) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["purchases", selectedCompany?.id, selectedBranch?.id],
        }),

        queryClient.invalidateQueries({
          queryKey: ["products"],
        }),
      ]);

      queryClient.removeQueries({
        queryKey: ["purchase-detail", purchase.id],
      });

      void showSuccessAlert({
        title: "Compra cancelada",
        text: `${purchase.purchase_number} fue cancelada correctamente.`,
      });
    },

    onError: (error) => {
      void Swal.fire({
        title: "No fue posible cancelar la compra",
        text: getApiErrorMessage(
          error,
          "Ocurrió un error al cancelar la compra.",
        ),
        icon: "error",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#064A57",
      });
    },
  });

  const handleOpenCreate = () => {
    setEditingPurchaseId(null);
    setFormError(null);
    setIsPurchaseDialogOpen(true);
  };

 
  const handleClosePurchaseDialog = () => {
    if (createPurchaseMutation.isPending || updatePurchaseMutation.isPending) return;

    setIsPurchaseDialogOpen(false);
    setEditingPurchaseId(null);
    setFormError(null);
  };

  useEffect(() => {

    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => window.clearTimeout(timeout);
    
  }, [search]);


  useEffect(() => {
    setPaginationModel((current) => ({
      ...current,
      page: 0,
    }));
  }, [
    selectedCompany?.id,
    selectedBranch?.id,
  ]);


  const purchasesQuery = useQuery({

    queryKey: [
      "purchases",
      selectedCompany?.id,
      selectedBranch?.id,
      debouncedSearch,
      statusFilter,
      paymentMethodFilter,
      paginationModel.page,
      paginationModel.pageSize,
    ],

    queryFn: () => getPurchases({
      companyId: selectedCompany!.id,
      branchId: selectedBranch!.id,
      search: debouncedSearch || undefined,
      status: statusFilter === "ALL" ? undefined : statusFilter,
      paymentMethod: paymentMethodFilter === "ALL" ? undefined : paymentMethodFilter,
      ordering: "-purchase_date",
      page: paginationModel.page + 1,
      pageSize: paginationModel.pageSize,
    }),

    enabled: Boolean(selectedCompany?.id) && Boolean(selectedBranch?.id),
    placeholderData: keepPreviousData,
  });

  const hasActiveFilters = statusFilter !== "ALL" || paymentMethodFilter !== "ALL";
  const purchases = purchasesQuery.data?.results ?? [];
  const totalPurchases = purchasesQuery.data?.count ?? 0;

  const handleClearFilters = () => {
    setStatusFilter("ALL");
    setPaymentMethodFilter("ALL");

    setPaginationModel((current) => ({
      ...current,
      page: 0,
    }));
  };

  const currencyFormatter = useMemo(() => {
    return new Intl.NumberFormat("es-GT", {
      style: "currency",
      currency: selectedCompany?.currency ?? "GTQ",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [selectedCompany?.currency]);


  const formatCurrency = (value: string | number) => {
    const amount = Number(value);

    if (!Number.isFinite(amount)) {
      return currencyFormatter.format(0);
    }

    return currencyFormatter.format(amount);
  };


  const handleSearchChange = (value: string) => {
    setSearch(value);

    setPaginationModel((current) => ({
      ...current,
      page: 0,
    }));
  };


  const handleRefresh = () => {
    void purchasesQuery.refetch();
  };


  const handleEditPurchase = (purchase: Purchase) => {
    if (purchase.status !== "DRAFT") return;

    setEditingPurchaseId(purchase.id);
    setFormError(null);
    setIsPurchaseDialogOpen(true);
  };


  const handleCompletePurchase = async (purchase: Purchase) => {
    if (purchase.payment_method === "CASH") {
      if (!selectedCompany || !selectedBranch) {
        void Swal.fire({
          title: "No fue posible completar la compra",
          text: "No hay una empresa o sucursal seleccionada.",
          icon: "error",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#064A57",
        });

        return;
      }

      try {
        const response = await getCashSessions({
          companyId: selectedCompany.id,
          branchId: selectedBranch.id,
          status: "OPEN",
          ordering: "-opened_at",
          page: 1,
          pageSize: 100,
        });

        const openCashSessions = response.results;

        if (openCashSessions.length === 0) {
          void Swal.fire({
            title: "No hay cajas abiertas",
            text: "Debes abrir una caja antes de completar una compra en efectivo.",
            icon: "warning",
            confirmButtonText: "Aceptar",
            confirmButtonColor: "#064A57",
          });

          return;
        }

        const cashSessionOptions = Object.fromEntries(
          openCashSessions.map((session) => [
            session.id,
            `${session.cash_register_name} (${session.cash_register_code})`,
          ]),
        );

        const result = await Swal.fire({
          title: "¿Completar compra?",
          text: `Selecciona la caja de donde saldrá el efectivo para ${purchase.purchase_number}.`,
          icon: "question",
          input: "select",
          inputOptions: cashSessionOptions,
          inputPlaceholder: "Selecciona una caja",
          showCancelButton: true,
          confirmButtonText: "Sí, completar",
          cancelButtonText: "Cancelar",
          confirmButtonColor: "#064A57",
          reverseButtons: true,
          inputValidator: (value) => {
            if (!value) {
              return "Debes seleccionar una caja.";
            }

            return null;
          },
        });

        if (!result.isConfirmed) {
          return;
        }

        completePurchaseMutation.mutate({
          purchase,
          cashSessionId: result.value,
        });

        return;
      } catch (error) {
        void Swal.fire({
          title: "No fue posible consultar las cajas",
          text: getApiErrorMessage(
            error,
            "Ocurrió un error al consultar las cajas abiertas.",
          ),
          icon: "error",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#064A57",
        });

        return;
      }
    }

    const result = await Swal.fire({
      title: "¿Completar compra?",
      text: `Al completar ${purchase.purchase_number}, los productos ingresarán al inventario de ${selectedBranch?.name ?? "la sucursal seleccionada"}.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, completar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#064A57",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    completePurchaseMutation.mutate({
      purchase,
    });
  };


  const handleCancelPurchase = async (purchase: Purchase) => {
    const isCompleted = purchase.status === "COMPLETED";

    const result = await Swal.fire({
      title: "¿Cancelar compra?",
      text: isCompleted
        ? `Al cancelar ${purchase.purchase_number}, se revertirán del inventario los productos que ingresaron con esta compra.`
        : `${purchase.purchase_number} será cancelada y ya no podrá editarse.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar compra",
      cancelButtonText: "Volver",
      confirmButtonColor: "#064A57",
      reverseButtons: true,
    });1

    if (!result.isConfirmed) return;

    cancelPurchaseMutation.mutate(purchase);
  };


  const loading = purchasesQuery.isLoading || purchasesQuery.isFetching;


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

          justifyContent: "space-between",
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
            Compras
          </Typography>

          <Typography
            sx={{
              color: "text.secondary", 
              fontSize: "0.9rem",
            }}
          >
            { selectedCompany && selectedBranch
              ? `Administra las compras de ${selectedCompany.name} en ${selectedBranch.name}.`
              : "Administra las compras realizadas a proveedores." }
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
            variant="outlined"
            startIcon={<FileUploadRounded />}
            disabled
            sx={{
              borderRadius: "5px",
              textTransform: "none",
              fontWeight: 700,
              minHeight: 40,
            }}
          >
            Importar
          </Button>

          <Button
            variant="outlined"
            startIcon={<FileDownloadRounded />}
            disabled
            sx={{
              borderRadius: "5px",
              textTransform: "none",
              fontWeight: 700,
              minHeight: 40,
            }}
          >
            Exportar
          </Button>

          <Button
            variant="contained"
            startIcon={<AddRounded />} 
            onClick={ handleOpenCreate }
            disabled={ !selectedCompany || !selectedBranch }
            sx={{
              borderRadius: "5px",
            }}
          >
            Nueva compra
          </Button>
        </Stack>
      </Stack>


      {!selectedBranch && (
        <Alert
          severity="warning"
          sx={{
            borderRadius: "5px",
          }}
        >
          Selecciona una sucursal para consultar las compras.
        </Alert>
      )}


      {purchasesQuery.isError && (
        <Alert
          severity="error"
          sx={{
            borderRadius: "5px",
          }}
        >
          No fue posible cargar las compras.
        </Alert>
      )}


      {selectedCompany && selectedBranch && (
        <PurchasesGridCard
          purchases={ purchases }
          totalPurchases={ totalPurchases }
          loading={ loading || completePurchaseMutation.isPending || cancelPurchaseMutation.isPending }
          search={ search }
          statusFilter={ statusFilter }
          paymentMethodFilter={ paymentMethodFilter }
          hasActiveFilters={ hasActiveFilters }
          paginationModel={ paginationModel }
          onSearchChange={ handleSearchChange }
          onStatusFilterChange={ setStatusFilter }
          onPaymentMethodFilterChange={ setPaymentMethodFilter }
          onClearFilters={ handleClearFilters }
          onPaginationModelChange={ setPaginationModel }
          onRefresh={ handleRefresh }
          onView={ handleViewPurchase }
          onEdit={ handleEditPurchase }
          onComplete={ handleCompletePurchase }
          onCancel={ handleCancelPurchase }
          formatCurrency={ formatCurrency }
        />
      )}

      <PurchaseFormDialog
        open={ isPurchaseDialogOpen }
        title={ isEditing ? "Editar compra" : "Nueva compra" }
        submitLabel={ isEditing ? "Guardar cambios" : "Guardar compra" }
        initialValues={ isEditing ? purchaseInitialValues : undefined }
        suppliers={ suppliers }
        products={ purchaseProducts }
        branchName={ selectedBranch?.name ?? "Sucursal activa" }
        isSubmitting={ createPurchaseMutation.isPending || updatePurchaseMutation.isPending }
        isLoadingOptions={ suppliersQuery.isLoading || purchaseProductsQuery.isLoading }
        isLoadingPurchase={ isEditing && purchaseDetailQuery.isLoading }
        submitError={ formError }
        formatCurrency={ formatCurrency }
        onClose={ handleClosePurchaseDialog }
        onSubmit={(values) => {
          setFormError(null);

          if (isEditing) {
            updatePurchaseMutation.mutate(values);
            return;
          }

          createPurchaseMutation.mutate(values);
        }}
      />

      <PurchaseDetailDialog
        open={ Boolean(viewingPurchaseId) }
        purchase={ purchaseViewQuery.data }
        loading={ purchaseViewQuery.isLoading }
        formatCurrency={ formatCurrency }
        onClose={ handleClosePurchaseDetail }
      />
    </Stack>
  );


  function getApiErrorMessage(error: unknown, fallbackMessage: string) {
    if (!axios.isAxiosError(error)) {
      return fallbackMessage;
    }

    const messages = flattenErrorMessages(error.response?.data);

    return messages.length > 0
      ? messages.join(" ")
      : fallbackMessage;
  }


  function flattenErrorMessages(value: unknown): string[] {
    if (typeof value === "string") {
      return [value];
    }

    if (Array.isArray(value)) {
      return value.flatMap(flattenErrorMessages);
    }

    if (value && typeof value === "object") {
      return Object.values(value).flatMap(flattenErrorMessages);
    }

    return [];
  }

}
